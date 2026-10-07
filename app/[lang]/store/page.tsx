import type { Metadata } from "next";
import { siteCopy } from "../../copy/site";
import { storeCopy } from "../../copy/store";
import { localePath, pageLang, type PageProps } from "../../i18n";
import { pageMetadata } from "../../site";
import { PageShell } from "../../site-components";
import { PurchasePanel } from "../../store/purchase-panel";
import { product } from "../../structured-data";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = await pageLang(params);
  const { title, description } = storeCopy[lang];
  return pageMetadata(lang, title, description, "/store");
}

/* The V11 orthographic renders share one camera scale. The band dimension
   line is placed in percent of the 1800 px source, where the band spans
   652–1148 px (8 mm). Diameters follow ring size, so they are not marked. */
const views: {
  file: "front" | "side" | "top";
  dimension?: { className: string; value: string };
}[] = [
  { file: "front" },
  { file: "side", dimension: { className: "dimension-band", value: "8 mm" } },
  { file: "top" },
];

export default async function StorePage({ params }: PageProps) {
  const lang = await pageLang(params);
  const copy = storeCopy[lang];
  const shared = siteCopy[lang];
  const specs = copy.specifications;
  return (
    <PageShell lang={lang} active="/store" structuredData={[product(lang)]}>
      <section className="store-heading content-width">
        <span className="eyebrow">{copy.eyebrow}</span>
        <p>{copy.tagline}</p>
      </section>
      <PurchasePanel
        lang={lang}
        copy={{
          panel: copy.panel,
          review: copy.review,
          gallery: copy.gallery,
          finishes: shared.finishes,
          renderAlt: shared.renderAlt,
          circuitAlt: shared.circuitAlt,
          waitlist: shared.waitlist,
        }}
      />
      <section
        className="technical-specifications content-width"
        id="specifications"
        aria-labelledby="specifications-title"
      >
        <div className="specification-heading">
          <div>
            <span className="eyebrow">{specs.eyebrow}</span>
            <h2 id="specifications-title">{specs.title}</h2>
          </div>
          <p>{specs.text}</p>
        </div>
        <figure className="dimension-drawing">
          <div className="dimension-views">
            {views.map((view) => (
              <div className={`dimension-view view-${view.file}`} key={view.file}>
                <div className="dimension-art">
                  <img
                    src={`/images/synoring-view-${view.file}.webp`}
                    alt={specs.views[view.file].alt}
                    width="1000"
                    height="1000"
                    loading="lazy"
                    decoding="async"
                  />
                  {view.dimension && (
                    <span
                      className={`dimension-line ${view.dimension.className}`}
                      aria-hidden="true"
                    >
                      <span>{view.dimension.value}</span>
                    </span>
                  )}
                </div>
                <span className="dimension-label">{specs.views[view.file].label}</span>
              </div>
            ))}
          </div>
          <figcaption>{specs.caption}</figcaption>
        </figure>
        <div className="specification-groups">
          {specs.groups.map((group, index) => (
            <section
              className="specification-group"
              key={group.title}
              aria-labelledby={`spec-group-${index}`}
            >
              <h3 id={`spec-group-${index}`}>
                <span>0{index + 1}</span>
                {group.title}
              </h3>
              <dl>
                {group.rows.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd
                      className={
                        value.startsWith(specs.pending) ? "spec-pending" : undefined
                      }
                    >
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </section>
      <section className="store-questions content-width">
        <div>
          <h2>{copy.questions.title}</h2>
          <p>{copy.questions.text}</p>
        </div>
        <div>
          {copy.questions.items.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
          <article>
            <h3>{copy.questions.demo.title}</h3>
            <p>
              {copy.questions.demo.before}
              <a href={localePath(lang, "/demo")}>{copy.questions.demo.link}</a>
              {copy.questions.demo.after}
            </p>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
