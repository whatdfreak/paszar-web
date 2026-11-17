-- CreateTable (idempotent: tabel mungkin sudah dibuat via db push)
CREATE TABLE IF NOT EXISTS "store_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "whatsapp_number" TEXT NOT NULL,
    "store_name" TEXT NOT NULL DEFAULT 'PASzar Koperasi Lapas Kupang',
    "operational_hours" TEXT NOT NULL DEFAULT 'Senin - Sabtu, 08.00 - 16.00 WITA',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);
