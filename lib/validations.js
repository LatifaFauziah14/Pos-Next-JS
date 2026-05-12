import { z } from "zod";

const safeText = z
  .string()
  .trim()
  .min(3)
  .max(50)
  .regex(/^[a-zA-Z0-9._-]+$/, "Hanya huruf, angka, titik, dash, dan underscore.");

export const loginSchema = z.object({
  username: safeText,
  password: z.string().trim().min(6).max(100),
});

export const transactionPayloadSchema = z.object({
  userId: z.number().int().positive(),
  branchId: z.number().int().positive(),
  paidAmount: z.number().int().positive(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        qty: z.number().int().positive().max(1000),
        priceNumber: z.number().positive(),
      }),
    )
    .min(1),
});

export const userPayloadSchema = z.object({
  username: safeText,
  password: z.string().trim().min(6).max(100),
  roleId: z.number().int().positive(),
  branchId: z.number().int().positive(),
});

export const userUpdateSchema = z.object({
  id: z.number().int().positive(),
  username: safeText,
  password: z.string().trim().max(100).optional(),
  roleId: z.number().int().positive(),
  branchId: z.number().int().positive(),
});

const productNameSchema = z
  .string()
  .trim()
  .min(3, "Nama produk minimal 3 karakter.")
  .max(120, "Nama produk maksimal 120 karakter.");

export const productPayloadSchema = z.object({
  name: productNameSchema,
  priceNumber: z.number().positive("Harga harus lebih dari 0."),
  stock: z.number().int().min(0, "Stok tidak boleh negatif."),
  categoryId: z.number().int().positive(),
  branchId: z.number().int().positive(),
});

export const productUpdateSchema = z.object({
  id: z.number().int().positive(),
  name: productNameSchema,
  priceNumber: z.number().positive("Harga harus lebih dari 0."),
  stock: z.number().int().min(0, "Stok tidak boleh negatif."),
  categoryId: z.number().int().positive(),
  branchId: z.number().int().positive(),
});

export const productRestockSchema = z.object({
  productId: z.number().int().positive(),
  additionalStock: z.number().int().positive("Jumlah restok harus lebih dari 0."),
});
