"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpWideShort, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";

export function DataTable({ data, columns, searchPlaceholder = "Cari data..." }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const memoData = useMemo(() => data || [], [data]);
  const memoColumns = useMemo(() => columns || [], [columns]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: memoData,
    columns: memoColumns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  const filteredRows = table.getFilteredRowModel().rows;
  const visibleRows = table.getRowModel().rows;

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="Belum ada data"
        description="Tambahkan data terlebih dahulu agar tabel bisa ditampilkan."
      />
    );
  }

  if (filteredRows.length === 0) {
    return (
      <EmptyState
        title="Tidak ada hasil"
        description="Coba kata kunci pencarian lain untuk menemukan data yang dimaksud."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[24px] border border-border bg-surface p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full min-w-0 max-w-md">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted"
          />
          <Input
            aria-label="Cari"
            className="pl-10"
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
        <div className="text-sm text-muted md:text-right">
          {table.getFilteredRowModel().rows.length} data ditemukan
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-border bg-surface">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-strong/55 text-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-4 font-semibold">
                      {header.isPlaceholder ? null : (
                        <button
                          className="inline-flex items-center gap-2"
                          onClick={header.column.getToggleSortingHandler()}
                          type="button"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <FontAwesomeIcon icon={faArrowUpWideShort} className="text-[11px]" />
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-border/70">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 md:hidden">
          {visibleRows.map((row) => (
            <article
              key={row.id}
              className="rounded-[22px] border border-border bg-white p-4"
            >
              <div className="grid gap-3">
                {row.getVisibleCells().map((cell) => {
                  const headerValue = cell.column.columnDef.header;
                  const headerLabel =
                    typeof headerValue === "string" ? headerValue : cell.column.id;

                  return (
                    <div key={cell.id} className="grid gap-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                        {headerLabel}
                      </p>
                      <div className="min-w-0 break-words text-sm leading-6 text-foreground">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[24px] border border-border bg-surface p-3 sm:p-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted">
          Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
          {table.getPageCount()}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Sebelumnya
          </Button>
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
