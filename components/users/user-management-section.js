"use client";

import { useState, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faPlus,
  faShieldHalved,
  faTrashCan,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { SectionCard } from "@/components/dashboard/section-card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

function SelectField({ label, value, onChange, options, helperText }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      <select
        className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-base outline-none transition focus:border-primary focus:ring-4 focus:ring-[var(--ring)]"
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
    </label>
  );
}

function getInitialForm(roles, branches) {
  return {
    id: null,
    username: "",
    password: "",
    roleId: String(roles.find((item) => item.name === "cashier")?.id || roles[0]?.id || ""),
    branchId: String(branches[0]?.id || ""),
  };
}

export function UserManagementSection({ initialUsers, roles, branches, session }) {
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(() => getInitialForm(roles, branches));
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({});
  const [isPending, startTransition] = useTransition();

  const totals = {
    all: users.length,
    admins: users.filter((item) => item.roleName === "admin").length,
    cashiers: users.filter((item) => item.roleName === "cashier").length,
    branches: new Set(users.map((item) => item.branchName)).size,
  };

  async function refreshUsers() {
    const response = await fetch("/api/users", { cache: "no-store" });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal memuat data pengguna.");
    }

    setUsers(result.data || []);
  }

  function resetForm() {
    setForm(getInitialForm(roles, branches));
    setErrors({});
  }

  function openCreateModal() {
    setMode("create");
    resetForm();
    setOpen(true);
  }

  function openEditModal(user) {
    setMode("edit");
    setErrors({});
    setForm({
      id: user.id,
      username: user.username,
      password: "",
      roleId: String(user.roleId),
      branchId: String(user.branchId),
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
      username: form.username,
      password: form.password,
      roleId: Number(form.roleId),
      branchId: Number(form.branchId),
    };

    startTransition(async () => {
      try {
        const response = await fetch("/api/users", {
          method: mode === "create" ? "POST" : "PATCH",
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
            message: result.message || "Perubahan pengguna gagal disimpan.",
          });
          return;
        }

        await refreshUsers();
        closeModal();
        setFeedback({
          type: "success",
          message:
            mode === "create"
              ? "Pengguna baru berhasil ditambahkan."
              : "Data pengguna berhasil diperbarui.",
        });
      } catch (error) {
        setFeedback({
          type: "error",
          message: error.message || "Terjadi masalah saat menyimpan pengguna.",
        });
      }
    });
  }

  function handleDelete(user) {
    const confirmed = window.confirm(
      `Hapus pengguna ${user.username}? Aksi ini tidak bisa dibatalkan.`,
    );

    if (!confirmed) return;

    setFeedback({ type: "", message: "" });

    startTransition(async () => {
      try {
        const response = await fetch("/api/users", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: user.id }),
        });

        const result = await response.json();

        if (!response.ok) {
          setFeedback({
            type: "error",
            message: result.message || "Pengguna gagal dihapus.",
          });
          return;
        }

        await refreshUsers();
        setFeedback({
          type: "success",
          message: `Pengguna ${user.username} berhasil dihapus.`,
        });
      } catch (error) {
        setFeedback({
          type: "error",
          message: error.message || "Terjadi masalah saat menghapus pengguna.",
        });
      }
    });
  }

  const columns = [
    {
      accessorKey: "username",
      header: "Pengguna",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold">{row.original.username}</p>
          <p className="text-xs text-muted">
            ID #{row.original.id} {row.original.id === session.id ? "- akun aktif Anda" : ""}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "roleName",
      header: "Role",
      cell: ({ row }) => (
        <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {row.original.roleName}
        </span>
      ),
    },
    {
      accessorKey: "branchName",
      header: "Cabang",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.branchName}</p>
          <p className="text-xs text-muted">Akses operasional cabang</p>
        </div>
      ),
    },
    {
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
            disabled={row.original.id === session.id}
          >
            <FontAwesomeIcon icon={faTrashCan} className="mr-2 text-sm" />
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] border border-border bg-surface p-4 card-shadow sm:p-5">
          <p className="text-sm text-muted">Total pengguna</p>
          <p className="mt-2 text-2xl font-semibold sm:text-3xl">{totals.all}</p>
        </div>
        <div className="rounded-[28px] border border-border bg-surface p-4 card-shadow sm:p-5">
          <p className="text-sm text-muted">Admin aktif</p>
          <p className="mt-2 text-2xl font-semibold sm:text-3xl">{totals.admins}</p>
        </div>
        <div className="rounded-[28px] border border-border bg-surface p-4 card-shadow sm:p-5">
          <p className="text-sm text-muted">Kasir aktif</p>
          <p className="mt-2 text-2xl font-semibold sm:text-3xl">{totals.cashiers}</p>
        </div>
        <div className="rounded-[28px] border border-border bg-surface p-4 card-shadow sm:p-5">
          <p className="text-sm text-muted">Cakupan cabang</p>
          <p className="mt-2 text-2xl font-semibold sm:text-3xl">{totals.branches}</p>
        </div>
      </section>

      <SectionCard
        title="Kelola Pengguna & Role"
        description="Tambahkan admin atau kasir baru, atur cabang, lalu ubah akun kapan saja tanpa perlu membuka database."
      >
        <div className="mb-5 grid gap-4 rounded-[24px] border border-border bg-surface-strong/55 p-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
              Panel khusus admin
            </p>
            <h4 className="text-xl font-semibold">Manajemen akun dibuat sesederhana mungkin</h4>
            <p className="text-sm leading-6 text-muted">
              Gunakan tombol tambah untuk membuat user baru. Saat edit, password boleh
              dikosongkan jika tidak ingin diubah.
            </p>
          </div>
          <div className="flex flex-col justify-between gap-3 rounded-[22px] border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <FontAwesomeIcon icon={faUsers} className="text-base" />
              </div>
              <div>
                <p className="font-semibold">Akun aktif saat ini</p>
                <p className="text-sm text-muted">{session.username} - {session.roleName}</p>
              </div>
            </div>
            <Button className="w-full md:w-auto" onClick={openCreateModal}>
              <FontAwesomeIcon icon={faPlus} className="mr-2 text-sm" />
              Tambah Pengguna
            </Button>
          </div>
        </div>

        {feedback.message ? (
          <div
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === "error"
                ? "border-danger/30 bg-danger/10 text-danger"
                : "border-primary/20 bg-primary/10 text-primary"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        {users.length === 0 ? (
          <EmptyState
            title="Belum ada pengguna"
            description="Tambahkan pengguna pertama agar admin dan kasir bisa mulai bekerja."
          />
        ) : (
          <DataTable
            data={users}
            columns={columns}
            searchPlaceholder="Cari username, role, atau cabang..."
          />
        )}
      </SectionCard>

      <Modal
        open={open}
        onClose={closeModal}
        title={mode === "create" ? "Tambah Pengguna Baru" : "Edit Pengguna"}
        description={
          mode === "create"
            ? "Isi data inti di bawah ini. Password akan diamankan dengan bcrypt."
            : "Perbarui role, cabang, atau username. Kosongkan password jika ingin tetap sama."
        }
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Input
            label="Username"
            value={form.username}
            onChange={(event) => updateField("username", event.target.value)}
            placeholder="contoh: admin.cabang1"
            error={errors.username?.[0]}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Role"
              value={form.roleId}
              onChange={(event) => updateField("roleId", event.target.value)}
              options={roles.map((item) => ({
                value: String(item.id),
                label: item.name === "admin" ? "Admin" : "Cashier",
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

          <Input
            label={mode === "create" ? "Password" : "Password Baru"}
            type="password"
            value={form.password}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder={mode === "create" ? "Minimal 6 karakter" : "Kosongkan jika tidak diubah"}
            helperText={
              mode === "create"
                ? "Password login pengguna."
                : "Biarkan kosong untuk mempertahankan password lama."
            }
            error={errors.password?.[0]}
          />

          <div className="rounded-2xl border border-border bg-surface-strong/45 px-4 py-3 text-xs leading-6 text-muted">
            Username hanya boleh berisi huruf, angka, titik, dash, dan underscore.
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Menyimpan..."
                : mode === "create"
                  ? "Simpan Pengguna"
                  : "Update Pengguna"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
