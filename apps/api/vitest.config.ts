import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    threads: false,
    sequence: {
      concurrent: false
    },
    env: {
      NODE_ENV: "test"
    }
  }
});
