import { Nav } from "../Nav";
import { hero } from "@/lib/content";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden flex items-center">
      <Nav />

      {/* Soft radial halo behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(184,196,209,0.10) 0%, transparent 60%)",
        }}
      />

      {/* Centered content */}
      <div className="relative z-[2] mx-auto max-w-5xl w-full px-6 md:px-16 text-center">
        {/* Eyebrow */}
        <div className="mb-9 inline-flex items-center justify-center gap-3.5 text-platinum-dim text-[10px] tracking-[0.4em] uppercase font-sans">
          <span aria-hidden className="block h-px w-8 bg-platinum-dim" />
          {hero.eyebrow}
          <span aria-hidden className="block h-px w-8 bg-platinum-dim" />
        </div>

        {/* Headline */}
        <h1 className="font-serif font-normal text-[clamp(48px,9vw,112px)] leading-[0.92] tracking-[-0.025em] mb-9">
          {hero.headline.line1}{" "}
          <em className="not-italic font-serif italic font-medium text-platinum">
            {hero.headline.italic}
          </em>{" "}
          {hero.headline.line1cont}
          <br />
          {hero.headline.line2}
        </h1>

        {/* Quote */}
        <blockquote className="relative mx-auto mb-12 max-w-[640px] font-serif italic font-light text-[clamp(16px,1.7vw,22px)] leading-[1.5] text-platinum">
          <span
            aria-hidden
            className="mx-auto mb-6 block h-px w-10 bg-platinum-dim"
          />
          <span className="block">&ldquo;{hero.quote[0]}</span>
          <span className="block">{hero.quote[1]}&rdquo;</span>
        </blockquote>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <a
            href={hero.ctas.primary.href}
            className="group inline-flex items-center gap-3 border border-platinum px-8 py-3.5 text-platinum-bright font-sans text-[11px] font-medium tracking-[0.3em] uppercase transition-colors hover:bg-platinum hover:text-noir"
          >
            {hero.ctas.primary.label}
          </a>
          <a
            href={hero.ctas.ghost.href}
            className="inline-flex items-center gap-3 py-3.5 text-platinum-bright font-sans text-[11px] font-medium tracking-[0.3em] uppercase transition-opacity hover:opacity-70"
          >
            {hero.ctas.ghost.label}
          </a>
        </div>
      </div>

      {/* Footer pinned to bottom of viewport */}
      <div className="absolute bottom-7 left-16 right-16 hidden md:flex items-center justify-between font-sans text-[10px] tracking-[0.25em] uppercase opacity-45">
        <span>{hero.footerLeft}</span>
        <span>{hero.footerRight}</span>
      </div>
    </section>
  );
}
