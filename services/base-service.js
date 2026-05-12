import { getDbOrNull } from "@/lib/db";

export class BaseService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async getDb() {
    return getDbOrNull();
  }

  normalizeRows(result) {
    if (!result) return [];

    if (Array.isArray(result)) {
      // mysql2/drizzle can return [rows, fields], while some fallbacks return rows directly.
      if (Array.isArray(result[0])) return result[0];
      return result;
    }

    return result.rows || [];
  }

  async listFallback(data) {
    return data;
  }

  async findByIdFallback(data, id) {
    return data.find((item) => item.id === id) || null;
  }
}
