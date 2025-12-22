import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "./testApp.js";
import prisma from "../lib/db.js";
import { hashPassword } from "../lib/auth.js";

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
let databaseReady = false;

async function createUser(email: string) {
  return prisma.user.create({
    data: {
      email,
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

describe("activities", () => {
  beforeAll(async () => {
    if (!hasDatabaseUrl) {
      return;
    }

    try {
      await prisma.$connect();
      databaseReady = true;
    } catch {
      databaseReady = false;
      // eslint-disable-next-line no-console
      console.warn("[test] database not reachable, skipping activities tests");
    }
  });

  beforeEach(async () => {
    if (!databaseReady) {
      return;
    }

    await prisma.tripDayActivity.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.place.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    if (!databaseReady) {
      return;
    }

    await prisma.$disconnect();
  });

  it("creates and lists activities", withDatabase(async () => {
    const owner = await createUser("owner@example.com");
    const place = await prisma.place.create({
      data: {
        ownerId: owner.id,
        name: "Shrine",
        description: null,
        address: null,
        latitude: null,
        longitude: null
      }
    });

    const createResponse = await request(app)
      .post("/activities")
      .set("x-test-user-id", owner.id)
      .send({
        title: "Morning tour",
        placeId: place.id,
        startTime: "2025-06-01T09:00:00.000Z",
        endTime: "2025-06-01T11:00:00.000Z"
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.title).toBe("Morning tour");
    expect(createResponse.body.place.name).toBe("Shrine");

    const listResponse = await request(app)
      .get("/activities")
      .set("x-test-user-id", owner.id);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
  }));

  it("gets, updates, and deletes an activity", withDatabase(async () => {
    const owner = await createUser("owner@example.com");

    const activity = await prisma.activity.create({
      data: {
        ownerId: owner.id,
        title: "Check-in",
        description: null,
        notes: null,
        startTime: null,
        endTime: null
      }
    });

    const getResponse = await request(app)
      .get(`/activities/${activity.id}`)
      .set("x-test-user-id", owner.id);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.title).toBe("Check-in");

    const updateResponse = await request(app)
      .patch(`/activities/${activity.id}`)
      .set("x-test-user-id", owner.id)
      .send({ notes: "Bring passport" });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.notes).toBe("Bring passport");

    const deleteResponse = await request(app)
      .delete(`/activities/${activity.id}`)
      .set("x-test-user-id", owner.id);

    expect(deleteResponse.status).toBe(204);
  }));
});
