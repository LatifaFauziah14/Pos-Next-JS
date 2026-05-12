import { ProductTableSection } from "@/components/products/product-table-section";
import { getSession } from "@/lib/auth";
import { ProductService } from "@/services/product-service";

export const metadata = {
  title: "Produk | POS Multi Cabang",
};

export default async function ProductsPage() {
  const session = await getSession();
  const productService = new ProductService();
  const [products, categories, branches] = await Promise.all([
    productService.listForTable(),
    productService.listCategories(),
    productService.listBranches(),
  ]);

  return (
    <ProductTableSection
      data={products}
      categories={categories}
      branches={branches}
      session={session}
    />
  );
}
