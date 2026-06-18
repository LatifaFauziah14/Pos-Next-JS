import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import dns from 'dns';

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

console.log('🔍 Database URL (masked):', databaseUrl.replace(/:[^:/@]+@/, ':****@'));

const isSupabase = /supabase/i.test(databaseUrl);

// Extract hostname for DNS check
try {
  const urlObj = new URL(databaseUrl);
  const hostname = urlObj.hostname;
  console.log(`🔍 Testing DNS resolution untuk: ${hostname}`);
  
  dns.resolve4(hostname, (err, addresses) => {
    if (err) {
      console.error(`❌ DNS resolution gagal: ${err.message}`);
      console.log('💡 Pastikan Anda terhubung ke internet dan Supabase server dapat diakses');
    } else {
      console.log(`✅ DNS resolved ke: ${addresses.join(', ')}`);
    }
  });
} catch (e) {
  console.error('❌ URL parsing error:', e.message);
}

const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  ssl: isSupabase ? 'require' : undefined,
  idle_in_transaction_session_timeout: 10000,
  statement_timeout: 10000,
  connection_timeout: 5000,
});

(async () => {
  let startTime = Date.now();
  try {
    console.log('🔄 Menghubungkan ke database...');
    const res = await sql`SELECT 1 as ok`;
    const duration = Date.now() - startTime;
    console.log(`✅ Koneksi DB berhasil (${duration}ms):`, res[0] || res);
    await sql.end({ timeout: 5000 });
    process.exit(0);
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`❌ Koneksi DB gagal (${duration}ms):`);
    console.error(`   Error: ${err.message}`);
    if (err.code) console.error(`   Code: ${err.code}`);
    try { await sql.end({ timeout: 5000 }); } catch (e) {
      console.error('Gagal menutup koneksi:', e.message);
    }
    process.exit(3);
  }
})();


