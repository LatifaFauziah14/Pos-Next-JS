export function EmptyState({ title, description }) {
  return (
    <div className="rounded-[24px] border border-dashed border-border bg-surface p-6 text-center sm:rounded-[28px] sm:p-10">
      <h3 className="text-lg font-semibold sm:text-xl">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
