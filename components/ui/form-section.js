export function FormSection({ title, description, children }) {
  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 card-shadow">
      <div className="mb-5">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
