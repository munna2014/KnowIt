export default function AuthShell({ eyebrow, heading, description, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-blue-950 to-black">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-[-18%] h-[22rem] w-[40rem] rounded-full bg-blue-600/25 blur-[140px]" />
        <div className="absolute top-20 right-[-16%] h-[18rem] w-[34rem] rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-[-18%] left-[-5%] h-[20rem] w-[36rem] rounded-full bg-blue-700/25 blur-[150px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
        <section
          className="space-y-8 opacity-0 motion-safe:animate-[fade-up_0.7s_ease_forwards]"
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white shadow-lg shadow-emerald-500/20 ring-1 ring-white/10">
              K
            </div>
            <span className="text-3xl font-semibold text-white font-[var(--font-display)]">
              KnowIt
            </span>
          </div>

          <div className="space-y-4">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-3xl font-semibold text-white font-[var(--font-display)] sm:text-4xl lg:text-5xl">
              {heading}
            </h1>
            <p className="max-w-xl text-base text-slate-300 sm:text-lg">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-100 shadow-sm ring-1 ring-slate-700/60">
              Communities
            </span>
            <span className="rounded-full bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-100 shadow-sm ring-1 ring-slate-700/60">
              Stories
            </span>
            <span className="rounded-full bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-100 shadow-sm ring-1 ring-slate-700/60">
              Events
            </span>
            <span className="rounded-full bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-100 shadow-sm ring-1 ring-slate-700/60">
              Messaging
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-900/70 p-4 shadow-sm ring-1 ring-slate-700/70">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Share
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                Updates that feel personal.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-900/70 p-4 shadow-sm ring-1 ring-slate-700/70">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Discover
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                Spaces built for every interest.
              </p>
            </div>
          </div>
        </section>

        <div
          className="mt-12 opacity-0 motion-safe:animate-[fade-up_0.7s_ease_forwards] lg:mt-0"
          style={{ animationDelay: "160ms" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
