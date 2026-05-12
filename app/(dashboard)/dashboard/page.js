import { MetricCard } from "@/components/dashboard/metric-card";
import { DashboardAnalyticsPanel } from "@/components/dashboard/dashboard-analytics-panel";
import { ReportSummary } from "@/components/dashboard/report-summary";
import { SectionCard } from "@/components/dashboard/section-card";
import { DashboardService } from "@/services/dashboard-service";

export const metadata = {
  title: "Dashboard | POS Multi Cabang",
};

export default async function DashboardPage() {
  const dashboardService = new DashboardService();
  const analyticsRange = await dashboardService.getDefaultAnalyticsRange(6);
  const [stats, initialAnalytics] = await Promise.all([
    dashboardService.getDashboardOverview(),
    dashboardService.getDashboardAnalytics(analyticsRange),
  ]);

  return (
    <div className="grid gap-6 animate__animated animate__fadeIn">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <SectionCard
          title="Ringkasan Operasional"
          description="Snapshot cepat performa toko hari ini."
          className="animate__animated animate__fadeInUp"
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.45fr)_repeat(3,minmax(0,1fr))]">
            <MetricCard
              label="Penjualan Hari Ini"
              value={stats.todayRevenue}
              helper="Akumulasi seluruh cabang"
              highlight
            />
            <MetricCard label="Transaksi" value={stats.totalTransactions} helper="Invoice berhasil dibuat" />
            <MetricCard label="Produk Aktif" value={stats.totalProducts} helper="Tersedia untuk dijual" />
            <MetricCard label="Stok Menipis" value={stats.lowStockCount} helper="Perlu restock" />
          </div>
        </SectionCard>

        <SectionCard
          title="Laporan Cabang"
          description="Pendapatan per cabang untuk monitoring sederhana."
          className="animate__animated animate__fadeInUp"
        >
          <ReportSummary data={stats.branchReports} />
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Produk Favorit"
          description="Top seller yang paling sering masuk transaksi."
          className="animate__animated animate__fadeInUp"
        >
          <div className="grid gap-3">
            {stats.topProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface-strong/65 px-4 py-3"
              >
                <div>
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-muted">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{product.sold} terjual</p>
                  <p className="text-sm text-muted">{product.branch}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Aktivitas Terbaru"
          description="Riwayat transaksi paling baru yang tercatat."
          className="animate__animated animate__fadeInUp"
        >
          <div className="grid gap-3">
            {stats.recentTransactions.map((transaction) => (
              <div
                key={transaction.invoiceNumber}
                className="flex items-center justify-between rounded-2xl border border-border px-4 py-3"
              >
                <div>
                  <p className="font-semibold">{transaction.invoiceNumber}</p>
                  <p className="text-sm text-muted">
                    {transaction.cashier} - {transaction.branch}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{transaction.total}</p>
                  <p className="text-sm text-muted">{transaction.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <DashboardAnalyticsPanel initialRange={analyticsRange} initialAnalytics={initialAnalytics} />
    </div>
  );
}
