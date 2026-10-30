import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  symlink,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  collectSourceFiles,
  packageSource,
} from "../scripts/package-source.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "eduhive-package-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  async function put(name, value = "fixture") {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), value);
  }
  await put("package.json", '{"private":true}');
  await put("README.md");
  return { root, put };
}

test("manifest explicitly selects source and examples, excluding local data and generated files", async (t) => {
  const { root, put } = await fixture(t);
  for (const name of [
    "app/page.tsx",
    "prisma/migrations/001/migration.sql",
    "ml-backend/app/main.py",
    ".env.example",
    "ml-backend/.env.example",
    "docs/buyer/setup.md",
  ])
    await put(name);
  for (const name of [
    ".env",
    "ml-backend/.env",
    "debug.log",
    "graphify-out/graph.json",
    "node_modules/pkg/index.js",
    "app/.next/generated.ts",
    "prisma/generated/client.js",
    "ml-backend/.venv/bin/python.exe",
    "ml-backend/app/__pycache__/main.pyc",
    "public/customer-records.csv",
    "app/debug.log",
    "ml-backend/model.bin",
    ".idea/settings.json",
  ])
    await put(name);
  const manifest = await collectSourceFiles(root);
  assert.deepEqual(
    manifest.map((x) => x.path),
    [
      ".env.example",
      "README.md",
      "app/page.tsx",
      "docs/buyer/setup.md",
      "ml-backend/.env.example",
      "ml-backend/app/main.py",
      "package.json",
      "prisma/migrations/001/migration.sql",
    ],
  );
  assert.ok(
    manifest.every(
      (x) => Number.isInteger(x.size) && /^[a-f0-9]{64}$/.test(x.sha256),
    ),
  );
});

test("Next.js metadata icons are retained without allowing arbitrary app assets", async (t) => {
  const { root, put } = await fixture(t);
  for (const name of [
    "app/favicon.ico",
    "app/icon.png",
    "app/apple-icon.png",
    "app/unexpected-image.png",
  ])
    await put(name);
  const paths = (await collectSourceFiles(root)).map((entry) => entry.path);
  for (const name of ["app/favicon.ico", "app/icon.png", "app/apple-icon.png"])
    assert.ok(paths.includes(name));
  assert.equal(paths.includes("app/unexpected-image.png"), false);
});

test("sale bundle keeps reviewed runtime artwork and license inventories, excluding unverified images and arbitrary JSON", async (t) => {
  const { root, put } = await fixture(t);
  const included = [
    "public/images/eduhive-icon.png",
    "public/images/study-workspace.svg",
    "public/images/avatar-placeholder.svg",
    "docs/buyer/npm-license-inventory.json",
    "docs/buyer/python-license-inventory.json",
  ];
  const excluded = [
    "public/images/welcome.png",
    "public/images/landing.jpg",
    "public/images/unknown-artwork.svg",
    "docs/buyer/private-records.json",
  ];
  for (const name of [...included, ...excluded]) await put(name, "{}");
  const paths = (await collectSourceFiles(root)).map((entry) => entry.path);
  for (const name of included) assert.ok(paths.includes(name), name);
  for (const name of excluded) assert.equal(paths.includes(name), false, name);
});

test("nested credential artifacts fail closed without leaking content", async (t) => {
  for (const name of [
    "app/nested/credentials.json",
    "public/nested/service-account.json",
    "scripts/nested/.env.production",
    "lib/nested/private-key.pem",
  ]) {
    const { root, put } = await fixture(t);
    await put(name, "fixture-sensitive-value");
    await assert.rejects(
      collectSourceFiles(root),
      (error) =>
        /Sensitive artifact/.test(error.message) &&
        !error.message.includes("fixture-sensitive-value"),
    );
  }
});

test("distribution contains the verified workflow and buyer screenshot assets only", async (t) => {
  const { root, put } = await fixture(t);
  for (const name of [
    ".github/workflows/verify.yml",
    "docs/buyer/screenshots/demo.png",
    "docs/buyer/screenshots/mobile.webp",
    ".github/workflows/internal.yml",
    "docs/buyer/screenshots/records.csv",
    "docs/superpowers/plan.md",
  ])
    await put(name);
  assert.deepEqual(
    (await collectSourceFiles(root)).map((x) => x.path),
    [
      ".github/workflows/verify.yml",
      "README.md",
      "docs/buyer/screenshots/demo.png",
      "docs/buyer/screenshots/mobile.webp",
      "package.json",
    ],
  );
});

test("private key material hidden in an allowed source file fails closed", async (t) => {
  const { root, put } = await fixture(t);
  await put(
    "lib/config.ts",
    "-----BEGIN " + "PRIVATE KEY-----\nfixture\n-----END PRIVATE KEY-----",
  );
  await assert.rejects(collectSourceFiles(root), /Sensitive content/);
});

test("symlinks in included trees cannot escape the package root", async (t) => {
  const { root, put } = await fixture(t);
  await put("lib/normal.ts");
  const external = await mkdtemp(path.join(os.tmpdir(), "eduhive-external-"));
  t.after(() => rm(external, { recursive: true, force: true }));
  await symlink(
    external,
    path.join(root, "lib", "linked"),
    process.platform === "win32" ? "junction" : "dir",
  );
  await assert.rejects(collectSourceFiles(root), /Symbolic link/);
});

test("staging is deterministic and existing or unsafe output targets are refused", async (t) => {
  const { root, put } = await fixture(t);
  await put("app/page.tsx", "export default function Page() {}");
  const a = path.join(root, "release", "one");
  const b = path.join(root, "release", "two");
  await packageSource(root, a);
  await packageSource(root, b);
  assert.equal(
    await readFile(path.join(a, "SOURCE_MANIFEST.json"), "utf8"),
    await readFile(path.join(b, "SOURCE_MANIFEST.json"), "utf8"),
  );
  assert.equal(
    await readFile(path.join(a, "app/page.tsx"), "utf8"),
    "export default function Page() {}",
  );
  for (const bad of [
    root,
    path.join(root, "app"),
    path.join(root, "release"),
    path.join(root, "..", "escape"),
    path.join(root, "release", "nested", "output"),
    a,
  ])
    await assert.rejects(packageSource(root, bad), /output|exists/i);
});

test("output parent junctions are refused before writing outside the repository", async (t) => {
  const { root } = await fixture(t);
  const external = await mkdtemp(path.join(os.tmpdir(), "eduhive-output-"));
  t.after(() => rm(external, { recursive: true, force: true }));
  await symlink(
    external,
    path.join(root, "release"),
    process.platform === "win32" ? "junction" : "dir",
  );
  await assert.rejects(
    packageSource(root, path.join(root, "release", "bundle")),
    /Symbolic link/,
  );
});

test("a symlink root is refused by collection and staging", async (t) => {
  const { root } = await fixture(t);
  const { root: holder } = await fixture(t);
  const linked = path.join(holder, "linked");
  await symlink(
    root,
    linked,
    process.platform === "win32" ? "junction" : "dir",
  );
  await assert.rejects(collectSourceFiles(linked), /Symbolic link/);
  await assert.rejects(
    packageSource(linked, path.join(linked, "release", "bundle")),
    /Symbolic link/,
  );
});
