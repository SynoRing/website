import { site } from "./site";
import { SiteHeader, SiteFooter, Note, ArrowLink } from "./site-components";
import {
  ProductVisual,
  explodedView,
  productMedia,
  ringFrontView,
  ringRenders,
  ringRenderSize,
} from "./product-visual";
import { finishes } from "./store/product";
import { RotatingWords } from "./rotating-words";
import {
  ArrowIcon,
  CircleIcon,
  GlideIcon,
  HoldIcon,
  NavigationIcon,
  PauseIcon,
  PlusIcon,
  TapIcon,
} from "./icons";

const earlyAccessEmail =
  "mailto:hello@synoring.com?subject=SynoRing%20Early%20Access&body=Hi%20SynoRing%20team%2C%0A%0AI%27d%20like%20to%20join%20the%20early%20access%20list.%0A%0AName%3A%0AHow%20I%27d%20use%20SynoRing%3A%0A";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: `${site.url}/`,
      name: site.name,
      alternateName: site.organization,
      description: site.description,
      inLanguage: site.language,
      publisher: { "@id": `${site.url}/#organization` },
      about: { "@id": `${site.url}/#product` },
    },
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.organization,
      alternateName: site.name,
      url: `${site.url}/`,
      email: site.email,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/logo.svg`,
        width: 251,
        height: 251,
      },
    },
    {
      "@type": "Product",
      "@id": `${site.url}/#product`,
      name: site.name,
      url: `${site.url}/`,
      description: site.description,
      image: `${site.url}/og.png`,
      category: "Wearable gesture controller for AR and spatial computing",
      brand: { "@id": `${site.url}/#organization` },
    },
  ],
};

const heroDevices = [
  "your AR glasses",
  "your smart glasses",
  "your headset",
  "your phone",
  "your laptop",
  "your PC",
  "your robot",
] as const;

const explodedLayers = [
  {
    id: "shell",
    side: "left",
    title: "Ceramic shell",
    text: "A thin glazed shell. Six touch points line its outer face, right over the electrodes.",
  },
  {
    id: "circuit",
    side: "right",
    title: "Flexible circuit",
    text: "A translucent C-shaped board with six outward-facing electrodes and the electronics for motion sensing, gesture processing, and wireless connection.",
  },
  {
    id: "battery",
    side: "left",
    title: "Arc battery",
    text: "A curved cell that sits just inside the touch area.",
  },
  {
    id: "band",
    side: "right",
    title: "Steel inner band",
    text: "One piece of stainless steel. Its rims form the ring's two steel edges.",
  },
] as const;

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="site-frame" id="top">
        <a className="news-bar" href="https://wacv27seai.synoring.ai/">
          Meet us at the WACV 2027 SEAI Workshop
          <span>January 4–8, 2027</span>
          <ArrowIcon />
        </a>
        <SiteHeader home />
        <main id="main">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-copy">
              <h1 id="hero-title">
                <span className="sr-only">
                  Control your AR glasses, smart glasses, headset, phone,
                  laptop, PC, or robot without breaking the moment.
                </span>
                <span className="hero-title-line" aria-hidden="true">
                  Control <RotatingWords words={heroDevices} />
                </span>
                <span className="hero-title-line" aria-hidden="true">
                  without breaking the moment.
                </span>
              </h1>
              <p>Your world, at your fingertips.</p>
              <a className="button" href="#why">
                Discover SynoRing
              </a>
            </div>
            <div className="hero-art">
              <img
                className="hero-ring"
                src={ringFrontView.src}
                srcSet={ringFrontView.srcSet}
                sizes="(max-width: 760px) 116vw, 1100px"
                width={ringFrontView.width}
                height={ringFrontView.height}
                fetchPriority="high"
                alt="SynoRing seen from the front, its touch surface at the top"
              />
            </div>
          </section>

          <section className="product-intro" id="why">
            <p className="intro-line">
              SynoRing turns finger movements and thumb touches
              <br className="desktop-break" /> into controls for your AR
              glasses.
            </p>
            <div className="product-showcase">
              <div className="product-caption">
                <span>Meet SynoRing</span>
                <p>
                  A gesture controller.
                  <br />
                  Made to feel natural.
                </p>
              </div>
              <div className="showcase-art">
                <ProductVisual slot="detail" />
              </div>
              <div className="product-caption">
                <span>For your spatial world</span>
                <p>
                  AR control.
                  <br />
                  Without the interruption.
                </p>
              </div>
            </div>
            <h2>
              Your AR glasses.
              <br />
              Controlled from your ring.
            </h2>
            <p className="intro-function">
              Select with a tap. Scroll with a glide. Adjust with a circle.
            </p>
          </section>

          <section
            className="product-facts content-width"
            aria-label="What SynoRing does"
          >
            <article>
              <span>01 / Input</span>
              <h3>Touch + movement</h3>
              <p>
                Thumb touches and finger motion work together. Tap, glide, hold,
                or circle to control what is in view.
              </p>
            </article>
            <article>
              <span>02 / Experience</span>
              <h3>A smaller gesture</h3>
              <p>
                Designed for subtle control at your side, without speaking a
                command or reaching toward a floating screen.
              </p>
            </article>
            <article>
              <span>03 / Application</span>
              <h3>Made for spatial apps</h3>
              <p>
                Explore music, reading, and navigation today in our interactive
                browser demo.
              </p>
            </article>
          </section>

          {productMedia.lifestyle && (
            <section
              className="lifestyle-section content-width"
              aria-label="SynoRing in everyday life"
            >
              <div className="lifestyle-media">
                <img
                  src={productMedia.lifestyle.src}
                  srcSet={productMedia.lifestyle.srcSet}
                  alt={productMedia.lifestyle.alt}
                  loading="lazy"
                  decoding="async"
                />
                <div className="lifestyle-copy">
                  <h2>
                    Control your glasses.
                    <br />
                    Keep your hands relaxed.
                  </h2>
                  <p>
                    Navigate, read, and change the music
                    <br />
                    with small movements at your side.
                  </p>
                </div>
              </div>
            </section>
          )}

          <section
            className="gestures-section content-width"
            id="gestures"
            aria-labelledby="demo-strip-title"
          >
            <div className="demo-strip">
              <div className="demo-strip-copy">
                <span className="eyebrow">Interactive demo</span>
                <h2 id="demo-strip-title">
                  See through the glasses.
                  <br />
                  Control it with the ring.
                </h2>
              </div>
              <ul className="demo-strip-gestures">
                <li>
                  <TapIcon />
                  Tap to select
                </li>
                <li>
                  <GlideIcon />
                  Glide to scroll
                </li>
                <li>
                  <CircleIcon />
                  Circle to adjust
                </li>
                <li>
                  <HoldIcon />
                  Hold for apps
                </li>
              </ul>
              <a className="button" href="/demo">
                Try the demo
              </a>
            </div>
          </section>

          <section
            className="possibilities content-width"
            aria-labelledby="possibilities-title"
          >
            <h2 id="possibilities-title">
              One ring.
              <br />
              So many ways to stay present.
            </h2>
            <div className="possibility-grid">
              <article className="possibility music">
                <div className="music-visual" aria-hidden="true">
                  <div className="record">
                    <div />
                  </div>
                  <span className="play-symbol">
                    <PauseIcon />
                  </span>
                </div>
                <div className="possibility-copy">
                  <h3>
                    Your music.
                    <br />
                    Your moment.
                  </h3>
                  <p>Adjust the volume. Keep your rhythm.</p>
                </div>
              </article>
              <article className="possibility reading">
                <div className="reading-visual" aria-hidden="true">
                  <span>
                    A little space
                    <br />
                    <em>to think.</em>
                  </span>
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <div className="possibility-copy">
                  <h3>
                    Follow the thought.
                    <br />
                    Not the screen.
                  </h3>
                  <p>Move through a page with a glide.</p>
                </div>
              </article>
              <article className="possibility navigation">
                <div className="navigation-visual" aria-hidden="true">
                  <div className="navigation-path" />
                  <NavigationIcon className="navigation-turn" />
                </div>
                <div className="possibility-copy">
                  <h3>
                    Eyes up.
                    <br />
                    World open.
                  </h3>
                  <p>Your next direction, a tap away.</p>
                </div>
              </article>
            </div>
          </section>

          <section
            className="technology-section content-width"
            id="technology"
            aria-labelledby="technology-title"
          >
            <div className="technology-heading">
              <h2 id="technology-title">
                Motion and touch.
                <br />
                Working together.
              </h2>
              <p>Sensors read your movement. Touch gives it intent.</p>
            </div>
            <figure className="exploded-stage">
              <div className="exploded-art">
                <img
                  className="exploded-image"
                  src={explodedView.src}
                  srcSet={explodedView.srcSet}
                  sizes="(max-width: 760px) 220px, 320px"
                  width={explodedView.width}
                  height={explodedView.height}
                  loading="lazy"
                  decoding="async"
                  alt="SynoRing exploded view: ceramic shell, flexible circuit, arc battery, and steel inner band"
                />
                {explodedLayers.map((layer, index) => (
                  <span
                    key={layer.id}
                    className={`exploded-marker side-${layer.side}`}
                    style={{ top: `${explodedView.layers[layer.id]}%` }}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                ))}
              </div>
              <ol className="exploded-callouts">
                {explodedLayers.map((layer, index) => (
                  <li
                    key={layer.id}
                    className={`side-${layer.side}`}
                    style={{ top: `${explodedView.layers[layer.id]}%` }}
                  >
                    <span className="exploded-index">0{index + 1}</span>
                    <h3>{layer.title}</h3>
                    <p>{layer.text}</p>
                  </li>
                ))}
              </ol>
              <figcaption>
                Illustrative exploded view. Parts are separated for clarity.
                <Note number={3} />
              </figcaption>
            </figure>
          </section>

          <section className="connection-section content-width">
            <div className="section-heading">
              <div>
                <span className="eyebrow">The connection</span>
                <h2>
                  From a small gesture
                  <br />
                  to an action in view.
                </h2>
              </div>
              <p>
                Our integration direction connects ring input to spatial
                applications through a phone-side software layer. Device support
                will be confirmed through testing.
              </p>
            </div>
            <ol className="connection-flow">
              <li>
                <span className="step-index">01</span>
                <h3>SynoRing</h3>
                <p>Touch and motion input</p>
              </li>
              <li>
                <span className="step-index">02</span>
                <h3>Software layer</h3>
                <p>Interpret and map gestures</p>
              </li>
              <li>
                <span className="step-index">03</span>
                <h3>Your AR app</h3>
                <p>Select, scroll, and adjust</p>
              </li>
            </ol>
          </section>

          <section className="home-developer content-width">
            <div>
              <span className="eyebrow">For developers</span>
              <h2>
                Your app.
                <br />A new way in.
              </h2>
              <p>
                Building a spatial reader, a media interface, or something we
                have not imagined? Help shape how ring input fits your
                application.
              </p>
              <ArrowLink href="/developers">Build with SynoRing</ArrowLink>
            </div>
            <div className="mapping-preview">
              <div>
                <strong>Tap</strong>
                <span>Select a track</span>
              </div>
              <div>
                <strong>Glide</strong>
                <span>Move through a page</span>
              </div>
              <div>
                <strong>Circle</strong>
                <span>Bring a map closer</span>
              </div>
              <p>Your context defines the action.</p>
            </div>
          </section>

          <section className="closing-section" id="early-access">
            <div className="closing-copy">
              <h2>
                Get closer to
                <br />
                the first SynoRing.
              </h2>
              <p>
                Follow product progress, developer pilots, and launch updates.
              </p>
              <a className="button button-dark" href={earlyAccessEmail}>
                Request early access
              </a>
            </div>
            <ul className="closing-lineup" aria-label="Four finishes">
              {finishes.map((finish) => (
                <li key={finish.id}>
                  <img
                    src={ringRenders[finish.id].src}
                    srcSet={ringRenders[finish.id].srcSet}
                    sizes="(max-width: 760px) 44vw, 260px"
                    width={ringRenderSize.width}
                    height={ringRenderSize.height}
                    loading="lazy"
                    decoding="async"
                    alt={ringRenders[finish.id].alt}
                  />
                  <span>{finish.name}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="faq-section content-width" id="faq">
            <h2>A little more to know.</h2>
            <div className="faq-list">
              <details id="progress">
                <summary>
                  When can I get SynoRing? <PlusIcon />
                </summary>
                <p>
                  Early means early. We are refining the interaction prototype,
                  with developer pilots and production validation to follow.
                  Join early access for updates; we are not taking deposits.
                  <Note number={2} />
                  <Note number={4} />
                </p>
              </details>
              <details>
                <summary>
                  Which AR glasses will it work with? <PlusIcon />
                </summary>
                <p>
                  Compatibility is being explored. Our direction is a phone-side
                  SDK that connects with AR ecosystems. Supported devices will
                  be announced after validation.
                </p>
              </details>
              <details>
                <summary>
                  Can I get involved as a developer? <PlusIcon />
                </summary>
                <p>
                  We would love to hear from people building spatial interfaces.{" "}
                  <a href={earlyAccessEmail}>
                    Tell us what you are working on.
                  </a>
                </p>
              </details>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
