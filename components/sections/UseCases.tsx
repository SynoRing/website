import { useCases } from "@/lib/content";

export function UseCases() {
  return (
    <section
      id="use"
      className="relative px-6 md:px-16 py-32 md:py-44 border-t border-hairline"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-20">
          <div className="eyebrow mb-6">{useCases.eyebrow}</div>
          <h2 className="font-serif font-normal text-[clamp(36px,5vw,68px)] leading-[1.0] tracking-[-0.02em] max-w-3xl">
            {useCases.headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border border-hairline">
          {useCases.cases.map((c, i) => (
            <article
              key={c.number}
              className="bg-noir p-10 md:p-16 relative min-h-[420px] flex flex-col justify-between"
            >
              <header>
                <div className="flex items-baseline gap-4 mb-8">
                  <span className="font-serif italic text-platinum text-3xl">
                    0{i + 1}
                  </span>
                  <span className="text-[10px] tracking-[0.35em] uppercase text-platinum-dim font-sans">
                    {c.number}
                  </span>
                </div>
                <h3 className="font-serif font-normal text-[clamp(28px,3.6vw,44px)] leading-[1.05] tracking-tight mb-6">
                  <em className="not-italic font-serif italic font-medium text-platinum-bright">
                    {c.title}
                  </em>
                </h3>
                <p className="font-sans text-[15px] leading-[1.75] text-ivory-dim max-w-md">
                  {c.body}
                </p>
              </header>
              <footer className="mt-10 pt-6 border-t border-hairline text-[11px] tracking-[0.3em] uppercase text-platinum-dim font-sans">
                {c.detail}
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
