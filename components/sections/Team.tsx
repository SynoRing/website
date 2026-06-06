import { team } from "@/lib/content";

export function Team() {
  return (
    <section
      id="team"
      className="relative px-6 md:px-16 py-32 md:py-44 border-t border-hairline"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-20">
          <div className="md:col-span-6">
            <div className="eyebrow mb-6">{team.eyebrow}</div>
            <h2 className="font-serif font-normal text-[clamp(36px,5vw,68px)] leading-[1.0] tracking-[-0.02em] whitespace-pre-line">
              {team.headline}
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-8 md:pt-10">
            <p className="font-sans text-[15px] leading-[1.75] text-ivory-dim">
              {team.intro}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-hairline border border-hairline">
          {team.members.map((m) => (
            <article
              key={m.name}
              className="bg-noir p-8 md:p-10 min-h-[260px] flex flex-col justify-between"
            >
              {/* Portrait placeholder — abstract platinum gradient */}
              <div
                aria-hidden
                className="w-12 h-12 rounded-full mb-8"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #d4dae2 0%, #8a96a8 50%, #3a3f47 100%)",
                  boxShadow: "inset 0 0 12px rgba(0,0,0,0.3)",
                }}
              />
              <div>
                <h3 className="font-serif italic text-platinum-bright text-2xl mb-2">
                  {m.name}
                </h3>
                <p className="text-[11px] tracking-[0.2em] uppercase text-platinum-dim font-sans mb-4">
                  {m.role}
                </p>
                <p className="font-sans text-[13px] text-ivory-dim">
                  Focus · {m.focus}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
