export function FormSection({ title, description, children }) {
  return (
    <section className="rounded-[24px] border border-border bg-surface p-4 card-shadow sm:rounded-[28px] sm:p-6">
      <div className="mb-4 sm:mb-5">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
