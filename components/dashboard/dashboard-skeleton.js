import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[30px] border border-border bg-surface p-6 card-shadow">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-3 h-8 w-80" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
        </div>

        <div className="rounded-[30px] border border-border bg-surface p-6 card-shadow">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-3 h-4 w-64" />
          <div className="mt-5 grid gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[30px] border border-border bg-surface p-6 card-shadow">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-3 h-4 w-64" />
          <div className="mt-5 grid gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
        <div className="rounded-[30px] border border-border bg-surface p-6 card-shadow">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-3 h-4 w-72" />
          <div className="mt-5 grid gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-border bg-surface p-6 card-shadow">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="mt-3 h-4 w-80" />
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Skeleton className="min-h-[320px]" />
          <div className="grid gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </div>
      </section>
    </div>
  );
}
