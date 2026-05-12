export function MetricCard({ label, value, helper, highlight = false }) {
  return (
    <article
      className={`min-w-0 rounded-[24px] border p-5 ${
        highlight ? "border-primary/30 bg-primary/5" : "border-border bg-white"
      }`}
    >
      <p className="text-sm leading-5 text-muted">{label}</p>
      <h3 className="mt-3 text-[clamp(1.85rem,3vw,2.35rem)] font-semibold leading-none tracking-tight whitespace-nowrap">
        {value}
      </h3>
      <p className="mt-3 text-sm leading-6 text-muted">{helper}</p>
    </article>
  );
}
