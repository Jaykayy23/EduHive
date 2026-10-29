import { verify } from "@node-rs/argon2";

export function authOrigins(
  base: string,
  additional = "",
  production = false,
): string[] {
  return [
    ...new Set(
      [
        base,
        ...additional
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      ].map((value) => {
        const url = new URL(value);
        if (
          !["https:", "http:"].includes(url.protocol) ||
          url.username ||
          url.password ||
          url.pathname !== "/" ||
          url.search ||
          url.hash ||
          (production && url.protocol !== "https:")
        ) {
          throw new Error(
            "Auth origins must be exact HTTP(S) origins; production requires HTTPS",
          );
        }
        return url.origin;
      }),
    ),
  ];
}

export async function verifyPassword(
  encoded: string,
  password: string,
): Promise<boolean> {
  try {
    return await verify(encoded, password);
  } catch {
    return false;
  }
}
