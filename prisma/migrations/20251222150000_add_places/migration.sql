-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripDayPlace" (
    "id" TEXT NOT NULL,
    "tripDayId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripDayPlace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Place_ownerId_createdAt_idx" ON "Place"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "TripDayPlace_tripDayId_position_idx" ON "TripDayPlace"("tripDayId", "position");

-- CreateIndex
CREATE INDEX "TripDayPlace_tripDayId_placeId_idx" ON "TripDayPlace"("tripDayId", "placeId");

-- CreateIndex
CREATE INDEX "TripDayPlace_placeId_idx" ON "TripDayPlace"("placeId");

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripDayPlace" ADD CONSTRAINT "TripDayPlace_tripDayId_fkey" FOREIGN KEY ("tripDayId") REFERENCES "TripDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripDayPlace" ADD CONSTRAINT "TripDayPlace_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
