# POS Multi Cabang - Next.js 16

Aplikasi Point of Sale modern berbasis Next.js 16 App Router, JavaScript, Tailwind CSS, Drizzle ORM, dan Supabase Postgres.

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
npm run dev
```

## Environment

Pakai connection string Supabase Postgres di `DATABASE_URL`.

```env
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres?sslmode=require"
AUTH_SECRET="ganti_dengan_secret_yang_kuat"
```

## SQL Import

Gunakan file `database/pos_supabase.sql` langsung di Supabase SQL Editor atau client PostgreSQL lain.
