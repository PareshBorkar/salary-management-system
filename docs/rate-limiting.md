# API Rate Limiting

The API uses Redis-backed token bucket rate limiting to protect the Salary Management System from excessive traffic, brute-force login attempts, and repeated sensitive write operations.

Rate limiting is implemented in `apps/api/src/shared/middleware/rate-limit.middleware.ts` and is registered globally when the API app starts.

## Goals

- Apply a global request limit across API instances.
- Use Redis as the shared store so limits work when the API is horizontally scaled.
- Use token bucket behavior instead of a fixed request window.
- Apply stricter limits to sensitive routes such as login and salary updates.
- Keep health checks available for infrastructure monitoring.

## Token Bucket Behavior

Each rate limit key has a bucket with:

- `tokens`: current number of available requests
- `updatedAt`: timestamp of the last refill calculation

On each request, the API:

1. Loads the bucket from Redis.
2. Calculates how much time elapsed since the last update.
3. Refills tokens based on the configured refill rate.
4. Caps the token count at the bucket capacity.
5. Allows the request when at least one token is available.
6. Decrements one token for an allowed request.
7. Returns HTTP `429` when the bucket has no available token.

This means limits recover gradually. For example:

```env
RATE_LIMIT_BUCKET_CAPACITY=3
RATE_LIMIT_REFILL_TOKENS=1
RATE_LIMIT_REFILL_INTERVAL_MS=60000
```

With that configuration, a client can make 3 requests immediately. After the bucket is empty, 1 request becomes available every 60 seconds. The bucket is full again after about 3 minutes.

## Redis Storage

Redis stores token bucket state in temporary keys using this pattern:

```text
salary-management:rate-limit:<scope>:<key>
```

Examples:

```text
salary-management:rate-limit:global:127.0.0.1
salary-management:rate-limit:login:127.0.0.1:<hashed-email>
salary-management:rate-limit:salary-update:<organizationId>:<userId>
```

The login limiter hashes the normalized email before using it in the Redis key. Raw email addresses are not stored in rate-limit keys.

Each bucket key gets a Redis TTL so old clients do not leave permanent keys behind.

## Atomicity

The Redis-backed store uses a Lua script to make token bucket reads, refill calculations, token consumption, and TTL updates atomic.

This avoids race conditions when multiple API instances receive requests for the same key at the same time.

## Configuration

Rate limiting is configured through environment variables.

| Variable                        | Purpose                                               | Local default               |
| ------------------------------- | ----------------------------------------------------- | --------------------------- |
| `RATE_LIMIT_ENABLED`            | Enables or disables API rate limiting.                | `true`                      |
| `RATE_LIMIT_BUCKET_CAPACITY`    | Global bucket size.                                   | `1000`                      |
| `RATE_LIMIT_REFILL_TOKENS`      | Number of tokens restored per refill interval.        | `1000`                      |
| `RATE_LIMIT_REFILL_INTERVAL_MS` | Refill interval in milliseconds.                      | `60000`                     |
| `REDIS_URL`                     | Redis connection string used by the rate-limit store. | Optional outside production |

Production should set `REDIS_URL`. When rate limiting is enabled in production, the API requires Redis so limits are shared across instances.

## Applied Limits

### Global API Limit

The global limiter applies to API routes by IP address.

It does not rate-limit:

- `OPTIONS` requests
- `/v1/health`

Health checks are skipped so load balancers, Docker health checks, and uptime monitors do not accidentally consume client request capacity.

### Login Limit

The login route has a stricter bucket than the global limiter.

The key uses:

```text
IP address + hashed normalized email
```

This protects login from repeated attempts while avoiding storage of raw email addresses in Redis.

### Salary Update Limit

Salary update requests use a stricter authenticated bucket.

The key uses:

```text
organizationId + userId
```

If authenticated request context is not available, the limiter falls back to IP address.

## Error Response

When a bucket is empty, the API returns HTTP `429` with the shared API error format:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "code": "RATE_LIMITED",
  "statusCode": 429
}
```

The response also includes rate-limit headers:

```text
X-RateLimit-Limit
X-RateLimit-Remaining
Retry-After
```

`Retry-After` is included only when the request is blocked.

## Local Testing

Use small bucket values locally so the limit is easy to trigger.

Create or update `apps/api/.env`:

```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_BUCKET_CAPACITY=3
RATE_LIMIT_REFILL_TOKENS=1
RATE_LIMIT_REFILL_INTERVAL_MS=60000
REDIS_URL=redis://localhost:6379
```

Start Redis:

```bash
docker run --name sms-redis -p 6379:6379 redis:7
```

If the container already exists:

```bash
docker start sms-redis
```

Start the API:

```bash
npm run dev -w @salary-management/api
```

Call a non-health route repeatedly:

```bash
curl -i http://localhost:3000/v1/employees
curl -i http://localhost:3000/v1/employees
curl -i http://localhost:3000/v1/employees
curl -i http://localhost:3000/v1/employees
```

The first 3 requests should consume the bucket. The 4th request should return HTTP `429`.

If the response header shows this, the local test config is active:

```text
X-RateLimit-Limit: 3
```

If it shows `1000`, the running API process did not pick up the local `.env` values. Restart the API and confirm the env file is in `apps/api/.env` when using the workspace npm script.

Reset local Redis buckets when needed:

```bash
docker exec sms-redis redis-cli FLUSHDB
```

## Tests

Rate-limit behavior tests live under:

```text
apps/api/tests/integration/rate-limit/
```

The tests use deterministic low limits and an in-memory token bucket store so they do not require production Redis configuration.

Run the focused suite:

```bash
cd apps/api
npx vitest run tests/integration/rate-limit/rate-limit.behavior.test.ts
```

The test coverage verifies:

- requests within the bucket capacity are allowed
- excessive requests return HTTP `429`
- the response body follows the API error format
- health checks are skipped by the global limiter
- login limits are keyed by normalized email
- salary update limits are keyed by authenticated organization and user

## Production Notes

For production deployments:

- Keep `RATE_LIMIT_ENABLED=true`.
- Set `REDIS_URL` to a production Redis service such as Amazon ElastiCache.
- Use conservative initial limits, then tune based on observed traffic.
- Keep `/v1/health` excluded so infrastructure health checks remain reliable.
- Monitor HTTP `429` rates to detect abusive traffic or overly strict configuration.

Recommended starting global values for an MVP:

```env
RATE_LIMIT_BUCKET_CAPACITY=1000
RATE_LIMIT_REFILL_TOKENS=1000
RATE_LIMIT_REFILL_INTERVAL_MS=60000
```

These values allow short bursts while capping each IP to roughly 1000 requests per minute over time.
