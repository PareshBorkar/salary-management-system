import type { FastifyInstance, FastifyReply } from "fastify";

export type ErrorStatusCode = 400 | 401 | 403 | 404 | 429 | 500;

type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL_SERVER_ERROR";

const errorCodeByStatus = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  429: "RATE_LIMITED",
  500: "INTERNAL_SERVER_ERROR"
} as const satisfies Record<ErrorStatusCode, ErrorCode>;

const defaultMessageByStatus: Record<ErrorStatusCode, string> = {
  400: "Bad request",
  401: "Authentication required",
  403: "Forbidden",
  404: "Not found",
  429: "Too many requests",
  500: "Internal server error"
};

export type ErrorResponse = {
  error: string;
  code: ErrorCode;
  statusCode: ErrorStatusCode;
};

export function createErrorResponse(
  statusCode: ErrorStatusCode,
  message = defaultMessageByStatus[statusCode]
): ErrorResponse {
  return {
    error: message,
    code: errorCodeByStatus[statusCode],
    statusCode
  };
}

export function sendError(
  reply: FastifyReply,
  statusCode: ErrorStatusCode,
  message?: string
) {
  return reply.code(statusCode).send(createErrorResponse(statusCode, message));
}

export function registerErrorHandlers(app: FastifyInstance) {
  app.setNotFoundHandler((request, reply) => {
    return sendError(reply, 404);
  });

  app.setErrorHandler((error: unknown, request, reply) => {
    request.log.error(error);

    const statusCode = normalizeStatusCode(getErrorStatusCode(error));
    const message =
      statusCode === 500
        ? defaultMessageByStatus[500]
        : getErrorMessage(error) || defaultMessageByStatus[statusCode];

    return sendError(reply, statusCode, message);
  });
}

function getErrorStatusCode(error: unknown) {
  if (typeof error === "object" && error && "statusCode" in error) {
    return Number(error.statusCode);
  }

  return undefined;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return undefined;
}

function normalizeStatusCode(statusCode: number | undefined): ErrorStatusCode {
  if (
    statusCode === 400 ||
    statusCode === 401 ||
    statusCode === 403 ||
    statusCode === 404 ||
    statusCode === 429
  ) {
    return statusCode;
  }

  return 500;
}
