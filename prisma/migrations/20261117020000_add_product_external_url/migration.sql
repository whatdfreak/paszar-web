-- AlterTable (idempotent untuk database yang memakai db push maupun migrate)
ALTER TABLE "products"
ADD COLUMN IF NOT EXISTS "external_url" TEXT;
