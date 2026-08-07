import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import test from "node:test"

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8")

test("HiveQ uses canonical feature and demo routes", () => {
  assert.equal(existsSync(new URL("../app/(main)/hiveq/page.tsx", import.meta.url)), true)
  assert.equal(existsSync(new URL("../app/(main)/hiveq/demo/page.tsx", import.meta.url)), true)
  assert.equal(existsSync(new URL("../app/(main)/brainforge", import.meta.url)), false)
  assert.equal(existsSync(new URL("../app/(main)/Demo", import.meta.url)), false)

  const menu = read("../app/(main)/MenuBar.tsx")
  const landingPage = read("../components/landing/LandingPageExperience.tsx")

  assert.match(menu, /href="\/hiveq"/)
  assert.doesNotMatch(menu, /href="\/brainforge"/)
  assert.match(landingPage, /href="\/hiveq\/demo"/)
  assert.doesNotMatch(landingPage, /href="\/Demo"/)
})

test("legacy BrainForge URLs redirect to HiveQ", () => {
  const nextConfig = read("../next.config.ts")

  assert.match(nextConfig, /source: "\/brainforge\/:path\*"/)
  assert.match(nextConfig, /destination: "\/hiveq\/:path\*"/)
  assert.match(nextConfig, /source: "\/Demo"/)
  assert.match(nextConfig, /destination: "\/hiveq\/demo"/)
})
