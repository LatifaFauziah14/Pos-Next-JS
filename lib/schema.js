import { decimal, int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const rolesTable = mysqlTable("roles", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 50 }).notNull(),
});

export const branchesTable = mysqlTable("branches", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
});

export const usersTable = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 50 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  roleId: int("role_id").notNull(),
  branchId: int("branch_id").notNull(),
});

export const categoriesTable = mysqlTable("categories", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const productsTable = mysqlTable("products", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 120 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  stock: int("stock").notNull(),
  categoryId: int("category_id").notNull(),
  branchId: int("branch_id").notNull(),
});

export const transactionsTable = mysqlTable("transactions", {
  id: int("id").primaryKey().autoincrement(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  userId: int("user_id").notNull(),
  branchId: int("branch_id").notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionDetailsTable = mysqlTable("transaction_details", {
  id: int("id").primaryKey().autoincrement(),
  transactionId: int("transaction_id").notNull(),
  productId: int("product_id").notNull(),
  qty: int("qty").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
});
