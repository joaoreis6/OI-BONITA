import test from "node:test";
import assert from "node:assert/strict";
import { authenticateAdmin, hashAdminPassword, verifyAdminPassword } from "../src/services/admin-auth-service.ts";
import { hasActiveAdminSession, hasAdminAccess } from "../src/lib/auth/authorization.ts";

test("stores only a salted scrypt hash and verifies credentials safely", async () => {
  const password = "a-private-test-password";
  const hash = await hashAdminPassword(password);
  assert.match(hash, /^scrypt\$32768\$8\$1\$/);
  assert.ok(!hash.includes(password));
  assert.equal(await verifyAdminPassword(password, hash), true);
  assert.equal(await verifyAdminPassword("wrong-test-password", hash), false);
  assert.equal(await verifyAdminPassword(password, "scrypt$999999999$8$1$aa$bb"), false);
});

test("authenticates an active administrator and clears previous failures", async () => {
  const passwordHash = await hashAdminPassword("a-private-test-password");
  const calls = [];
  const repository = {
    findByEmail: async (email) => email === "admin@example.test" ? { id: "fixture-admin", email, passwordHash, isActive: true, failedLoginAttempts: 2, lockedUntil: null } : null,
    recordFailure: async (...args) => calls.push(["failure", ...args]),
    resetFailures: async (id) => calls.push(["reset", id]),
  };

  const identity = await authenticateAdmin({ email: " ADMIN@example.test ", password: "a-private-test-password" }, repository);
  assert.deepEqual(identity, { id: "fixture-admin", email: "admin@example.test", role: "admin" });
  assert.deepEqual(calls, [["reset", "fixture-admin"]]);
});

test("rejects bad, locked and inactive administrators without revealing which check failed", async () => {
  const passwordHash = await hashAdminPassword("a-private-test-password");
  const records = new Map([
    ["active@example.test", { id: "active", email: "active@example.test", passwordHash, isActive: true, failedLoginAttempts: 0, lockedUntil: null }],
    ["locked@example.test", { id: "locked", email: "locked@example.test", passwordHash, isActive: true, failedLoginAttempts: 5, lockedUntil: new Date("2030-01-01T00:00:00Z") }],
    ["inactive@example.test", { id: "inactive", email: "inactive@example.test", passwordHash, isActive: false, failedLoginAttempts: 0, lockedUntil: null }],
  ]);
  const failures = [];
  const repository = {
    findByEmail: async (email) => records.get(email) ?? null,
    recordFailure: async (admin) => failures.push(admin.id),
    resetFailures: async () => assert.fail("A rejected login must not reset attempts"),
  };
  const now = new Date("2026-09-23T00:00:00Z");

  assert.equal(await authenticateAdmin({ email: "active@example.test", password: "incorrect-password" }, repository, now), null);
  assert.equal(await authenticateAdmin({ email: "locked@example.test", password: "a-private-test-password" }, repository, now), null);
  assert.equal(await authenticateAdmin({ email: "inactive@example.test", password: "a-private-test-password" }, repository, now), null);
  assert.equal(await authenticateAdmin({ email: "missing@example.test", password: "a-private-test-password" }, repository, now), null);
  assert.deepEqual(failures, ["active"]);
});

test("server authorization requires both an administrator role and a session identity", () => {
  assert.equal(hasAdminAccess(null), false);
  assert.equal(hasAdminAccess({ id: "user-1", role: "customer" }), false);
  assert.equal(hasAdminAccess({ id: "", role: "admin" }), false);
  assert.equal(hasAdminAccess({ id: "admin-1", role: "admin" }), true);
});

test("administrator mutations also require a matching active database account", () => {
  assert.equal(hasActiveAdminSession({ id: "admin-1", role: "admin" }, { id: "admin-1", isActive: true }), true);
  assert.equal(hasActiveAdminSession(null, { id: "admin-1", isActive: true }), false);
  assert.equal(hasActiveAdminSession({ id: "admin-1", role: "admin" }, { id: "admin-2", isActive: true }), false);
  assert.equal(hasActiveAdminSession({ id: "admin-1", role: "admin" }, { id: "admin-1", isActive: false }), false);
});
