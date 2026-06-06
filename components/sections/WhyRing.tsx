import { whyRing } from "@/lib/content";

export function WhyRing() {
  return (
    <section
      id="why"
      className="relative px-6 md:px-16 py-32 md:py-44 border-t border-hairline"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-24">
          <div className="md:col-span-5">
            <div className="eyebrow mb-6">{whyRing.eyebrow}</div>
            <h2 className="font-serif font-normal text-[clamp(36px,5vw,68px)] leading-[1.0] tracking-[-0.02em]">
              {whyRing.headline.line1}
              <br />
              {whyRing.headline.line2}
              <br />
              <em className="not-italic font-serif italic font-medium text-platinum">
                {whyRing.headline.italic}
              </em>
              {whyRing.headline.italicTail}
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 md:pt-12">
            <p className="font-sans text-[15px] leading-[1.75] text-ivory-dim max-w-md">
              {whyRing.intro}
            </p>
          </div>
        </div>

        {/* Comparison table */}
        <div className="border-t border-hairline">
          {whyRing.competitors.map((row) => (
            <div
              key={row.method}
              className={`grid grid-cols-12 gap-4 md:gap-8 py-7 md:py-9 border-b border-hairline items-baseline ${
                row.featured ? "bg-platinum/[0.04]" : ""
              }`}
            >
              <div className="col-span-12 md:col-span-4">
                <h3
                  className={`font-serif text-[clamp(22px,2.6vw,32px)] leading-tight tracking-tight ${
                    row.featured ? "text-platinum-bright italic" : "text-ivory"
                  }`}
                >
                  {row.method}
                </h3>
              </div>
              <div className="col-span-4 md:col-span-3 text-[10px] tracking-[0.3em] uppercase text-platinum-dim font-sans">
                {row.vs}
              </div>
              <div className="col-span-8 md:col-span-5 text-sm md:text-[15px] leading-relaxed text-ivory-dim font-sans">
                {row.issue}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
