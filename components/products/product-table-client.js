"use client";

import { useState, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faPencil,
  faPlus,
  faRotate,
  faShieldHalved,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

function SelectField({ label, value, onChange, options, helperText, error }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      <select
        className={`h-12 w-full rounded-2xl border bg-white px-4 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-[var(--ring)] ${
          error ? "border-danger" : "border-border"
        }`}
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText ? <span className="text-xs text-muted">{helperText}</span> : null}
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}

function getInitialForm(categories, branches) {
  return {
    id: null,
    name: "",
    priceNumber: "",
    stock: "",
    categoryId: String(categories[0]?.id || ""),
    branchId: String(branches[0]?.id || ""),
    restockProductId: "",
    additionalStock: "",
  };
}

function getInitialRestockForm(products) {
  return {
    id: null,
    name: "",
    priceNumber: "",
    stock: "",
    categoryId: "",
    branchId: "",
    restockProductId: String(products[0]?.id || ""),
    additionalStock: "",
  };
}

function formatNumberInput(value) {
  return value.replace(/[^\d]/g, "");
}

export function ProductTableClient({ data, categories, branches, session }) {
  const isAdmin = session?.roleName === "admin" || session?.roleId === 1;
  const [products, setProducts] = useState(data);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(() => getInitialForm(categories, branches));
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({});
  const [isPending, startTransition] = useTransition();

  const totals = {
    all: products.length,
    categories: new Set(products.map((item) => item.categoryName)).size,
    branches: new Set(products.map((item) => item.branchName)).size,
    stock: products.reduce((total, item) => total + Number(item.stock || 0), 0),
  };

  async function refreshProducts() {
    const response = await fetch("/api/products", { cache: "no-store" });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal memuat data produk.");
    }

    setProducts(result.data || []);
  }

  function resetForm() {
    setForm(getInitialForm(categories, branches));
    setErrors({});
  }

  function openCreateModal() {
    setMode("create");
    resetForm();
    setOpen(true);
  }

  function openRestockModal() {
    if (products.length === 0) {
      setFeedback({
        type: "error",
        message: "Belum ada produk yang bisa di-restok.",
      });
      return;
    }

    setMode("restock");
    setErrors({});
    setForm(getInitialRestockForm(products));
    setOpen(true);
  }

  function openEditModal(product) {
    setMode("edit");
    setErrors({});
    setForm({
      id: product.id,
      name: product.name,
      priceNumber: String(product.priceNumber),
      stock: String(product.stock),
      categoryId: String(product.categoryId),
      branchId: String(product.branchId),
      restockProductId: "",
      additionalStock: "",
    });
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    resetForm();
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback({ type: "", message: "" });
    setErrors({});

    const payload = {
      ...(mode === "edit" ? { id: Number(form.id) } : {}),
      ...(mode === "restock"
        ? {
            action: "restock",
            productId: Number(form.restockProductId),
            additionalStock: Number(form.additionalStock),
          }
        : {
            name: form.name,
            priceNumber: Number(form.priceNumber),
            stock: Number(form.stock),
            categoryId: Number(form.categoryId),
            branchId: Number(form.branchId),
          }),
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/products", {
          method: mode === "edit" ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          setErrors(result.errors || {});
          setFeedback({
            type: "error",
            message: result.message || "Perubahan produk gagal disimpan.",
          });
          return;
        }

        await refreshProducts();
        closeModal();
        setFeedback({
          type: "success",
          message:
            mode === "create"
              ? "Produk baru berhasil ditambahkan."
              : mode === "restock"
                ? "Stok produk berhasil ditambahkan."
              : "Produk berhasil diperbarui.",
        });
      } catch (error) {
        setFeedback({
          type: "error",
          message: error.message || "Terjadi masalah saat menyimpan produk.",
        });
      }
    });
  }

  function handleDelete(product) {
    const confirmed = window.confirm(
      `Hapus produk ${product.name}? Aksi ini tidak bisa dibatalkan.`,
    );

    if (!confirmed) return;

    setFeedback({ type: "", message: "" });

    startTransition(async () => {
      try {
        const response = await fetch("/api/products", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: product.id }),
        });

        const result = await response.json();

        if (!response.ok) {
          setFeedback({
            type: "error",
            message: result.message || "Produk gagal dihapus.",
          });
          return;
        }

        await refreshProducts();
        setFeedback({
          type: "success",
          message: `Produk ${product.name} berhasil dihapus.`,
        });
      } catch (error) {
        setFeedback({
          type: "error",
          message: error.message || "Terjadi masalah saat menghapus produk.",
        });
      }
    });
  }

  const columns = [
    {
      accessorKey: "name",
      header: "Produk",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.name}</p>
          <p className="text-xs text-muted">ID #{row.original.id}</p>
        </div>
      ),
    },
    { accessorKey: "categoryName", header: "Kategori" },
    { accessorKey: "branchName", header: "Cabang" },
    { accessorKey: "price", header: "Harga" },
    { accessorKey: "stock", header: "Stok" },
  ];

  if (isAdmin) {
    columns.push({
      id: "actions",
      header: "Aksi",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            size="sm"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => openEditModal(row.original)}
          >
            <FontAwesomeIcon icon={faPencil} className="mr-2 text-sm" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            className="w-full sm:w-auto"
            onClick={() => handleDelete(row.original)}
          >
            <FontAwesomeIcon icon={faTrashCan} className="mr-2 text-sm" />
            Hapus
          </Button>
        </div>
      ),
    });
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-border bg-surface p-4 card-shadow sm:p-5">
          <p className="text-sm text-muted">Total produk</p>
          <p className="mt-2 text-2xl font-semibold sm:text-3xl">{totals.all}</p>
        </div>
        <div className="rounded-[28px] border border-border bg-surface p-4 card-shadow sm:p-5">
          <p className="text-sm text-muted">Kategori aktif</p>
          <p className="mt-2 text-2xl font-semibold sm:text-3xl">{totals.categories}</p>
        </div>
        <div className="rounded-[28px] border border-border bg-surface p-4 card-shadow sm:p-5">
          <p className="text-sm text-muted">Cabang terdaftar</p>
          <p className="mt-2 text-2xl font-semibold sm:text-3xl">{totals.branches}</p>
        </div>
        <div className="rounded-[28px] border border-border bg-surface p-4 card-shadow sm:p-5">
          <p className="text-sm text-muted">Total stok</p>
          <p className="mt-2 text-2xl font-semibold sm:text-3xl">{totals.stock}</p>
        </div>
      </section>

      {isAdmin ? (
        <div className="grid gap-4 rounded-[24px] border border-border bg-surface-strong/55 p-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
              Menu produk khusus admin
            </p>
            <h4 className="text-xl font-semibold">Kelola master produk tanpa buka database</h4>
            <p className="text-sm leading-6 text-muted">
              Admin bisa menambah, memperbarui, dan menghapus produk dari panel ini.
            </p>
          </div>
          <div className="flex flex-col justify-between gap-3 rounded-[22px] border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <FontAwesomeIcon icon={faBox} className="text-base" />
              </div>
              <div>
                <p className="font-semibold">Akses saat ini</p>
                <p className="text-sm text-muted">
                  {session.username} - {session.roleName}
                </p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button className="w-full" onClick={openCreateModal}>
                <FontAwesomeIcon icon={faPlus} className="mr-2 text-sm" />
                Tambah Produk
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                onClick={openRestockModal}
                disabled={products.length === 0}
              >
                <FontAwesomeIcon icon={faRotate} className="mr-2 text-sm" />
                Restok Stok
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {feedback.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === "error"
              ? "border-danger/30 bg-danger/10 text-danger"
              : "border-primary/20 bg-primary/10 text-primary"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {products.length === 0 ? (
        <EmptyState
          title="Belum ada produk"
          description="Tambahkan produk pertama agar daftar menu bisa digunakan."
        />
      ) : (
        <DataTable
          data={products}
          columns={columns}
          searchPlaceholder="Cari produk, kategori, atau cabang..."
        />
      )}

      <Modal
        open={open}
        onClose={closeModal}
        title={
          mode === "create"
            ? "Tambah Produk Baru"
            : mode === "restock"
              ? "Restok Stok Produk"
              : "Edit Produk"
        }
        description={
          mode === "create"
            ? "Isi detail produk di bawah ini untuk menambahkan menu baru."
            : mode === "restock"
              ? "Pilih produk lalu tambahkan jumlah stok yang masuk."
            : "Perbarui detail produk sesuai kebutuhan operasional."
        }
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {mode === "restock" ? (
            <>
              <SelectField
                label="Produk"
                value={form.restockProductId}
                onChange={(event) => updateField("restockProductId", event.target.value)}
                options={products.map((item) => ({
                  value: String(item.id),
                  label: `${item.name} - ${item.branchName} (stok: ${item.stock})`,
                }))}
                helperText="Pilih produk yang stoknya mau ditambah."
                error={errors.productId?.[0] || errors.restockProductId?.[0]}
              />
              <Input
                label="Jumlah Restok"
                inputMode="numeric"
                value={form.additionalStock}
                onChange={(event) =>
                  updateField("additionalStock", formatNumberInput(event.target.value))
                }
                placeholder="contoh: 10"
                helperText="Masukkan jumlah stok tambahan."
                error={errors.additionalStock?.[0]}
              />
            </>
          ) : (
            <>
              <Input
                label="Nama Produk"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="contoh: Cappuccino"
                error={errors.name?.[0]}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Harga"
                  inputMode="numeric"
                  value={form.priceNumber}
                  onChange={(event) =>
                    updateField("priceNumber", formatNumberInput(event.target.value))
                  }
                  placeholder="contoh: 25000"
                  helperText="Masukkan angka tanpa titik atau koma."
                  error={errors.priceNumber?.[0]}
                />
                <Input
                  label="Stok"
                  inputMode="numeric"
                  value={form.stock}
                  onChange={(event) => updateField("stock", formatNumberInput(event.target.value))}
                  placeholder="contoh: 20"
                  helperText="Gunakan angka 0 atau lebih."
                  error={errors.stock?.[0]}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Kategori"
                  value={form.categoryId}
                  onChange={(event) => updateField("categoryId", event.target.value)}
                  options={categories.map((item) => ({
                    value: String(item.id),
                    label: item.name,
                  }))}
                />
                <SelectField
                  label="Cabang"
                  value={form.branchId}
                  onChange={(event) => updateField("branchId", event.target.value)}
                  options={branches.map((item) => ({
                    value: String(item.id),
                    label: item.name,
                  }))}
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Menyimpan..."
                : mode === "create"
                  ? "Simpan Produk"
                  : mode === "restock"
                    ? "Simpan Restok"
                  : "Update Produk"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
