export function hasAdminAccess(user: { id?: string | null; role?: string | null } | null | undefined) {
  return user?.role === "admin" && typeof user.id === "string" && user.id.length > 0;
}

export function hasActiveAdminSession(
  user: { id?: string | null; role?: string | null } | null | undefined,
  admin: { id: string; isActive: boolean } | null | undefined,
) {
  if (!hasAdminAccess(user) || !admin?.isActive || !user) return false;
  return admin.id === user.id;
}
