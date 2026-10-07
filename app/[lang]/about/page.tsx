import type { Metadata } from "next";
import { aboutCopy } from "../../copy/about";
import { siteCopy } from "../../copy/site";
import { localePath, pageLang, type PageProps } from "../../i18n";
import { ArrowIcon } from "../../icons";
import { pageMetadata } from "../../site";
import { DevelopmentSteps, PageShell } from "../../site-components";
import { Br } from "../../text";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = await pageLang(params);
  const { title, description } = aboutCopy[lang];
  return pageMetadata(lang, title, description, "/about");
}

export default async function AboutPage({ params }: PageProps) {
  const lang = await pageLang(params);
  const copy = aboutCopy[lang];
  return (
    <PageShell lang={lang} active="/about">
      <section className="about-hero content-width">
        <span className="eyebrow">{copy.hero.eyebrow}</span>
        <h1>
          <Br text={copy.hero.title} />
        </h1>
        <div className="about-intro">
          <p>
            <Br text={copy.hero.lead} />
          </p>
          <div>
            {copy.hero.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
      <section className="about-statement">
        <div className="content-width">
          <div className="about-emblem">
            <img src="/logo.svg" width="220" height="220" alt={copy.statement.emblemAlt} />
          </div>
          <div>
            <span className="eyebrow">{copy.statement.eyebrow}</span>
            <h2>
              <Br text={copy.statement.title} />
              <br />
              <em>{copy.statement.emphasis}</em>
            </h2>
            <p>{copy.statement.text}</p>
          </div>
        </div>
      </section>
      <section className="page-section content-width">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{copy.principles.eyebrow}</span>
            <h2>{copy.principles.title}</h2>
          </div>
          <p>{copy.principles.text}</p>
        </div>
        <div className="principle-grid">
          {copy.principles.items.map((item, index) => (
            <article key={item.title}>
              <span>0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="about-development content-width" id="development">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{copy.development.eyebrow}</span>
            <h2>{copy.development.title}</h2>
          </div>
          <p>{copy.development.text}</p>
        </div>
        <DevelopmentSteps lang={lang} />
      </section>
      <section className="about-contact content-width">
        <div>
          <span className="eyebrow">{copy.contact.eyebrow}</span>
          <h2>
            <Br text={copy.contact.title} />
          </h2>
          <p>
            <Br text={copy.contact.text} />
          </p>
        </div>
        <div className="contact-rows">
          <a href="mailto:contact@synoring.ai">
            <span>
              <small>{copy.contact.general}</small>
              <strong>contact@synoring.ai</strong>
            </span>
            <ArrowIcon />
          </a>
          <a href={siteCopy[lang].developerEmail}>
            <span>
              <small>{copy.contact.builders}</small>
              <strong>{copy.contact.buildersLink}</strong>
            </span>
            <ArrowIcon />
          </a>
          <a href={localePath(lang, "/demo")}>
            <span>
              <small>{copy.contact.demo}</small>
              <strong>{copy.contact.demoLink}</strong>
            </span>
            <ArrowIcon />
          </a>
        </div>
      </section>
    </PageShell>
  );
}
