"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateAdminProfile,
  changeAdminPassword,
  updateStoreSettings,
} from "@/actions/settings.actions";
import {
  TIME_SLOT_OPTIONS,
  type DaySchedule,
} from "@/lib/store-hours";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { useAdminI18n, type AdminLang } from "@/lib/admin-i18n";
import {
  User,
  Lock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Clock,
  Globe,
} from "lucide-react";

interface SettingsClientProps {
  initialProfile: {
    name: string;
    email: string;
  };
  initialStore: {
    whatsappNumber: string;
    storeName: string;
    schedule: DaySchedule[];
  };
}

const inputCls =
  "w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1C30]/15 focus:border-[#0B1C30] transition-all bg-white";

export default function SettingsClient({
  initialProfile,
  initialStore,
}: SettingsClientProps) {
  const router = useRouter();
  const { lang, t, switchLang } = useAdminI18n();

  // Profile form state
  const [profile, setProfile] = useState(initialProfile);
  const [profileMsg, setProfileMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSavingProfile, startProfileTransition] = useTransition();

  // Password form state
  const [pwd, setPwd] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSavingPwd, startPwdTransition] = useTransition();

  // Store & WhatsApp form state
  const [store, setStore] = useState(initialStore);
  const [storeMsg, setStoreMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSavingStore, startStoreTransition] = useTransition();

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (profile.name.trim().length < 2) {
      setProfileMsg({ type: "error", text: "Nama minimal 2 karakter." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      setProfileMsg({ type: "error", text: "Format email tidak valid." });
      return;
    }

    startProfileTransition(async () => {
      const res = await updateAdminProfile({
        name: profile.name.trim(),
        email: profile.email.trim(),
      });
      if (res.success) {
        setProfile(res.data);
        setProfileMsg({
          type: "success",
          text: "Profil admin berhasil diperbarui.",
        });
        router.refresh();
      } else {
        setProfileMsg({ type: "error", text: res.error });
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (!pwd.currentPassword) {
      setPwdMsg({ type: "error", text: "Password saat ini wajib diisi." });
      return;
    }
    if (pwd.newPassword.length < 8) {
      setPwdMsg({ type: "error", text: "Password baru minimal 8 karakter." });
      return;
    }
    if (pwd.newPassword !== pwd.confirmPassword) {
      setPwdMsg({
        type: "error",
        text: "Konfirmasi password baru tidak cocok.",
      });
      return;
    }

    startPwdTransition(async () => {
      const res = await changeAdminPassword(pwd);
      if (res.success) {
        setPwd({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPwdMsg({
          type: "success",
          text: "Password berhasil diubah. Gunakan password baru pada login berikutnya.",
        });
      } else {
        setPwdMsg({ type: "error", text: res.error });
      }
    });
  };

  const handleStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStoreMsg(null);

    const digits = store.whatsappNumber.replace(/\D/g, "");
    const normalized = digits.startsWith("0")
      ? `62${digits.slice(1)}`
      : digits;

    if (!/^62\d{8,14}$/.test(normalized)) {
      setStoreMsg({
        type: "error",
        text: "Format nomor WhatsApp tidak valid (contoh: 081234567890 atau 6281234567890).",
      });
      return;
    }
    if (store.storeName.trim().length < 3) {
      setStoreMsg({ type: "error", text: "Nama toko minimal 3 karakter." });
      return;
    }

    for (const dayRow of store.schedule) {
      if (dayRow.isOpen && dayRow.closeTime <= dayRow.openTime) {
        setStoreMsg({
          type: "error",
          text: `Pada hari ${dayRow.day}, jam tutup harus lebih akhir dari jam buka.`,
        });
        return;
      }
    }

    startStoreTransition(async () => {
      const res = await updateStoreSettings({
        whatsappNumber: store.whatsappNumber.trim(),
        storeName: store.storeName.trim(),
        schedule: store.schedule,
      });
      if (res.success) {
        setStore(res.data);
        setStoreMsg({
          type: "success",
          text: "Pengaturan kontak WhatsApp & jadwal operasional berhasil disimpan.",
        });
        router.refresh();
      } else {
        setStoreMsg({ type: "error", text: res.error });
      }
    });
  };

  const handleDayChange = (
    index: number,
    patch: Partial<Pick<DaySchedule, "isOpen" | "openTime" | "closeTime">>
  ) => {
    setStoreMsg(null);
    setStore((prev) => ({
      ...prev,
      schedule: prev.schedule.map((row, idx) =>
        idx === index ? { ...row, ...patch } : row
      ),
    }));
  };

  const applyMondayToWeekdays = () => {
    const monday = store.schedule[0];
    if (!monday) return;
    setStoreMsg(null);
    setStore((prev) => ({
      ...prev,
      schedule: prev.schedule.map((row, idx) =>
        idx >= 1 && idx <= 4
          ? {
              ...row,
              isOpen: monday.isOpen,
              openTime: monday.openTime,
              closeTime: monday.closeTime,
            }
          : row
      ),
    }));
  };

  const previewWaDigits = (() => {
    const d = store.whatsappNumber.replace(/\D/g, "");
    return d.startsWith("0") ? `62${d.slice(1)}` : d;
  })();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminTopBar
        breadcrumbs={[
          { label: "PASzar", href: "/dashboard" },
          { label: t.settings.title },
        ]}
      />

      <div className="p-5 md:p-6 max-w-5xl mx-auto space-y-5 animate-soft-enter">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {t.settings.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.settings.subtitle}
            </p>
          </div>
        </header>

        {/* Pengaturan Bahasa Dashboard (Indonesia / English dengan transisi load) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {t.settings.languageTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.settings.languageDesc}
              </p>
            </div>
          </div>

          <AdminSelect
            value={lang}
            ariaLabel={t.settings.languageTitle}
            align="right"
            menuClassName="w-44"
            onChange={(val) => switchLang(val as AdminLang)}
            options={[
              { value: "id", label: "Indonesia (ID)" },
              { value: "en", label: "English (EN)" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Kiri: Profil & Keamanan Password */}
          <div className="lg:col-span-7 space-y-5">
            {/* Profil Admin */}
            <form
              onSubmit={handleProfileSubmit}
              noValidate
              className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">
                  {t.settings.profileTitle}
                </h2>
              </div>

              {profileMsg && (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
                    profileMsg.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {profileMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  {t.settings.adminNameLabel}
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => {
                    setProfile((p) => ({ ...p, name: e.target.value }));
                    setProfileMsg(null);
                  }}
                  maxLength={80}
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  {t.settings.loginEmailLabel}
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => {
                    setProfile((p) => ({ ...p, email: e.target.value }));
                    setProfileMsg(null);
                  }}
                  maxLength={120}
                  className={inputCls}
                />
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="h-9 px-4 rounded-lg bg-[#0B1C30] hover:bg-[#132944] text-white text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSavingProfile ? t.settings.saving : t.settings.saveProfile}
                </button>
              </div>
            </form>

            {/* Ubah Password */}
            <form
              onSubmit={handlePasswordSubmit}
              noValidate
              className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <h2 className="text-sm font-semibold text-slate-900">
                    {t.settings.passwordTitle}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800"
                >
                  {showPwd ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> {t.settings.hidePwd}
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> {t.settings.showPwd}
                    </>
                  )}
                </button>
              </div>

              {pwdMsg && (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
                    pwdMsg.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {pwdMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{pwdMsg.text}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  {t.settings.currentPwdLabel}
                </label>
                <input
                  type={showPwd ? "text" : "password"}
                  value={pwd.currentPassword}
                  onChange={(e) => {
                    setPwd((p) => ({ ...p, currentPassword: e.target.value }));
                    setPwdMsg(null);
                  }}
                  placeholder={
                    lang === "en"
                      ? "Enter current password"
                      : "Masukkan password saat ini"
                  }
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {t.settings.newPwdLabel}
                  </label>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={pwd.newPassword}
                    onChange={(e) => {
                      setPwd((p) => ({ ...p, newPassword: e.target.value }));
                      setPwdMsg(null);
                    }}
                    placeholder={
                      lang === "en"
                        ? "Minimum 8 characters"
                        : "Minimal 8 karakter"
                    }
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {t.settings.confirmPwdLabel}
                  </label>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={pwd.confirmPassword}
                    onChange={(e) => {
                      setPwd((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }));
                      setPwdMsg(null);
                    }}
                    placeholder={
                      lang === "en"
                        ? "Re-enter new password"
                        : "Ulangi password baru"
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingPwd}
                  className="h-9 px-4 rounded-lg bg-[#0B1C30] hover:bg-[#132944] text-white text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSavingPwd ? t.settings.processing : t.settings.updatePwd}
                </button>
              </div>
            </form>
          </div>

          {/* Kanan: Pengaturan Kontak WhatsApp & Toko (Editable!) */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleStoreSubmit}
              noValidate
              className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">
                  {t.settings.storeTitle}
                </h2>
              </div>

              {storeMsg && (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
                    storeMsg.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {storeMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{storeMsg.text}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  {t.settings.waLabel}
                </label>
                <input
                  type="tel"
                  value={store.whatsappNumber}
                  onChange={(e) => {
                    setStore((s) => ({ ...s, whatsappNumber: e.target.value }));
                    setStoreMsg(null);
                  }}
                  placeholder="081234567890 / 6281234567890"
                  className={`${inputCls} font-mono`}
                />
                <p className="text-[11px] text-slate-400">
                  {t.settings.waHint}{" "}
                  <span className="font-mono text-slate-600">628...</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  {t.settings.storeNameLabel}
                </label>
                <input
                  type="text"
                  value={store.storeName}
                  onChange={(e) => {
                    setStore((s) => ({ ...s, storeName: e.target.value }));
                    setStoreMsg(null);
                  }}
                  maxLength={100}
                  className={inputCls}
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.settings.hoursLabel}</span>
                  </label>
                  <button
                    type="button"
                    onClick={applyMondayToWeekdays}
                    className="text-[11px] font-medium text-[#0B1C30] hover:underline"
                  >
                    {t.settings.matchWeekdays}
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-slate-50/40">
                  {store.schedule.map((row, idx) => (
                    <div
                      key={row.day}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-[96px]">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={row.isOpen}
                          aria-label={`Status buka hari ${row.day}`}
                          onClick={() =>
                            handleDayChange(idx, { isOpen: !row.isOpen })
                          }
                          className={`relative w-7 h-4 rounded-full transition-colors shrink-0 ${
                            row.isOpen ? "bg-emerald-500" : "bg-slate-200"
                          }`}
                        >
                          <span
                            className={`block w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
                              row.isOpen ? "translate-x-3.5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                        <span
                          className={`font-medium ${
                            row.isOpen ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {t.settings.days[row.day]}
                        </span>
                      </div>

                      {row.isOpen ? (
                        <div className="flex items-center gap-1.5">
                          <AdminSelect
                            value={row.openTime}
                            ariaLabel={`Jam buka ${row.day}`}
                            onChange={(val) =>
                              handleDayChange(idx, { openTime: val })
                            }
                            triggerClassName="inline-flex items-center justify-between gap-1.5 h-7 px-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-white text-[11px] font-medium text-slate-800 transition-colors cursor-pointer"
                            menuClassName="w-24"
                            options={TIME_SLOT_OPTIONS}
                          />
                          <span className="text-slate-400 text-[11px]">–</span>
                          <AdminSelect
                            value={row.closeTime}
                            ariaLabel={`Jam tutup ${row.day}`}
                            align="right"
                            onChange={(val) =>
                              handleDayChange(idx, { closeTime: val })
                            }
                            triggerClassName="inline-flex items-center justify-between gap-1.5 h-7 px-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-white text-[11px] font-medium text-slate-800 transition-colors cursor-pointer"
                            menuClassName="w-24"
                            options={TIME_SLOT_OPTIONS}
                          />
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[11px] font-medium">
                          {t.settings.closedLabel}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isSavingStore}
                  className="w-full h-9 rounded-lg bg-[#0B1C30] hover:bg-[#132944] text-white text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSavingStore ? t.settings.saving : t.settings.saveStore}
                </button>

                {previewWaDigits && (
                  <a
                    href={`https://wa.me/${previewWaDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full h-9 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>
                      {t.settings.testChat} (+{previewWaDigits})
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
