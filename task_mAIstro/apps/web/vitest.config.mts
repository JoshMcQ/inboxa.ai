import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "next/server": path.resolve(__dirname, "./tests/mocks/next-server.ts"),
    },
  },
  test: {
    environment: "node",
    environmentMatchGlobs: [["**/__tests__/**/*.test.tsx", "jsdom"]],
    env: {
      ...config({ path: "./.env.test" }).parsed,
    },
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
})
