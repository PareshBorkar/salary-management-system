import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { verifyJwt, type AuthenticatedUser } from "./jwt.js";

export type OrganizationRequestContext = {
  userId: string;
  organizationId: string;
  role: string;
};

declare module "fastify" {
  interface FastifyRequest {
    currentUser: AuthenticatedUser | null;
    requestContext: OrganizationRequestContext | null;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export async function registerAuthentication(app: FastifyInstance) {
  app.decorateRequest("currentUser", null);
  app.decorateRequest("requestContext", null);

  app.decorate("authenticate", async (request, reply) => {
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
  });
}
