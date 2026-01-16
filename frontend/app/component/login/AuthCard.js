export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className = "",
}) {
  return (
    <div
      className={`rounded-3xl border border-slate-700/80 bg-slate-900/90 p-8 text-slate-100 shadow-2xl shadow-slate-950/35 backdrop-blur ${className}`}
    >
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
          {title}
        </p>
        <h2 className="text-2xl font-semibold text-white font-[var(--font-display)] sm:text-3xl">
          {subtitle}
        </h2>
      </div>
      <div className="space-y-6">{children}</div>
      {footer ? <div className="mt-6">{footer}</div> : null}
    </div>
  );
}
