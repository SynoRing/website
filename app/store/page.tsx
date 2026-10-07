import { PageShell } from "../site-components";
import { pageMetadata } from "../site";
import { product } from "../structured-data";
import { PurchasePanel } from "./purchase-panel";

export const metadata = pageMetadata(
  "Pre-order SynoRing R1 — $99",
  "Pre-order SynoRing R1 for $99 (regularly $129) in Space Gray, Platinum, Rose Gold, or Gold. Ships Q1 2027 with free US shipping; a sizing kit comes first.",
  "/store",
);

const specifications = [
  {
    title: "Design & finish",
    rows: [
      ["Product", "SynoRing R1 wearable gesture controller"],
      ["Colors", "Space Gray · Platinum · Rose Gold · Gold"],
      ["Band width", "8 mm in every size"],
      ["Inner & outer diameter", "Varies by ring size"],
      ["Ring sizes", "Multiple sizes; confirmed with a sizing kit first"],
      ["Materials", "Zirconia ceramic outer shell · Stainless steel inner band"],
      ["Weight", "To be announced"],
    ],
  },
  {
    title: "Input & gestures",
    rows: [
      ["Input method", "Thumb touch + movement of the ring-bearing finger"],
      ["Touch gestures", "Tap · Glide · Press and hold"],
      ["Motion gestures", "Clockwise and counterclockwise circular movements"],
      ["Control functions", "Selection, scrolling, and continuous adjustment"],
      [
        "Gesture mapping",
        "Application-dependent; explore examples in the Demo",
      ],
    ],
  },
  {
    title: "Connectivity & software",
    rows: [
      ["Device connection", "Wireless; protocol and version to be announced"],
      ["Intended applications", "AR glasses and spatial computing"],
      ["Compatible devices", "Validated device list to be announced"],
      [
        "Software integration",
        "Phone-side SDK planned; public release to be announced",
      ],
      ["System requirements", "To be announced"],
    ],
  },
  {
    title: "Power & durability",
    rows: [
      ["Battery capacity", "12 mAh"],
      ["Battery life, typical use", "Up to 12 hours"],
      ["Battery life, intensive use", "Up to 1 hour"],
      ["Charging", "Full charge in about 1.5 hours"],
      ["Water & dust resistance", "Rating to be announced after validation"],
    ],
  },
  {
    title: "Pre-order & delivery",
    rows: [
      ["Pre-order price", "$99 USD"],
      ["Regular price", "$129 USD"],
      ["Sizing kit", "Ships first so you can confirm your size"],
      ["In the box", "SynoRing R1 · Charger"],
      ["Estimated shipping", "Q1 2027"],
      ["Shipping", "Free within the US; other regions pay shipping"],
      ["Taxes", "Confirmed by email before payment"],
    ],
  },
];

/* The V11 orthographic renders share one camera scale. The band dimension
   line is placed in percent of the 1800 px source, where the band spans
   652–1148 px (8 mm). Diameters follow ring size, so they are not marked. */
const views: {
  file: string;
  label: string;
  alt: string;
  dimension?: { className: string; value: string };
}[] = [
  {
    file: "front",
    label: "Front",
    alt: "SynoRing R1 front view",
  },
  {
    file: "side",
    label: "Side",
    alt: "SynoRing R1 side view, 8 mm band width",
    dimension: { className: "dimension-band", value: "8 mm" },
  },
  {
    file: "top",
    label: "Top · touch surface",
    alt: "SynoRing R1 top view of the touch surface and logo",
  },
];

export default function StorePage() {
  return (
    <PageShell active="/store" structuredData={[product]}>
      <section className="store-heading content-width">
        <span className="eyebrow">SynoRing Store</span>
        <p>Four finishes. One natural connection.</p>
      </section>
      <PurchasePanel />
      <section
        className="technical-specifications content-width"
        id="specifications"
        aria-labelledby="specifications-title"
      >
        <div className="specification-heading">
          <div>
            <span className="eyebrow">A closer look</span>
            <h2 id="specifications-title">Technical specifications.</h2>
          </div>
          <p>
            Product details at a glance. Development specifications may change;
            unconfirmed details are marked below.
          </p>
        </div>
        <figure className="dimension-drawing">
          <div className="dimension-views">
            {views.map((view) => (
              <div
                className={`dimension-view view-${view.file}`}
                key={view.file}
              >
                <div className="dimension-art">
                  <img
                    src={`/images/synoring-view-${view.file}.webp`}
                    alt={view.alt}
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
                <span className="dimension-label">{view.label}</span>
              </div>
            ))}
          </div>
          <figcaption>
            Shown in Space Gray at one scale. The band is 8 mm wide in every
            size; inner and outer diameter follow your ring size.
          </figcaption>
        </figure>
        <div className="specification-groups">
          {specifications.map((group, index) => (
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
                        value.startsWith("To be announced")
                          ? "spec-pending"
                          : undefined
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
          <h2>Before you pre-order.</h2>
          <p>A few things to know about this release.</p>
        </div>
        <div>
          <article>
            <h3>How does pre-ordering work?</h3>
            <p>
              Choose a finish and quantity, review your selection, and leave
              your email. Our team will contact you to confirm your size and
              the next steps; this website does not collect payment.
            </p>
          </article>
          <article>
            <h3>When will my ring ship?</h3>
            <p>
              SynoRing R1 is estimated to ship in Q1 2027. Shipping is free
              within the US; orders to other regions pay the shipping cost.
            </p>
          </article>
          <article>
            <h3>How do I find my size?</h3>
            <p>
              We send you a sizing kit first. Wear it, confirm your size, and
              your SynoRing R1 ships in that size. The band is 8 mm wide in
              every size; only the inner and outer diameter change.
            </p>
          </article>
          <article>
            <h3>Can I try the controls first?</h3>
            <p>
              Yes. Explore music, reading, and navigation in our{" "}
              <a href="/demo">interactive demo</a>.
            </p>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
