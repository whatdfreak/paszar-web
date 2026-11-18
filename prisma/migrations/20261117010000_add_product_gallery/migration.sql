-- AlterTable (idempotent untuk database yang memakai db push maupun migrate)
ALTER TABLE "products"
ADD COLUMN IF NOT EXISTS "gallery_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
