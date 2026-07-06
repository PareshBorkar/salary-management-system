import type { FastifyReply, FastifyRequest } from "fastify";

import { verifyJwt } from "../auth/jwt.js";

export async function authenticationMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    await reply.code(401).send({ error: "Authentication required" });
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
    await reply.code(401).send({ error: "Invalid or expired token" });
  }
}
