import { sql } from "drizzle-orm";
import {
  branches,
  products as mockProducts,
  transactionDetails,
  transactions,
  users,
} from "@/lib/mock-data";
import { formatCurrency, slugifyInvoice } from "@/lib/utils";
import { BaseService } from "@/services/base-service";

const fallbackCreatedTransactions = [];

function getResolvedFallbackTransactions() {
  return transactions.map((transaction) => {
    const branch = branches.find((item) => item.id === transaction.branchId);
    const user = users.find((item) => item.id === transaction.userId);

    return {
      ...transaction,
      total: formatCurrency(transaction.total),
      branchName: branch?.name || "-",
      username: user?.username || "-",
    };
  });
}

function createFallbackInvoice(invoiceNumber, payload, total) {
  const branch = branches.find((item) => item.id === payload.branchId);
  const user = users.find((item) => item.id === payload.userId);

  return {
    id: Date.now(),
    invoiceNumber,
    userId: payload.userId,
    branchId: payload.branchId,
    total: formatCurrency(total),
    createdAt: new Date().toISOString(),
    branchName: branch?.name || "-",
    branchAddress: branch?.address || "-",
    cashier: user?.username || "-",
    items: payload.items.map((item) => {
      const product = mockProducts.find((entry) => entry.id === item.productId);
      const price = Number(item.priceNumber || 0);
      const subtotal = item.qty * price;

      return {
        productId: item.productId,
        productName: product?.name || item.name || "-",
        qty: item.qty,
        price: formatCurrency(price),
        subtotal: formatCurrency(subtotal),
      };
    }),
  };
}

function getFallbackInvoiceByNumber(invoiceNumber) {
  const created = fallbackCreatedTransactions.find(
    (item) => item.invoiceNumber === invoiceNumber,
  );

  if (created) {
    return created;
  }

  const transaction = transactions.find(
    (item) => item.invoiceNumber === invoiceNumber,
  );

  if (!transaction) {
    return null;
  }

  const branch = branches.find((item) => item.id === transaction.branchId);
  const user = users.find((item) => item.id === transaction.userId);

  const items = transactionDetails
    .filter((item) => item.transactionId === transaction.id)
    .map((item) => {
      const product = mockProducts.find((entry) => entry.id === item.productId);

      return {
        productId: item.productId,
        productName: product?.name || "-",
        qty: item.qty,
        price: formatCurrency(item.price),
        subtotal: formatCurrency(item.subtotal),
      };
    });

  return {
    ...transaction,
    branchName: branch?.name || "-",
    branchAddress: branch?.address || "-",
    cashier: user?.username || "-",
    total: formatCurrency(transaction.total),
    items,
  };
}

export class TransactionService extends BaseService {
  constructor() {
    super("transactions");
  }

  async listTransactions() {
    const db = await this.getDb();

    if (db) {
      try {
        const result = await db.execute(sql`
          SELECT t.id, t.invoice_number AS invoiceNumber, t.branch_id AS branchId,
                 t.user_id AS userId, t.total, t.created_at AS createdAt,
                 b.name AS branchName, u.username
          FROM transactions t
          INNER JOIN branches b ON b.id = t.branch_id
          INNER JOIN users u ON u.id = t.user_id
          ORDER BY t.created_at DESC
        `);

        return this.normalizeRows(result).map((transaction) => ({
          ...transaction,
          total: formatCurrency(transaction.total),
        }));
      } catch (error) {
        console.warn("Gagal membaca transaksi dari database, memakai data fallback.");
      }
    }

    return [...fallbackCreatedTransactions, ...getResolvedFallbackTransactions()];
  }

  async createTransaction(payload) {
    const db = await this.getDb();
    const invoiceNumber = `INV-${slugifyInvoice(Date.now())}`;
    const total = payload.items.reduce(
      (sum, item) => sum + item.qty * Number(item.priceNumber || 0),
      0,
    );

    if (db) {
      try {
        await db.transaction(async (tx) => {
          const inserted = await tx.execute(sql`
            INSERT INTO transactions (invoice_number, user_id, branch_id, total)
            VALUES (${invoiceNumber}, ${payload.userId}, ${payload.branchId}, ${total})
            RETURNING id
          `);

          const transactionId = Number(this.normalizeRows(inserted)[0]?.id);

          if (!transactionId) {
            throw new Error("Gagal membuat transaksi.");
          }

          for (const item of payload.items) {
            const price = Number(item.priceNumber || 0);
            const subtotal = item.qty * price;

            await tx.execute(sql`
              INSERT INTO transaction_details (transaction_id, product_id, qty, price, subtotal)
              VALUES (${transactionId}, ${item.productId}, ${item.qty}, ${price}, ${subtotal})
            `);

            await tx.execute(sql`
              UPDATE products
              SET stock = stock - ${item.qty}
              WHERE id = ${item.productId} AND branch_id = ${payload.branchId}
            `);
          }
        });
      } catch (error) {
        console.warn("Gagal menyimpan transaksi ke database, memakai transaksi fallback.");
        fallbackCreatedTransactions.unshift(createFallbackInvoice(invoiceNumber, payload, total));
      }
    } else {
      fallbackCreatedTransactions.unshift(createFallbackInvoice(invoiceNumber, payload, total));
    }

    return {
      invoiceNumber,
      total: formatCurrency(total),
      itemsCount: payload.items.length,
    };
  }

  async getTransactionByInvoiceNumber(invoiceNumber) {
    const db = await this.getDb();

    if (db) {
      try {
        const transactionResult = await db.execute(sql`
          SELECT t.id, t.invoice_number AS invoiceNumber, t.branch_id AS branchId,
                 t.user_id AS userId, t.total, t.created_at AS createdAt,
                 b.name AS branchName, b.address AS branchAddress, u.username AS cashier
          FROM transactions t
          INNER JOIN branches b ON b.id = t.branch_id
          INNER JOIN users u ON u.id = t.user_id
          WHERE t.invoice_number = ${invoiceNumber}
          LIMIT 1
        `);

        const transaction = this.normalizeRows(transactionResult)[0];

        if (!transaction) {
          return getFallbackInvoiceByNumber(invoiceNumber);
        }

        const detailResult = await db.execute(sql`
          SELECT td.product_id AS productId, p.name AS productName, td.qty, td.price, td.subtotal
          FROM transaction_details td
          INNER JOIN products p ON p.id = td.product_id
          WHERE td.transaction_id = ${transaction.id}
          ORDER BY td.id ASC
        `);

        return {
          ...transaction,
          total: formatCurrency(transaction.total),
          items: this.normalizeRows(detailResult).map((item) => ({
            productId: Number(item.productId),
            productName: item.productName,
            qty: Number(item.qty),
            price: formatCurrency(item.price),
            subtotal: formatCurrency(item.subtotal),
          })),
        };
      } catch (error) {
        console.warn("Gagal membaca invoice dari database, memakai data fallback.");
      }
    }

    return getFallbackInvoiceByNumber(invoiceNumber);
  }

  async getRecentTransactions() {
    const db = await this.getDb();

    if (db) {
      try {
        const result = await db.execute(sql`
          SELECT t.invoice_number AS invoiceNumber, t.total, t.created_at AS createdAt,
                 b.name AS branch, u.username AS cashier
          FROM transactions t
          INNER JOIN branches b ON b.id = t.branch_id
          INNER JOIN users u ON u.id = t.user_id
          ORDER BY t.created_at DESC
          LIMIT 5
        `);

        return this.normalizeRows(result).map((transaction) => ({
          ...transaction,
          total: formatCurrency(transaction.total),
        }));
      } catch (error) {
        console.warn("Gagal membaca transaksi terbaru dari database, memakai data fallback.");
      }
    }

    return transactions.slice(-5).reverse().map((transaction) => {
      const branch = branches.find((item) => item.id === transaction.branchId);
      const user = users.find((item) => item.id === transaction.userId);

      return {
        invoiceNumber: transaction.invoiceNumber,
        total: formatCurrency(transaction.total),
        createdAt: transaction.createdAt,
        branch: branch?.name || "-",
        cashier: user?.username || "-",
      };
    });
  }

  async getTopProducts() {
    const db = await this.getDb();

    if (db) {
      try {
        const result = await db.execute(sql`
          SELECT td.product_id AS id, SUM(td.qty) AS sold
          FROM transaction_details td
          GROUP BY td.product_id
          ORDER BY sold DESC
          LIMIT 5
        `);

        return this.normalizeRows(result).map((item) => ({
          id: Number(item.id),
          sold: Number(item.sold),
        }));
      } catch (error) {
        console.warn("Gagal membaca produk terlaris dari database, memakai data fallback.");
      }
    }

    const aggregated = transactionDetails.reduce((map, item) => {
      map[item.productId] = (map[item.productId] || 0) + item.qty;
      return map;
    }, {});

    return Object.entries(aggregated).map(([productId, sold]) => ({
      id: Number(productId),
      sold,
    }));
  }
}
