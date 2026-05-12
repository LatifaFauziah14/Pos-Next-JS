import { sql } from "drizzle-orm";
import { branches, transactions as mockTransactions } from "@/lib/mock-data";
import {
  getDateRangeBounds,
  getDefaultDateRange,
  isDateInRange,
  normalizeDateOnly,
  shiftDateInput,
} from "@/lib/date";
import { formatCurrency } from "@/lib/utils";
import { ProductService } from "@/services/product-service";
import { TransactionService } from "@/services/transaction-service";

const LOW_STOCK_THRESHOLD = 20;

function toNumber(value) {
  return Number(String(value).replace(/[^\d.-]/g, "")) || 0;
}

function initBranchMap() {
  return branches.reduce((map, branch) => {
    map[branch.id] = {
      branchId: branch.id,
      branchName: branch.name,
      address: branch.address,
      transactions: 0,
      revenue: 0,
    };
    return map;
  }, {});
}

function groupLowStockProducts(products) {
  return products.reduce((map, product) => {
    if (Number(product.stock) > LOW_STOCK_THRESHOLD) {
      return map;
    }

    const branchId = Number(product.branchId);
    if (!map[branchId]) {
      const branch = branches.find((item) => item.id === branchId);
      map[branchId] = {
        branchId,
        branchName: branch?.name || "-",
        address: branch?.address || "-",
        lowStockCount: 0,
        lowStockProducts: [],
      };
    }

    map[branchId].lowStockCount += 1;
    map[branchId].lowStockProducts.push({
      id: product.id,
      name: product.name,
      stock: Number(product.stock),
    });
    return map;
  }, {});
}

export class DashboardService {
  constructor() {
    this.productService = new ProductService();
    this.transactionService = new TransactionService();
  }

  async getDefaultAnalyticsRange(days = 6) {
    const db = await this.transactionService.getDb();

    if (db) {
      try {
        const result = await db.execute(sql`
          SELECT DATE_FORMAT(MAX(created_at), '%Y-%m-%d') AS latestDate
          FROM transactions
        `);
        const latestDate = normalizeDateOnly(
          this.transactionService.normalizeRows(result)[0]?.latestDate,
        );

        if (latestDate) {
          return {
            start: shiftDateInput(latestDate, -days) || latestDate,
            end: latestDate,
          };
        }
      } catch (error) {
        console.warn("Gagal membaca tanggal transaksi terbaru dari database, memakai data fallback.");
      }
    }

    const latestMockDate = mockTransactions
      .map((transaction) => normalizeDateOnly(transaction.createdAt))
      .filter(Boolean)
      .sort()
      .at(-1);

    if (latestMockDate) {
      return {
        start: shiftDateInput(latestMockDate, -days) || latestMockDate,
        end: latestMockDate,
      };
    }

    return getDefaultDateRange(days);
  }

  async getDashboardOverview() {
    const products = await this.productService.listForTable();
    const transactions = await this.transactionService.listTransactions();
    const recentTransactions = await this.transactionService.getRecentTransactions();
    const topSales = await this.transactionService.getTopProducts();

    const todayRevenue = transactions.reduce((sum, item) => {
      const normalized = Number(String(item.total).replace(/[^\d]/g, "")) || 0;
      return sum + normalized;
    }, 0);

    return {
      todayRevenue: formatCurrency(todayRevenue),
      totalTransactions: transactions.length,
      totalProducts: products.length,
      lowStockCount: products.filter((item) => item.stock <= 20).length,
      branchReports: branches.map((branch) => ({
        branchId: branch.id,
        branchName: branch.name,
        address: branch.address,
        transactions: transactions.filter((item) => item.branchId === branch.id).length,
        revenue: formatCurrency(
          transactions
            .filter((item) => item.branchId === branch.id)
            .reduce((sum, item) => {
              const normalized = Number(String(item.total).replace(/[^\d]/g, "")) || 0;
              return sum + normalized;
            }, 0),
        ),
      })),
      recentTransactions,
      topProducts: topSales.map((item) => {
        const product = products.find((productItem) => productItem.id === item.id);
        return {
          id: item.id,
          name: product?.name || "-",
          category: product?.categoryName || "-",
          branch: product?.branchName || "-",
          sold: item.sold,
        };
      }),
    };
  }

  async getDashboardAnalytics({ startDate, endDate } = {}) {
    const db = await this.transactionService.getDb();
    const incomingRange = getDateRangeBounds(startDate, endDate);
    const defaultRange = getDefaultDateRange();
    const range = {
      start: incomingRange.start || defaultRange.start,
      end: incomingRange.end || defaultRange.end,
    };
    const products = await this.productService.listForTable();

    if (db) {
      try {
        const revenueResult = await db.execute(sql`
          SELECT
            t.branch_id AS branchId,
            b.name AS branchName,
            b.address AS address,
            COUNT(t.id) AS transactions,
            COALESCE(SUM(t.total), 0) AS revenue
          FROM transactions t
          INNER JOIN branches b ON b.id = t.branch_id
          WHERE DATE(t.created_at) BETWEEN ${range.start} AND ${range.end}
          GROUP BY t.branch_id, b.name, b.address
          ORDER BY revenue DESC, b.name ASC
        `);

        const lowStockResult = await db.execute(sql`
          SELECT
            p.branch_id AS branchId,
            b.name AS branchName,
            b.address AS address,
            p.id,
            p.name,
            p.stock
          FROM products p
          INNER JOIN branches b ON b.id = p.branch_id
          WHERE p.stock <= ${LOW_STOCK_THRESHOLD}
          ORDER BY b.name ASC, p.stock ASC, p.name ASC
        `);

        const revenueRows = this.transactionService.normalizeRows(revenueResult);
        const lowStockRows = this.transactionService.normalizeRows(lowStockResult);
        const revenueMap = initBranchMap();

        revenueRows.forEach((row) => {
          const branchId = Number(row.branchId);
          if (!revenueMap[branchId]) {
            revenueMap[branchId] = {
              branchId,
              branchName: row.branchName || "-",
              address: row.address || "-",
              transactions: 0,
              revenue: 0,
            };
          }

          revenueMap[branchId].transactions = Number(row.transactions);
          revenueMap[branchId].revenue = toNumber(row.revenue);
        });

        const lowStockMap = groupLowStockProducts(lowStockRows);

        return {
          range,
          omzetByBranch: branches.map((branch) => {
            const item = revenueMap[branch.id] || {
              branchId: branch.id,
              branchName: branch.name,
              address: branch.address,
              transactions: 0,
              revenue: 0,
            };
            return {
              branchId: branch.id,
              branchName: branch.name,
              address: branch.address,
              transactions: item?.transactions || 0,
              revenue: item?.revenue || 0,
            };
          }),
          lowStockByBranch: branches.map((branch) => {
            const item = lowStockMap[branch.id] || {
              branchId: branch.id,
              branchName: branch.name,
              address: branch.address,
              lowStockCount: 0,
              lowStockProducts: [],
            };

            return item;
          }),
        };
      } catch (error) {
        console.warn("Gagal membaca analytics dashboard dari database, memakai data fallback.");
      }
    }

    const filteredTransactions = mockTransactions.filter((transaction) => {
      const normalizedDate = normalizeDateOnly(transaction.createdAt);
      return isDateInRange(normalizedDate, range.start, range.end);
    });

    return {
      range,
      omzetByBranch: branches.map((branch) => {
        const branchTransactions = filteredTransactions.filter((item) => item.branchId === branch.id);
        return {
          branchId: branch.id,
          branchName: branch.name,
          address: branch.address,
          transactions: branchTransactions.length,
          revenue: branchTransactions.reduce((sum, item) => sum + toNumber(item.total), 0),
        };
      }),
      lowStockByBranch: branches.map((branch) => {
        const branchLowStock = products.filter(
          (product) => product.branchId === branch.id && Number(product.stock) <= LOW_STOCK_THRESHOLD,
        );
        return {
          branchId: branch.id,
          branchName: branch.name,
          address: branch.address,
          lowStockCount: branchLowStock.length,
          lowStockProducts: branchLowStock.map((product) => ({
            id: product.id,
            name: product.name,
            stock: Number(product.stock),
          })),
        };
      }),
    };
  }
}
