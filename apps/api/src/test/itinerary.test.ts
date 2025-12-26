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

async function createTrip(ownerId: string, title: string, startDate?: string, endDate?: string) {
  return prisma.trip.create({
    data: {
      ownerId,
      title,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
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

describe("itinerary days", () => {
  beforeAll(async () => {
    if (!hasDatabaseUrl) {
      return;
    }

    const { isReady } = await setupTestDb("itinerary");
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

  it("lists days generated from trip dates", withDatabase(async () => {
    const owner = await createUser("owner@example.com");
    const tripResponse = await request(app)
      .post("/trips")
      .set("x-test-user-id", owner.id)
      .send({
        title: "Weekend",
        startDate: "2025-06-01T00:00:00.000Z",
        endDate: "2025-06-03T00:00:00.000Z",
        startDateTimeZone: "UTC",
        endDateTimeZone: "UTC"
      });

    expect(tripResponse.status).toBe(201);

    const listResponse = await request(app)
      .get(`/trips/${tripResponse.body.id}/days`)
      .set("x-test-user-id", owner.id);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(3);
    expect(listResponse.body[0].position).toBe(0);
    expect(listResponse.body[2].position).toBe(2);
  }));

  it("returns 404 for non-owner", withDatabase(async () => {
    const owner = await createUser("owner@example.com");
    const other = await createUser("other@example.com");
    const trip = await createTrip(
      owner.id,
      "Weekend",
      "2025-06-01T00:00:00.000Z",
      "2025-06-01T00:00:00.000Z"
    );

    const response = await request(app)
      .get(`/trips/${trip.id}/days`)
      .set("x-test-user-id", other.id);

    expect(response.status).toBe(404);
  }));

  it("attaches places to a day", withDatabase(async () => {
    const owner = await createUser("owner@example.com");
    const trip = await createTrip(
      owner.id,
      "Weekend",
      "2025-06-01T00:00:00.000Z",
      "2025-06-01T00:00:00.000Z"
    );

    const itinerary = await prisma.itinerary.create({
      data: { tripId: trip.id }
    });

    const day = await prisma.tripDay.create({
      data: {
        itineraryId: itinerary.id,
        date: new Date("2025-06-01T00:00:00.000Z"),
        title: "Day 1",
        position: 0
      }
    });

    const place = await prisma.place.create({
      data: {
        ownerId: owner.id,
        name: "Central Park",
        description: null,
        address: null,
        latitude: null,
        longitude: null
      }
    });

    const attachResponse = await request(app)
      .post(`/trips/${trip.id}/days/${day.id}/places`)
      .set("x-test-user-id", owner.id)
      .send({ placeId: place.id });

    expect(attachResponse.status).toBe(201);

    const listResponse = await request(app)
      .get(`/trips/${trip.id}/days/${day.id}/places`)
      .set("x-test-user-id", owner.id);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].place.name).toBe("Central Park");
  }));

  it("attaches cities to a day", withDatabase(async () => {
    const owner = await createUser("owner@example.com");
    const trip = await createTrip(
      owner.id,
      "Weekend",
      "2025-06-01T00:00:00.000Z",
      "2025-06-01T00:00:00.000Z"
    );

    const itinerary = await prisma.itinerary.create({
      data: { tripId: trip.id }
    });

    const day = await prisma.tripDay.create({
      data: {
        itineraryId: itinerary.id,
        date: new Date("2025-06-01T00:00:00.000Z"),
        title: "Day 1",
        position: 0
      }
    });

    const city = await prisma.city.create({
      data: {
        name: "Kyoto",
        country: "Japan",
        region: null,
        latitude: null,
        longitude: null
      }
    });

    const attachResponse = await request(app)
      .post(`/trips/${trip.id}/days/${day.id}/cities`)
      .set("x-test-user-id", owner.id)
      .send({ cityId: city.id });

    expect(attachResponse.status).toBe(201);

    const listResponse = await request(app)
      .get(`/trips/${trip.id}/days/${day.id}/cities`)
      .set("x-test-user-id", owner.id);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].city.name).toBe("Kyoto");
  }));

  it("attaches activities to a day", withDatabase(async () => {
    const owner = await createUser("owner@example.com");
    const trip = await createTrip(
      owner.id,
      "Weekend",
      "2025-06-01T00:00:00.000Z",
      "2025-06-01T00:00:00.000Z"
    );

    const itinerary = await prisma.itinerary.create({
      data: { tripId: trip.id }
    });

    const day = await prisma.tripDay.create({
      data: {
        itineraryId: itinerary.id,
        date: new Date("2025-06-01T00:00:00.000Z"),
        title: "Day 1",
        position: 0
      }
    });

    const activity = await prisma.activity.create({
      data: {
        ownerId: owner.id,
        title: "Walking tour",
        description: null,
        notes: null,
        startTime: null,
        endTime: null
      }
    });

    const attachResponse = await request(app)
      .post(`/trips/${trip.id}/days/${day.id}/activities`)
      .set("x-test-user-id", owner.id)
      .send({ activityId: activity.id });

    expect(attachResponse.status).toBe(201);

    const listResponse = await request(app)
      .get(`/trips/${trip.id}/days/${day.id}/activities`)
      .set("x-test-user-id", owner.id);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].activity.title).toBe("Walking tour");
  }));
});
