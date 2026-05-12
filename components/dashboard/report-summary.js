export function ReportSummary({ data }) {
  return (
    <div className="grid gap-3">
      {data.map((item) => (
        <div
          key={item.branchId}
          className="rounded-[22px] border border-border bg-white px-4 py-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{item.branchName}</p>
              <p className="text-sm text-muted">{item.address}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{item.revenue}</p>
              <p className="text-sm text-muted">{item.transactions} transaksi</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
