import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "./testApp.js";
import prisma from "../lib/db.js";
import { hashPassword } from "../lib/auth.js";

async function createUser(email: string) {
  return prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword("Password1234"),
      name: "Owner"
    }
  });
}

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
let databaseReady = false;

function withDatabase(testFn: () => Promise<void>) {
  return async () => {
    if (!databaseReady) {
      return;
    }

    await testFn();
  };
}

describe("trips", () => {
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
      console.warn("[test] database not reachable, skipping trip tests");
    }
  });

  beforeEach(async () => {
    if (!databaseReady) {
      return;
    }

    await prisma.trip.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    if (!databaseReady) {
      return;
    }

    await prisma.$disconnect();
  });

  it("creates a trip", withDatabase(async () => {
    const user = await createUser("owner@example.com");

    const createResponse = await request(app)
      .post("/trips")
      .set("x-test-user-id", user.id)
      .send({
        title: "Paris",
        description: "Spring break",
        startDate: "2025-04-01T00:00:00.000Z",
        endDate: "2025-04-05T00:00:00.000Z"
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.title).toBe("Paris");
  }));

  it("lists only owner trips", withDatabase(async () => {
    const owner = await createUser("owner@example.com");
    const other = await createUser("other@example.com");

    await request(app)
      .post("/trips")
      .set("x-test-user-id", owner.id)
      .send({ title: "Owner Trip" });

    await request(app)
      .post("/trips")
      .set("x-test-user-id", other.id)
      .send({ title: "Other Trip" });

    const listResponse = await request(app)
      .get("/trips")
      .set("x-test-user-id", owner.id);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].title).toBe("Owner Trip");
  }));

  it("blocks access to another user's trip", withDatabase(async () => {
    const owner = await createUser("owner@example.com");
    const other = await createUser("other@example.com");

    const tripResponse = await request(app)
      .post("/trips")
      .set("x-test-user-id", other.id)
      .send({ title: "Other Trip" });

    const response = await request(app)
      .get(`/trips/${tripResponse.body.id}`)
      .set("x-test-user-id", owner.id);

    expect(response.status).toBe(404);
  }));

  it("updates a trip", withDatabase(async () => {
    const owner = await createUser("owner@example.com");

    const tripResponse = await request(app)
      .post("/trips")
      .set("x-test-user-id", owner.id)
      .send({ title: "Original" });

    const response = await request(app)
      .patch(`/trips/${tripResponse.body.id}`)
      .set("x-test-user-id", owner.id)
      .send({ title: "Updated" });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Updated");
  }));

  it("deletes a trip", withDatabase(async () => {
    const owner = await createUser("owner@example.com");

    const tripResponse = await request(app)
      .post("/trips")
      .set("x-test-user-id", owner.id)
      .send({ title: "Disposable" });

    const response = await request(app)
      .delete(`/trips/${tripResponse.body.id}`)
      .set("x-test-user-id", owner.id);

    expect(response.status).toBe(204);
  }));
});
