import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

let databaseUrl = process.env.DATABASE_URL;

// Attempt to read .env.local if DATABASE_URL not in environment
if (!databaseUrl) {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const raw = fs.readFileSync(envPath, 'utf8');
    const match = raw.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m);
    if (match) databaseUrl = match[1].trim().replace(/^"|"$/g, '');
  } catch (e) {
    // ignore
  }

  if (!databaseUrl) {
    console.error('DATABASE_URL belum diset. Isi .env.local atau ekspor env sebelum menjalankan.');
    process.exit(2);
  }
}

const isSupabase = /supabase/i.test(databaseUrl);

const sql = postgres(databaseUrl, {
  max: 2,
  prepare: false,
  ssl: isSupabase ? 'require' : undefined,
});

(async () => {
  try {
    const res = await sql`SELECT 1 as ok`;
    console.log('Koneksi DB berhasil:', res[0] || res);
    await sql.end({ timeout: 1000 });
    process.exit(0);
  } catch (err) {
    console.error('Koneksi DB gagal:', err.message || err);
    try { await sql.end({ timeout: 1000 }); } catch (e) {}
    process.exit(3);
  }
})();
