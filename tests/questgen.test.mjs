import assert from "node:assert/strict"
import test from "node:test"

import { getQuestgenUrl } from "../lib/questgen.ts"

test("uses localhost only in development", () => {
  assert.equal(
    getQuestgenUrl("/generate-from-text/", undefined, "development"),
    "http://localhost:8000/generate-from-text/",
  )
  assert.throws(
    () => getQuestgenUrl("/generate-from-text/", undefined, "production"),
    /NEXT_PUBLIC_QUESTGEN_API_URL/,
  )
})

test("normalizes a configured API base URL", () => {
  assert.equal(
    getQuestgenUrl("/generate-from-file/", "https://questions.example.com/", "production"),
    "https://questions.example.com/generate-from-file/",
  )
})

test("rejects non-HTTP API URLs", () => {
  assert.throws(
    () => getQuestgenUrl("/generate-from-text/", "javascript:alert(1)", "production"),
    /HTTP or HTTPS/,
  )
})
