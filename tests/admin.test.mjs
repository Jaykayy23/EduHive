import assert from "node:assert/strict"
import test from "node:test"

import { isAdminUser } from "../lib/admin.ts"

test("admin access fails closed when no IDs are configured", () => {
  const previous = process.env.ADMIN_USER_IDS
  delete process.env.ADMIN_USER_IDS

  try {
    assert.equal(isAdminUser({ id: "user-1" }), false)
    assert.equal(isAdminUser(null), false)
  } finally {
    if (previous === undefined) delete process.env.ADMIN_USER_IDS
    else process.env.ADMIN_USER_IDS = previous
  }
})

test("admin access accepts exact configured user IDs", () => {
  const previous = process.env.ADMIN_USER_IDS
  process.env.ADMIN_USER_IDS = "user-1, user-2"

  try {
    assert.equal(isAdminUser({ id: "user-2" }), true)
    assert.equal(isAdminUser({ id: "user" }), false)
  } finally {
    if (previous === undefined) delete process.env.ADMIN_USER_IDS
    else process.env.ADMIN_USER_IDS = previous
  }
})
