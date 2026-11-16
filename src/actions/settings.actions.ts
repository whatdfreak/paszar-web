"use server";

// ============================================================
// PASzar — Admin Settings Server Actions
// ============================================================
// Mengelola profil admin (nama/email) & ubah password dengan
// verifikasi bcrypt dan session guard (A3) + Zod (A4).
// ============================================================

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DAYS_OF_WEEK, type DaySchedule } from "@/lib/store-hours";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter.")
    .max(80, "Nama maksimal 80 karakter."),
  email: z
    .string()
    .trim()
    .email("Format email tidak valid.")
    .max(120, "Email maksimal 120 karakter."),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi."),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter.")
      .max(100, "Password baru maksimal 100 karakter."),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password baru tidak cocok.",
    path: ["confirmPassword"],
  });

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function updateAdminProfile(input: {
  name: string;
  email: string;
}): Promise<ActionResult<{ name: string; email: string }>> {
  try {
    const session = await requireAdminSession();

    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const currentAdmin = await prisma.admin.findUnique({
      where: { email: session.user!.email! },
      select: { id: true },
    });

    if (!currentAdmin) {
      return { success: false, error: "Akun admin tidak ditemukan." };
    }

    const duplicateEmail = await prisma.admin.findFirst({
      where: {
        email: parsed.data.email,
        NOT: { id: currentAdmin.id },
      },
      select: { id: true },
    });
    if (duplicateEmail) {
      return { success: false, error: "Email sudah digunakan akun lain." };
    }

    const updated = await prisma.admin.update({
      where: { id: currentAdmin.id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
      },
      select: { name: true, email: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pengaturan");
    return { success: true, data: updated };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    console.error("[updateAdminProfile]", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat memperbarui profil.",
    };
  }
}

export async function changeAdminPassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResult<{ updated: true }>> {
  try {
    const session = await requireAdminSession();

    const parsed = changePasswordSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const admin = await prisma.admin.findUnique({
      where: { email: session.user!.email! },
      select: { id: true, hashedPassword: true },
    });

    if (!admin) {
      return { success: false, error: "Akun admin tidak ditemukan." };
    }

    const isCurrentValid = await bcrypt.compare(
      parsed.data.currentPassword,
      admin.hashedPassword
    );
    if (!isCurrentValid) {
      return { success: false, error: "Password saat ini salah." };
    }

    const isSame = await bcrypt.compare(
      parsed.data.newPassword,
      admin.hashedPassword
    );
    if (isSame) {
      return {
        success: false,
        error: "Password baru tidak boleh sama dengan password saat ini.",
      };
    }

    const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { hashedPassword: newHash },
    });

    return { success: true, data: { updated: true } };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    console.error("[changeAdminPassword]", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengubah password.",
    };
  }
}

// ── Update Store Settings (WhatsApp & Info Toko) ──────────────

function normalizeIndonesianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }
  return digits;
}

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const dayScheduleSchema = z
  .object({
    day: z.enum([
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu",
    ]),
    isOpen: z.boolean(),
    openTime: z.string().regex(timeRegex, "Format jam buka tidak valid (JJ:MM)."),
    closeTime: z
      .string()
      .regex(timeRegex, "Format jam tutup tidak valid (JJ:MM)."),
  })
  .refine((d) => !d.isOpen || d.closeTime > d.openTime, {
    message: "Jam tutup harus lebih akhir dari jam buka.",
    path: ["closeTime"],
  });

const storeSettingsSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .min(9, "Nomor WhatsApp minimal 9 digit.")
    .max(20, "Nomor WhatsApp maksimal 20 karakter.")
    .transform(normalizeIndonesianPhone)
    .refine((val) => /^62\d{8,14}$/.test(val), {
      message:
        "Gunakan format nomor Indonesia yang valid (contoh: 081234567890 atau 6281234567890).",
    }),
  storeName: z
    .string()
    .trim()
    .min(3, "Nama toko minimal 3 karakter.")
    .max(100, "Nama toko maksimal 100 karakter."),
  schedule: z
    .array(dayScheduleSchema)
    .length(7, "Jadwal operasional harus mencakup 7 hari.")
    .refine(
      (arr) => DAYS_OF_WEEK.every((day, idx) => arr[idx]?.day === day),
      "Urutan hari jadwal operasional tidak valid."
    ),
});

export async function updateStoreSettings(input: {
  whatsappNumber: string;
  storeName: string;
  schedule: DaySchedule[];
}): Promise<
  ActionResult<{
    whatsappNumber: string;
    storeName: string;
    schedule: DaySchedule[];
  }>
> {
  try {
    await requireAdminSession();

    const parsed = storeSettingsSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const serializedSchedule = JSON.stringify(parsed.data.schedule);

    if ("storeSetting" in prisma && prisma.storeSetting) {
      await prisma.storeSetting.upsert({
        where: { id: "default" },
        update: {
          whatsappNumber: parsed.data.whatsappNumber,
          storeName: parsed.data.storeName,
          operationalHours: serializedSchedule,
        },
        create: {
          id: "default",
          whatsappNumber: parsed.data.whatsappNumber,
          storeName: parsed.data.storeName,
          operationalHours: serializedSchedule,
        },
      });
    } else {
      await prisma.$executeRaw`
        INSERT INTO store_settings (id, whatsapp_number, store_name, operational_hours, updated_at)
        VALUES ('default', ${parsed.data.whatsappNumber}, ${parsed.data.storeName}, ${serializedSchedule}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          whatsapp_number = EXCLUDED.whatsapp_number,
          store_name = EXCLUDED.store_name,
          operational_hours = EXCLUDED.operational_hours,
          updated_at = NOW()
      `;
    }

    revalidatePath("/dashboard/pengaturan");
    revalidatePath("/");
    revalidatePath("/katalog");
    return {
      success: true,
      data: {
        whatsappNumber: parsed.data.whatsappNumber,
        storeName: parsed.data.storeName,
        schedule: parsed.data.schedule,
      },
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return { success: false, error: "Unauthorized: Silakan login kembali." };
    }
    console.error("[updateStoreSettings]", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat menyimpan pengaturan toko.",
    };
  }
}
