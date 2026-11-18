import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { MAX_GALLERY_IMAGES } from "@/validations/product.schema";

const FLOBAKARYA_CATALOG_URL = "https://flobakarya.com/products.php";
const FLOBAKARYA_ORIGIN = "https://flobakarya.com";
const SYNC_TTL_MS = 30 * 60 * 1000;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");
const SOURCE_MAP_PATH = path.join(UPLOAD_DIR, "flobakarya-sources.json");

export interface SyncFlobakaryaOptions {
  force?: boolean;
  htmlOverride?: string;
}

export interface SyncFlobakaryaResult {
  skipped: boolean;
  error?: string;
  parsedCount: number;
  syncedCount: number;
  createdCount: number;
  updatedCount: number;
  deactivatedCount: number;
  syncedAt: number;
}

interface FlobakaryaSizeOption {
  id?: number;
  label?: string;
  model_label?: string;
  size_label?: string;
  dimensions?: string;
  length?: string;
  width?: string;
  price?: number;
  price_label?: string;
  stock?: number;
  stock_label?: string;
}

interface FlobakaryaColorOption {
  label?: string;
  value?: string;
  hex?: string;
}

export interface ParsedFlobakaryaProduct {
  flobakaryaId: string;
  flobakaryaCategory: string;
  categorySlug: "tenun-tradisional" | "kerajinan-tangan" | "kuliner-hasil-tani";
  name: string;
  slug: string;
  description: string;
  story: string;
  price: number;
  stock: number;
  remoteImagePaths: string[];
  externalUrl: string;
}

interface SyncGlobalState {
  lastSyncAt: number;
  inFlight: Promise<SyncFlobakaryaResult> | null;
}

const globalForSync = globalThis as unknown as {
  __flobakaryaSyncState?: SyncGlobalState;
};

function getSyncState(): SyncGlobalState {
  if (!globalForSync.__flobakaryaSyncState) {
    globalForSync.__flobakaryaSyncState = {
      lastSyncAt: 0,
      inFlight: null,
    };
  }
  return globalForSync.__flobakaryaSyncState;
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function safeParseJsonArray<T>(raw: string | undefined): T[] {
  if (!raw) return [];
  try {
    const normalized = raw.replace(/&quot;/g, '"').replace(/\\\//g, "/");
    const parsed: unknown = JSON.parse(normalized);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function mapCategorySlug(
  flobaCat: string
): "tenun-tradisional" | "kerajinan-tangan" | "kuliner-hasil-tani" {
  const normalized = flobaCat.toLowerCase();
  if (normalized.includes("tenun")) return "tenun-tradisional";
  if (
    normalized.includes("kebun") ||
    normalized.includes("makanan") ||
    normalized.includes("minuman")
  ) {
    return "kuliner-hasil-tani";
  }
  return "kerajinan-tangan";
}

function buildStory(flobaCat: string, name: string): string {
  const base =
    "Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.";
  const normalized = flobaCat.toLowerCase();
  if (normalized.includes("tenun")) {
    return `${name} ditenun dan dikerjakan dengan ketekunan tinggi oleh warga binaan perempuan Kupang untuk melestarikan ragam motif tradisional NTT. ${base}`;
  }
  if (normalized.includes("rajutan") || normalized.includes("kerajinan")) {
    return `${name} merupakan buah tangan terampil warga binaan perempuan Kupang yang memadukan kerapian teknik kriya dan sentuhan estetika modern. ${base}`;
  }
  if (normalized.includes("kebun")) {
    return `${name} dibudidayakan secara segar di lahan ketahanan pangan Lapas Perempuan Kelas IIB Kupang melalui program agribisnis pembinaan kemandirian.`;
  }
  return `${name} diolah dari dapur tata boga Lapas Perempuan Kelas IIB Kupang dengan standar kebersihan dan cita rasa terjaga dalam program kemandirian FLOBAKARYA.`;
}

function formatSizeVariant(opt: FlobakaryaSizeOption): string | null {
  const labelParts = [opt.model_label, opt.size_label]
    .map((v) => v?.trim())
    .filter((v): v is string => Boolean(v));
  const title = opt.label?.trim() || labelParts.join(" - ");
  if (!title) return null;

  const dims =
    opt.dimensions?.trim() ||
    [opt.length?.trim(), opt.width?.trim()].filter(Boolean).join(" x ");
  const withDims = dims ? `${title} (${dims})` : title;
  const priceText =
    opt.price_label?.trim() ||
    (typeof opt.price === "number" && opt.price > 0 ? formatRupiah(opt.price) : "");
  const stockText =
    typeof opt.stock === "number" ? ` (Stok: ${opt.stock})` : "";

  return priceText
    ? `${withDims}: ${priceText}${stockText}`
    : `${withDims}${stockText}`;
}

function buildRichDescription(
  summary: string,
  sizes: FlobakaryaSizeOption[],
  colors: FlobakaryaColorOption[],
  isHalal: boolean,
  foodServiceNote: string | null
): string {
  const sections: string[] = [];
  if (summary) sections.push(summary);

  const variantEntries = sizes
    .map(formatSizeVariant)
    .filter((entry): entry is string => Boolean(entry));
  if (variantEntries.length > 0) {
    sections.push(`Pilihan Ukuran & Harga: ${variantEntries.join(" · ")}.`);
  }

  const colorLabels = Array.from(
    new Set(
      colors
        .map((c) => c.label?.trim())
        .filter((label): label is string => Boolean(label))
    )
  );
  if (colorLabels.length > 0) {
    sections.push(`Pilihan Warna: ${colorLabels.join(", ")}.`);
  }

  const notes: string[] = [];
  if (isHalal) {
    notes.push("Bersertifikat Halal Indonesia.");
  }
  if (foodServiceNote) {
    notes.push(foodServiceNote);
  }
  if (notes.length > 0) {
    sections.push(notes.join(" "));
  }

  const joined = sections.join("\n\n").trim();
  if (joined.length <= 1980) return joined;
  return `${joined.slice(0, 1977).trimEnd()}...`;
}

export function parseFlobakaryaHtml(html: string): ParsedFlobakaryaProduct[] {
  const articles = html.split('<article class="product-card reveal"').slice(1);
  const results: ParsedFlobakaryaProduct[] = [];

  for (const article of articles) {
    const id = (article.match(/id="product-(\d+)"/) || [])[1];
    if (!id) continue;

    const flobaCat = decodeHtmlEntities(
      (article.match(/<small>([^<]+)<\/small>/) || [])[1] || ""
    );
    const name = decodeHtmlEntities(
      (article.match(/<h3><a[^>]*>([^<]+)<\/a><\/h3>/) || [])[1] || ""
    );
    const summary = decodeHtmlEntities(
      (article.match(/<p>([^<]+)<\/p>/) || [])[1] || ""
    );
    if (!name || !summary) continue;

    const sizes = safeParseJsonArray<FlobakaryaSizeOption>(
      (article.match(/data-size-options="([^"]+)"/) || [])[1]
    );
    const colors = safeParseJsonArray<FlobakaryaColorOption>(
      (article.match(/data-color-options="([^"]+)"/) || [])[1]
    );

    const stockLine = decodeHtmlEntities(
      (article.match(/<div class="stock-line">([^<]+)<\/div>/) || [])[1] || ""
    ).toLowerCase();
    const stockAttrRaw = (article.match(/data-product-stock="(\d+)"/) || [])[1];

    let stock = 0;
    if (!stockLine.includes("habis") && !stockLine.includes("kosong")) {
      if (stockAttrRaw !== undefined) {
        stock = parseInt(stockAttrRaw, 10);
      } else if (sizes.length > 0) {
        stock = sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
      } else if (stockLine.includes("ada") || stockLine === "") {
        stock = 15;
      }
    }

    const priceRaw = decodeHtmlEntities(
      (article.match(/<strong>([^<]+)<\/strong>/) || [])[1] || ""
    );
    let price = priceRaw ? parseInt(priceRaw.replace(/[^0-9]/g, ""), 10) : 0;
    if (!price && sizes.length > 0) {
      const positivePrices = sizes
        .map((s) => Number(s.price) || 0)
        .filter((v) => v > 0);
      if (positivePrices.length > 0) {
        price = Math.min(...positivePrices);
      }
    }

    const isHalal = article.includes("halal-image-badge");
    const isFoodItem =
      article.includes("product-actions-food") ||
      article.includes("food-chat-note") ||
      flobaCat.toLowerCase().includes("makanan");
    const closedMsgMatch = decodeHtmlEntities(
      (article.match(/data-food-closed-message="([^"]+)"/) || [])[1] || ""
    );
    const scheduleMatch = closedMsgMatch.match(/Jadwal layanan:\s*([^"]+)$/i);
    const foodServiceNote = isFoodItem
      ? scheduleMatch
        ? `Jadwal layanan kuliner: ${scheduleMatch[1].replace(/\.$/, "")}.`
        : "Jadwal layanan kuliner: Senin–Kamis 09.00–14.00 WITA, Jumat–Sabtu 09.00–12.00 WITA, Minggu tutup."
      : null;

    const mainImg = (article.match(/data-card-gallery-image\s+src="([^"]+)"/) || [])[1];
    const galleryParsed = safeParseJsonArray<string>(
      (article.match(/data-card-gallery="([^"]+)"/) || [])[1]
    );
    const remoteImagePaths = Array.from(
      new Set([mainImg, ...galleryParsed].filter((v): v is string => Boolean(v)))
    ).slice(0, 1 + MAX_GALLERY_IMAGES);

    if (remoteImagePaths.length === 0) continue;

    results.push({
      flobakaryaId: id,
      flobakaryaCategory: flobaCat,
      categorySlug: mapCategorySlug(flobaCat),
      name,
      slug: toSlug(name),
      description: buildRichDescription(
        summary,
        sizes,
        colors,
        isHalal,
        foodServiceNote
      ),
      story: buildStory(flobaCat, name),
      price,
      stock,
      remoteImagePaths,
      externalUrl: `${FLOBAKARYA_ORIGIN}/product.php?id=${id}`,
    });
  }

  return results;
}

function detectImageExtension(buffer: Buffer, fallbackPath: string): "webp" | "jpg" | "png" {
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }
  const ext = path.extname(fallbackPath).replace(".", "").toLowerCase();
  if (ext === "png") return "png";
  if (ext === "jpg" || ext === "jpeg") return "jpg";
  return "webp";
}

function toFullRemoteUrl(remotePath: string): string {
  if (remotePath.startsWith("https://") || remotePath.startsWith("http://")) {
    return remotePath;
  }
  return `${FLOBAKARYA_ORIGIN}${remotePath.startsWith("/") ? "" : "/"}${remotePath}`;
}

async function readSourceMap(): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(SOURCE_MAP_PATH, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

async function resolveProductImages(
  flobakaryaId: string,
  remotePaths: string[],
  sourceMap: Record<string, string>
): Promise<{ localOrRemoteUrls: string[]; sourceMapDirty: boolean }> {
  const resolved: string[] = [];
  let sourceMapDirty = false;

  let existingDirFiles: Set<string>;
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const entries = await fs.readdir(UPLOAD_DIR);
    existingDirFiles = new Set(entries);
  } catch {
    return {
      localOrRemoteUrls: remotePaths.map(toFullRemoteUrl),
      sourceMapDirty: false,
    };
  }

  for (let idx = 0; idx < remotePaths.length; idx++) {
    const remotePath = remotePaths[idx];
    const remoteUrl = toFullRemoteUrl(remotePath);
    const cacheKey = `flobakarya-${flobakaryaId}-${idx}`;
    const knownRemoteForSlot = sourceMap[cacheKey];
    const hash = crypto
      .createHash("sha1")
      .update(remotePath)
      .digest("hex")
      .slice(0, 6);

    const matchingHashedName = (["webp", "jpg", "png"] as const)
      .map((ext) => `${cacheKey}-${hash}.${ext}`)
      .find((name) => existingDirFiles.has(name));

    if (matchingHashedName) {
      if (knownRemoteForSlot !== remotePath) {
        sourceMap[cacheKey] = remotePath;
        sourceMapDirty = true;
      }
      resolved.push(`/uploads/products/${matchingHashedName}`);
      continue;
    }

    const matchingLocalName = (["webp", "jpg", "png"] as const)
      .map((ext) => `${cacheKey}.${ext}`)
      .find((name) => existingDirFiles.has(name));

    // Gunakan file lokal jika sudah ada & asal remote URL-nya belum berubah
    if (
      matchingLocalName &&
      (!knownRemoteForSlot || knownRemoteForSlot === remotePath)
    ) {
      if (!knownRemoteForSlot) {
        sourceMap[cacheKey] = remotePath;
        sourceMapDirty = true;
      }
      resolved.push(`/uploads/products/${matchingLocalName}`);
      continue;
    }

    // Jika file lokal belum ada atau remotePath berubah, unduh ke public/uploads/products
    try {
      const res = await fetch(remoteUrl, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.byteLength === 0) {
        throw new Error("Empty image buffer");
      }
      const ext = detectImageExtension(buffer, remotePath);
      const filename =
        knownRemoteForSlot && knownRemoteForSlot !== remotePath
          ? `${cacheKey}-${hash}.${ext}`
          : `${cacheKey}.${ext}`;

      await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
      existingDirFiles.add(filename);
      sourceMap[cacheKey] = remotePath;
      sourceMapDirty = true;
      resolved.push(`/uploads/products/${filename}`);
    } catch {
      resolved.push(remoteUrl);
    }
  }

  return { localOrRemoteUrls: resolved, sourceMapDirty };
}

function stringArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

async function runSyncInternal(
  options: SyncFlobakaryaOptions
): Promise<SyncFlobakaryaResult> {
  const now = Date.now();
  let html = options.htmlOverride;

  if (!html) {
    const res = await fetch(FLOBAKARYA_CATALOG_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      throw new Error(
        `Gagal mengambil katalog Flobakarya (HTTP ${res.status}).`
      );
    }
    html = await res.text();
  }

  const parsedProducts = parseFlobakaryaHtml(html);
  if (parsedProducts.length === 0) {
    throw new Error(
      "Tidak ada produk Flobakarya yang berhasil dibaca dari halaman asal."
    );
  }

  const categories = await prisma.category.findMany({
    where: {
      slug: {
        in: ["tenun-tradisional", "kerajinan-tangan", "kuliner-hasil-tani"],
      },
    },
    select: { id: true, slug: true },
  });
  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  const fallbackCat = categories[0]?.id;
  if (!fallbackCat) {
    throw new Error("Kategori dasar belum tersedia di database.");
  }

  const existingExternal = await prisma.product.findMany({
    where: { externalUrl: { startsWith: `${FLOBAKARYA_ORIGIN}/` } },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      image: true,
      galleryEnabled: true,
      images: true,
      isActive: true,
      categoryId: true,
      externalUrl: true,
    },
  });

  const existingByExternalUrl = new Map(
    existingExternal
      .filter((p): p is typeof p & { externalUrl: string } =>
        Boolean(p.externalUrl)
      )
      .map((p) => [p.externalUrl, p])
  );

  const sourceMap = await readSourceMap();
  let anySourceMapDirty = false;
  let createdCount = 0;
  let updatedCount = 0;
  const activeExternalUrls = new Set<string>();

  for (const item of parsedProducts) {
    activeExternalUrls.add(item.externalUrl);
    const categoryId = catMap.get(item.categorySlug) ?? fallbackCat;
    const { localOrRemoteUrls, sourceMapDirty } = await resolveProductImages(
      item.flobakaryaId,
      item.remoteImagePaths,
      sourceMap
    );
    if (sourceMapDirty) anySourceMapDirty = true;

    const image = localOrRemoteUrls[0] ?? toFullRemoteUrl(item.remoteImagePaths[0]);
    const images = localOrRemoteUrls.slice(1, 1 + MAX_GALLERY_IMAGES);
    const galleryEnabled = images.length > 0;

    const existing =
      existingByExternalUrl.get(item.externalUrl) ??
      (await prisma.product.findUnique({
        where: { slug: item.slug },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          price: true,
          stock: true,
          image: true,
          galleryEnabled: true,
          images: true,
          isActive: true,
          categoryId: true,
          externalUrl: true,
        },
      }));

    if (!existing) {
      await prisma.product.create({
        data: {
          name: item.name,
          slug: item.slug,
          description: item.description,
          story: item.story,
          price: item.price,
          stock: item.stock,
          image,
          galleryEnabled,
          images,
          externalUrl: item.externalUrl,
          isActive: true,
          categoryId,
        },
      });
      createdCount++;
      continue;
    }

    const hasChanges =
      existing.name !== item.name ||
      existing.description !== item.description ||
      existing.price !== item.price ||
      existing.stock !== item.stock ||
      existing.image !== image ||
      existing.galleryEnabled !== galleryEnabled ||
      !stringArraysEqual(existing.images, images) ||
      existing.isActive !== true ||
      existing.categoryId !== categoryId ||
      existing.externalUrl !== item.externalUrl;

    if (hasChanges) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          stock: item.stock,
          image,
          galleryEnabled,
          images,
          externalUrl: item.externalUrl,
          isActive: true,
          categoryId,
        },
      });
      updatedCount++;
    }
  }

  // Nonaktifkan produk asal Flobakarya yang sudah tidak ada di website asal
  let deactivatedCount = 0;
  for (const existing of existingExternal) {
    if (
      existing.externalUrl &&
      !activeExternalUrls.has(existing.externalUrl) &&
      (existing.isActive || existing.stock > 0)
    ) {
      await prisma.product.update({
        where: { id: existing.id },
        data: { isActive: false, stock: 0 },
      });
      deactivatedCount++;
    }
  }

  if (anySourceMapDirty) {
    try {
      await fs.writeFile(SOURCE_MAP_PATH, JSON.stringify(sourceMap, null, 2));
    } catch {
      // Abaikan jika filesystem read-only
    }
  }

  getSyncState().lastSyncAt = now;

  return {
    skipped: false,
    parsedCount: parsedProducts.length,
    syncedCount: createdCount + updatedCount + deactivatedCount,
    createdCount,
    updatedCount,
    deactivatedCount,
    syncedAt: now,
  };
}

export async function syncFlobakaryaCatalog(
  options: SyncFlobakaryaOptions = {}
): Promise<SyncFlobakaryaResult> {
  const force = Boolean(options.force);
  const state = getSyncState();
  const now = Date.now();

  if (!force && now - state.lastSyncAt < SYNC_TTL_MS) {
    return {
      skipped: true,
      parsedCount: 0,
      syncedCount: 0,
      createdCount: 0,
      updatedCount: 0,
      deactivatedCount: 0,
      syncedAt: state.lastSyncAt,
    };
  }

  if (state.inFlight && !options.htmlOverride) {
    return state.inFlight;
  }

  const exec = runSyncInternal(options)
    .catch((err: unknown): SyncFlobakaryaResult => {
      const msg =
        err instanceof Error ? err.message : "Gagal menyinkronkan Flobakarya.";
      if (force) {
        throw err instanceof Error ? err : new Error(msg);
      }
      console.error("[syncFlobakaryaCatalog]", msg);
      return {
        skipped: true,
        error: msg,
        parsedCount: 0,
        syncedCount: 0,
        createdCount: 0,
        updatedCount: 0,
        deactivatedCount: 0,
        syncedAt: state.lastSyncAt,
      };
    })
    .finally(() => {
      if (getSyncState().inFlight === exec) {
        getSyncState().inFlight = null;
      }
    });

  if (!options.htmlOverride) {
    state.inFlight = exec;
  }

  return exec;
}
