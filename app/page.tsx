const earlyAccessEmail =
  "mailto:hello@synoring.com?subject=SynoRing%20Early%20Access&body=Hi%20SynoRing%20team%2C%0A%0AI%27d%20like%20to%20join%20the%20early%20access%20list.%0A%0AName%3A%0AHow%20I%27d%20use%20SynoRing%3A%0A";

const gestures = [
  {
    number: "01",
    name: "Tap",
    action: "Select",
    detail: "Confirm a choice without reaching for the glasses.",
    mark: "•",
  },
  {
    number: "02",
    name: "Glide",
    action: "Scroll",
    detail: "Move through a page, a map, or a playlist quietly.",
    mark: "→",
  },
  {
    number: "03",
    name: "Rotate",
    action: "Adjust",
    detail: "Tune volume, zoom, or any continuous control.",
    mark: "↻",
  },
  {
    number: "04",
    name: "Hold",
    action: "Invoke",
    detail: "Bring up the action you use most, right where you are.",
    mark: "+",
  },
];

const phases = [
  {
    step: "Phase 01",
    title: "Interaction prototype",
    copy: "Gesture vocabulary, motion sensing, and touch behavior.",
    state: "active",
  },
  {
    step: "Phase 02",
    title: "Developer pilot",
    copy: "Small-batch hardware and SDK tests with real workflows.",
    state: "next",
  },
  {
    step: "Phase 03",
    title: "Production design",
    copy: "Fit, durability, battery, and manufacturing validation.",
    state: "later",
  },
  {
    step: "Phase 04",
    title: "First release",
    copy: "Launch timing follows validation — not a countdown timer.",
    state: "later",
  },
];

const targetSpecs = [
  ["Motion", "9-axis inertial sensing"],
  ["Touch", "Full-circumference input"],
  ["Connectivity", "Bluetooth Low Energy"],
  ["Compute", "Phone-side gesture intelligence"],
  ["Platforms", "iOS · Android · AR ecosystems"],
  ["Material", "Titanium enclosure under evaluation"],
];

export default function Home() {
  return (
    <div className="site-frame">
      <div className="project-bar">
        <span>Independent hardware project</span>
        <span className="project-status">
          <i /> Interaction prototype in development
        </span>
        <span className="project-location">Illinois, USA</span>
      </div>

      <header className="nav-wrap">
        <a className="brand" href="#top" aria-label="SynoRing home">
          <span className="brand-mark" aria-hidden="true">
            III
          </span>
          <span>SYNORING</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#why">Why a ring</a>
          <a href="#gestures">Gestures</a>
          <a href="#progress">Progress</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="nav-cta" href="#early-access">
          Join early access <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main>
        <section className="hero" id="top">
          <div className="hero-heading">
            <p className="eyebrow">A quiet controller for spatial computing</p>
            <h1>
              Control AR without
              <br />
              <em>breaking the moment.</em>
            </h1>
          </div>
          <div className="hero-intro">
            <p>
              SynoRing turns small, natural finger gestures into scroll, select,
              and navigation commands — so your eyes stay up and your hands stay
              where they belong.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#early-access">
                Join early access <span aria-hidden="true">↗</span>
              </a>
              <a className="text-link" href="#gestures">
                Explore the gestures <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="honesty-note">
              <span>Early-stage concept</span>
              <span>No deposit</span>
              <span>Updates only when there is news</span>
            </p>
          </div>

          <figure className="hero-visual">
            <img
              src="/og.png"
              alt="Concept visualization of the SynoRing titanium gesture controller"
            />
            <figcaption>
              Concept visualization <span>Final hardware may change</span>
            </figcaption>
          </figure>

          <div className="signal-strip" aria-label="Product pillars">
            <div>
              <span>01</span>
              <strong>Subtle by design</strong>
              <p>No mid-air choreography.</p>
            </div>
            <div>
              <span>02</span>
              <strong>Private in public</strong>
              <p>No voice commands required.</p>
            </div>
            <div>
              <span>03</span>
              <strong>Built around intent</strong>
              <p>Motion, touch, and context.</p>
            </div>
          </div>
        </section>

        <section className="why-section" id="why">
          <div className="section-heading light-heading">
            <p className="eyebrow">01 — Why a ring</p>
            <h2>Your hands already know what to do.</h2>
          </div>
          <div className="why-grid">
            <p className="why-lede">
              Spatial computers need an input that disappears into daily life.
              Cameras consume power. Voice exposes the moment. Touching the frame
              interrupts it. A ring can stay ready without asking for attention.
            </p>
            <div className="comparison" role="list" aria-label="Input comparison">
              <div role="listitem">
                <span>Voice</span>
                <p>Visible to everyone around you</p>
                <b>Public</b>
              </div>
              <div role="listitem">
                <span>Air gestures</span>
                <p>Large movements with social friction</p>
                <b>Obvious</b>
              </div>
              <div className="comparison-active" role="listitem">
                <span>SynoRing</span>
                <p>Small inputs, close to the body</p>
                <b>Quiet</b>
              </div>
            </div>
          </div>
        </section>

        <section className="gestures-section" id="gestures">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">02 — A small gesture language</p>
              <h2>Less movement. More meaning.</h2>
            </div>
            <p>
              Four familiar inputs form a compact vocabulary. The final set will
              be shaped with early testers, not invented in isolation.
            </p>
          </div>

          <div className="gesture-grid">
            {gestures.map((gesture) => (
              <article className="gesture-card" key={gesture.number}>
                <div className="gesture-topline">
                  <span>{gesture.number}</span>
                  <span>{gesture.name}</span>
                </div>
                <div className="gesture-mark" aria-hidden="true">
                  {gesture.mark}
                </div>
                <h3>{gesture.action}</h3>
                <p>{gesture.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="moments-section" id="moments">
          <div className="section-heading light-heading split-heading">
            <div>
              <p className="eyebrow">03 — In the moment</p>
              <h2>Designed for the places voice fails.</h2>
            </div>
            <p>
              The value is not another notification surface. It is keeping the
              interface available while the device disappears.
            </p>
          </div>

          <div className="moment-grid">
            <article className="moment-card moment-desk">
              <div className="moment-index">01 / Focus</div>
              <div className="moment-copy">
                <h3>At the desk</h3>
                <p>
                  Read on your glasses, type on your laptop, and move through a
                  document without changing posture.
                </p>
                <span>Scroll · select · highlight</span>
              </div>
              <div className="moment-illustration desk-lines" aria-hidden="true">
                <i />
                <i />
                <i />
                <b>→</b>
              </div>
            </article>
            <article className="moment-card moment-street">
              <div className="moment-index">02 / Move</div>
              <div className="moment-copy">
                <h3>On the street</h3>
                <p>
                  Step through directions, music, and messages without speaking
                  into the air or tapping your face.
                </p>
                <span>Navigate · reply · adjust</span>
              </div>
              <div className="moment-illustration route-line" aria-hidden="true">
                <i />
                <i />
                <b>↗</b>
              </div>
            </article>
          </div>
        </section>

        <section className="progress-section" id="progress">
          <div className="progress-head">
            <p className="eyebrow">04 — Building in public</p>
            <h2>Early means early.</h2>
            <p>
              We are validating the interaction before promising a launch date.
              Here is the path from prototype to product — with no fictional
              countdown and no deposit today.
            </p>
          </div>

          <div className="phase-list">
            {phases.map((phase) => (
              <article className={`phase phase-${phase.state}`} key={phase.step}>
                <div className="phase-state">
                  <span>{phase.step}</span>
                  {phase.state === "active" ? <b>Now</b> : null}
                </div>
                <h3>{phase.title}</h3>
                <p>{phase.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="spec-section" id="specs">
          <div className="spec-intro">
            <p className="eyebrow">05 — Product direction</p>
            <h2>Built light. Kept capable.</h2>
            <p>
              These are development targets, not final shipping specifications.
              We will publish measured numbers as prototypes mature.
            </p>
            <span className="spec-label">Target architecture · subject to change</span>
          </div>
          <dl className="spec-list">
            {targetSpecs.map(([term, definition]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{definition}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="access-section" id="early-access">
          <div className="access-number" aria-hidden="true">
            06
          </div>
          <div className="access-copy">
            <p className="eyebrow">Early access</p>
            <h2>Help shape the input, before we shape the object.</h2>
            <p>
              Tell us how you would use SynoRing. Early members get honest build
              updates, prototype opportunities, and launch priority when the
              product is ready.
            </p>
            <a className="button button-lime" href={earlyAccessEmail}>
              Request early access <span aria-hidden="true">↗</span>
            </a>
            <small>No payment. No weekly noise. Just meaningful progress.</small>
          </div>
        </section>

        <section className="faq-section" id="faq">
          <div className="faq-heading">
            <p className="eyebrow">Questions, answered plainly</p>
            <h2>Before you ask.</h2>
          </div>
          <div className="faq-list">
            <details>
              <summary>
                Can I buy SynoRing today? <span>+</span>
              </summary>
              <p>
                Not yet. We are in active development and are not taking deposits.
                Early access is the best way to follow the build and hear when
                testing opens.
              </p>
            </details>
            <details>
              <summary>
                Which AR glasses will it support? <span>+</span>
              </summary>
              <p>
                Compatibility work comes after the core interaction is reliable.
                The current direction is a phone-side SDK designed to work across
                AR ecosystems instead of locking the ring to one headset.
              </p>
            </details>
            <details>
              <summary>
                Are the specifications final? <span>+</span>
              </summary>
              <p>
                No. Materials, battery, sensing, and industrial design remain
                development targets. We will replace targets with measured data as
                prototypes are validated.
              </p>
            </details>
            <details>
              <summary>
                I build AR software. Can we collaborate? <span>+</span>
              </summary>
              <p>
                Yes. We especially want to hear from developers working on
                navigation, productivity, accessibility, and spatial interfaces.
                Use the early-access link and tell us what you are building.
              </p>
            </details>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <a className="brand brand-footer" href="#top">
            <span className="brand-mark" aria-hidden="true">
              III
            </span>
            <span>SYNORING</span>
          </a>
          <p>A quiet controller for spatial computing.</p>
        </div>
        <div className="footer-links">
          <a href="#why">Why a ring</a>
          <a href="#gestures">Gestures</a>
          <a href="#progress">Progress</a>
          <a href="#faq">FAQ</a>
          <a href={earlyAccessEmail}>Contact</a>
        </div>
        <div className="footer-meta">
          <span>© 2026 SynoRing Labs Inc.</span>
          <span>Designed in Illinois</span>
        </div>
      </footer>
    </div>
  );
}
