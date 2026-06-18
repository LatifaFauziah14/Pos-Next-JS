"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { TransactionService } from "@/services/transaction-service";
import { transactionPayloadSchema } from "@/lib/validations";

export async function createTransactionAction(_prevState, formData) {
  const session = await getSession();
  const rawItems = String(formData.get("items") || "[]");
  const paidAmount = Number(formData.get("paidAmount") || 0);

  if (!session) {
    return {
      success: false,
      message: "Sesi login tidak ditemukan.",
      errors: {},
    };
  }

  const payload = {
    userId: Number(session.id),
    branchId: Number(session.branchId),
    paidAmount,
    items: JSON.parse(rawItems),
  };

  const parsed = transactionPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      message: "Payload transaksi tidak valid.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const service = new TransactionService();
  let result;
  try {
    result = await service.createTransaction(parsed.data);
  } catch (error) {
    return {
      success: false,
      message: error?.message || "Gagal menyimpan transaksi.",
      errors: {},
    };
  }
  const total = parsed.data.items.reduce(
    (sum, item) => sum + item.qty * Number(item.priceNumber || 0),
    0,
  );
  const change = parsed.data.paidAmount - total;

  revalidatePath("/dashboard");
  revalidatePath("/pos");

  return {
    success: true,
    message: `Transaksi ${result.invoiceNumber} berhasil dibuat.`,
    data: {
      ...result,
      paidAmount: parsed.data.paidAmount,
      change,
      printUrl: `/invoice/${result.invoiceNumber}?autoprint=1&paidAmount=${parsed.data.paidAmount}&change=${change}`,
    },
  };
}
