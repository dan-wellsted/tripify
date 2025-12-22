import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
