import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const SCRYPT_N = 32_768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const MAXMEM = 64 * 1024 * 1024;
const DUMMY_HASH = hashAdminPassword("not-a-real-admin-password");

function deriveKey(password: string, salt: Buffer, keyLength: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, maxmem: MAXMEM }, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export const adminLoginSchema = z.object({
  email: z.string().trim().max(254).pipe(z.email()).transform((email) => email.toLowerCase()),
  password: z.string().min(12).max(128),
});

export type AdminAuthRecord = {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
};

export type AdminIdentity = { id: string; email: string; role: "admin" };

export type AdminAuthRepository = {
  findByEmail: (email: string) => Promise<AdminAuthRecord | null>;
  recordFailure: (admin: AdminAuthRecord, now: Date) => Promise<void>;
  resetFailures: (id: string) => Promise<void>;
};

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt, KEY_LENGTH);
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyAdminPassword(password: string, encoded: string) {
  const parts = encoded.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt" || Number(parts[1]) !== SCRYPT_N || Number(parts[2]) !== SCRYPT_R || Number(parts[3]) !== SCRYPT_P) return false;
  if (!/^[\da-f]{32}$/i.test(parts[4]) || !/^[\da-f]{128}$/i.test(parts[5])) return false;

  const expected = Buffer.from(parts[5], "hex");
  const actual = await deriveKey(password, Buffer.from(parts[4], "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

export async function authenticateAdmin(
  value: unknown,
  repository: AdminAuthRepository,
  now = new Date(),
): Promise<AdminIdentity | null> {
  const parsed = adminLoginSchema.safeParse(value);
  if (!parsed.success) return null;

  const admin = await repository.findByEmail(parsed.data.email);
  const passwordMatches = await verifyAdminPassword(parsed.data.password, admin?.passwordHash ?? await DUMMY_HASH);
  const isLocked = Boolean(admin?.lockedUntil && admin.lockedUntil > now);

  if (!admin || !admin.isActive || isLocked || !passwordMatches) {
    if (admin?.isActive && !isLocked) await repository.recordFailure(admin, now);
    return null;
  }

  await repository.resetFailures(admin.id);
  return { id: admin.id, email: admin.email, role: "admin" };
}
