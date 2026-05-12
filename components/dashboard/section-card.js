export function SectionCard({ title, description, children, className = "" }) {
  return (
    <section className={`rounded-[30px] border border-border bg-surface p-6 card-shadow ${className}`}>
      <div className="mb-5">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}
