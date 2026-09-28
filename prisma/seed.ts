// ============================================================
// PASzar — Prisma Seed Script
// ============================================================
// Menjalankan: npx prisma db seed
// Membuat: 1 Admin, 3 Kategori, 8 Produk
// ============================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai proses seeding database PASzar...\n");

  // ── 1. BERSIHKAN DATA LAMA (urutan relasi penting) ─────────────
  // Hapus dari tabel paling bawah relasi → atas
  console.log("🗑️  Membersihkan data lama...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.admin.deleteMany();
  console.log("   ✓ Database bersih.\n");

  // ── 2. BUAT AKUN ADMIN ─────────────────────────────────────────
  console.log("👤 Membuat akun SuperAdmin...");
  const hashedPassword = await bcrypt.hash("password123", 12);
  const admin = await prisma.admin.create({
    data: {
      email: "admin@paszar.com",
      name: "Super Admin",
      hashedPassword,
    },
  });
  console.log(`   ✓ Admin dibuat: ${admin.email}\n`);

  // ── 3. BUAT KATEGORI ───────────────────────────────────────────
  console.log("📂 Membuat kategori produk...");
  const [kategoriMebel, kategoriTenun, kategoriPertanian] = await Promise.all([
    prisma.category.create({
      data: {
        name: "Furnitur Kayu",
        slug: "furnitur-kayu",
        description:
          "Furnitur dan perabotan kayu buatan tangan warga binaan, dikerjakan dengan ketelitian tinggi menggunakan kayu pilihan dari hutan lestari NTT.",
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Tenun NTT",
        slug: "tenun-ntt",
        description:
          "Kain tenun ikat tradisional Nusa Tenggara Timur dengan motif autentik khas setiap daerah. Setiap lembar ditenun secara manual menggunakan alat tenun bukan mesin.",
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Hasil Pertanian",
        slug: "hasil-pertanian",
        description:
          "Produk pertanian organik dan olahan pangan yang dibudidayakan oleh warga binaan dalam program ketahanan pangan Lapas Kupang.",
        sortOrder: 3,
      },
    }),
  ]);
  console.log("   ✓ 3 kategori dibuat.\n");

  // ── 4. BUAT PRODUK ─────────────────────────────────────────────
  console.log("📦 Membuat produk...");

  const products = await Promise.all([
    // ── FURNITUR KAYU (3 produk) ────────────────────────────────
    prisma.product.create({
      data: {
        name: "Kursi Ukir Jati Tradisional",
        slug: "kursi-ukir-jati-tradisional",
        description:
          "Kursi kayu jati dengan ukiran tangan bermotif flora khas NTT. Kokoh, tahan lama, dan elegan. Cocok untuk ruang tamu atau ruang kerja yang menginginkan sentuhan budaya lokal yang autentik.",
        story:
          "Kursi ini dikerjakan oleh Pak Yohanes selama 3 minggu penuh di bengkel kayu Lapas Kupang. Setiap lekukan ukirannya mencerminkan kecintaannya pada seni budaya leluhur Timor. Kini, keterampilannya bukan hanya menjadi terapi, tetapi juga sumber penghasilan yang bermartabat.",
        price: 2850000,
        stock: 5,
        image: "https://via.placeholder.com/400x500",
        isActive: true,
        categoryId: kategoriMebel.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Meja Kopi Minimalis Akasia",
        slug: "meja-kopi-minimalis-akasia",
        description:
          "Meja kopi berdesain minimalis dari kayu akasia lokal NTT. Kaki kerangka metal hitam memberikan kontras modern yang elegan. Permukaan meja dilapisi pernis anti-gores untuk ketahanan jangka panjang.",
        story:
          "Dirancang oleh tim pertukangan program Bimbingan Kerja Lapas Kupang, meja ini lahir dari proses belajar desain furniture yang dimulai tiga tahun lalu. Para pengrajin ingin membuktikan bahwa produk premium bisa lahir dari balik tembok penjara.",
        price: 1750000,
        stock: 8,
        image: "https://via.placeholder.com/400x500",
        isActive: true,
        categoryId: kategoriMebel.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Rak Buku Susun Kayu Pinus",
        slug: "rak-buku-susun-kayu-pinus",
        description:
          "Rak buku 3 susun dari kayu pinus pilihan. Desain simpel dan fungsional, tersedia dalam finishing natural dan warna walnut. Mampu menampung hingga 80 buku standar. Assembly mudah dengan panduan terlampir.",
        story:
          "Ibu Maria, yang pernah bekerja sebagai guru sebelum menjalani masa pidana, mencurahkan kecintaannya pada literasi dalam setiap rak yang ia buat. Baginya, membuat rak buku adalah caranya tetap dekat dengan dunia pendidikan.",
        price: 980000,
        stock: 12,
        image: "https://via.placeholder.com/400x500",
        isActive: true,
        categoryId: kategoriMebel.id,
      },
    }),

    // ── TENUN NTT (3 produk) ────────────────────────────────────
    prisma.product.create({
      data: {
        name: "Tenun Ikat Motif Sotis NTT",
        slug: "tenun-ikat-motif-sotis-ntt",
        description:
          "Kain tenun ikat tradisional dengan motif Sotis, motif geometris khas Timor yang melambangkan keharmonisan alam dan manusia. Ukuran 2m × 1.2m. Benang sutra alami dengan pewarna alam indigo dan kunyit.",
        story:
          "Nenek Rosalinda telah menenun selama lebih dari 40 tahun. Di bengkel tenun Lapas, ia mengajarkan seni leluhur ini kepada 12 warga binaan muda. Setiap motif yang ia buat adalah doa — untuk keluarga yang menunggunya di rumah.",
        price: 1500000,
        stock: 15,
        image: "https://via.placeholder.com/400x500",
        isActive: true,
        categoryId: kategoriTenun.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Selendang Tenun Motif Bunga Lantana",
        slug: "selendang-tenun-motif-bunga-lantana",
        description:
          "Selendang tenun halus dengan motif Bunga Lantana, bunga liar ikonik padang sabana NTT. Ukuran 180cm × 60cm. Ringan dan lembut, cocok dipakai sebagai aksesori fashion maupun oleh-oleh premium.",
        story:
          "Bapak Dominikus mempelajari teknik tenun dari ibunya semasa kecil di Flores. Di Lapas, ia memperbarui teknik tersebut dengan motif kontemporer yang terinspirasi dari alam sekitar NTT, menjembatani tradisi dan selera pasar modern.",
        price: 650000,
        stock: 20,
        image: "https://via.placeholder.com/400x500",
        isActive: true,
        categoryId: kategoriTenun.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Sarung Tenun Premium Motif Belis",
        slug: "sarung-tenun-premium-motif-belis",
        description:
          "Sarung tenun pria berkualitas tinggi dengan motif Belis (mas kawin adat Timor). Cocok untuk acara adat, pernikahan, atau koleksi fashion etnik. Ukuran standar pria dewasa. Pewarna alami anti-pudar.",
        story:
          "Motif Belis bukan sekadar ornamen — ia adalah simbol ikatan keluarga dan adat istiadat Timor yang sakral. Pak Cornelius menuangkan makna mendalam itu ke dalam setiap helai benang, menjadikannya karya yang melampaui sekadar kain.",
        price: 1850000,
        stock: 10,
        image: "https://via.placeholder.com/400x500",
        isActive: true,
        categoryId: kategoriTenun.id,
      },
    }),

    // ── HASIL PERTANIAN (2 produk) ──────────────────────────────
    prisma.product.create({
      data: {
        name: "Kopi Arabika Flores Organik (250gr)",
        slug: "kopi-arabika-flores-organik-250gr",
        description:
          "Biji kopi Arabika single origin dari kebun binaan Lapas Kupang, ditanam di ketinggian 1.200 mdpl dengan metode organik tanpa pestisida kimia. Profil rasa: cokelat gelap, sedikit floral, aftertaste karamel. Roast level: Medium.",
        story:
          "Program kebun kopi ini dimulai pada 2024 sebagai bagian dari program pertanian organik Lapas. Para warga binaan tidak hanya menanam, tetapi juga memproses panen secara mandiri — dari pulping, fermentasi, hingga pengeringan — di bawah bimbingan petani kopi berpengalaman.",
        price: 85000,
        stock: 50,
        image: "https://via.placeholder.com/400x500",
        isActive: true,
        categoryId: kategoriPertanian.id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Madu Hutan Timor Murni (500ml)",
        slug: "madu-hutan-timor-murni-500ml",
        description:
          "Madu hutan murni hasil panen dari lebah liar di hutan sekitar Kupang. Tidak dipanaskan (raw honey), mengandung enzim dan antioksidan alami yang terjaga. Warna keemasan gelap dengan rasa yang kaya dan sedikit asam.",
        story:
          "Pak Agus belajar teknik pemanenan madu lestari — tanpa membunuh koloni lebah — dari program pemberdayaan yang diinisiasi bersama komunitas petani lokal. Madu ini bukan sekadar produk; ia adalah bukti bahwa manusia dan alam dapat hidup berdampingan dengan harmonis.",
        price: 120000,
        stock: 30,
        image: "https://via.placeholder.com/400x500",
        isActive: true,
        categoryId: kategoriPertanian.id,
      },
    }),
  ]);

  console.log(`   ✓ ${products.length} produk dibuat.\n`);

  // ── RINGKASAN ─────────────────────────────────────────────────
  console.log("═══════════════════════════════════════════════");
  console.log("✅ SEEDING BERHASIL!");
  console.log("═══════════════════════════════════════════════");
  console.log(`   👤 Admin   : 1 akun`);
  console.log(`   📂 Kategori: 3 kategori`);
  console.log(`   📦 Produk  : ${products.length} produk`);
  console.log("\n   Kredensial Admin:");
  console.log("   Email    : admin@paszar.com");
  console.log("   Password : password123");
  console.log("═══════════════════════════════════════════════\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error saat seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
