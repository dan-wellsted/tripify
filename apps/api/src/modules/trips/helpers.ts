import prisma from "../../lib/db.js";

type TripDates = {
  tripId: string;
  startDate: Date;
  endDate: Date;
};

export async function ensureItineraryDays({ tripId, startDate, endDate }: TripDates) {
  const days: { date: Date; position: number }[] = [];
  const current = new Date(startDate);
  let position = 0;

  while (current.getTime() <= endDate.getTime()) {
    days.push({ date: new Date(current), position });
    current.setUTCDate(current.getUTCDate() + 1);
    position += 1;
  }

  const itinerary = await prisma.itinerary.upsert({
    where: { tripId },
    update: {},
    create: { tripId }
  });

  await prisma.tripDay.deleteMany({ where: { itineraryId: itinerary.id } });

  if (days.length) {
    await prisma.tripDay.createMany({
      data: days.map((day) => ({
        itineraryId: itinerary.id,
        date: day.date,
        position: day.position
      }))
    });
  }
}
