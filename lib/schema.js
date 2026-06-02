import {
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const rolesTable = pgTable(
  "roles",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
  },
  (table) => ({
    nameUnique: uniqueIndex("roles_name_unique").on(table.name),
  }),
);

export const branchesTable = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
});

export const usersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 50 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    roleId: integer("role_id")
      .notNull()
      .references(() => rolesTable.id),
    branchId: integer("branch_id")
      .notNull()
      .references(() => branchesTable.id),
  },
  (table) => ({
    usernameUnique: uniqueIndex("users_username_unique").on(table.username),
  }),
);

export const categoriesTable = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
  },
  (table) => ({
    nameUnique: uniqueIndex("categories_name_unique").on(table.name),
  }),
);

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoriesTable.id),
  branchId: integer("branch_id")
    .notNull()
    .references(() => branchesTable.id),
});

export const transactionsTable = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id),
    branchId: integer("branch_id")
      .notNull()
      .references(() => branchesTable.id),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    invoiceNumberUnique: uniqueIndex("transactions_invoice_number_unique").on(
      table.invoiceNumber,
    ),
  }),
);

export const transactionDetailsTable = pgTable("transaction_details", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id")
    .notNull()
    .references(() => transactionsTable.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => productsTable.id),
  qty: integer("qty").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
});
