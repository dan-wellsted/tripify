import prisma from "../lib/db.js";

export type TestDbState = {
  isReady: boolean;
};

const requireDb = process.env.CI === "true" || process.env.TEST_DB_REQUIRED === "true";

export async function setupTestDb(label: string): Promise<TestDbState> {
  try {
    await prisma.$connect();
    return { isReady: true };
  } catch (error) {
    if (requireDb) {
      throw error;
    }

    // eslint-disable-next-line no-console
    console.warn(`[test] database not reachable, skipping ${label} tests`);
    return { isReady: false };
  }
}
