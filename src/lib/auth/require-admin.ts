import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import { getPrisma } from "@/lib/prisma";
import { hasActiveAdminSession, hasAdminAccess } from "@/lib/auth/authorization";

export async function getActiveAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !hasAdminAccess(session.user)) return null;

  const admin = await getPrisma().admin.findUnique({
    where: { id: session.user.id },
    select: { id: true, isActive: true },
  });
  if (!hasActiveAdminSession(session.user, admin)) return null;

  return admin;
}

export async function requireAdmin() {
  const admin = await getActiveAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
