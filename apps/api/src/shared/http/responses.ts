import type { FastifyReply } from "fastify";

export type SuccessResponse<TData> = {
  success: true;
  message: string;
  data: TData;
};

const defaultSuccessMessage = "Request completed successfully";

export function createSuccessResponse<TData>(
  data: TData,
  message = defaultSuccessMessage
): SuccessResponse<TData> {
  return {
    success: true,
    message,
    data
  };
}

export function sendSuccess<TData>(
  reply: FastifyReply,
  data: TData,
  message?: string,
  statusCode = 200
) {
  return reply.code(statusCode).send(createSuccessResponse(data, message));
}
