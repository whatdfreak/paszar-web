export interface DaySchedule {
  day:
    | "Senin"
    | "Selasa"
    | "Rabu"
    | "Kamis"
    | "Jumat"
    | "Sabtu"
    | "Minggu";
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export const DAYS_OF_WEEK: DaySchedule["day"][] = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

export const TIME_SLOT_OPTIONS: { value: string; label: string }[] = Array.from(
  { length: 33 },
  (_, i) => {
    const totalMinutes = 6 * 60 + i * 30; // 06:00 s/d 22:00 tiap 30 menit
    const hh = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const mm = String(totalMinutes % 60).padStart(2, "0");
    const val = `${hh}:${mm}`;
    return { value: val, label: val };
  }
);

export const DEFAULT_WEEKLY_SCHEDULE: DaySchedule[] = [
  { day: "Senin", isOpen: true, openTime: "08:00", closeTime: "16:00" },
  { day: "Selasa", isOpen: true, openTime: "08:00", closeTime: "16:00" },
  { day: "Rabu", isOpen: true, openTime: "08:00", closeTime: "16:00" },
  { day: "Kamis", isOpen: true, openTime: "08:00", closeTime: "16:00" },
  { day: "Jumat", isOpen: true, openTime: "08:00", closeTime: "16:00" },
  { day: "Sabtu", isOpen: true, openTime: "08:00", closeTime: "14:00" },
  { day: "Minggu", isOpen: false, openTime: "08:00", closeTime: "16:00" },
];

export function parseOperationalHours(raw: string | null | undefined): DaySchedule[] {
  if (!raw) return DEFAULT_WEEKLY_SCHEDULE;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 7) {
      return DEFAULT_WEEKLY_SCHEDULE;
    }
    const valid = parsed.every(
      (item): item is DaySchedule =>
        typeof item === "object" &&
        item !== null &&
        "day" in item &&
        "isOpen" in item &&
        "openTime" in item &&
        "closeTime" in item &&
        typeof (item as DaySchedule).day === "string" &&
        typeof (item as DaySchedule).isOpen === "boolean" &&
        typeof (item as DaySchedule).openTime === "string" &&
        typeof (item as DaySchedule).closeTime === "string"
    );
    return valid ? parsed : DEFAULT_WEEKLY_SCHEDULE;
  } catch {
    return DEFAULT_WEEKLY_SCHEDULE;
  }
}
