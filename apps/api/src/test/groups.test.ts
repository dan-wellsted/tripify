import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "./testApp.js";
import prisma from "../lib/db.js";
import { hashPassword } from "../lib/auth.js";
import { resetTestDb, setupTestDb } from "./testDb.js";

async function createUser(email: string) {
  const [local, domain] = email.split("@");
  const uniqueEmail = `${local}+${randomUUID()}@${domain ?? "example.com"}`;
  return prisma.user.create({
    data: {
      email: uniqueEmail,
      passwordHash: await hashPassword("Password1234"),
      name: "Member"
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

describe("groups", () => {
  beforeAll(async () => {
    if (!hasDatabaseUrl) {
      return;
    }

    const { isReady } = await setupTestDb("groups");
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

  it("creates a group and lists it", withDatabase(async () => {
    const owner = await createUser("owner@example.com");

    const createResponse = await request(app)
      .post("/groups")
      .set("x-test-user-id", owner.id)
      .send({ name: "Road Trip Crew" });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.name).toBe("Road Trip Crew");

    const listResponse = await request(app)
      .get("/groups")
      .set("x-test-user-id", owner.id);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].ownerId).toBe(owner.id);
  }));

  it("adds and removes group members", withDatabase(async () => {
    const owner = await createUser("owner@example.com");
    const member = await createUser("member@example.com");

    const groupResponse = await request(app)
      .post("/groups")
      .set("x-test-user-id", owner.id)
      .send({ name: "Friends" });

    const addResponse = await request(app)
      .post(`/groups/${groupResponse.body.id}/members`)
      .set("x-test-user-id", owner.id)
      .send({ email: member.email });

    expect(addResponse.status).toBe(201);
    expect(addResponse.body.user.email).toBe(member.email);

    const listResponse = await request(app)
      .get(`/groups/${groupResponse.body.id}/members`)
      .set("x-test-user-id", owner.id);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(2);

    const deleteResponse = await request(app)
      .delete(`/groups/${groupResponse.body.id}/members/${addResponse.body.id}`)
      .set("x-test-user-id", owner.id);

    expect(deleteResponse.status).toBe(204);

    const afterDelete = await request(app)
      .get(`/groups/${groupResponse.body.id}/members`)
      .set("x-test-user-id", owner.id);

    expect(afterDelete.status).toBe(200);
    expect(afterDelete.body).toHaveLength(1);
  }));

  it("lists groups for members", withDatabase(async () => {
    const owner = await createUser("owner@example.com");
    const member = await createUser("member@example.com");

    const groupResponse = await request(app)
      .post("/groups")
      .set("x-test-user-id", owner.id)
      .send({ name: "Family" });

    await request(app)
      .post(`/groups/${groupResponse.body.id}/members`)
      .set("x-test-user-id", owner.id)
      .send({ email: member.email });

    const listResponse = await request(app)
      .get("/groups")
      .set("x-test-user-id", member.id);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].name).toBe("Family");
  }));

  it("assigns a trip to a group", withDatabase(async () => {
    const owner = await createUser("owner@example.com");

    const groupResponse = await request(app)
      .post("/groups")
      .set("x-test-user-id", owner.id)
      .send({ name: "Partners" });

    const tripResponse = await request(app)
      .post("/trips")
      .set("x-test-user-id", owner.id)
      .send({ title: "Shared Trip" });

    const updateResponse = await request(app)
      .patch(`/trips/${tripResponse.body.id}`)
      .set("x-test-user-id", owner.id)
      .send({ groupId: groupResponse.body.id });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.groupId).toBe(groupResponse.body.id);
  }));
});
