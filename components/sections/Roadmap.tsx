import { roadmap } from "@/lib/content";

export function Roadmap() {
  return (
    <section
      id="roadmap"
      className="relative px-6 md:px-16 py-32 md:py-44 border-t border-hairline"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-24">
          <div className="eyebrow mb-6">{roadmap.eyebrow}</div>
          <h2 className="font-serif font-normal text-[clamp(36px,5vw,68px)] leading-[1.0] tracking-[-0.02em] whitespace-pre-line">
            {roadmap.headline}
          </h2>
        </div>

        {/* Timeline */}
        <ol className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <span
            aria-hidden
            className="absolute left-[7px] top-3 bottom-3 w-px bg-hairline"
          />

          {roadmap.steps.map((step) => {
            const dotColor =
              step.state === "current"
                ? "bg-platinum-bright shadow-[0_0_0_4px_rgba(212,218,226,0.2)]"
                : step.state === "next"
                  ? "bg-platinum"
                  : "bg-platinum-dim";
            return (
              <li
                key={step.year}
                className="relative pl-12 md:pl-16 pb-14 last:pb-0"
              >
                <span
                  className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full ${dotColor}`}
                />
                <div className="text-[10px] tracking-[0.35em] uppercase text-platinum-dim font-sans mb-2">
                  {step.year}
                </div>
                <h3 className="font-serif italic text-platinum-bright text-[clamp(20px,2.2vw,28px)] mb-3">
                  {step.title}
                </h3>
                <p className="font-sans text-[14px] leading-[1.75] text-ivory-dim max-w-lg">
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
