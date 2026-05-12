import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

let connection;
let database;

export async function getDb() {
  if (database) return database;
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diatur.");
  }

  connection =
    connection ||
    mysql.createPool({
      uri: process.env.DATABASE_URL,
      connectionLimit: 10,
    });

  database = drizzle(connection);
  return database;
}

export async function getDbOrNull() {
  if (!process.env.DATABASE_URL) return null;
  return getDb();
}
