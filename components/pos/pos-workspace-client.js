"use client";

import dynamic from "next/dynamic";

const PosWorkspace = dynamic(
  () => import("@/components/pos/pos-workspace").then((mod) => mod.PosWorkspace),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-[30px] border border-border bg-surface p-6 card-shadow">
        <div className="h-[520px] animate-pulse rounded-[24px] bg-surface-strong/70" />
      </div>
    ),
  },
);

export function PosWorkspaceClient({ initialData }) {
  return <PosWorkspace initialData={initialData} />;
}
