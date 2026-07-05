import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { verifyJwt, type AuthenticatedUser } from "./jwt.js";

declare module "fastify" {
  interface FastifyRequest {
    currentUser: AuthenticatedUser | null;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export async function registerAuthentication(app: FastifyInstance) {
  app.decorateRequest("currentUser", null);

  app.decorate("authenticate", async (request, reply) => {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      await reply.code(401).send({ error: "Authentication required" });
      return;
    }

    try {
      const token = authorization.slice("Bearer ".length);
      request.currentUser = verifyJwt(token);
    } catch {
      await reply.code(401).send({ error: "Invalid or expired token" });
    }
  });
}
