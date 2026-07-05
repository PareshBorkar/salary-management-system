import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { signJwt, type AuthenticatedUser } from "../../shared/auth/jwt.js";
import { prisma } from "../../shared/database/prisma.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({ error: "Invalid login request" });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (!user?.isActive) {
      return reply.code(401).send({ error: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(parsed.data.password, user.passwordHash);

    if (!passwordMatches) {
      return reply.code(401).send({ error: "Invalid email or password" });
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

    return reply.send({
      token: signJwt(authenticatedUser),
      user: authenticatedUser
    });
  });
}
