import { sql } from "drizzle-orm";
import { branches, categories, getResolvedProducts } from "@/lib/mock-data";
import { BaseService } from "@/services/base-service";

function mapProductRow(item) {
  return {
    ...item,
    priceNumber: Number(item.priceNumber),
    stock: Number(item.stock),
    categoryId: Number(item.categoryId),
    branchId: Number(item.branchId),
    price: new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(item.priceNumber)),
  };
}

let fallbackProducts = getResolvedProducts();

function resolveFallbackProduct(product) {
  const category = categories.find((item) => item.id === Number(product.categoryId));
  const branch = branches.find((item) => item.id === Number(product.branchId));

  return mapProductRow({
    ...product,
    categoryName: category?.name || "-",
    branchName: branch?.name || "-",
    priceNumber: Number(product.priceNumber ?? product.price),
  });
}

function getFallbackProducts() {
  return fallbackProducts;
}

function createFallbackProduct({ name, priceNumber, stock, categoryId, branchId }) {
  const nextId = Math.max(0, ...fallbackProducts.map((item) => Number(item.id) || 0)) + 1;
  const product = resolveFallbackProduct({
    id: nextId,
    name,
    priceNumber,
    stock,
    categoryId,
    branchId,
  });

  fallbackProducts = [product, ...fallbackProducts];
  return product;
}

function updateFallbackProduct(id, payload) {
  const productId = Number(id);
  let updatedProduct = null;

  fallbackProducts = fallbackProducts.map((product) => {
    if (Number(product.id) !== productId) {
      return product;
    }

    updatedProduct = resolveFallbackProduct({
      ...product,
      ...payload,
      id: productId,
    });
    return updatedProduct;
  });

  if (!updatedProduct) {
    throw new Error("Produk tidak ditemukan.");
  }

  return updatedProduct;
}

function restockFallbackProduct(id, additionalStock) {
  const product = fallbackProducts.find((item) => Number(item.id) === Number(id));

  if (!product) {
    throw new Error("Produk tidak ditemukan.");
  }

  return updateFallbackProduct(id, {
    ...product,
    stock: Number(product.stock) + Number(additionalStock),
  });
}

function deleteFallbackProduct(id) {
  const productId = Number(id);
  const before = fallbackProducts.length;
  fallbackProducts = fallbackProducts.filter((product) => Number(product.id) !== productId);

  if (fallbackProducts.length === before) {
    throw new Error("Produk tidak ditemukan.");
  }

  return { success: true };
}

export class ProductService extends BaseService {
  constructor() {
    super("products");
  }

  async listForTable() {
    const db = await this.getDb();

    if (db) {
      try {
        const result = await db.execute(sql`
          SELECT p.id, p.name, p.stock, p.branch_id AS branchId, p.category_id AS categoryId,
                 c.name AS categoryName, b.name AS branchName, p.price AS priceNumber
          FROM products p
          INNER JOIN categories c ON c.id = p.category_id
          INNER JOIN branches b ON b.id = p.branch_id
          ORDER BY p.id DESC
        `);

        return this.normalizeRows(result).map(mapProductRow);
      } catch (error) {
        console.warn("Gagal membaca produk dari database, memakai data fallback.");
      }
    }

    return this.listFallback(getFallbackProducts());
  }

  async listByBranch(branchId) {
    const db = await this.getDb();

    if (db) {
      try {
        const result = await db.execute(sql`
          SELECT p.id, p.name, p.stock, p.branch_id AS branchId, p.category_id AS categoryId,
                 c.name AS categoryName, b.name AS branchName, p.price AS priceNumber
          FROM products p
          INNER JOIN categories c ON c.id = p.category_id
          INNER JOIN branches b ON b.id = p.branch_id
          WHERE p.branch_id = ${branchId}
          ORDER BY p.name ASC
        `);

        return this.normalizeRows(result).map(mapProductRow);
      } catch (error) {
        console.warn("Gagal membaca katalog POS dari database, memakai data fallback.");
      }
    }

    const data = getFallbackProducts().filter((item) => item.branchId === Number(branchId));
    return this.listFallback(data);
  }

  async listCategories() {
    const db = await this.getDb();

    if (db) {
      try {
        const result = await db.execute(sql`
          SELECT id, name
          FROM categories
          ORDER BY name ASC
        `);

        return this.normalizeRows(result);
      } catch (error) {
        console.warn("Gagal membaca kategori dari database, memakai data fallback.");
      }
    }

    return categories;
  }

  async listBranches() {
    const db = await this.getDb();

    if (db) {
      try {
        const result = await db.execute(sql`
          SELECT id, name, address
          FROM branches
          ORDER BY name ASC
        `);

        return this.normalizeRows(result);
      } catch (error) {
        console.warn("Gagal membaca cabang dari database, memakai data fallback.");
      }
    }

    return branches;
  }

  async createProduct({ name, priceNumber, stock, categoryId, branchId }) {
    const db = await this.getDb();
    const fallbackPayload = { name, priceNumber, stock, categoryId, branchId };

    if (!db) {
      return createFallbackProduct(fallbackPayload);
    }

    try {
      await db.execute(sql`
        INSERT INTO products (name, price, stock, category_id, branch_id)
        VALUES (${name}, ${priceNumber}, ${stock}, ${categoryId}, ${branchId})
      `);

      const created = await db.execute(sql`
        SELECT id
        FROM products
        ORDER BY id DESC
        LIMIT 1
      `);

      const product = this.normalizeRows(created)[0];
      return this.findProductById(product?.id);
    } catch (error) {
      console.warn("Gagal menambahkan produk ke database, memakai data fallback.");
      return createFallbackProduct(fallbackPayload);
    }
  }

  async updateProduct(id, { name, priceNumber, stock, categoryId, branchId }) {
    const db = await this.getDb();
    const fallbackPayload = { name, priceNumber, stock, categoryId, branchId };

    if (!db) {
      return updateFallbackProduct(id, fallbackPayload);
    }

    try {
      await db.execute(sql`
        UPDATE products
        SET name = ${name},
            price = ${priceNumber},
            stock = ${stock},
            category_id = ${categoryId},
            branch_id = ${branchId}
        WHERE id = ${id}
      `);

      return (await this.findProductById(id)) || updateFallbackProduct(id, fallbackPayload);
    } catch (error) {
      console.warn("Gagal memperbarui produk di database, memakai data fallback.");
      return updateFallbackProduct(id, fallbackPayload);
    }
  }

  async restockProduct(id, additionalStock) {
    const db = await this.getDb();
    if (!db) {
      return restockFallbackProduct(id, additionalStock);
    }

    try {
      await db.execute(sql`
        UPDATE products
        SET stock = stock + ${additionalStock}
        WHERE id = ${id}
        LIMIT 1
      `);

      return (await this.findProductById(id)) || restockFallbackProduct(id, additionalStock);
    } catch (error) {
      console.warn("Gagal restok produk di database, memakai data fallback.");
      return restockFallbackProduct(id, additionalStock);
    }
  }

  async deleteProduct(id) {
    const db = await this.getDb();
    if (!db) {
      return deleteFallbackProduct(id);
    }

    try {
      await db.execute(sql`
        DELETE FROM products
        WHERE id = ${id}
        LIMIT 1
      `);

      return { success: true };
    } catch (error) {
      console.warn("Gagal menghapus produk di database, memakai data fallback.");
      return deleteFallbackProduct(id);
    }
  }

  async findProductById(id) {
    const db = await this.getDb();
    if (!db) return null;

    try {
      const result = await db.execute(sql`
        SELECT p.id, p.name, p.stock, p.branch_id AS branchId, p.category_id AS categoryId,
               c.name AS categoryName, b.name AS branchName, p.price AS priceNumber
        FROM products p
        INNER JOIN categories c ON c.id = p.category_id
        INNER JOIN branches b ON b.id = p.branch_id
        WHERE p.id = ${id}
        LIMIT 1
      `);

      const product = this.normalizeRows(result)[0];
      return product ? mapProductRow(product) : null;
    } catch (error) {
      console.warn("Gagal membaca detail produk dari database.");
      return null;
    }
  }
}
