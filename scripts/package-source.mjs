import { createHash } from "node:crypto";
import {
  lstat,
  mkdir,
  readdir,
  readFile,
  realpath,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Distribution policy is deliberately independent of gitignore and git status.
const ROOT_FILES = new Set([
  "README.md",
  ".env.example",
  ".gitignore",
  "package.json",
  "package-lock.json",
  "components.json",
  "tsconfig.json",
  "next.config.ts",
  "eslint.config.mjs",
  "postcss.config.mjs",
  "prettier.config.js",
  "vercel.json",
  "render.yaml",
]);
const SOURCE_DIRS = new Set([
  "app",
  "components",
  "lib",
  "types",
  "reports",
  "scripts",
  "tests",
  "prisma",
  "public",
]);
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".venv",
  "venv",
  "__pycache__",
  "generated",
  ".cache",
  "coverage",
  "dist",
  "build",
  "out",
  "release",
  "s2v_old",
  ".pytest_cache",
  ".mypy_cache",
]);
const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
]);
const ASSET_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".ico",
]);
const PUBLIC_ASSETS = new Set([
  "public/images/eduhive-icon.png",
  "public/images/study-workspace.svg",
  "public/images/avatar-placeholder.svg",
]);
const SENSITIVE_NAME =
  /(?:^\.env(?:\.|$)|^\.npmrc$|^\.pypirc$|^id_(?:rsa|ed25519)|credentials?|service[-_]?account|private[-_]?key|secrets?|\.(?:pem|key|p12|pfx|jks|sqlite|db|dump|bak)$)/i;

function allowedFile(relative) {
  if (ROOT_FILES.has(relative) || relative === "ml-backend/.env.example")
    return true;
  const ext = path.posix.extname(relative).toLowerCase();
  if (
    ["app/favicon.ico", "app/icon.png", "app/apple-icon.png"].includes(relative)
  )
    return true;
  if (relative.startsWith(".github/"))
    return relative === ".github/workflows/verify.yml";
  if (relative.startsWith("public/")) return PUBLIC_ASSETS.has(relative);
  if (relative.startsWith("docs/buyer/"))
    return (
      ext === ".md" ||
      ["docs/buyer/npm-license-inventory.json", "docs/buyer/python-license-inventory.json"].includes(relative) ||
      (relative.startsWith("docs/buyer/screenshots/") &&
        ASSET_EXTENSIONS.has(ext))
    );
  if (relative.startsWith("ml-backend/"))
    return (
      [
        "ml-backend/requirements.txt",
        "ml-backend/setup.ps1",
        "ml-backend/Dockerfile",
        "ml-backend/.dockerignore",
        "ml-backend/README.md",
      ].includes(relative) ||
      (/^ml-backend\/(app|tests)\//.test(relative) && ext === ".py")
    );
  if (relative.startsWith("prisma/"))
    return (
      relative === "prisma/schema.prisma" ||
      /^prisma\/migrations\/.+\/(migration\.sql)$/.test(relative) ||
      relative === "prisma/migrations/migration_lock.toml"
    );
  return SOURCE_DIRS.has(relative.split("/")[0]) && SOURCE_EXTENSIONS.has(ext);
}

function hash(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function assertRegular(root, relative) {
  const filename = path.join(root, relative);
  const stat = await lstat(filename);
  if (stat.isSymbolicLink())
    throw new Error(`Symbolic link refused: ${relative}`);
  const resolved = await realpath(filename);
  const rel = path.relative(root, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel))
    throw new Error(`Source escapes root: ${relative}`);
  return stat;
}

function inspectContent(relative, bytes) {
  if (ASSET_EXTENSIONS.has(path.extname(relative).toLowerCase())) return;
  const text = bytes.toString("utf8");
  if (bytes.includes(0)) throw new Error(`Binary source refused: ${relative}`);
  // High-confidence checks only; a human must still review the complete manifest.
  const privateKeyHeader = new RegExp(
    "-----BEGIN " + "(?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
  );
  if (
    privateKeyHeader.test(text) ||
    /\bAKIA[A-Z0-9]{16}\b/.test(text) ||
    /\bgh[pousr]_[A-Za-z0-9]{30,}\b/.test(text)
  )
    throw new Error(`Sensitive content refused: ${relative}`);
}

/** Sorted, portable relative paths with byte lengths and SHA-256 hashes. */
export async function collectSourceFiles(inputRoot) {
  if ((await lstat(inputRoot)).isSymbolicLink())
    throw new Error("Symbolic link root refused");
  const root = await realpath(inputRoot);
  const files = [];
  async function walk(relative) {
    const name = path.posix.basename(relative);
    const stat = await assertRegular(root, relative);
    // Local env files are never distributed. Nested env files elsewhere are an error.
    if (relative === ".env" || relative === "ml-backend/.env") return;
    if (
      !ROOT_FILES.has(relative) &&
      relative !== "ml-backend/.env.example" &&
      SENSITIVE_NAME.test(name)
    )
      throw new Error(`Sensitive artifact refused: ${relative}`);
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(name.toLowerCase())) return;
      for (const entry of (await readdir(path.join(root, relative))).sort())
        await walk(`${relative}/${entry}`);
    } else if (stat.isFile() && allowedFile(relative)) {
      const bytes = await readFile(path.join(root, relative));
      inspectContent(relative, bytes);
      files.push({ path: relative, size: bytes.length, sha256: hash(bytes) });
    } else if (!stat.isFile())
      throw new Error(`Non-regular artifact refused: ${relative}`);
  }
  for (const name of (await readdir(root)).sort()) {
    if (ROOT_FILES.has(name) || SOURCE_DIRS.has(name) || name === ".github")
      await walk(name);
    else if (name === "ml-backend") {
      const stat = await assertRegular(root, name);
      if (!stat.isDirectory()) throw new Error("Invalid backend directory");
      for (const entry of (await readdir(path.join(root, name))).sort()) {
        if (
          [
            "app",
            "tests",
            ".env",
            ".env.example",
            "requirements.txt",
            "setup.ps1",
            "Dockerfile",
            ".dockerignore",
            "README.md",
          ].includes(entry)
        )
          await walk(`${name}/${entry}`);
      }
    } else if (name === "docs") {
      await assertRegular(root, name);
      if ((await readdir(path.join(root, name))).includes("buyer"))
        await walk("docs/buyer");
    }
  }
  return files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/** Creates a NEW release/<single-name> folder only; never deletes or overwrites. */
export async function packageSource(inputRoot, inputOutput) {
  if ((await lstat(inputRoot)).isSymbolicLink())
    throw new Error("Symbolic link root refused");
  const root = await realpath(inputRoot);
  const output = path.resolve(
    inputOutput ?? path.join(root, "release", "eduhive-source"),
  );
  const relative = path.relative(root, output).split(path.sep);
  if (
    relative.length !== 2 ||
    relative[0] !== "release" ||
    !/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(relative[1])
  )
    throw new Error(
      "Unsafe output: choose release/<single-name> inside the project",
    );
  const parent = path.join(root, "release");
  try {
    const stat = await lstat(parent);
    if (stat.isSymbolicLink())
      throw new Error("Symbolic link output parent refused");
    if (!stat.isDirectory()) throw new Error("Invalid output parent");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  try {
    await lstat(output);
    throw new Error("Output already exists; choose a new release name");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const manifest = await collectSourceFiles(root);
  await mkdir(parent, { recursive: true });
  await mkdir(output); // exclusive creation; never merge a previous release
  for (const entry of manifest) {
    await assertRegular(root, entry.path);
    const bytes = await readFile(path.join(root, entry.path));
    if (hash(bytes) !== entry.sha256)
      throw new Error(
        `Source changed during packaging: ${entry.path}; discard this incomplete staging folder`,
      );
    const destination = path.join(output, entry.path);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes, { flag: "wx" });
  }
  await writeFile(
    path.join(output, "SOURCE_MANIFEST.json"),
    `${JSON.stringify({ formatVersion: 1, files: manifest }, null, 2)}\n`,
    { flag: "wx" },
  );
  return manifest;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  try {
    if (process.argv.length > 3)
      throw new Error("Usage: node scripts/package-source.mjs [release/name]");
    const output = path.resolve(
      root,
      process.argv[2] ?? "release/eduhive-source",
    );
    const manifest = await packageSource(root, output);
    console.log(
      `Staged ${manifest.length} files at ${output}. Review SOURCE_MANIFEST.json and provenance before archiving.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
