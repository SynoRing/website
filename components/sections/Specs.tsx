import { specs } from "@/lib/content";

export function Specs() {
  return (
    <section
      id="specs"
      className="relative px-6 md:px-16 py-32 md:py-44 border-t border-hairline"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          {/* Left: title */}
          <div className="md:col-span-5 md:sticky md:top-32 md:self-start">
            <div className="eyebrow mb-6">{specs.eyebrow}</div>
            <h2 className="font-serif font-normal text-[clamp(36px,5vw,68px)] leading-[1.0] tracking-[-0.02em]">
              <em className="not-italic font-serif italic font-medium text-platinum">
                Engineered
              </em>
              <br />
              to disappear.
            </h2>
          </div>

          {/* Right: spec list */}
          <dl className="md:col-span-7 md:col-start-6 divide-y divide-hairline border-t border-hairline">
            {specs.list.map((s) => (
              <div
                key={s.label}
                className="py-5 md:py-6 grid grid-cols-12 gap-4 items-baseline"
              >
                <dt className="col-span-4 text-[10px] tracking-[0.3em] uppercase text-platinum-dim font-sans">
                  {s.label}
                </dt>
                <dd className="col-span-8 font-serif italic text-platinum-bright text-[clamp(17px,1.9vw,22px)] leading-snug">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
