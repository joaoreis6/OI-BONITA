import type { AdminAuthRepository } from "@/services/admin-auth-service";
import { getPrisma } from "@/lib/prisma";

const selectAdmin = {
  id: true,
  email: true,
  passwordHash: true,
  isActive: true,
  failedLoginAttempts: true,
  lockedUntil: true,
} as const;

export const adminAuthRepository: AdminAuthRepository = {
  async findByEmail(email) {
    const admin = await getPrisma().admin.findUnique({ where: { email }, select: selectAdmin });
    return admin;
  },

  async recordFailure(admin, now) {
    const prisma = getPrisma();
    await prisma.$transaction(async (transaction) => {
      const current = await transaction.admin.findUnique({ where: { id: admin.id }, select: selectAdmin });
      if (!current || (current.lockedUntil && current.lockedUntil > now)) return;

      const previousAttempts = current.lockedUntil && current.lockedUntil <= now ? 0 : current.failedLoginAttempts;
      const failedLoginAttempts = previousAttempts + 1;
      await transaction.admin.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts,
          lockedUntil: failedLoginAttempts >= 5 ? new Date(now.getTime() + 15 * 60 * 1000) : null,
        },
      });
    }, { isolationLevel: "Serializable" });
  },

  async resetFailures(id) {
    await getPrisma().admin.update({ where: { id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
  },
};
