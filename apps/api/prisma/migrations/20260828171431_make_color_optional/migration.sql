-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "color" TEXT,
    "description" TEXT NOT NULL,
    "isNeutered" BOOLEAN NOT NULL DEFAULT false,
    "isVaccinated" BOOLEAN NOT NULL DEFAULT false,
    "healthStatus" TEXT,
    "personality" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "location" TEXT,
    "temperament" TEXT,
    "compatibilityChildren" TEXT,
    "compatibilityAnimals" TEXT,
    "microchip" BOOLEAN NOT NULL DEFAULT false,
    "allergies" TEXT,
    "adoptionReason" TEXT,
    "adoptionReasonDetails" TEXT,
    "acceptOutsideCity" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT,
    "shelterId" TEXT,
    CONSTRAINT "pets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "pets_shelterId_fkey" FOREIGN KEY ("shelterId") REFERENCES "shelters" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_pets" ("acceptOutsideCity", "adoptionReason", "adoptionReasonDetails", "age", "allergies", "breed", "color", "compatibilityAnimals", "compatibilityChildren", "createdAt", "description", "gender", "healthStatus", "id", "images", "isNeutered", "isVaccinated", "location", "microchip", "name", "ownerId", "personality", "shelterId", "size", "species", "status", "temperament", "updatedAt") SELECT "acceptOutsideCity", "adoptionReason", "adoptionReasonDetails", "age", "allergies", "breed", "color", "compatibilityAnimals", "compatibilityChildren", "createdAt", "description", "gender", "healthStatus", "id", "images", "isNeutered", "isVaccinated", "location", "microchip", "name", "ownerId", "personality", "shelterId", "size", "species", "status", "temperament", "updatedAt" FROM "pets";
DROP TABLE "pets";
ALTER TABLE "new_pets" RENAME TO "pets";
CREATE INDEX "pets_species_status_idx" ON "pets"("species", "status");
CREATE INDEX "pets_size_status_idx" ON "pets"("size", "status");
CREATE INDEX "pets_ownerId_idx" ON "pets"("ownerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
