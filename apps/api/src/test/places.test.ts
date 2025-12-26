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

describe("places", () => {
  beforeAll(async () => {
    if (!hasDatabaseUrl) {
      return;
    }

    const { isReady } = await setupTestDb("places");
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

  it("creates and lists places", withDatabase(async () => {
    const owner = await createUser("owner@example.com");
    const other = await createUser("other@example.com");

    const createResponse = await request(app)
      .post("/places")
      .set("x-test-user-id", owner.id)
      .send({
        name: "Cafe Central",
        address: "Herrengasse 14",
        latitude: 48.2102,
        longitude: 16.3651
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.name).toBe("Cafe Central");

    const listResponse = await request(app)
      .get("/places")
      .set("x-test-user-id", owner.id);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);

    const otherList = await request(app)
      .get("/places")
      .set("x-test-user-id", other.id);

    expect(otherList.status).toBe(200);
    expect(otherList.body).toHaveLength(0);
  }));

  it("gets, updates, and deletes a place", withDatabase(async () => {
    const owner = await createUser("owner@example.com");

    const place = await prisma.place.create({
      data: {
        ownerId: owner.id,
        name: "Museum",
        description: null,
        address: null,
        latitude: null,
        longitude: null
      }
    });

    const getResponse = await request(app)
      .get(`/places/${place.id}`)
      .set("x-test-user-id", owner.id);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.name).toBe("Museum");

    const updateResponse = await request(app)
      .patch(`/places/${place.id}`)
      .set("x-test-user-id", owner.id)
      .send({ name: "Modern Museum", address: "Downtown" });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe("Modern Museum");
    expect(updateResponse.body.address).toBe("Downtown");

    const deleteResponse = await request(app)
      .delete(`/places/${place.id}`)
      .set("x-test-user-id", owner.id);

    expect(deleteResponse.status).toBe(204);
  }));
});
