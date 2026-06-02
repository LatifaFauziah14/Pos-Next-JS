export function MetricCard({ label, value, helper, highlight = false }) {
  return (
    <article
      className={`min-w-0 rounded-[24px] border p-4 ${
        highlight ? "border-primary/30 bg-primary/5" : "border-border bg-white"
      } sm:p-5`}
    >
      <p className="text-sm leading-5 text-muted">{label}</p>
      <h3 className="mt-2 text-2xl font-semibold leading-none tracking-tight break-words sm:mt-3 sm:text-[clamp(1.85rem,3vw,2.35rem)]">
        {value}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted sm:mt-3">{helper}</p>
    </article>
  );
}
