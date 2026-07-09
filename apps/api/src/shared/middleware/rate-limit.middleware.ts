import crypto from "node:crypto";

import { Redis } from "ioredis";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { env } from "../config/env.js";
import { sendError } from "../http/errors.js";

const rateLimitExceededMessage = "Too many requests. Please try again later.";

const tokenBucketLuaScript = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local refill_tokens = tonumber(ARGV[3])
local refill_interval_ms = tonumber(ARGV[4])
local ttl_ms = tonumber(ARGV[5])

local bucket = redis.call("HMGET", key, "tokens", "updatedAt")
local tokens = tonumber(bucket[1])
local updated_at = tonumber(bucket[2])

if tokens == nil then
  tokens = capacity
  updated_at = now
end

local elapsed = math.max(0, now - updated_at)
local refill = (elapsed / refill_interval_ms) * refill_tokens
tokens = math.min(capacity, tokens + refill)

local allowed = 0
local retry_after_ms = 0

if tokens >= 1 then
  allowed = 1
  tokens = tokens - 1
else
  retry_after_ms = math.ceil(((1 - tokens) / refill_tokens) * refill_interval_ms)
end

redis.call("HMSET", key, "tokens", tokens, "updatedAt", now)
redis.call("PEXPIRE", key, ttl_ms)

return { allowed, tokens, retry_after_ms }
`;

export type TokenBucketConfig = {
  capacity: number;
  refillTokens: number;
  refillIntervalMs: number;
};

export type RateLimitOptions = TokenBucketConfig & {
  keyPrefix: string;
  keyGenerator: (request: FastifyRequest) => string;
};

export type TokenBucketResult = {
  allowed: boolean;
  tokensRemaining: number;
  retryAfterMs: number;
};

export type TokenBucketStore = {
  consume: (key: string, config: TokenBucketConfig) => Promise<TokenBucketResult>;
  close?: () => Promise<void> | void;
};

export type RegisterRateLimitingOptions = {
  enabled?: boolean;
  store?: TokenBucketStore;
  global?: Partial<TokenBucketConfig>;
  login?: Partial<TokenBucketConfig>;
  salaryUpdate?: Partial<TokenBucketConfig>;
};

type MemoryBucket = {
  tokens: number;
  updatedAt: number;
};

declare module "fastify" {
  interface FastifyInstance {
    rateLimit: {
      login: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
      salaryUpdate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    };
  }
}

export class MemoryTokenBucketStore implements TokenBucketStore {
  private readonly buckets = new Map<string, MemoryBucket>();

  async consume(key: string, config: TokenBucketConfig): Promise<TokenBucketResult> {
    const now = Date.now();
    const existing = this.buckets.get(key) ?? {
      tokens: config.capacity,
      updatedAt: now
    };
    const elapsed = Math.max(0, now - existing.updatedAt);
    const refill = (elapsed / config.refillIntervalMs) * config.refillTokens;
    const tokens = Math.min(config.capacity, existing.tokens + refill);

    if (tokens >= 1) {
      const updatedBucket = {
        tokens: tokens - 1,
        updatedAt: now
      };
      this.buckets.set(key, updatedBucket);

      return {
        allowed: true,
        tokensRemaining: updatedBucket.tokens,
        retryAfterMs: 0
      };
    }

    this.buckets.set(key, {
      tokens,
      updatedAt: now
    });

    return {
      allowed: false,
      tokensRemaining: tokens,
      retryAfterMs: Math.ceil(
        ((1 - tokens) / config.refillTokens) * config.refillIntervalMs
      )
    };
  }

  clear() {
    this.buckets.clear();
  }
}

class RedisTokenBucketStore implements TokenBucketStore {
  private readonly redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      enableOfflineQueue: false,
      lazyConnect: true,
      maxRetriesPerRequest: 1
    });
  }

  async consume(key: string, config: TokenBucketConfig): Promise<TokenBucketResult> {
    await this.connect();

    const result = (await this.redis.eval(
      tokenBucketLuaScript,
      1,
      key,
      Date.now(),
      config.capacity,
      config.refillTokens,
      config.refillIntervalMs,
      calculateBucketTtlMs(config)
    )) as [number, number | string, number | string];

    return {
      allowed: Number(result[0]) === 1,
      tokensRemaining: Number(result[1]),
      retryAfterMs: Number(result[2])
    };
  }

  async close() {
    this.redis.disconnect();
  }

  private async connect() {
    if (this.redis.status === "ready" || this.redis.status === "connecting") {
      return;
    }

    await this.redis.connect();
  }
}

export async function registerRateLimiting(
  app: FastifyInstance,
  options: RegisterRateLimitingOptions = {}
) {
  const enabled = options.enabled ?? isRateLimitingEnabledByDefault();
  const disabledHandler = async () => undefined;

  if (!enabled) {
    app.decorate("rateLimit", {
      login: disabledHandler,
      salaryUpdate: disabledHandler
    });

    app.addHook("onClose", async () => {
      await options.store?.close?.();
    });

    return;
  }

  const store = options.store ?? createDefaultTokenBucketStore();

  app.decorate("rateLimit", {
    login: createRateLimitHandler(app, store, {
      keyPrefix: "login",
      ...createBucketConfig(
        {
          capacity: 10,
          refillTokens: 10,
          refillIntervalMs: 60_000
        },
        options.login
      ),
      keyGenerator: (request) => {
        const email = extractLoginEmail(request);

        return `${request.ip}:${email ? stableHash(email) : "unknown-email"}`;
      }
    }),
    salaryUpdate: createRateLimitHandler(app, store, {
      keyPrefix: "salary-update",
      ...createBucketConfig(
        {
          capacity: 30,
          refillTokens: 30,
          refillIntervalMs: 60_000
        },
        options.salaryUpdate
      ),
      keyGenerator: (request) => {
        const context = request.requestContext;

        return context ? `${context.organizationId}:${context.userId}` : request.ip;
      }
    })
  });

  const globalHandler = createRateLimitHandler(app, store, {
    keyPrefix: "global",
    ...createBucketConfig(
      {
        capacity: env.RATE_LIMIT_BUCKET_CAPACITY,
        refillTokens: env.RATE_LIMIT_REFILL_TOKENS,
        refillIntervalMs: env.RATE_LIMIT_REFILL_INTERVAL_MS
      },
      options.global
    ),
    keyGenerator: (request) => request.ip
  });

  app.addHook("onRequest", async (request, reply) => {
    if (shouldSkipGlobalRateLimit(request)) {
      return;
    }

    await globalHandler(request, reply);
  });

  app.addHook("onClose", async () => {
    await store.close?.();
  });
}

function isRateLimitingEnabledByDefault() {
  if (env.NODE_ENV === "test") {
    return false;
  }

  return env.RATE_LIMIT_ENABLED;
}

function createRateLimitHandler(
  app: FastifyInstance,
  store: TokenBucketStore,
  options: RateLimitOptions
) {
  return async function rateLimitHandler(request: FastifyRequest, reply: FastifyReply) {
    let result: TokenBucketResult;

    try {
      result = await store.consume(buildRateLimitKey(options, request), options);
    } catch (error) {
      if (env.NODE_ENV === "production") {
        throw error;
      }

      request.log.warn({ error }, "rate limit store unavailable; allowing request");
      return;
    }

    reply.header("X-RateLimit-Limit", options.capacity);
    reply.header("X-RateLimit-Remaining", Math.floor(result.tokensRemaining));

    if (!result.allowed) {
      const retryAfterSeconds = Math.max(Math.ceil(result.retryAfterMs / 1000), 1);
      reply.header("Retry-After", retryAfterSeconds);

      return sendError(reply, 429, rateLimitExceededMessage);
    }
  };
}

function createDefaultTokenBucketStore(): TokenBucketStore {
  if (env.REDIS_URL) {
    return new RedisTokenBucketStore(env.REDIS_URL);
  }

  if (env.NODE_ENV === "production") {
    throw new Error("REDIS_URL is required when rate limiting is enabled in production");
  }

  return new MemoryTokenBucketStore();
}

function createBucketConfig(
  defaults: TokenBucketConfig,
  overrides: Partial<TokenBucketConfig> = {}
): TokenBucketConfig {
  return {
    capacity: overrides.capacity ?? defaults.capacity,
    refillTokens: overrides.refillTokens ?? defaults.refillTokens,
    refillIntervalMs: overrides.refillIntervalMs ?? defaults.refillIntervalMs
  };
}

function buildRateLimitKey(options: RateLimitOptions, request: FastifyRequest) {
  return `salary-management:rate-limit:${options.keyPrefix}:${options.keyGenerator(request)}`;
}

function calculateBucketTtlMs(config: TokenBucketConfig) {
  const fullRefillIntervals = Math.ceil(config.capacity / config.refillTokens);

  return Math.max(
    config.refillIntervalMs * fullRefillIntervals * 2,
    config.refillIntervalMs
  );
}

function shouldSkipGlobalRateLimit(request: FastifyRequest) {
  return request.method === "OPTIONS" || request.url.startsWith("/v1/health");
}

function extractLoginEmail(request: FastifyRequest) {
  const body = request.body;

  if (!body || typeof body !== "object" || !("email" in body)) {
    return null;
  }

  const email = body.email;

  return typeof email === "string" ? email.trim().toLowerCase() : null;
}

function stableHash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
