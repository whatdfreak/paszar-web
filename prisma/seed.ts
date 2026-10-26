// ============================================================
// PASzar — Prisma Seed Script (Production Data v2)
// ============================================================
// Data Referensi: UPT Pemasyarakatan Wilayah Kupang, NTT
// Produk: Tenun NTT, Sasando, Anyaman, Mebel, Kuliner & Tani
//
// Menjalankan:
//   npx prisma db seed
// ============================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai proses seeding database PASzar (Production Data v2)...\n");

  // ── 1. BERSIHKAN DATA LAMA ──────────────────────────────────────────────
  console.log("🗑️  Membersihkan data lama...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.admin.deleteMany();
  console.log("   ✓ Database bersih.\n");

  // ── 2. BUAT AKUN ADMIN ────────────────────────────────────────────────
  console.log("👤 Membuat akun SuperAdmin...");
  const hashedPassword = await bcrypt.hash("password123", 12);
  const admin = await prisma.admin.create({
    data: {
      email: "admin@paszar.com",
      name: "Admin Koperasi Lapas Kupang",
      hashedPassword,
    },
  });
  console.log(`   ✓ Admin dibuat: ${admin.email}\n`);

  // ── 3. BUAT KATEGORI ──────────────────────────────────────────────────
  console.log("📂 Membuat 4 kategori produk...");
  const [katTenun, katKerajinan, katMebel, katKuliner] = await Promise.all([
    prisma.category.create({
      data: {
        name: "Tenun Tradisional",
        slug: "tenun-tradisional",
        description:
          "Kain tenun ikat Nusa Tenggara Timur yang ditenun secara manual menggunakan alat tenun bukan mesin (ATBM). Setiap helai benang mengandung makna filosofi dan identitas suku yang mendalam.",
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Kerajinan Tangan",
        slug: "kerajinan-tangan",
        description:
          "Produk kerajinan anyaman, ukiran, dan miniatur yang dibuat dengan tangan oleh warga binaan terampil. Setiap produk adalah ekspresi seni yang lahir dari ketekunan dan dedikasi.",
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Furnitur & Mebel",
        slug: "furnitur-mebel",
        description:
          "Furnitur dan perabotan berkualitas tinggi hasil karya tangan warga binaan. Menggunakan kayu pilihan dari sumber yang berkelanjutan, dikerjakan dengan presisi dan keahlian falegname tradisional.",
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: "Kuliner & Hasil Tani",
        slug: "kuliner-hasil-tani",
        description:
          "Produk kuliner premium dan hasil pertanian organik dari program ketahanan pangan dan agribisnis warga binaan Lapas Kupang. Diproses dengan standar kebersihan dan keamanan pangan.",
        sortOrder: 4,
      },
    }),
  ]);
  console.log("   ✓ 4 kategori dibuat.\n");

  // ── 4. BUAT 10 PRODUK UNGGULAN UPT KUPANG ────────────────────────────
  console.log("📦 Membuat 10 produk unggulan...");

  await Promise.all([

    // ══ TENUN TRADISIONAL (3 SKU) ════════════════════════════════════════

    prisma.product.create({
      data: {
        name: "Kain Tenun Ikat Motif Sotis NTT",
        slug: "kain-tenun-ikat-motif-sotis-ntt",
        description:
          "Kain tenun ikat premium bermotif Sotis — salah satu motif paling ikonik dari Nusa Tenggara Timur. Ditenun menggunakan benang katun pilihan dengan teknik ikat ganda yang menghasilkan pola geometris simetris yang presisi. Ukuran 200 x 70 cm. Cocok untuk selendang, bahan pakaian, hingga aksesori interior.",
        story:
          "Motif Sotis bukan sekadar ornamen. Ia adalah bahasa visual leluhur Timor yang merekam kosmologi, silsilah keluarga, dan nilai-nilai adat dalam setiap garis dan titiknya. Kain ini ditenun oleh Ibu Rosalia, warga binaan yang telah mewarisi keahlian menenun selama 20 tahun, kini diberdayakan melalui program Koperasi Lapas Kupang.",
        price: 850000,
        stock: 15,
        image: "https://placehold.co/800x800/2d2a27/f5f5f4?text=Tenun+Sotis+NTT",
        isActive: true,
        categoryId: katTenun.id,
      },
    }),

    prisma.product.create({
      data: {
        name: "Selendang Tenun Motif Buna Timor",
        slug: "selendang-tenun-motif-buna-timor",
        description:
          "Selendang tenun eksklusif bermotif Buna — teknik menenun tertua suku Dawan di Timor yang menghasilkan tekstur tiga dimensi yang khas dan mewah. Menggunakan benang sutra dan katun campuran dengan pewarnaan alami dari daun tarum (indigo) dan kulit mahoni. Dimensi 180 x 50 cm.",
        story:
          "Teknik Buna diwariskan secara turun-temurun dalam ritual adat dan hanya dikuasai oleh sedikit penenun. Di Lapas Kupang, keahlian langka ini dibangkitkan kembali dan diajarkan kepada para warga binaan putri, memastikan warisan budaya ini tidak punah bersama generasi.",
        price: 1250000,
        stock: 8,
        image: "https://placehold.co/800x800/3d3530/f5f5f4?text=Tenun+Buna+Timor",
        isActive: true,
        categoryId: katTenun.id,
      },
    }),

    prisma.product.create({
      data: {
        name: "Sarung Tenun Ikat Motif Pahikung",
        slug: "sarung-tenun-ikat-motif-pahikung",
        description:
          "Sarung tenun ikat bermotif Pahikung khas Sumba Timur dengan dominasi warna merah bata dan hitam yang kuat. Dibuat menggunakan teknik pewarnaan alami dari akar mengkudu (kombu) yang memberikan warna merah pekat tahan lama. Ukuran 200 x 110 cm. Ideal untuk keperluan adat maupun fashion kontemporer.",
        story:
          "Pahikung adalah motif kebesaran bangsawan Sumba yang bermakna keberanian dan martabat. Setiap sarung membutuhkan 3-4 bulan untuk diselesaikan. Pak Daniel, penenun berbakat dari Lapas Kupang, mempelajari teknik ini dari seniman adat Sumba dan kini menjadi instruktur internal yang menginspirasi.",
        price: 1650000,
        stock: 6,
        image: "https://placehold.co/800x800/5c2b1e/f5f5f4?text=Tenun+Pahikung",
        isActive: true,
        categoryId: katTenun.id,
      },
    }),

    // ══ KERAJINAN TANGAN (3 SKU) ═══════════════════════════════════════════

    prisma.product.create({
      data: {
        name: "Miniatur Sasando Rote",
        slug: "miniatur-sasando-rote",
        description:
          "Miniatur instrumen musik sasando — harpa tradisional khas Pulau Rote yang diakui sebagai Warisan Budaya Takbenda Indonesia. Dibuat dari bambu pilihan dan daun lontar asli dengan detail yang sangat presisi. Tinggi 45 cm. Dapat berfungsi sebagai instrumen mini maupun pajangan premium.",
        story:
          "Sasando adalah jiwa musik NTT. Miniatur ini bukan sekadar suvenir — ia adalah duta budaya berbentuk. Pak Yohanes, warga binaan asal Rote, menuangkan 15 tahun keahliannya dalam setiap miniatur. Setiap detail — dari 28 senar hingga lekukan lontar — dikerjakan tanpa satu pun alat mesin.",
        price: 580000,
        stock: 20,
        image: "https://placehold.co/800x800/4a3728/f5f5f4?text=Miniatur+Sasando",
        isActive: true,
        categoryId: katKerajinan.id,
      },
    }),

    prisma.product.create({
      data: {
        name: "Tudung Saji Anyaman Lidi Kelapa Sawit",
        slug: "tudung-saji-anyaman-lidi-kelapa-sawit",
        description:
          "Tudung saji premium anyaman lidi kelapa sawit yang difinishing dengan cat alami dari getah pohon. Pola anyaman catur yang rapat membuatnya kuat dan tahan lama. Tersedia diameter 35 cm dan 45 cm. Food-safe dan bebas bahan kimia berbahaya.",
        story:
          "Lidi kelapa sawit yang selama ini dianggap limbah kebun diubah menjadi produk bernilai seni oleh tim anyaman Koperasi Lapas. Setiap tudung saji dikerjakan selama 2-3 hari, menghasilkan produk yang tidak hanya fungsional tapi juga merupakan karya seni dapur yang layak dijadikan koleksi.",
        price: 135000,
        stock: 50,
        image: "https://placehold.co/800x800/6b5b45/f5f5f4?text=Tudung+Saji",
        isActive: true,
        categoryId: katKerajinan.id,
      },
    }),

    prisma.product.create({
      data: {
        name: "Penutup Bosara Anyaman Bambu",
        slug: "penutup-bosara-anyaman-bambu",
        description:
          "Penutup bosara berbahan bambu yang dianyam dengan teknik silang rapat. Dilengkapi pegangan kayu ukir dan finishing pernis alami. Diameter 40 cm, tinggi 25 cm. Elegan untuk acara adat, pernikahan, dan sajian kuliner artisan.",
        story:
          "Bosara adalah simbol penghormatan tamu dalam budaya yang kini populer di NTT. Kelompok anyaman Lapas Kupang mengangkat tradisi ini dengan keahlian bambu lokal, menghasilkan produk yang diminati untuk pernikahan adat dan hotel-hotel butik di Kupang.",
        price: 210000,
        stock: 30,
        image: "https://placehold.co/800x800/5a4a35/f5f5f4?text=Bosara+Bambu",
        isActive: true,
        categoryId: katKerajinan.id,
      },
    }),

    // ══ FURNITUR & MEBEL (2 SKU) ════════════════════════════════════════

    prisma.product.create({
      data: {
        name: "Kursi Rotan Ukir Model Vintage",
        slug: "kursi-rotan-ukir-model-vintage",
        description:
          "Kursi rotan solid model vintage dengan sandaran lengkung dan ukiran motif floral pada rangka kayu mahoni. Diproses dengan teknik pengeringan oven untuk mencegah rayap. Finishing natural varnish memperlihatkan serat alami rotan. Kapasitas beban hingga 120 kg.",
        story:
          "Tim falegname Lapas Kupang menggabungkan teknik ukir warisan dengan material rotan NTT yang melimpah. Setiap kursi melewati 14 tahap pengerjaan — dari seleksi rotan, pengeringan, pembentukan, hingga finishing — selama 2 minggu. Sebuah proses yang mengajarkan kesabaran dan presisi.",
        price: 1850000,
        stock: 5,
        image: "https://placehold.co/800x800/3a2e24/f5f5f4?text=Kursi+Rotan",
        isActive: true,
        categoryId: katMebel.id,
      },
    }),

    prisma.product.create({
      data: {
        name: "Meja Kopi Kayu Jati Solid Minimalis",
        slug: "meja-kopi-kayu-jati-solid-minimalis",
        description:
          "Meja kopi minimalis berbahan kayu jati tua pilihan (recycled teak) dengan kaki model hairpin stainless steel. Permukaan difinishing dengan oil finishing yang menonjolkan serat kayu alami. Dimensi: P 100 cm x L 60 cm x T 45 cm.",
        story:
          "Kayu jati tua bekas bangunan lama diberikan kehidupan baru oleh tangan-tangan terampil warga binaan. Filosofi daur ulang ini bukan sekadar ramah lingkungan — ia adalah metafora rehabilitasi itu sendiri: dari sesuatu yang dianggap tidak berguna, lahir karya baru yang bernilai tinggi.",
        price: 2750000,
        stock: 3,
        image: "https://placehold.co/800x800/2a2118/f5f5f4?text=Meja+Jati",
        isActive: true,
        categoryId: katMebel.id,
      },
    }),

    // ══ KULINER & HASIL TANI (2 SKU) ══════════════════════════════════════

    prisma.product.create({
      data: {
        name: "Madu Hutan Timor Murni 500ml",
        slug: "madu-hutan-timor-murni-500ml",
        description:
          "Madu hutan murni yang dipanen dari lebah liar di kawasan hutan Timor Tengah melalui program budidaya lebah warga binaan Lapas Kupang. Tidak dipasteurisasi, tidak dicampur gula, 100% raw honey. Kadar air <18%. Tersertifikasi bebas antibiotik.",
        story:
          "Program budidaya lebah hutan Lapas Kupang dimulai sebagai terapi rehabilitasi dan berkembang menjadi usaha bernilai tinggi. Para warga binaan belajar memahami ekosistem dan kesabaran melalui merawat koloni lebah. Setiap tetes adalah buah dari keharmonisan antara manusia yang sedang berubah dan alam yang lestari.",
        price: 185000,
        stock: 40,
        image: "https://placehold.co/800x800/8b6914/f5f5f4?text=Madu+Hutan+Timor",
        isActive: true,
        categoryId: katKuliner.id,
      },
    }),

    prisma.product.create({
      data: {
        name: "Kopi Flores Arabika Specialty (Bubuk 200g)",
        slug: "kopi-flores-arabika-specialty-200g",
        description:
          "Biji kopi Arabika specialty dari ketinggian 1.200 mdpl perkebunan Flores, diproses dengan metode natural dan di-roasting medium oleh tim roaster Koperasi Lapas. Profil rasa: floral, dark chocolate, brown sugar, aftertaste panjang dan bersih. Digiling segar per order.",
        story:
          "Kolaborasi antara petani kopi Flores dan Koperasi Lapas Kupang menghasilkan rantai nilai yang bermartabat. Warga binaan terlatih sebagai roaster, quality control, dan packaging — keahlian yang dapat mereka bawa sebagai modal wirausaha setelah bebas. Setiap kemasan adalah cerita tentang potensi yang tidak pernah hilang.",
        price: 95000,
        stock: 60,
        image: "https://placehold.co/800x800/1a110a/f5f5f4?text=Kopi+Flores+Arabika",
        isActive: true,
        categoryId: katKuliner.id,
      },
    }),
  ]);

  console.log("   ✓ 10 produk unggulan dibuat.\n");

  // ── 5. RINGKASAN ────────────────────────────────────────────────────
  const [totalProducts, totalCategories, totalAdmin] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.admin.count(),
  ]);

  console.log("✅ Seeding selesai!");
  console.log(`   - Admin     : ${totalAdmin} akun`);
  console.log(`   - Kategori  : ${totalCategories} kategori`);
  console.log(`   - Produk    : ${totalProducts} SKU aktif`);
  console.log("\n📋 Kredensial Admin:");
  console.log("   Email    : admin@paszar.com");
  console.log("   Password : password123");
  console.log("\n⚠️  GANTI PASSWORD sebelum deploy ke production!");
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


