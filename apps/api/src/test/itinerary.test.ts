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

    try {
      await prisma.$connect();
      databaseReady = true;
    } catch {
      databaseReady = false;
      // eslint-disable-next-line no-console
      console.warn("[test] database not reachable, skipping itinerary tests");
    }
  });

  beforeEach(async () => {
    if (!databaseReady) {
      return;
    }

    await prisma.tripDayCity.deleteMany();
    await prisma.city.deleteMany();
    await prisma.tripDayPlace.deleteMany();
    await prisma.place.deleteMany();
    await prisma.tripDay.deleteMany();
    await prisma.itinerary.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    if (!databaseReady) {
      return;
    }

    await prisma.$disconnect();
  });

  it("lists days generated from trip dates", withDatabase(async () => {
    const owner = await createUser("owner@example.com");
    const trip = await createTrip(
      owner.id,
      "Weekend",
      "2025-06-01T00:00:00.000Z",
      "2025-06-03T00:00:00.000Z"
    );

    await request(app)
      .post(`/trips/${trip.id}/days`)
      .set("x-test-user-id", owner.id)
      .send({
        date: "2025-06-01T00:00:00.000Z",
        title: "Arrival"
      });

    const listResponse = await request(app)
      .get(`/trips/${trip.id}/days`)
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
});
