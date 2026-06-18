import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

let connection;
let database;

function createConnection() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL belum diatur.");
  }

  const isSupabase = /supabase/i.test(databaseUrl);

  return postgres(databaseUrl, {
    max: 5, // Reduce from 10 to prevent connection exhaustion
    prepare: false,
    ssl: isSupabase ? "require" : undefined,
    idle_in_transaction_session_timeout: 30000, // 30s idle timeout
    statement_timeout: 30000, // 30s query timeout
    connection_timeout: 10000, // 10s connection timeout
  });
}

export async function getDb() {
  if (database) return database;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diatur.");
  }

  connection = connection || createConnection();
  database = drizzle(connection);
  return database;
}

export async function getDbOrNull() {
  if (!process.env.DATABASE_URL) return null;
  return getDb();
}
