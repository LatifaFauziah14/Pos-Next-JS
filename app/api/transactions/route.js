import { NextResponse } from "next/server";
import { TransactionService } from "@/services/transaction-service";

export async function GET() {
  const service = new TransactionService();
  const data = await service.listTransactions();
  return NextResponse.json({ data });
}
