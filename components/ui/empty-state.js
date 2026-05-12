export function EmptyState({ title, description }) {
  return (
    <div className="rounded-[28px] border border-dashed border-border bg-surface p-10 text-center">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
