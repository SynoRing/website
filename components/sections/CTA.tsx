import { cta } from "@/lib/content";

export function CTA() {
  return (
    <section
      id="reserve"
      className="relative px-6 md:px-16 py-32 md:py-48 border-t border-hairline overflow-hidden"
    >
      {/* Soft halo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(184,196,209,0.10) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <div className="eyebrow mb-8 inline-flex items-center justify-center gap-3.5">
          <span aria-hidden className="block h-px w-8 bg-platinum-dim" />
          {cta.eyebrow}
          <span aria-hidden className="block h-px w-8 bg-platinum-dim" />
        </div>

        <h2 className="font-serif font-normal text-[clamp(40px,6vw,80px)] leading-[0.98] tracking-[-0.025em] mb-10 whitespace-pre-line">
          {cta.headline}
        </h2>

        <p className="font-sans text-[15px] leading-[1.75] text-ivory-dim max-w-lg mx-auto mb-12">
          {cta.body}
        </p>

        <div className="flex items-center justify-center gap-6 flex-wrap mb-8">
          <a
            href={cta.primary.href}
            className="inline-flex items-center gap-3 border border-platinum px-9 py-4 text-platinum-bright font-sans text-[11px] font-medium tracking-[0.3em] uppercase transition-colors hover:bg-platinum hover:text-noir"
          >
            {cta.primary.label}
          </a>
          <a
            href={cta.ghost.href}
            className="inline-flex items-center gap-3 py-4 text-platinum-bright font-sans text-[11px] font-medium tracking-[0.3em] uppercase transition-opacity hover:opacity-70"
          >
            {cta.ghost.label}
          </a>
        </div>

        <p className="text-[10px] tracking-[0.3em] uppercase text-platinum-dim font-sans">
          {cta.fineprint}
        </p>
      </div>
    </section>
  );
}
