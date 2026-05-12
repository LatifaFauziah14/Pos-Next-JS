import { getSession } from "@/lib/auth";
import { branches } from "@/lib/mock-data";
import { ProductService } from "@/services/product-service";

export class PosService {
  constructor() {
    this.productService = new ProductService();
  }

  async getPosCatalog() {
    const session = await getSession();
    const branch = session
      ? { id: session.branchId, name: session.branchName }
      : branches[0];
    const products = await this.productService.listByBranch(branch.id);

    return {
      branch,
      user: {
        id: session?.id || 1,
        username: session?.username || "admin",
      },
      products,
    };
  }
}
