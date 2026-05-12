import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { getSession } from "@/lib/auth";
import { TransactionService } from "@/services/transaction-service";
import { InvoicePrintTrigger } from "./invoice-print-trigger";

export const metadata = {
  title: "Invoice POS | POS Multi Cabang",
};

function formatTransactionDate(value) {
  if (!value) {
    return "-";
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(value);
  }

  const parsed = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function readSearchValue(searchParams, key) {
  const value = searchParams?.[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function InvoicePage({ params, searchParams }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const invoiceNumber = resolvedParams?.invoiceNumber;

  if (!invoiceNumber) {
    notFound();
  }

  const transactionService = new TransactionService();
  const invoice = await transactionService.getTransactionByInvoiceNumber(invoiceNumber);

  if (!invoice) {
    notFound();
  }

  const autoPrint = resolvedSearchParams?.autoprint === "1";
  const paidAmount = Number(readSearchValue(resolvedSearchParams, "paidAmount") || 0);
  const change = Number(readSearchValue(resolvedSearchParams, "change") || 0);

  return (
    <>
      <InvoicePrintTrigger enabled={autoPrint} />
      <main className="invoice-print-page min-h-screen bg-background px-4 py-8 text-foreground">
        <div className="invoice-toolbar mx-auto mb-4 flex w-full max-w-[210mm] items-center justify-between gap-3">
          <Link
            href="/pos"
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold transition hover:border-primary hover:text-primary"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
            Kembali ke POS
          </Link>
          <p className="text-sm text-muted">
            Invoice akan otomatis dibuka ke dialog cetak PDF A4.
          </p>
        </div>

        <section className="mx-auto w-full max-w-[210mm]">
          <div className="invoice-sheet rounded-[28px] border border-border bg-white p-8 shadow-[0_30px_80px_-40px_rgba(24,35,15,0.35)]">
            <div className="flex items-start justify-between gap-6 border-b border-dashed border-border pb-6">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-muted">
                  POS Cabang
                </p>
                <h1 className="mt-2 text-3xl font-semibold">Invoice Penjualan</h1>
                <p className="mt-2 text-sm text-muted">{invoice.branchName}</p>
                <p className="text-sm text-muted">{invoice.branchAddress}</p>
              </div>

              <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
                <p className="text-muted">Invoice</p>
                <p className="mt-1 font-semibold">{invoice.invoiceNumber}</p>
                <p className="mt-3 text-muted">Kasir</p>
                <p className="mt-1 font-semibold">{invoice.cashier}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-muted md:grid-cols-2">
              <p>
                Tanggal transaksi:{" "}
                <span className="font-semibold text-foreground">
                  {formatTransactionDate(invoice.createdAt)}
                </span>
              </p>
              <p>
                Dicetak oleh:{" "}
                <span className="font-semibold text-foreground">
                  {session.username}
                </span>
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-[24px] border border-border">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-surface">
                  <tr className="text-left text-muted">
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Qty</th>
                    <th className="px-4 py-3 font-medium">Harga</th>
                    <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={`${item.productId}-${item.productName}`} className="border-t border-border">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3 text-muted">{item.qty}</td>
                      <td className="px-4 py-3 text-muted">{item.price}</td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {item.subtotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex items-end justify-between gap-6">
              <div className="max-w-md text-sm text-muted">
                <p className="font-semibold text-foreground">Catatan</p>
                <p className="mt-2">
                  Simpan invoice ini sebagai PDF lewat dialog cetak browser. Layout
                  sudah disetel untuk ukuran A4.
                </p>
              </div>

              <div className="grid min-w-72 gap-3">
                <div className="rounded-[24px] border border-border bg-surface px-5 py-4 text-sm">
                  <p className="text-muted">Uang dibayarkan</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {formatRupiah(paidAmount)}
                  </p>
                </div>
                <div className="rounded-[24px] border border-primary bg-primary px-5 py-4 text-primary-foreground">
                  <p className="text-sm text-white/70">Kembalian</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {formatRupiah(Math.max(change, 0))}
                  </p>
                </div>
                <div className="rounded-[24px] border border-border bg-surface px-5 py-4 text-sm">
                  <p className="text-muted">Total bayar</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {invoice.total}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
