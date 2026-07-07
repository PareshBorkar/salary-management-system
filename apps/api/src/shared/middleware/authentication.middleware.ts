import type { FastifyReply, FastifyRequest } from "fastify";

import { verifyJwt } from "../auth/jwt.js";
import { sendError } from "../http/errors.js";

export async function authenticationMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    await sendError(reply, 401);
    return;
  }

  try {
    const token = authorization.slice("Bearer ".length);
    const currentUser = verifyJwt(token);

    request.currentUser = currentUser;
    request.requestContext = {
      userId: currentUser.id,
      organizationId: currentUser.organizationId,
      role: currentUser.role
    };
  } catch {
    await sendError(reply, 401, "Invalid or expired token");
  }
}
