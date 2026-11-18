export interface FlobakaryaSeedItem {
  name: string;
  slug: string;
  categorySlug: "tenun-tradisional" | "kerajinan-tangan" | "kuliner-hasil-tani";
  description: string;
  story: string;
  price: number;
  stock: number;
  image: string;
  galleryEnabled: boolean;
  images: string[];
  externalUrl: string;
}

export const FLOBAKARYA_PRODUCTS: FlobakaryaSeedItem[] = [
  {
    "name": "Boneka Rajut",
    "slug": "boneka-rajut",
    "categorySlug": "kerajinan-tangan",
    "description": "Boneka rajut handmade dengan detail lembut dan rapi.\n\nPilihan Ukuran & Harga: Boneka Rajut: Rp 100.000 (Stok: 10).\n\nPilihan Warna: Merah Maroon Kombinasi Cream, Merah Kombinasi Coklat, Coklat Kombinasi Cream, Hitam Putih.",
    "story": "Boneka Rajut merupakan buah tangan terampil warga binaan perempuan Kupang yang memadukan kerapian teknik kriya dan sentuhan estetika modern. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 100000,
    "stock": 10,
    "image": "/uploads/products/flobakarya-76-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=76"
  },
  {
    "name": "Cake Jadul",
    "slug": "cake-jadul",
    "categorySlug": "kuliner-hasil-tani",
    "description": "Cake jadul lembut dengan cita rasa rumahan.\n\nBersertifikat Halal Indonesia. Jadwal layanan kuliner: Senin–Kamis 09.00–14.00 WITA, Jumat–Sabtu 09.00–12.00 WITA, Minggu tutup.",
    "story": "Cake Jadul diolah dari dapur tata boga Lapas Perempuan Kelas IIB Kupang dengan standar kebersihan dan cita rasa terjaga dalam program kemandirian FLOBAKARYA.",
    "price": 125000,
    "stock": 15,
    "image": "/uploads/products/flobakarya-77-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=77"
  },
  {
    "name": "Cake Lontar Papua",
    "slug": "cake-lontar-papua",
    "categorySlug": "kuliner-hasil-tani",
    "description": "Cake lontar Papua dengan tekstur lembut dan rasa manis gurih.\n\nBersertifikat Halal Indonesia. Jadwal layanan kuliner: Senin–Kamis 09.00–14.00 WITA, Jumat–Sabtu 09.00–12.00 WITA, Minggu tutup.",
    "story": "Cake Lontar Papua diolah dari dapur tata boga Lapas Perempuan Kelas IIB Kupang dengan standar kebersihan dan cita rasa terjaga dalam program kemandirian FLOBAKARYA.",
    "price": 130000,
    "stock": 15,
    "image": "/uploads/products/flobakarya-78-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=78"
  },
  {
    "name": "Cake Zebra",
    "slug": "cake-zebra",
    "categorySlug": "kuliner-hasil-tani",
    "description": "Cake zebra lembut dengan motif vanila cokelat.\n\nBersertifikat Halal Indonesia. Jadwal layanan kuliner: Senin–Kamis 09.00–14.00 WITA, Jumat–Sabtu 09.00–12.00 WITA, Minggu tutup.",
    "story": "Cake Zebra diolah dari dapur tata boga Lapas Perempuan Kelas IIB Kupang dengan standar kebersihan dan cita rasa terjaga dalam program kemandirian FLOBAKARYA.",
    "price": 125000,
    "stock": 15,
    "image": "/uploads/products/flobakarya-83-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=83"
  },
  {
    "name": "Daun Bawang",
    "slug": "daun-bawang",
    "categorySlug": "kuliner-hasil-tani",
    "description": "Daun bawang segar dengan aroma harum.",
    "story": "Daun Bawang dibudidayakan secara segar di lahan ketahanan pangan Lapas Perempuan Kelas IIB Kupang melalui program agribisnis pembinaan kemandirian.",
    "price": 5000,
    "stock": 30,
    "image": "/uploads/products/flobakarya-86-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=86"
  },
  {
    "name": "Daun Seledri",
    "slug": "daun-seledri",
    "categorySlug": "kuliner-hasil-tani",
    "description": "Pilih daun seledri atau tanaman seledri segar.\n\nPilihan Ukuran & Harga: Daun Seledri: Rp 5.000 (Stok: 15) · Tanaman Seledri: Rp 20.000 (Stok: 15).",
    "story": "Daun Seledri dibudidayakan secara segar di lahan ketahanan pangan Lapas Perempuan Kelas IIB Kupang melalui program agribisnis pembinaan kemandirian.",
    "price": 5000,
    "stock": 30,
    "image": "/uploads/products/flobakarya-87-0.webp",
    "galleryEnabled": true,
    "images": [
      "/uploads/products/flobakarya-87-1.webp"
    ],
    "externalUrl": "https://flobakarya.com/product.php?id=87"
  },
  {
    "name": "Dompet Rajut",
    "slug": "dompet-rajut",
    "categorySlug": "kerajinan-tangan",
    "description": "Dompet rajut handmade berukuran 18 x 13 cm.\n\nPilihan Ukuran & Harga: Ukuran 18 x 13 cm (18 cm x 13 cm): Rp 150.000 (Stok: 10).",
    "story": "Dompet Rajut merupakan buah tangan terampil warga binaan perempuan Kupang yang memadukan kerapian teknik kriya dan sentuhan estetika modern. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 150000,
    "stock": 10,
    "image": "/uploads/products/flobakarya-73-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=73"
  },
  {
    "name": "Gantungan Kunci Boneka",
    "slug": "gantungan-kunci-boneka",
    "categorySlug": "kerajinan-tangan",
    "description": "Gantungan kunci boneka rajut handmade.\n\nPilihan Ukuran & Harga: Model A: Rp 50.000 (Stok: 22) · Model B: Rp 50.000 (Stok: 23).\n\nPilihan Warna: Merah Maroon Kombinasi Cream, Merah Kombinasi Coklat, Coklat Kombinasi Cream.",
    "story": "Gantungan Kunci Boneka merupakan buah tangan terampil warga binaan perempuan Kupang yang memadukan kerapian teknik kriya dan sentuhan estetika modern. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 50000,
    "stock": 45,
    "image": "/uploads/products/flobakarya-75-0.webp",
    "galleryEnabled": true,
    "images": [
      "/uploads/products/flobakarya-75-1.webp"
    ],
    "externalUrl": "https://flobakarya.com/product.php?id=75"
  },
  {
    "name": "Kangkung",
    "slug": "kangkung",
    "categorySlug": "kuliner-hasil-tani",
    "description": "Kangkung segar hasil kebun pembinaan.",
    "story": "Kangkung dibudidayakan secara segar di lahan ketahanan pangan Lapas Perempuan Kelas IIB Kupang melalui program agribisnis pembinaan kemandirian.",
    "price": 5000,
    "stock": 27,
    "image": "/uploads/products/flobakarya-84-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=84"
  },
  {
    "name": "Kaos Motif Tenun Dua Sisi",
    "slug": "kaos-motif-tenun-dua-sisi",
    "categorySlug": "tenun-tradisional",
    "description": "Kaos motif tenun dua sisi dengan bahan nyaman.\n\nPilihan Ukuran & Harga: M: Rp 150.000 (Stok: 12) · L: Rp 150.000 (Stok: 12) · XL: Rp 150.000 (Stok: 12) · 2XL: Rp 150.000 (Stok: 12).\n\nPilihan Warna: Hitam, Biru, Merah, Krem, Navy.",
    "story": "Kaos Motif Tenun Dua Sisi ditenun dan dikerjakan dengan ketekunan tinggi oleh warga binaan perempuan Kupang untuk melestarikan ragam motif tradisional NTT. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 150000,
    "stock": 48,
    "image": "/uploads/products/flobakarya-66-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=66"
  },
  {
    "name": "Kaos Motif Tenun Satu Sisi",
    "slug": "kaos-motif-tenun-satu-sisi",
    "categorySlug": "tenun-tradisional",
    "description": "Kaos motif tenun satu sisi dengan sentuhan budaya NTT.\n\nPilihan Ukuran & Harga: M: Rp 150.000 (Stok: 12) · L: Rp 150.000 (Stok: 12) · XL: Rp 150.000 (Stok: 12) · 2XL: Rp 150.000 (Stok: 12).\n\nPilihan Warna: Hitam, Biru, Merah, Krem, Navy.",
    "story": "Kaos Motif Tenun Satu Sisi ditenun dan dikerjakan dengan ketekunan tinggi oleh warga binaan perempuan Kupang untuk melestarikan ragam motif tradisional NTT. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 150000,
    "stock": 48,
    "image": "/uploads/products/flobakarya-69-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=69"
  },
  {
    "name": "Kaos Motif Tenun Tengah Horizontal",
    "slug": "kaos-motif-tenun-tengah-horizontal",
    "categorySlug": "tenun-tradisional",
    "description": "Kaos motif tenun tengah horizontal dengan jahitan rapi.\n\nPilihan Ukuran & Harga: M: Rp 150.000 (Stok: 11) · L: Rp 150.000 (Stok: 12) · XL: Rp 150.000 (Stok: 12) · 2XL: Rp 150.000 (Stok: 12).\n\nPilihan Warna: Hitam, Biru, Merah, Krem, Navy.",
    "story": "Kaos Motif Tenun Tengah Horizontal ditenun dan dikerjakan dengan ketekunan tinggi oleh warga binaan perempuan Kupang untuk melestarikan ragam motif tradisional NTT. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 150000,
    "stock": 47,
    "image": "/uploads/products/flobakarya-68-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=68"
  },
  {
    "name": "Kaos Motif Tenun Tengah Vertikal",
    "slug": "kaos-motif-tenun-tengah-vertikal",
    "categorySlug": "tenun-tradisional",
    "description": "Kaos motif tenun tengah vertikal untuk tampilan kasual etnik.\n\nPilihan Ukuran & Harga: M: Rp 150.000 (Stok: 12) · L: Rp 150.000 (Stok: 12) · XL: Rp 150.000 (Stok: 12) · 2XL: Rp 150.000 (Stok: 12).\n\nPilihan Warna: Hitam, Biru, Merah, Krem, Navy.",
    "story": "Kaos Motif Tenun Tengah Vertikal ditenun dan dikerjakan dengan ketekunan tinggi oleh warga binaan perempuan Kupang untuk melestarikan ragam motif tradisional NTT. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 150000,
    "stock": 48,
    "image": "/uploads/products/flobakarya-67-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=67"
  },
  {
    "name": "Kotak Tisu Diagonal",
    "slug": "kotak-tisu-diagonal",
    "categorySlug": "kerajinan-tangan",
    "description": "Kotak tisu handmade dari stik es krim dengan motif diagonal.\n\nPilihan Warna: Pink, Biru, Ungu, Kuning.",
    "story": "Kotak Tisu Diagonal merupakan buah tangan terampil warga binaan perempuan Kupang yang memadukan kerapian teknik kriya dan sentuhan estetika modern. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 50000,
    "stock": 20,
    "image": "/uploads/products/flobakarya-70-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=70"
  },
  {
    "name": "Kotak Tisu Persegi Panjang",
    "slug": "kotak-tisu-persegi-panjang",
    "categorySlug": "kerajinan-tangan",
    "description": "Kotak tisu persegi panjang dengan motif dekoratif.\n\nPilihan Warna: Pink, Biru, Ungu, Kuning.",
    "story": "Kotak Tisu Persegi Panjang merupakan buah tangan terampil warga binaan perempuan Kupang yang memadukan kerapian teknik kriya dan sentuhan estetika modern. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 50000,
    "stock": 20,
    "image": "/uploads/products/flobakarya-71-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=71"
  },
  {
    "name": "Onbekoek",
    "slug": "onbekoek",
    "categorySlug": "kuliner-hasil-tani",
    "description": "Kue tradisional lembut dengan taburan kacang kenari.\n\nBersertifikat Halal Indonesia. Jadwal layanan kuliner: Senin–Kamis 09.00–14.00 WITA, Jumat–Sabtu 09.00–12.00 WITA, Minggu tutup.",
    "story": "Onbekoek diolah dari dapur tata boga Lapas Perempuan Kelas IIB Kupang dengan standar kebersihan dan cita rasa terjaga dalam program kemandirian FLOBAKARYA.",
    "price": 125000,
    "stock": 15,
    "image": "/uploads/products/flobakarya-80-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=80"
  },
  {
    "name": "Pepaya California",
    "slug": "pepaya-california",
    "categorySlug": "kuliner-hasil-tani",
    "description": "Pepaya California segar dengan rasa manis.\n\nPilihan Ukuran & Harga: Kecil: Rp 10.000 (Stok: 17) · Sedang: Rp 15.000 (Stok: 20) · Besar: Rp 20.000 (Stok: 20).",
    "story": "Pepaya California dibudidayakan secara segar di lahan ketahanan pangan Lapas Perempuan Kelas IIB Kupang melalui program agribisnis pembinaan kemandirian.",
    "price": 10000,
    "stock": 57,
    "image": "/uploads/products/flobakarya-89-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=89"
  },
  {
    "name": "Pita Rambut",
    "slug": "pita-rambut",
    "categorySlug": "kerajinan-tangan",
    "description": "Pita rambut rajut handmade yang ringan dan nyaman.\n\nPilihan Ukuran & Harga: Pita Rambut: Rp 30.000 (Stok: 8).\n\nPilihan Warna: Merah Maroon, Navy, Cream, Coklat, Maroon Kombinasi Cream.",
    "story": "Pita Rambut merupakan buah tangan terampil warga binaan perempuan Kupang yang memadukan kerapian teknik kriya dan sentuhan estetika modern. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 30000,
    "stock": 8,
    "image": "/uploads/products/flobakarya-74-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=74"
  },
  {
    "name": "Sayur Pakcoy",
    "slug": "sayur-pakcoy",
    "categorySlug": "kuliner-hasil-tani",
    "description": "Pakcoy segar hasil budidaya WBP.",
    "story": "Sayur Pakcoy dibudidayakan secara segar di lahan ketahanan pangan Lapas Perempuan Kelas IIB Kupang melalui program agribisnis pembinaan kemandirian.",
    "price": 5000,
    "stock": 12,
    "image": "/uploads/products/flobakarya-88-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=88"
  },
  {
    "name": "Selendang Tenun Motif Memoli (Sumba)",
    "slug": "selendang-tenun-motif-memoli-sumba",
    "categorySlug": "tenun-tradisional",
    "description": "Selendang tenun motif Memoli khas Sumba.\n\nPilihan Ukuran & Harga: Kecil (14 cm x 53 cm): Rp 50.000 (Stok: 19) · Sedang (19 cm x 72 cm): Rp 100.000 (Stok: 19) · Besar (53 cm x 94 cm): Rp 200.000 (Stok: 19).",
    "story": "Selendang Tenun Motif Memoli (Sumba) ditenun dan dikerjakan dengan ketekunan tinggi oleh warga binaan perempuan Kupang untuk melestarikan ragam motif tradisional NTT. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 50000,
    "stock": 57,
    "image": "/uploads/products/flobakarya-62-0.webp",
    "galleryEnabled": true,
    "images": [
      "/uploads/products/flobakarya-62-1.webp"
    ],
    "externalUrl": "https://flobakarya.com/product.php?id=62"
  },
  {
    "name": "Selendang Tenun Motif Sabu",
    "slug": "selendang-tenun-motif-sabu",
    "categorySlug": "tenun-tradisional",
    "description": "Selendang tenun motif Sabu untuk aksesori dan pelengkap busana.\n\nPilihan Ukuran & Harga: Kecil (14 cm x 53 cm): Rp 50.000 (Stok: 19) · Sedang (19 cm x 72 cm): Rp 100.000 (Stok: 20) · Besar (53 cm x 94 cm): Rp 200.000 (Stok: 20).",
    "story": "Selendang Tenun Motif Sabu ditenun dan dikerjakan dengan ketekunan tinggi oleh warga binaan perempuan Kupang untuk melestarikan ragam motif tradisional NTT. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 50000,
    "stock": 59,
    "image": "/uploads/products/flobakarya-64-0.webp",
    "galleryEnabled": true,
    "images": [
      "/uploads/products/flobakarya-64-1.webp",
      "/uploads/products/flobakarya-64-2.webp"
    ],
    "externalUrl": "https://flobakarya.com/product.php?id=64"
  },
  {
    "name": "Selendang Tenun Motif Sepe",
    "slug": "selendang-tenun-motif-sepe",
    "categorySlug": "tenun-tradisional",
    "description": "Selendang tenun motif Sepe dengan pilihan warna dasar.\n\nPilihan Ukuran & Harga: Kecil (14 cm x 53 cm): Rp 50.000 (Stok: 20) · Sedang (19 cm x 72 cm): Rp 100.000 (Stok: 20) · Besar (53 cm x 94 cm): Rp 200.000 (Stok: 20).",
    "story": "Selendang Tenun Motif Sepe ditenun dan dikerjakan dengan ketekunan tinggi oleh warga binaan perempuan Kupang untuk melestarikan ragam motif tradisional NTT. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 50000,
    "stock": 60,
    "image": "/uploads/products/flobakarya-65-0.webp",
    "galleryEnabled": true,
    "images": [
      "/uploads/products/flobakarya-65-1.webp",
      "/uploads/products/flobakarya-65-2.webp",
      "/uploads/products/flobakarya-65-3.webp"
    ],
    "externalUrl": "https://flobakarya.com/product.php?id=65"
  },
  {
    "name": "Selendang Tenun Motif Sepe Kembang",
    "slug": "selendang-tenun-motif-sepe-kembang",
    "categorySlug": "tenun-tradisional",
    "description": "Selendang tenun motif Sepe Kembang dengan pilihan ukuran kecil, sedang, dan besar.\n\nPilihan Ukuran & Harga: Kecil (14 cm x 53 cm): Rp 50.000 (Stok: 20) · Sedang (19 cm x 72 cm): Rp 100.000 (Stok: 20) · Besar (53 cm x 94 cm): Rp 200.000 (Stok: 20).",
    "story": "Selendang Tenun Motif Sepe Kembang ditenun dan dikerjakan dengan ketekunan tinggi oleh warga binaan perempuan Kupang untuk melestarikan ragam motif tradisional NTT. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 50000,
    "stock": 60,
    "image": "/uploads/products/flobakarya-91-0.webp",
    "galleryEnabled": true,
    "images": [
      "/uploads/products/flobakarya-91-1.webp",
      "/uploads/products/flobakarya-91-2.webp"
    ],
    "externalUrl": "https://flobakarya.com/product.php?id=91"
  },
  {
    "name": "Selendang Tenun Motif Sumba",
    "slug": "selendang-tenun-motif-sumba",
    "categorySlug": "tenun-tradisional",
    "description": "Selendang tenun motif Sumba dengan warna khas dan detail rapi.\n\nPilihan Ukuran & Harga: Kecil (14 cm x 53 cm): Rp 50.000 (Stok: 19) · Sedang (19 cm x 72 cm): Rp 100.000 (Stok: 20) · Besar (53 cm x 94 cm): Rp 200.000 (Stok: 20).",
    "story": "Selendang Tenun Motif Sumba ditenun dan dikerjakan dengan ketekunan tinggi oleh warga binaan perempuan Kupang untuk melestarikan ragam motif tradisional NTT. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 50000,
    "stock": 59,
    "image": "/uploads/products/flobakarya-63-0.webp",
    "galleryEnabled": true,
    "images": [
      "/uploads/products/flobakarya-63-1.webp"
    ],
    "externalUrl": "https://flobakarya.com/product.php?id=63"
  },
  {
    "name": "Selendang Tenun Motif Timor (Kombinasi 2 Warna)",
    "slug": "selendang-tenun-motif-timor-kombinasi-2-warna",
    "categorySlug": "tenun-tradisional",
    "description": "Selendang tenun motif Timor dengan pilihan ukuran kecil, sedang, dan besar.\n\nPilihan Ukuran & Harga: Kecil (14 cm x 53 cm): Rp 50.000 (Stok: 16) · Sedang (19 cm x 72 cm): Rp 100.000 (Stok: 19) · Besar (53 cm x 94 cm): Rp 200.000 (Stok: 19).",
    "story": "Selendang Tenun Motif Timor (Kombinasi 2 Warna) ditenun dan dikerjakan dengan ketekunan tinggi oleh warga binaan perempuan Kupang untuk melestarikan ragam motif tradisional NTT. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 50000,
    "stock": 54,
    "image": "/uploads/products/flobakarya-60-0.webp",
    "galleryEnabled": true,
    "images": [
      "/uploads/products/flobakarya-60-1.webp",
      "/uploads/products/flobakarya-60-2.webp",
      "/uploads/products/flobakarya-60-3.webp",
      "/uploads/products/flobakarya-60-4.webp",
      "/uploads/products/flobakarya-60-5.webp",
      "/uploads/products/flobakarya-60-6.webp",
      "/uploads/products/flobakarya-60-7.webp",
      "/uploads/products/flobakarya-60-8.webp",
      "/uploads/products/flobakarya-60-9.webp",
      "/uploads/products/flobakarya-60-10.webp",
      "/uploads/products/flobakarya-60-11.webp",
      "/uploads/products/flobakarya-60-12.webp",
      "/uploads/products/flobakarya-60-13.webp"
    ],
    "externalUrl": "https://flobakarya.com/product.php?id=60"
  },
  {
    "name": "Selendang Tenun Motif Timor (Kombinasi 3 Warna)",
    "slug": "selendang-tenun-motif-timor-kombinasi-3-warna",
    "categorySlug": "tenun-tradisional",
    "description": "Selendang tenun motif Timor kombinasi tiga warna.\n\nPilihan Ukuran & Harga: Kecil (14 cm x 53 cm): Rp 50.000 (Stok: 20) · Sedang (19 cm x 72 cm): Rp 100.000 (Stok: 20) · Besar (53 cm x 94 cm): Rp 200.000 (Stok: 20).",
    "story": "Selendang Tenun Motif Timor (Kombinasi 3 Warna) ditenun dan dikerjakan dengan ketekunan tinggi oleh warga binaan perempuan Kupang untuk melestarikan ragam motif tradisional NTT. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 50000,
    "stock": 60,
    "image": "/uploads/products/flobakarya-61-0.webp",
    "galleryEnabled": true,
    "images": [
      "/uploads/products/flobakarya-61-1.webp",
      "/uploads/products/flobakarya-61-2.webp",
      "/uploads/products/flobakarya-61-3.webp",
      "/uploads/products/flobakarya-61-4.webp",
      "/uploads/products/flobakarya-61-5.webp",
      "/uploads/products/flobakarya-61-6.webp"
    ],
    "externalUrl": "https://flobakarya.com/product.php?id=61"
  },
  {
    "name": "Tart Susu",
    "slug": "tart-susu",
    "categorySlug": "kuliner-hasil-tani",
    "description": "Tart susu lembut dengan rasa manis gurih.\n\nBersertifikat Halal Indonesia. Jadwal layanan kuliner: Senin–Kamis 09.00–14.00 WITA, Jumat–Sabtu 09.00–12.00 WITA, Minggu tutup.",
    "story": "Tart Susu diolah dari dapur tata boga Lapas Perempuan Kelas IIB Kupang dengan standar kebersihan dan cita rasa terjaga dalam program kemandirian FLOBAKARYA.",
    "price": 120000,
    "stock": 15,
    "image": "/uploads/products/flobakarya-81-0.webp",
    "galleryEnabled": false,
    "images": [],
    "externalUrl": "https://flobakarya.com/product.php?id=81"
  },
  {
    "name": "Tas Rajut",
    "slug": "tas-rajut",
    "categorySlug": "kerajinan-tangan",
    "description": "Tas rajut handmade tersedia dalam 14 model dan ukuran.\n\nPilihan Ukuran & Harga: Model A (25 cm x 15 cm): Rp 350.000 (Stok: 4) · Model B (22 cm x 15 cm): Rp 150.000 (Stok: 5) · Model C (25 cm x 30 cm): Rp 200.000 (Stok: 5) · Model D (22 cm x 17 cm): Rp 200.000 (Stok: 5) · Model E (20 cm x 18 cm): Rp 350.000 (Stok: 5) · Model F (28 cm x 20 cm): Rp 250.000 (Stok: 3) · Model G (28 cm x 20 cm): Rp 250.000 (Stok: 5) · Model H (28 cm x 20 cm): Rp 250.000 (Stok: 5) · Model I (28 cm x 18 cm): Rp 250.000 (Stok: 5) · Model J (28 cm x 17 cm): Rp 250.000 (Stok: 4) · Model K (28 cm x 17 cm): Rp 300.000 (Stok: 5) · Model L (29 cm x 16 cm): Rp 250.000 (Stok: 5) · Model M (31 cm x 18 cm): Rp 250.000 (Stok: 5) · Model N (16 cm x 17 cm): Rp 250.000 (Stok: 5).",
    "story": "Tas Rajut merupakan buah tangan terampil warga binaan perempuan Kupang yang memadukan kerapian teknik kriya dan sentuhan estetika modern. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 150000,
    "stock": 66,
    "image": "/uploads/products/flobakarya-72-0.webp",
    "galleryEnabled": true,
    "images": [
      "/uploads/products/flobakarya-72-1.webp",
      "/uploads/products/flobakarya-72-2.webp",
      "/uploads/products/flobakarya-72-3.webp",
      "/uploads/products/flobakarya-72-4.webp",
      "/uploads/products/flobakarya-72-5.webp",
      "/uploads/products/flobakarya-72-6.webp",
      "/uploads/products/flobakarya-72-7.webp",
      "/uploads/products/flobakarya-72-8.webp",
      "/uploads/products/flobakarya-72-9.webp",
      "/uploads/products/flobakarya-72-10.webp",
      "/uploads/products/flobakarya-72-11.webp",
      "/uploads/products/flobakarya-72-12.webp",
      "/uploads/products/flobakarya-72-13.webp"
    ],
    "externalUrl": "https://flobakarya.com/product.php?id=72"
  },
  {
    "name": "Tumbler Rajutan",
    "slug": "tumbler-rajutan",
    "categorySlug": "kerajinan-tangan",
    "description": "Tumbler dengan sarung rajut handmade dalam tiga ukuran.\n\nPilihan Ukuran & Harga: Model A - 750 ml: Rp 75.000 (Stok: 5) · Model B - 750 ml: Rp 75.000 (Stok: 5) · Model C - 750 ml: Rp 75.000 (Stok: 5) · Model A - 75 ml: Rp 75.000 (Stok: 5) · Model B - 75 ml: Rp 75.000 (Stok: 5) · Model C - 75 ml: Rp 75.000 (Stok: 5) · Model A - 1000 ml: Rp 100.000 (Stok: 5) · Model B - 1000 ml: Rp 100.000 (Stok: 5) · Model C - 1000 ml: Rp 100.000 (Stok: 5) · Model A - 1500 ml: Rp 120.000 (Stok: 5) · Model B - 1500 ml: Rp 120.000 (Stok: 5) · Model C - 1500 ml: Rp 120.000 (Stok: 5).",
    "story": "Tumbler Rajutan merupakan buah tangan terampil warga binaan perempuan Kupang yang memadukan kerapian teknik kriya dan sentuhan estetika modern. Diproduksi langsung oleh warga binaan pemasyarakatan di Lapas Perempuan Kelas IIB Kupang dalam program pembinaan kemandirian FLOBAKARYA.",
    "price": 75000,
    "stock": 60,
    "image": "/uploads/products/flobakarya-90-0.webp",
    "galleryEnabled": true,
    "images": [
      "/uploads/products/flobakarya-90-1.webp",
      "/uploads/products/flobakarya-90-2.webp"
    ],
    "externalUrl": "https://flobakarya.com/product.php?id=90"
  }
];
