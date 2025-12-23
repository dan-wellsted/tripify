import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import app from "./testApp.js";
import prisma from "../lib/db.js";
import { hashPassword } from "../lib/auth.js";
import { setupTestDb } from "./testDb.js";

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

describe("auth", () => {
  beforeAll(async () => {
    if (!hasDatabaseUrl) {
      return;
    }

    const { isReady } = await setupTestDb("auth");
    databaseReady = isReady;
  });

  beforeEach(async () => {
    if (!databaseReady) {
      return;
    }

    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    if (!databaseReady) {
      return;
    }

    await prisma.$disconnect();
  });

  it("register success", withDatabase(async () => {
    const response = await request(app)
      .post("/auth/register")
      .send({
        email: "test@example.com",
        password: "Password1234",
        name: "Test User"
      });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("test@example.com");
    expect(response.body.session.id).toBeTypeOf("string");
  }));

  it("login success", withDatabase(async () => {
    await prisma.user.create({
      data: {
        email: "login@example.com",
        passwordHash: await hashPassword("Password1234"),
        name: null
      }
    });

    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "login@example.com",
        password: "Password1234"
      });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("login@example.com");
    expect(response.body.session.id).toBeTypeOf("string");
  }));

  it("login failure", withDatabase(async () => {
    await prisma.user.create({
      data: {
        email: "fail@example.com",
        passwordHash: await hashPassword("Password1234"),
        name: null
      }
    });

    const response = await request(app)
      .post("/auth/login")
      .send({
        email: "fail@example.com",
        password: "WrongPassword"
      });

    expect(response.status).toBe(401);
  }));

  it("me requires auth", withDatabase(async () => {
    const response = await request(app).get("/auth/me");

    expect(response.status).toBe(401);
  }));
});
