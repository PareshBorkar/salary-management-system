import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { signJwt, type AuthenticatedUser } from "../../shared/auth/jwt.js";
import { prisma } from "../../shared/database/prisma.js";
import { sendError } from "../../shared/http/errors.js";
import { sendSuccess } from "../../shared/http/responses.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function authRoutes(app: FastifyInstance) {
  app.post(
    "/auth/login",
    {
      preHandler: app.rateLimit.login
    },
    async (request, reply) => {
      const parsed = loginSchema.safeParse(request.body);

      if (!parsed.success) {
        return sendError(reply, 400);
      }

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email },
        include: {
          organization: {
            select: {
              name: true
            }
          }
        }
      });

      if (!user?.isActive) {
        return sendError(reply, 401, "Invalid email or password");
      }

      const passwordMatches = await bcrypt.compare(
        parsed.data.password,
        user.passwordHash
      );

      if (!passwordMatches) {
        return sendError(reply, 401, "Invalid email or password");
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      const authenticatedUser: AuthenticatedUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      };

      const responseUser = {
        ...authenticatedUser,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationName: user.organization.name
      };

      return sendSuccess(reply, {
        token: signJwt(authenticatedUser),
        user: responseUser
      });
    }
  );
}
