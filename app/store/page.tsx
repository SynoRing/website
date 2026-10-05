import { PageShell } from "../site-components";
import { pageMetadata } from "../site";
import { PurchasePanel } from "./purchase-panel";

export const metadata = pageMetadata(
  "Store — Pre-order",
  "Pre-order SynoRing for $99 USD, regularly $129. Choose Space Gray, Platinum, Rose Gold, or Gold. Explore technical specifications and submit your pre-order enquiry.",
  "/store",
);

const specifications = [
  {
    title: "Design & finish",
    rows: [
      ["Product", "SynoRing wearable gesture controller"],
      ["Colors", "Space Gray · Platinum · Rose Gold · Gold"],
      ["Ring sizes", "To be announced"],
      ["Dimensions & weight", "To be announced"],
      ["Materials", "To be announced"],
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
      ["Battery capacity", "To be announced"],
      ["Battery life", "To be announced after testing"],
      ["Charging", "Method and charging time to be announced"],
      ["Water & dust resistance", "Rating to be announced after validation"],
    ],
  },
  {
    title: "Pre-order & delivery",
    rows: [
      ["Pre-order price", "$99 USD"],
      ["Regular price", "$129 USD"],
      ["Included accessories", "To be announced"],
      ["Dispatch date", "To be announced"],
      ["Shipping & taxes", "Confirmed by email before payment"],
    ],
  },
];

export default function StorePage() {
  return (
    <PageShell active="/store">
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
              Choose a finish and quantity, then review your selection. The
              enquiry button opens your email app with the details filled in.
              Our team will confirm the next steps; this website does not
              collect payment.
            </p>
          </article>
          <article>
            <h3>When will my ring ship?</h3>
            <p>
              A dispatch date has not been announced. Delivery, fit, and
              compatibility details will be confirmed before payment.
            </p>
          </article>
          <article>
            <h3>Can I try the controls first?</h3>
            <p>
              Yes. Explore music, reading, and navigation in our{" "}
              <a href="/demo">interactive AR demo</a>.
            </p>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
