import { Redis } from "ioredis";

import { env } from "../../shared/config/env.js";
import { prisma } from "../../shared/database/prisma.js";

type DependencyName = "database" | "redis";
type DependencyStatus = "ok" | "skipped" | "error";

export type DependencyCheck = {
  name: DependencyName;
  status: DependencyStatus;
};

export type HealthResponse = {
  status: "ok" | "degraded";
  service: string;
  environment: string;
  uptimeSeconds: number;
  checks?: DependencyCheck[];
};

type HealthCheckOptions = {
  checkDependencies?: boolean;
  checkDatabase?: () => Promise<DependencyCheck>;
  checkRedis?: () => Promise<DependencyCheck>;
};

export async function getHealth(
  options: HealthCheckOptions = {}
): Promise<HealthResponse> {
  const response: HealthResponse = {
    status: "ok",
    service: env.APP_NAME,
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime())
  };

  if (!options.checkDependencies) {
    return response;
  }

  const checks = await Promise.all([
    (options.checkDatabase ?? checkDatabaseReachability)(),
    (options.checkRedis ?? checkRedisReachability)()
  ]);

  return {
    ...response,
    status: checks.some((check) => check.status === "error") ? "degraded" : "ok",
    checks
  };
}

export async function checkDatabaseReachability(): Promise<DependencyCheck> {
  if (!env.DATABASE_URL) {
    return {
      name: "database",
      status: "skipped"
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      name: "database",
      status: "ok"
    };
  } catch {
    return {
      name: "database",
      status: "error"
    };
  }
}

export async function checkRedisReachability(): Promise<DependencyCheck> {
  if (!env.REDIS_URL) {
    return {
      name: "redis",
      status: "skipped"
    };
  }

  const redis = new Redis(env.REDIS_URL, {
    enableOfflineQueue: false,
    lazyConnect: true,
    maxRetriesPerRequest: 1
  });

  try {
    await redis.connect();
    await redis.ping();

    return {
      name: "redis",
      status: "ok"
    };
  } catch {
    return {
      name: "redis",
      status: "error"
    };
  } finally {
    redis.disconnect();
  }
}
