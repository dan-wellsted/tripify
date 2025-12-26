import { PrismaClient } from "@prisma/client";
import { createRequire } from "node:module";

const prisma = new PrismaClient();

const seedEmail = "test@test.com";
const seedPassword = "Password1234";

const require = createRequire(new URL("../apps/api/package.json", import.meta.url));
const bcrypt = require("bcryptjs");

const cities = [
  {
    name: "Tokyo",
    country: "Japan",
    region: "Kanto",
    latitude: 35.6895,
    longitude: 139.6917
  },
  {
    name: "Kyoto",
    country: "Japan",
    region: "Kansai",
    latitude: 35.0116,
    longitude: 135.7681
  },
  {
    name: "Osaka",
    country: "Japan",
    region: "Kansai",
    latitude: 34.6937,
    longitude: 135.5023
  },
  {
    name: "Hiroshima",
    country: "Japan",
    region: "Chugoku",
    latitude: 34.3853,
    longitude: 132.4553
  },
  {
    name: "Fukuoka",
    country: "Japan",
    region: "Kyushu",
    latitude: 33.5904,
    longitude: 130.4017
  },
  {
    name: "Sapporo",
    country: "Japan",
    region: "Hokkaido",
    latitude: 43.0618,
    longitude: 141.3545
  },
  {
    name: "Nara",
    country: "Japan",
    region: "Kansai",
    latitude: 34.6851,
    longitude: 135.8048
  }
];

async function main() {
  const passwordHash = bcrypt.hashSync(seedPassword, 12);
  const owner = await prisma.user.upsert({
    where: { email: seedEmail },
    update: { name: "Test User", passwordHash },
    create: {
      email: seedEmail,
      name: "Test User",
      passwordHash
    }
  });

  for (const city of cities) {
    await prisma.city.upsert({
      where: {
        name_country: {
          name: city.name,
          country: city.country
        }
      },
      update: {
        region: city.region,
        latitude: city.latitude,
        longitude: city.longitude
      },
      create: city
    });
  }

  const trip = await prisma.trip.upsert({
    where: { id: "seed-trip-japan" },
    update: {},
    create: {
      id: "seed-trip-japan",
      ownerId: owner.id,
      title: "Japan Highlights",
      description: "Seeded trip with cities, places, and activities.",
      startDate: new Date("2025-04-10T00:00:00.000Z"),
      endDate: new Date("2025-04-13T00:00:00.000Z")
    }
  });

  const itinerary = await prisma.itinerary.upsert({
    where: { tripId: trip.id },
    update: {},
    create: { tripId: trip.id }
  });

  const days = await prisma.tripDay.findMany({
    where: { itineraryId: itinerary.id },
    orderBy: { position: "asc" }
  });

  const dayIds =
    days.length > 0
      ? days
      : await prisma.tripDay.createMany({
          data: [
            {
              itineraryId: itinerary.id,
              date: new Date("2025-04-10T00:00:00.000Z"),
              title: "Arrival",
              position: 0
            },
            {
              itineraryId: itinerary.id,
              date: new Date("2025-04-11T00:00:00.000Z"),
              title: "Kyoto",
              position: 1
            },
            {
              itineraryId: itinerary.id,
              date: new Date("2025-04-12T00:00:00.000Z"),
              title: "Osaka",
              position: 2
            },
            {
              itineraryId: itinerary.id,
              date: new Date("2025-04-13T00:00:00.000Z"),
              title: "Departure",
              position: 3
            }
          ]
        })
        .then(async () =>
          prisma.tripDay.findMany({
            where: { itineraryId: itinerary.id },
            orderBy: { position: "asc" }
          })
        );

  const [tokyo, kyoto, osaka] = await Promise.all([
    prisma.city.findFirst({ where: { name: "Tokyo", country: "Japan" } }),
    prisma.city.findFirst({ where: { name: "Kyoto", country: "Japan" } }),
    prisma.city.findFirst({ where: { name: "Osaka", country: "Japan" } })
  ]);

  if (kyoto && dayIds[1]) {
    await prisma.tripDayCity.create({
      data: { tripDayId: dayIds[1].id, cityId: kyoto.id, position: 0 }
    });
  }
  if (osaka && dayIds[2]) {
    await prisma.tripDayCity.create({
      data: { tripDayId: dayIds[2].id, cityId: osaka.id, position: 0 }
    });
  }
  if (tokyo && dayIds[0]) {
    await prisma.tripDayCity.create({
      data: { tripDayId: dayIds[0].id, cityId: tokyo.id, position: 0 }
    });
  }

  const [shibuya, fushimi] = await Promise.all([
    prisma.place.upsert({
      where: { id: "seed-place-shibuya" },
      update: {},
      create: {
        id: "seed-place-shibuya",
        ownerId: owner.id,
        name: "Shibuya Crossing",
        description: "Iconic Tokyo intersection.",
        address: "Shibuya City, Tokyo",
        latitude: 35.6595,
        longitude: 139.7005
      }
    }),
    prisma.place.upsert({
      where: { id: "seed-place-fushimi" },
      update: {},
      create: {
        id: "seed-place-fushimi",
        ownerId: owner.id,
        name: "Fushimi Inari Taisha",
        description: "Famed torii gates shrine.",
        address: "Fushimi Ward, Kyoto",
        latitude: 34.9671,
        longitude: 135.7727
      }
    })
  ]);

  if (dayIds[0]) {
    await prisma.tripDayPlace.create({
      data: { tripDayId: dayIds[0].id, placeId: shibuya.id, position: 0 }
    });
  }
  if (dayIds[1]) {
    await prisma.tripDayPlace.create({
      data: { tripDayId: dayIds[1].id, placeId: fushimi.id, position: 0 }
    });
  }

  const activity = await prisma.activity.upsert({
    where: { id: "seed-activity-tour" },
    update: {},
    create: {
      id: "seed-activity-tour",
      ownerId: owner.id,
      placeId: fushimi.id,
      title: "Sunrise shrine walk",
      description: "Early walk through the torii gates.",
      notes: "Bring water and snacks.",
      startTime: new Date("2025-04-11T21:00:00.000Z"),
      endTime: new Date("2025-04-11T23:00:00.000Z")
    }
  });

  if (dayIds[1]) {
    await prisma.tripDayActivity.create({
      data: { tripDayId: dayIds[1].id, activityId: activity.id, position: 0 }
    });
  }
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("[seed] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
