import fs from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

function parseDatabaseUrl(envText) {
  const match = envText.match(/^DATABASE_URL\s*=\s*(.+)$/m);

  if (!match) {
    throw new Error("DATABASE_URL tidak ditemukan di .env.production.");
  }

  const rawValue = match[1].trim();

  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1);
  }

  return rawValue;
}

async function loadDatabaseUrl(rootDir) {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const envPath = path.join(rootDir, ".env.production");
  const envText = await fs.readFile(envPath, "utf8");
  return parseDatabaseUrl(envText);
}

async function main() {
  const rootDir = process.cwd();
  const databaseUrl = await loadDatabaseUrl(rootDir);
  const seedPath = path.join(rootDir, "database", "pos_supabase.sql");

  const sql = postgres(databaseUrl, {
    prepare: false,
    ssl: "require",
  });

  try {
    await sql.begin(async (tx) => {
      await tx.file(seedPath);
    });

    const [roles] = await sql`SELECT COUNT(*)::int AS count FROM roles`;
    const [branches] = await sql`SELECT COUNT(*)::int AS count FROM branches`;
    const [categories] = await sql`SELECT COUNT(*)::int AS count FROM categories`;
    const [users] = await sql`SELECT COUNT(*)::int AS count FROM users`;
    const [products] = await sql`SELECT COUNT(*)::int AS count FROM products`;
    const [transactions] = await sql`SELECT COUNT(*)::int AS count FROM transactions`;
    const [details] = await sql`SELECT COUNT(*)::int AS count FROM transaction_details`;

    console.log("Seed Supabase selesai.");
    console.log(
      `roles=${roles.count}, branches=${branches.count}, categories=${categories.count}, users=${users.count}, products=${products.count}, transactions=${transactions.count}, transaction_details=${details.count}`,
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error("Seed Supabase gagal:", error.message || error);
  process.exitCode = 1;
});
