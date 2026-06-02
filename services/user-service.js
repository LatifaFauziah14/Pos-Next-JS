import { sql } from "drizzle-orm";
import { branches, roles, users } from "@/lib/mock-data";
import { hashPassword, verifyPassword } from "@/lib/security";
import { BaseService } from "@/services/base-service";

function resolveUser(user) {
  const role = roles.find((item) => item.id === user.roleId);
  const branch = branches.find((item) => item.id === user.branchId);

  return {
    id: user.id,
    username: user.username,
    roleId: user.roleId,
    branchId: user.branchId,
    roleName: role?.name || "-",
    branchName: branch?.name || "-",
  };
}

export class UserService extends BaseService {
  constructor() {
    super("users");
  }

  async listUsers() {
    const db = await this.getDb();

    if (db) {
      try {
        const result = await db.execute(sql`
          SELECT u.id, u.username, u.role_id AS roleId, u.branch_id AS branchId,
                 r.name AS roleName, b.name AS branchName
          FROM users u
          INNER JOIN roles r ON r.id = u.role_id
          INNER JOIN branches b ON b.id = u.branch_id
          ORDER BY u.id DESC
        `);

        return this.normalizeRows(result);
      } catch (error) {
        console.warn("Gagal membaca pengguna dari database, memakai data fallback.");
      }
    }

    return users.map(resolveUser);
  }

  async listRoles() {
    const db = await this.getDb();

    if (db) {
      try {
        const result = await db.execute(sql`
          SELECT id, name
          FROM roles
          ORDER BY id ASC
        `);

        return this.normalizeRows(result);
      } catch (error) {
        console.warn("Gagal membaca role dari database, memakai data fallback.");
      }
    }

    return roles;
  }

  async listBranches() {
    const db = await this.getDb();

    if (db) {
      try {
        const result = await db.execute(sql`
          SELECT id, name, address
          FROM branches
          ORDER BY id ASC
        `);

        return this.normalizeRows(result);
      } catch (error) {
        console.warn("Gagal membaca cabang dari database, memakai data fallback.");
      }
    }

    return branches;
  }

  async createUser({ username, password, roleId, branchId }) {
    const db = await this.getDb();
    if (!db) {
      throw new Error("Database belum terhubung. CRUD pengguna memerlukan DATABASE_URL.");
    }

    const existing = await db.execute(sql`
      SELECT id
      FROM users
      WHERE username = ${username}
      LIMIT 1
    `);

    if (this.normalizeRows(existing)[0]) {
      throw new Error("Username sudah dipakai. Gunakan username lain.");
    }

    const hashedPassword = await hashPassword(username, password);

    await db.execute(sql`
      INSERT INTO users (username, password, role_id, branch_id)
      VALUES (${username}, ${hashedPassword}, ${roleId}, ${branchId})
    `);

    return this.findUserByUsername(username);
  }

  async updateUser(id, { username, password, roleId, branchId }) {
    const db = await this.getDb();
    if (!db) {
      throw new Error("Database belum terhubung. CRUD pengguna memerlukan DATABASE_URL.");
    }

    const existing = await db.execute(sql`
      SELECT id
      FROM users
      WHERE username = ${username} AND id <> ${id}
      LIMIT 1
    `);

    if (this.normalizeRows(existing)[0]) {
      throw new Error("Username sudah dipakai. Gunakan username lain.");
    }

    if (password) {
      const hashedPassword = await hashPassword(username, password);

      await db.execute(sql`
        UPDATE users
        SET username = ${username},
            password = ${hashedPassword},
            role_id = ${roleId},
            branch_id = ${branchId}
        WHERE id = ${id}
      `);
    } else {
      await db.execute(sql`
        UPDATE users
        SET username = ${username},
            role_id = ${roleId},
            branch_id = ${branchId}
        WHERE id = ${id}
      `);
    }

    return this.findUserById(id);
  }

  async deleteUser(id) {
    const db = await this.getDb();
    if (!db) {
      throw new Error("Database belum terhubung. CRUD pengguna memerlukan DATABASE_URL.");
    }

    await db.execute(sql`
      DELETE FROM users
      WHERE id = ${id}
    `);

    return { success: true };
  }

  async authenticateUser({ username, password }) {
    const db = await this.getDb();

    if (db) {
      try {
        const result = await db.execute(sql`
          SELECT u.id, u.username, u.password, u.role_id AS roleId, u.branch_id AS branchId,
                 r.name AS roleName, b.name AS branchName
          FROM users u
          INNER JOIN roles r ON r.id = u.role_id
          INNER JOIN branches b ON b.id = u.branch_id
          WHERE u.username = ${username}
          LIMIT 1
        `);

        const userRecord = this.normalizeRows(result)[0];
        if (!userRecord) return null;
        if (!userRecord.password) return null;

        const isValid = await verifyPassword(
          username,
          password,
          userRecord.password,
        );

        if (!isValid) return null;

        return {
          id: userRecord.id,
          username: userRecord.username,
          roleId: userRecord.roleId,
          roleName: userRecord.roleName,
          branchId: userRecord.branchId,
          branchName: userRecord.branchName,
        };
      } catch (error) {
        console.warn("Gagal login lewat database, memakai data fallback.");
      }
    }

    const user = users.find((item) => item.username === username);
    if (!user) return null;

    const isValid = await verifyPassword(username, password, user.password);
    if (!isValid) return null;

    return resolveUser(user);
  }

  async findUserById(id) {
    const db = await this.getDb();
    const fallbackUser = users.find((item) => item.id === Number(id));
    if (!db) return fallbackUser ? resolveUser(fallbackUser) : null;

    try {
      const result = await db.execute(sql`
        SELECT u.id, u.username, u.role_id AS roleId, u.branch_id AS branchId,
               r.name AS roleName, b.name AS branchName
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        INNER JOIN branches b ON b.id = u.branch_id
        WHERE u.id = ${id}
        LIMIT 1
      `);

      return this.normalizeRows(result)[0] || (fallbackUser ? resolveUser(fallbackUser) : null);
    } catch (error) {
      console.warn("Gagal membaca detail pengguna dari database, memakai data fallback.");
      return fallbackUser ? resolveUser(fallbackUser) : null;
    }
  }

  async findUserByUsername(username) {
    const db = await this.getDb();
    const fallbackUser = users.find((item) => item.username === username);
    if (!db) return fallbackUser ? resolveUser(fallbackUser) : null;

    try {
      const result = await db.execute(sql`
        SELECT u.id, u.username, u.role_id AS roleId, u.branch_id AS branchId,
               r.name AS roleName, b.name AS branchName
        FROM users u
        INNER JOIN roles r ON r.id = u.role_id
        INNER JOIN branches b ON b.id = u.branch_id
        WHERE u.username = ${username}
        LIMIT 1
      `);

      return this.normalizeRows(result)[0] || (fallbackUser ? resolveUser(fallbackUser) : null);
    } catch (error) {
      console.warn("Gagal membaca pengguna dari database, memakai data fallback.");
      return fallbackUser ? resolveUser(fallbackUser) : null;
    }
  }
}
