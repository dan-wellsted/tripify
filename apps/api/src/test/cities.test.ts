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

describe("cities", () => {
  beforeAll(async () => {
    if (!hasDatabaseUrl) {
      return;
    }

    const { isReady } = await setupTestDb("cities");
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

  it("creates and lists cities", withDatabase(async () => {
    const user = await createUser("owner@example.com");

    const createResponse = await request(app)
      .post("/cities")
      .set("x-test-user-id", user.id)
      .send({ name: "Tokyo", country: "Japan" });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.name).toBe("Tokyo");

    const listResponse = await request(app)
      .get("/cities")
      .set("x-test-user-id", user.id);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
  }));

  it("prevents duplicate cities", withDatabase(async () => {
    const user = await createUser("owner@example.com");

    await prisma.city.create({
      data: {
        name: "Lisbon",
        country: "Portugal",
        region: null,
        latitude: null,
        longitude: null
      }
    });

    const response = await request(app)
      .post("/cities")
      .set("x-test-user-id", user.id)
      .send({ name: "Lisbon", country: "Portugal" });

    expect(response.status).toBe(409);
  }));
});
