import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextCoreWebVitals,
  ...nextTypeScript,
  prettier,
  globalIgnores([
    ".next/**",
    ".venv/**",
    "graphify-out/**",
    "lib/generated/**",
    "ml-backend/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
