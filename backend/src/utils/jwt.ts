import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error(
    "JWT_SECRET is not configured in environment variables"
  );
}

// At this point secret is guaranteed to exist at runtime.
const JWT_SECRET: string = secret;

export type AuthUser = {
  id: number;
  email: string;
  role: Role;
  name: string;
};

export function signToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: "1d",
  });
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(
    token,
    JWT_SECRET
  ) as AuthUser;
}