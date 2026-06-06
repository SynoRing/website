import { howItWorks } from "@/lib/content";

export function HowItWorks() {
  return (
    <section
      id="how"
      className="relative px-6 md:px-16 py-32 md:py-44 border-t border-hairline overflow-hidden"
    >
      {/* Soft halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/4 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(184,196,209,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-6xl relative">
        {/* Header — centered */}
        <div className="text-center mb-20 md:mb-28">
          <div className="eyebrow mb-6">{howItWorks.eyebrow}</div>
          <h2 className="font-serif font-normal text-[clamp(36px,5vw,68px)] leading-[1.05] tracking-[-0.02em] whitespace-pre-line">
            {howItWorks.headline}
          </h2>
          <p className="mt-8 mx-auto max-w-xl font-sans text-[15px] leading-[1.75] text-ivory-dim">
            {howItWorks.intro}
          </p>
        </div>

        {/* Components — 3 column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {howItWorks.components.map((c) => (
            <div key={c.number} className="relative pt-10">
              {/* Roman numeral marker */}
              <div className="absolute top-0 left-0 font-serif italic text-platinum-dim text-2xl">
                {c.number}
              </div>
              <div className="absolute top-3 left-10 right-0 h-px bg-hairline" />

              <h3 className="font-serif italic text-platinum-bright text-[clamp(22px,2.4vw,28px)] leading-tight mb-4">
                {c.title}
              </h3>
              <p className="font-sans text-[14px] leading-[1.75] text-ivory-dim">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
