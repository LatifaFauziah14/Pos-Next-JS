export function ReportSummary({ data }) {
  return (
    <div className="grid gap-3">
      {data.map((item) => (
        <div
          key={item.branchId}
          className="rounded-[22px] border border-border bg-white px-4 py-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold">{item.branchName}</p>
              <p className="break-words text-sm leading-6 text-muted">{item.address}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-semibold">{item.revenue}</p>
              <p className="text-sm text-muted">{item.transactions} transaksi</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
