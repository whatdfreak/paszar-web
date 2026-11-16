import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseOperationalHours } from "@/lib/store-hours";
import SettingsClient from "@/components/admin/SettingsClient";

export const metadata: Metadata = {
  title: "Pengaturan — PASzar Admin",
};

export const dynamic = "force-dynamic";

interface StoreSettingRow {
  whatsapp_number: string;
  store_name: string;
  operational_hours: string;
}

export default async function PengaturanPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
    select: { name: true, email: true },
  });

  let storeData: {
    whatsappNumber: string;
    storeName: string;
    operationalHours: string;
  } | null = null;

  try {
    if ("storeSetting" in prisma && prisma.storeSetting) {
      storeData = await prisma.storeSetting.findUnique({
        where: { id: "default" },
        select: {
          whatsappNumber: true,
          storeName: true,
          operationalHours: true,
        },
      });
    } else {
      const rows = await prisma.$queryRaw<StoreSettingRow[]>`
        SELECT whatsapp_number, store_name, operational_hours
        FROM store_settings
        WHERE id = 'default'
        LIMIT 1
      `;
      if (rows[0]) {
        storeData = {
          whatsappNumber: rows[0].whatsapp_number,
          storeName: rows[0].store_name,
          operationalHours: rows[0].operational_hours,
        };
      }
    }
  } catch (err) {
    console.error("[PengaturanPage] storeSetting fetch error:", err);
  }

  const envFallbackWa =
    process.env.ADMIN_WHATSAPP_NUMBER?.trim() ||
    process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER?.trim() ||
    "6281234567890";

  return (
    <SettingsClient
      initialProfile={{
        name: admin?.name ?? session.user.name ?? "Admin",
        email: admin?.email ?? session.user.email,
      }}
      initialStore={{
        whatsappNumber: storeData?.whatsappNumber ?? envFallbackWa,
        storeName: storeData?.storeName ?? "PASzar Koperasi Lapas Kupang",
        schedule: parseOperationalHours(storeData?.operationalHours),
      }}
    />
  );
}
