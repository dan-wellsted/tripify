import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "./testApp.js";
import prisma from "../lib/db.js";
import { hashPassword } from "../lib/auth.js";
import { resetTestDb, setupTestDb } from "./testDb.js";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
let databaseReady = false;

async function createUser(email: string) {
  const [local, domain] = email.split("@");
  const uniqueEmail = `${local}+${randomUUID()}@${domain ?? "example.com"}`;
  return prisma.user.create({
    data: {
      email: uniqueEmail,
      passwordHash: await hashPassword("Password1234"),
      name: null
    }
  });
}

function withDatabase(testFn: () => Promise<void>) {
  return async () => {
    if (!databaseReady) {
      return;
    }

    await testFn();
  };
}

describe("itinerary ordering", () => {
  beforeAll(async () => {
    if (!hasDatabaseUrl) {
      return;
    }

    const { isReady } = await setupTestDb("ordering");
    databaseReady = isReady;
  });

  beforeEach(async () => {
    if (!databaseReady) {
      return;
    }

    await resetTestDb();
  });

  afterAll(async () => {
    if (!databaseReady) {
      return;
    }

    await prisma.$disconnect();
  });

  it("reorders trip days deterministically", withDatabase(async () => {
    const owner = await createUser("owner@example.com");
    const trip = await prisma.trip.create({
      data: {
        ownerId: owner.id,
        title: "Paris",
        startDate: new Date("2025-06-01T00:00:00.000Z"),
        endDate: new Date("2025-06-03T00:00:00.000Z")
      }
    });

    const itinerary = await prisma.itinerary.create({
      data: { tripId: trip.id }
    });

    const dayA = await prisma.tripDay.create({
      data: {
        itineraryId: itinerary.id,
        date: new Date("2025-06-01T00:00:00.000Z"),
        title: "Day 1",
        position: 0
      }
    });
    const dayB = await prisma.tripDay.create({
      data: {
        itineraryId: itinerary.id,
        date: new Date("2025-06-02T00:00:00.000Z"),
        title: "Day 2",
        position: 1
      }
    });

    const response = await request(app)
      .patch(`/trips/${trip.id}/days/reorder`)
      .set("x-test-user-id", owner.id)
      .send({ orderedIds: [dayB.id, dayA.id] });

    expect(response.status).toBe(204);

    const updated = await prisma.tripDay.findMany({
      where: { itineraryId: itinerary.id },
      orderBy: { position: "asc" }
    });

    expect(updated[0].id).toBe(dayB.id);
    expect(updated[1].id).toBe(dayA.id);
  }));
});
