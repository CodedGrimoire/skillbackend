-- Set booking status default to UPCOMING (after enum values exist)
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';

-- Categories table (ensure pgcrypto for UUID generation)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL UNIQUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
