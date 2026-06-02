"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createTransactionAction } from "@/app/actions/transactions";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";

const initialState = {
  success: false,
  message: "",
  errors: {},
};

export function PosWorkspace({ initialData }) {
  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  const router = useRouter();
  const handledCheckoutRef = useRef(false);
  const [state, formAction, pending] = useActionState(
    createTransactionAction,
    initialState,
  );

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty * item.priceNumber, 0),
    [cart],
  );
  const paidAmountNumber = Number(paidAmount || 0);
  const change = paidAmountNumber - total;
  const hasValidPayment = paidAmountNumber >= total && total > 0;
  const paymentInputValue = cart.length ? paidAmount : "";
  const checkoutCompleted = state.success && Boolean(state.data?.printUrl);
  const visibleCart = checkoutCompleted ? [] : cart;
  const isPreviewOpen = checkoutCompleted ? false : open;

  useEffect(() => {
    if (state.success && state.data?.printUrl && !handledCheckoutRef.current) {
      handledCheckoutRef.current = true;
      router.push(state.data.printUrl);
      return;
    }

    if (!state.success) {
      handledCheckoutRef.current = false;
    }
  }, [router, state.data?.printUrl, state.success]);

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);

      if (existing) {
        return current.map((item) =>
          item.productId === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          qty: 1,
          price: product.price,
          priceNumber: product.priceNumber,
        },
      ];
    });
  }

  function changeQty(productId, nextQty) {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId ? { ...item, qty: nextQty } : item,
        )
        .filter((item) => item.qty > 0),
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[24px] border border-border bg-surface p-4 card-shadow sm:rounded-[30px] sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold sm:text-xl">Katalog Produk</h3>
            <p className="mt-1 text-sm text-muted">
              Pilih produk berdasarkan cabang aktif kasir.
            </p>
          </div>
          <p className="text-sm text-muted">
            {initialData.branch.name} - {initialData.products.length} item
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {initialData.products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addToCart(product)}
              className="rounded-[24px] border border-border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-primary hover:shadow-lg sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{product.name}</p>
                  <p className="mt-1 text-sm text-muted">{product.categoryName}</p>
                </div>
                <span className="rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
                  Stok {product.stock}
                </span>
              </div>
              <p className="mt-5 text-xl font-semibold">{product.price}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-border bg-surface p-4 card-shadow sm:rounded-[30px] sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold sm:text-xl">Keranjang Kasir</h3>
            <p className="mt-1 text-sm text-muted">
              Perubahan qty dihitung otomatis sebelum checkout.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setOpen(true)}
            disabled={!cart.length}
            className="w-full sm:w-auto"
          >
            Preview
          </Button>
        </div>

        {!visibleCart.length ? (
          <EmptyState
            title="Keranjang masih kosong"
            description="Tambahkan produk dari katalog untuk mulai transaksi."
          />
        ) : (
          <form action={formAction} className="grid gap-4">
            <input type="hidden" name="userId" value={initialData.user.id} />
            <input type="hidden" name="branchId" value={initialData.branch.id} />
            <input type="hidden" name="items" value={JSON.stringify(visibleCart)} />
            <input type="hidden" name="paidAmount" value={paidAmountNumber} />

            <div className="grid gap-3">
              {visibleCart.map((item) => (
                <div
                  key={item.productId}
                  className="rounded-[24px] border border-border bg-white p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-muted">{item.price}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => changeQty(item.productId, item.qty - 1)}
                      >
                        -
                      </Button>
                      <span className="min-w-8 text-center text-sm font-semibold">
                        {item.qty}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => changeQty(item.productId, item.qty + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-border bg-primary px-5 py-4 text-primary-foreground">
              <p className="text-sm text-white/70">Total bayar</p>
              <p className="mt-2 text-3xl font-semibold">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(total)}
              </p>
            </div>

            <div className="rounded-[24px] border border-border bg-white px-5 py-4">
              <label className="text-sm font-semibold text-foreground" htmlFor="paidAmount">
                Uang dibayarkan
              </label>
              <input
                id="paidAmount"
                name="paidAmountInput"
                type="number"
                min="0"
                inputMode="numeric"
                value={paymentInputValue}
                onChange={(event) => setPaidAmount(event.target.value)}
                placeholder="Masukkan nominal bayar"
                className="mt-3 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-base outline-none transition focus:border-primary"
              />
              <div className="mt-4 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted">Nominal diterima</span>
                  <span className="font-semibold">
                    {paidAmountNumber
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(paidAmountNumber)
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted">Kembalian</span>
                  <span className={`font-semibold ${change >= 0 ? "text-primary" : "text-danger"}`}>
                    {paidAmountNumber
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(Math.max(change, 0))
                      : "-"}
                  </span>
                </div>
                {paidAmountNumber > 0 && change < 0 ? (
                  <p className="text-danger">
                    Kurang{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(Math.abs(change))}
                  </p>
                ) : null}
              </div>
            </div>

            {state.message ? (
              <p
                className={`rounded-2xl px-4 py-3 text-sm ${
                  state.success ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"
                }`}
              >
                {state.message}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={pending || !hasValidPayment}>
              {pending ? "Menyimpan transaksi..." : "Checkout Sekarang"}
            </Button>
          </form>
        )}
      </section>

      <Modal
        open={isPreviewOpen}
        onClose={() => setOpen(false)}
        title="Preview Keranjang"
        description="Cek detail item sebelum transaksi dikirim ke server."
      >
        <div className="grid gap-3">
          {visibleCart.map((item) => (
            <div
              key={item.productId}
              className="flex flex-col gap-3 rounded-2xl border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted">
                  {item.qty} x {item.price}
                </p>
              </div>
              <p className="font-semibold">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(item.qty * item.priceNumber)}
              </p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
