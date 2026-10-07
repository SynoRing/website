import type { Metadata } from "next";
import { developersCopy } from "../../copy/developers";
import { siteCopy } from "../../copy/site";
import { localePath, pageLang, type PageProps } from "../../i18n";
import { GitHubIcon, PlusIcon } from "../../icons";
import { pageMetadata, site } from "../../site";
import { ArrowLink, PageShell } from "../../site-components";
import { Br } from "../../text";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = await pageLang(params);
  const { title, description } = developersCopy[lang];
  return pageMetadata(lang, title, description, "/developers");
}

export default async function DevelopersPage({ params }: PageProps) {
  const lang = await pageLang(params);
  const copy = developersCopy[lang];
  const { developerEmail } = siteCopy[lang];
  return (
    <PageShell lang={lang} active="/developers">
      <section className="developer-hero content-width">
        <div className="developer-hero-copy">
          <span className="eyebrow">{copy.hero.eyebrow}</span>
          <h1>
            <Br text={copy.hero.title} />
          </h1>
          <p>{copy.hero.text}</p>
          <div className="inline-actions">
            <a
              className="button button-dark"
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon />
              {copy.hero.github}
            </a>
            <ArrowLink href={developerEmail}>{copy.hero.pilot}</ArrowLink>
          </div>
          <span className="quiet-label">{copy.hero.status}</span>
        </div>
        <div className="developer-console" aria-label={copy.console.label}>
          <div className="console-header">
            <span className="live-dot" />
            {copy.console.title}
            <span>{copy.console.badge}</span>
          </div>
          <div className="console-orbit">
            <img src="/logo.svg" width="90" height="90" alt="SynoRing" />
            <span className="orbit-tag tag-tap">tap</span>
            <span className="orbit-tag tag-glide">glide</span>
            <span className="orbit-tag tag-circle">circle</span>
          </div>
          <div className="console-event">
            <span>gesture</span>
            <strong>circle.clockwise</strong>
          </div>
          <div className="console-event">
            <span>app context</span>
            <strong>reader</strong>
          </div>
          <div className="console-result">
            <span>{copy.console.result}</span>
            <strong>
              {copy.console.action} <PlusIcon />
            </strong>
          </div>
        </div>
      </section>
      <section className="page-section content-width" id="integration">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{copy.integration.eyebrow}</span>
            <h2>
              <Br text={copy.integration.title} />
            </h2>
          </div>
          <p>{copy.integration.text}</p>
        </div>
        <div className="integration-grid">
          {copy.integration.steps.map((step) => (
            <article key={step.stage}>
              <span>{step.stage}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <ul>
                {step.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="developer-mappings content-width">
        <div>
          <span className="eyebrow">{copy.mappings.eyebrow}</span>
          <h2>
            <Br text={copy.mappings.title} />
          </h2>
          <p>{copy.mappings.text}</p>
          <ArrowLink href={localePath(lang, "/demo")}>{copy.mappings.link}</ArrowLink>
        </div>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">{copy.mappings.caption}</caption>
            <thead>
              <tr>
                <th>{copy.mappings.headers[0]}</th>
                <th>{copy.mappings.headers[1]}</th>
              </tr>
            </thead>
            <tbody>
              {copy.mappings.rows.map(([input, action]) => (
                <tr key={input}>
                  <th>{input}</th>
                  <td>{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="pilot-panel content-width" id="pilots">
        <div>
          <span className="eyebrow">{copy.pilot.eyebrow}</span>
          <h2>
            <Br text={copy.pilot.title} />
          </h2>
          <p>{copy.pilot.text}</p>
          <a className="button" href={developerEmail}>
            {copy.pilot.cta}
          </a>
        </div>
        <div className="pilot-checklist">
          {copy.pilot.questions.map((question, index) => (
            <article key={question.title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{question.title}</h3>
                <p>{question.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="release-status content-width">
        <h2>{copy.status.title}</h2>
        <div>
          {copy.status.items.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
