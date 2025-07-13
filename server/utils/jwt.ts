import crypto from "crypto";

export function generateJWTSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function getJWTSecret(): string {
  return process.env.JWT_SECRET || generateJWTSecret();
}