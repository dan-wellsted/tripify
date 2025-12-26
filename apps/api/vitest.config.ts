import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

function readEnvValue(filePath: string, key: string): string | undefined {
  try {
    const contents = fs.readFileSync(filePath, "utf8");
    const lines = contents.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const [entryKey, ...rest] = trimmed.split("=");
      if (entryKey === key) {
        const value = rest.join("=").trim();
        return value.replace(/^"(.*)"$/, "$1");
      }
    }
  } catch (error) {
    return undefined;
  }

  return undefined;
}

const envPath = path.resolve(__dirname, "../../prisma/.env");
const testDatabaseUrl =
  process.env.DATABASE_URL_TEST ?? readEnvValue(envPath, "DATABASE_URL_TEST");

if (testDatabaseUrl) {
  process.env.DATABASE_URL = testDatabaseUrl;
}

export default defineConfig({
  test: {
    environment: "node",
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
        isolate: false
      }
    },
    fileParallelism: false,
    maxConcurrency: 1,
    sequence: {
      concurrent: false
    },
    env: {
      NODE_ENV: "test",
      DATABASE_URL: process.env.DATABASE_URL
    }
  }
});
