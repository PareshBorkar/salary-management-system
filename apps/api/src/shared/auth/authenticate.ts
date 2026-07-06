import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { authenticationMiddleware } from "../middleware/authentication.middleware.js";
import type { AuthenticatedUser } from "./jwt.js";

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

  app.decorate("authenticate", authenticationMiddleware);
}
