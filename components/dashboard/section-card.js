export function SectionCard({ title, description, children, className = "" }) {
  return (
    <section
      className={`rounded-[24px] border border-border bg-surface p-4 card-shadow sm:rounded-[30px] sm:p-6 ${className}`}
    >
      <div className="mb-4 sm:mb-5">
        <h3 className="text-lg font-semibold sm:text-xl">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}
