# POS Multi Cabang - Next.js 16

Aplikasi Point of Sale modern berbasis Next.js 16 App Router, JavaScript, Tailwind CSS, Drizzle ORM, MySQL/MariaDB, dan reusable component architecture.

## Fitur

- Login dan logout
- Manajemen user, cabang, kategori, dan produk
- Halaman POS untuk kasir
- Keranjang transaksi
- Riwayat transaksi dan laporan sederhana per cabang
- Validasi client dan server
- Contoh hashing `bcrypt(username + password)`

## Struktur

```bash
app/
components/
lib/
services/
database/
```

## Menjalankan

```bash
npm install
cp .env.development.example .env.local
npm run dev
```

## Environment

Development:

```bash
cp .env.development.example .env.local
```

Production:

```bash
cp .env.production.example .env.production
```

Keduanya sudah diset menggunakan akun MySQL `root` tanpa password sesuai kebutuhan lokal:

```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/pos_nextjs"
```

## SQL Import

Gunakan file `database/pos_mysql.sql` langsung di phpMyAdmin.
