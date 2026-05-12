import { SectionCard } from "@/components/dashboard/section-card";
import { ProductTableClient } from "@/components/products/product-table-client";

export function ProductTableSection({ data, categories, branches, session }) {
  return (
    <SectionCard
      title="Master Produk"
      description="Kelola produk per cabang dengan tabel reusable berbasis TanStack."
    >
      <ProductTableClient
        data={data}
        categories={categories}
        branches={branches}
        session={session}
      />
    </SectionCard>
  );
}
