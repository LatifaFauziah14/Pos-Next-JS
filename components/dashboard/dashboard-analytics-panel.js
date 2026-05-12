"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Flatpickr from "react-flatpickr";
import { Bar } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faRotate } from "@fortawesome/free-solid-svg-icons";
import { formatCurrency } from "@/lib/utils";
import { formatDateInput } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function toDateObject(value) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function toDateLabel(value) {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function sumValues(items, key) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
}

function AnalyticsSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="min-h-[340px]" />
        <div className="grid gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    </div>
  );
}

export function DashboardAnalyticsPanel({ initialRange, initialAnalytics }) {
  const [range, setRange] = useState(initialRange);
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const controller = new AbortController();

    async function loadAnalytics() {
      setIsLoading(true);
      setError("");

      try {
        const url = new URL("/api/dashboard/analytics", window.location.origin);
        url.searchParams.set("start", range.start);
        url.searchParams.set("end", range.end);

        const response = await fetch(url.toString(), {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Gagal memuat chart dashboard.");
        }

        setAnalytics(result.data);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Gagal memuat chart dashboard.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalytics();

    return () => controller.abort();
  }, [range.end, range.start]);

  const revenueTotals = useMemo(() => {
    const omzetByBranch = analytics?.omzetByBranch || [];
    return {
      totalRevenue: sumValues(omzetByBranch, "revenue"),
      totalTransactions: sumValues(omzetByBranch, "transactions"),
      branchCount: omzetByBranch.filter((item) => Number(item.revenue) > 0).length,
    };
  }, [analytics]);

  const lowStockTotals = useMemo(() => {
    const lowStockByBranch = analytics?.lowStockByBranch || [];
    return {
      totalLowStock: sumValues(lowStockByBranch, "lowStockCount"),
      branchCount: lowStockByBranch.filter((item) => Number(item.lowStockCount) > 0).length,
    };
  }, [analytics]);

  const revenueData = useMemo(() => {
    const items = analytics?.omzetByBranch || [];

    return {
      labels: items.map((item) => item.branchName),
      datasets: [
        {
          label: "Omzet",
          data: items.map((item) => Number(item.revenue) || 0),
          backgroundColor: ["#1f4d3b", "#c97b2b", "#6b8f71"],
          borderRadius: 16,
          borderSkipped: false,
        },
      ],
    };
  }, [analytics]);

  const lowStockData = useMemo(() => {
    const items = analytics?.lowStockByBranch || [];

    return {
      labels: items.map((item) => item.branchName),
      datasets: [
        {
          label: "Produk stok rendah",
          data: items.map((item) => Number(item.lowStockCount) || 0),
          backgroundColor: ["#c2410c", "#d97706", "#ca8a04"],
          borderRadius: 16,
          borderSkipped: false,
        },
      ],
    };
  }, [analytics]);

  const revenueOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              return ` ${formatCurrency(context.parsed.y)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#6b7280",
            font: { size: 11 },
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#6b7280",
            callback(value) {
              return formatCurrency(value);
            },
          },
        },
      },
    }),
    [],
  );

  const lowStockOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              return ` ${context.parsed.x} produk`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: "#6b7280",
            precision: 0,
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: "#6b7280",
            font: { size: 11 },
          },
        },
      },
    }),
    [],
  );

  function handleRangeChange(selectedDates) {
    if (!selectedDates || selectedDates.length === 0) {
      setRange(initialRange);
      return;
    }

    const nextStart = formatDateInput(selectedDates[0]);
    const nextEnd = formatDateInput(selectedDates[selectedDates.length - 1]);

    setRange({
      start: nextStart,
      end: nextEnd || nextStart,
    });
  }

  function resetRange() {
    setRange(initialRange);
  }

  return (
    <section className="rounded-[30px] border border-border bg-surface p-6 card-shadow animate__animated animate__fadeInUp">
      <div className="flex flex-col gap-4 border-b border-dashed border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-muted">Analitik Dashboard</p>
          <h3 className="mt-2 text-2xl font-semibold">Grafik omzet dan stok rendah</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Pilih rentang tanggal untuk melihat omzet per cabang. Stok rendah ditampilkan
            sebagai snapshot inventori saat ini.
          </p>
        </div>

        <div className="grid gap-3 sm:min-w-[320px]">
          <label className="grid gap-2 text-sm font-medium text-foreground">
            <span className="inline-flex items-center gap-2 text-muted">
              <FontAwesomeIcon icon={faCalendarDays} className="text-sm" />
              Rentang tanggal
            </span>
            <Flatpickr
              value={[toDateObject(range.start), toDateObject(range.end)].filter(Boolean)}
              options={{
                mode: "range",
                dateFormat: "Y-m-d",
                altInput: true,
                altFormat: "d M Y",
                allowInput: true,
                defaultDate: [toDateObject(range.start), toDateObject(range.end)].filter(Boolean),
                altInputClass:
                  "h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-[var(--ring)]",
              }}
              onChange={handleRangeChange}
              className="h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-[var(--ring)]"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={resetRange}>
              <FontAwesomeIcon icon={faRotate} className="mr-2 text-xs" />
              Reset
            </Button>
            <p className="text-xs text-muted">
              {toDateLabel(range.start)} - {toDateLabel(range.end)}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-5">
          <AnalyticsSkeleton />
        </div>
      ) : (
        <div className="mt-5 grid gap-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-[24px] border border-border bg-white p-5 animate__animated animate__fadeInUp">
              <p className="text-sm text-muted">Omzet terpilih</p>
              <h4 className="mt-3 text-2xl font-semibold">{formatCurrency(revenueTotals.totalRevenue)}</h4>
              <p className="mt-2 text-sm text-muted">{revenueTotals.totalTransactions} transaksi</p>
            </article>
            <article className="rounded-[24px] border border-border bg-white p-5 animate__animated animate__fadeInUp">
              <p className="text-sm text-muted">Cabang aktif di grafik</p>
              <h4 className="mt-3 text-2xl font-semibold">{revenueTotals.branchCount}</h4>
              <p className="mt-2 text-sm text-muted">menyumbang omzet pada rentang ini</p>
            </article>
            <article className="rounded-[24px] border border-border bg-white p-5 animate__animated animate__fadeInUp">
              <p className="text-sm text-muted">Stok rendah</p>
              <h4 className="mt-3 text-2xl font-semibold">{lowStockTotals.totalLowStock}</h4>
              <p className="mt-2 text-sm text-muted">produk perlu restock</p>
            </article>
            <article className="rounded-[24px] border border-border bg-white p-5 animate__animated animate__fadeInUp">
              <p className="text-sm text-muted">Cabang dengan stok rendah</p>
              <h4 className="mt-3 text-2xl font-semibold">{lowStockTotals.branchCount}</h4>
              <p className="mt-2 text-sm text-muted">snapshot inventori saat ini</p>
            </article>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-[28px] border border-border bg-white p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-lg font-semibold">Omzet per Cabang</h4>
                  <p className="text-sm text-muted">Pendapatan pada rentang tanggal terpilih.</p>
                </div>
              </div>
              <div className="min-h-[340px]">
                <Bar data={revenueData} options={revenueOptions} />
              </div>
            </article>

            <article className="rounded-[28px] border border-border bg-white p-5">
              <div className="mb-4">
                <h4 className="text-lg font-semibold">Produk Stok Rendah per Cabang</h4>
                <p className="text-sm text-muted">Jumlah produk dengan stok di bawah ambang batas.</p>
              </div>
              <div className="min-h-[340px]">
                <Bar data={lowStockData} options={lowStockOptions} />
              </div>
            </article>
          </div>

          <div className="grid gap-3 xl:grid-cols-3">
            {(analytics?.lowStockByBranch || []).map((branch) => (
              <article key={branch.branchId} className="rounded-[24px] border border-border bg-surface-strong/55 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h5 className="font-semibold">{branch.branchName}</h5>
                    <p className="text-sm text-muted">{branch.address}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {branch.lowStockCount} item
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {branch.lowStockProducts?.length ? (
                    branch.lowStockProducts.map((product) => (
                      <span
                        key={product.id}
                        className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-foreground"
                      >
                        {product.name} ({product.stock})
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted">Tidak ada stok rendah.</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
