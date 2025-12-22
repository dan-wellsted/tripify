-- AlterTable
ALTER TABLE "Trip" ADD COLUMN "startDateTimeZone" TEXT,
ADD COLUMN "endDateTimeZone" TEXT;

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN "startTimeZone" TEXT,
ADD COLUMN "endTimeZone" TEXT;
