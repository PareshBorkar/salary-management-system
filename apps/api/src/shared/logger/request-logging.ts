import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

const requestStartTimes = new WeakMap<FastifyRequest, bigint>();

export type RequestLogContext = {
  event: "request_completed";
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  responseTimeMs: number;
  userId?: string;
  organizationId?: string;
  role?: string;
};

export function registerRequestLogging(app: FastifyInstance) {
  app.addHook("onRequest", async (request) => {
    requestStartTimes.set(request, process.hrtime.bigint());
  });

  app.addHook("onResponse", async (request, reply) => {
    request.log.info(buildRequestLogContext(request, reply), "request completed");
  });
}

export function buildRequestLogContext(
  request: FastifyRequest,
  reply: FastifyReply
): RequestLogContext {
  const requestContext = request.requestContext;

  return {
    event: "request_completed",
    requestId: request.id,
    method: request.method,
    path: request.url.split("?")[0] ?? request.url,
    statusCode: reply.statusCode,
    responseTimeMs: calculateResponseTimeMs(request),
    ...(requestContext
      ? {
          userId: requestContext.userId,
          organizationId: requestContext.organizationId,
          role: requestContext.role
        }
      : {})
  };
}

function calculateResponseTimeMs(request: FastifyRequest) {
  const startedAt = requestStartTimes.get(request);

  if (!startedAt) {
    return 0;
  }

  return Number(process.hrtime.bigint() - startedAt) / 1_000_000;
}
