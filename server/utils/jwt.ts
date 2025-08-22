import crypto from "crypto";

export function generateJWTSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function getJWTSecret(): string {
  // return process.env.JWT_SECRET || generateJWTSecret();
  return 'jK1jN9QP1LEr2TYUT7M9B3wnZouzdB6p2mmfxgiuMWA6bdDmQKn4jmw2bRYt0baGKi8AnXyaR'
}