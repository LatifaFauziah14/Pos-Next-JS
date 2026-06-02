"use client";

import dynamic from "next/dynamic";

const PosWorkspace = dynamic(
  () => import("@/components/pos/pos-workspace").then((mod) => mod.PosWorkspace),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-[24px] border border-border bg-surface p-4 card-shadow sm:rounded-[30px] sm:p-6">
        <div className="h-[420px] animate-pulse rounded-[24px] bg-surface-strong/70 sm:h-[520px]" />
      </div>
    ),
  },
);

export function PosWorkspaceClient({ initialData }) {
  return <PosWorkspace initialData={initialData} />;
}
