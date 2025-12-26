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

export async function resetTestDb(): Promise<void> {
  await prisma.tripDayActivity.deleteMany();
  await prisma.tripDayCity.deleteMany();
  await prisma.tripDayPlace.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.place.deleteMany();
  await prisma.city.deleteMany();
  await prisma.tripDay.deleteMany();
  await prisma.itinerary.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();
}
