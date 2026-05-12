import { PosWorkspaceClient } from "@/components/pos/pos-workspace-client";
import { PosService } from "@/services/pos-service";

export const metadata = {
  title: "POS Kasir | POS Multi Cabang",
};

export default async function PosPage() {
  const posService = new PosService();
  const data = await posService.getPosCatalog();

  return <PosWorkspaceClient initialData={data} />;
}
