import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

const developmentJwtSecret = "development-jwt-secret-change-before-production";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
  organizationId: string;
};

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  organizationId: string;
};

function jwtSecret() {
  if (env.JWT_SECRET) {
    return env.JWT_SECRET;
  }

  if (env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }

  return developmentJwtSecret;
}

export function signJwt(user: AuthenticatedUser) {
  return jwt.sign(
    {
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    },
    jwtSecret(),
    {
      subject: user.id,
      expiresIn: "1h"
    }
  );
}

export function verifyJwt(token: string): AuthenticatedUser {
  const payload = jwt.verify(token, jwtSecret()) as JwtPayload;

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    organizationId: payload.organizationId
  };
}
