import { homeCopy } from "../copy/home";
import { siteCopy } from "../copy/site";
import { localePath, pageLang, type PageProps } from "../i18n";
import {
  ArrowIcon,
  CircleIcon,
  GlideIcon,
  HoldIcon,
  NavigationIcon,
  PauseIcon,
  PlusIcon,
  TapIcon,
} from "../icons";
import {
  ProductVisual,
  explodedView,
  productMedia,
  ringFrontView,
  ringRenders,
  ringRenderSize,
} from "../product-visual";
import { RotatingWords } from "../rotating-words";
import { ArrowLink, Note, SiteFooter, SiteHeader } from "../site-components";
import { finishes } from "../store/product";
import { jsonLd, organization, product, website } from "../structured-data";
import { Br, fill } from "../text";
import { WaitlistSignup } from "../waitlist-form";

const explodedLayers = [
  { id: "shell", side: "left" },
  { id: "circuit", side: "right" },
  { id: "battery", side: "left" },
  { id: "band", side: "right" },
] as const;

const demoIcons = [TapIcon, GlideIcon, CircleIcon, HoldIcon];

export default async function Home({ params }: PageProps) {
  const lang = await pageLang(params);
  const copy = homeCopy[lang];
  const shared = siteCopy[lang];
  const path = (to: string) => localePath(lang, to);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(website(lang), organization, product(lang)),
        }}
      />
      <a className="skip-link" href="#main">
        {shared.skipLink}
      </a>
      <div className="site-frame" id="top">
        <a className="news-bar" href="https://wacv27seai.synoring.ai/">
          {copy.news}
          <span>{copy.newsDate}</span>
          <ArrowIcon />
        </a>
        <SiteHeader lang={lang} home />
        <main id="main">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-copy">
              <h1 id="hero-title">
                <span className="sr-only">{copy.hero.summary}</span>
                {copy.hero.lines.map((line) => {
                  const [before, after] = line.split("{device}");
                  return (
                    <span key={line} className="hero-title-line" aria-hidden="true">
                      {before}
                      {after !== undefined && (
                        <>
                          <RotatingWords words={copy.hero.devices} />
                          {after}
                        </>
                      )}
                    </span>
                  );
                })}
              </h1>
              <p>{copy.hero.subtitle}</p>
              <a className="button" href="#why">
                {copy.hero.cta}
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
                alt={copy.hero.alt}
              />
            </div>
          </section>

          <section className="product-intro" id="why">
            <p className="intro-line">
              {copy.intro.line[0]}
              <br className="desktop-break" /> {copy.intro.line[1]}
            </p>
            <div className="product-showcase">
              <div className="product-caption">
                <span>{copy.intro.captions[0].label}</span>
                <p>
                  <Br text={copy.intro.captions[0].text} />
                </p>
              </div>
              <div className="showcase-art">
                <ProductVisual
                  slot="detail"
                  alt={fill(shared.renderAlt, { finish: shared.finishes["rose-gold"] })}
                />
              </div>
              <div className="product-caption">
                <span>{copy.intro.captions[1].label}</span>
                <p>
                  <Br text={copy.intro.captions[1].text} />
                </p>
              </div>
            </div>
            <h2>
              <Br text={copy.intro.title} />
            </h2>
            <p className="intro-function">{copy.intro.gestures}</p>
          </section>

          <section className="product-facts content-width" aria-label={copy.factsLabel}>
            {copy.facts.map((fact) => (
              <article key={fact.stage}>
                <span>{fact.stage}</span>
                <h3>{fact.title}</h3>
                <p>{fact.text}</p>
              </article>
            ))}
          </section>

          {productMedia.lifestyle && (
            <section
              className="lifestyle-section content-width"
              aria-label={copy.lifestyle.label}
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
                    <Br text={copy.lifestyle.title} />
                  </h2>
                  <p>
                    <Br text={copy.lifestyle.text} />
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
                <span className="eyebrow">{copy.demo.eyebrow}</span>
                <h2 id="demo-strip-title">
                  <Br text={copy.demo.title} />
                </h2>
              </div>
              <ul className="demo-strip-gestures">
                {copy.demo.gestures.map((gesture, index) => {
                  const Icon = demoIcons[index];
                  return (
                    <li key={gesture}>
                      <Icon />
                      {gesture}
                    </li>
                  );
                })}
              </ul>
              <a className="button" href={path("/demo")}>
                {copy.demo.cta}
              </a>
            </div>
          </section>

          <section
            className="possibilities content-width"
            aria-labelledby="possibilities-title"
          >
            <h2 id="possibilities-title">
              <Br text={copy.possibilities.title} />
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
                    <Br text={copy.possibilities.music.title} />
                  </h3>
                  <p>{copy.possibilities.music.text}</p>
                </div>
              </article>
              <article className="possibility reading">
                <div className="reading-visual" aria-hidden="true">
                  <span>
                    {copy.possibilities.readingArt.text}
                    <br />
                    <em>{copy.possibilities.readingArt.emphasis}</em>
                  </span>
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <div className="possibility-copy">
                  <h3>
                    <Br text={copy.possibilities.reading.title} />
                  </h3>
                  <p>{copy.possibilities.reading.text}</p>
                </div>
              </article>
              <article className="possibility navigation">
                <div className="navigation-visual" aria-hidden="true">
                  <div className="navigation-path" />
                  <NavigationIcon className="navigation-turn" />
                </div>
                <div className="possibility-copy">
                  <h3>
                    <Br text={copy.possibilities.navigation.title} />
                  </h3>
                  <p>{copy.possibilities.navigation.text}</p>
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
                <Br text={copy.technology.title} />
              </h2>
              <p>{copy.technology.text}</p>
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
                  alt={copy.technology.alt}
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
                    <h3>{copy.technology.layers[layer.id].title}</h3>
                    <p>{copy.technology.layers[layer.id].text}</p>
                  </li>
                ))}
              </ol>
              <figcaption>
                {copy.technology.caption}
                <Note lang={lang} number={3} />
              </figcaption>
            </figure>
          </section>

          <section className="connection-section content-width">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{copy.connection.eyebrow}</span>
                <h2>
                  <Br text={copy.connection.title} />
                </h2>
              </div>
              <p>{copy.connection.text}</p>
            </div>
            <ol className="connection-flow">
              {copy.connection.steps.map(([title, text], index) => (
                <li key={title}>
                  <span className="step-index">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="home-developer content-width">
            <div>
              <span className="eyebrow">{copy.developers.eyebrow}</span>
              <h2>
                <Br text={copy.developers.title} />
              </h2>
              <p>{copy.developers.text}</p>
              <ArrowLink href={path("/developers")}>{copy.developers.link}</ArrowLink>
            </div>
            <div className="mapping-preview">
              {copy.developers.mappings.map(([gesture, action]) => (
                <div key={gesture}>
                  <strong>{gesture}</strong>
                  <span>{action}</span>
                </div>
              ))}
              <p>{copy.developers.note}</p>
            </div>
          </section>

          <section className="closing-section" id="early-access">
            <div className="closing-copy">
              <h2>
                <Br text={copy.closing.title} />
              </h2>
              <p>{copy.closing.text}</p>
              <WaitlistSignup lang={lang} copy={shared.waitlist} />
            </div>
            <ul className="closing-lineup" aria-label={copy.closing.lineup}>
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
                    alt={fill(shared.renderAlt, { finish: shared.finishes[finish.id] })}
                  />
                  <span>{shared.finishes[finish.id]}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="faq-section content-width" id="faq">
            <h2>{copy.faq.title}</h2>
            <div className="faq-list">
              <details id="progress">
                <summary>
                  {copy.faq.shipping.question} <PlusIcon />
                </summary>
                <p>
                  {copy.faq.shipping.answer}
                  <Note lang={lang} number={2} />
                  <Note lang={lang} number={4} />
                </p>
              </details>
              <details>
                <summary>
                  {copy.faq.compatibility.question} <PlusIcon />
                </summary>
                <p>{copy.faq.compatibility.answer}</p>
              </details>
              <details>
                <summary>
                  {copy.faq.developers.question} <PlusIcon />
                </summary>
                <p>
                  {copy.faq.developers.answer}{" "}
                  <a href={shared.developerEmail}>{copy.faq.developers.link}</a>
                </p>
              </details>
            </div>
          </section>
        </main>
        <SiteFooter lang={lang} />
      </div>
    </>
  );
}
