import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "7d";

export function signAuthToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable");
  }

  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAuthToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable");
  }

  return jwt.verify(token, secret);
}
