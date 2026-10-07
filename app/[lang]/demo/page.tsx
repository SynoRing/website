import type { Metadata } from "next";
import { GestureExperience } from "../../ar-experience";
import { demoCopy } from "../../copy/demo";
import { localePath, pageLang, type PageProps } from "../../i18n";
import {
  CircleIcon,
  GlideIcon,
  HoldIcon,
  MusicIcon,
  NavigationIcon,
  ReadingIcon,
  TapIcon,
} from "../../icons";
import { pageMetadata } from "../../site";
import { ArrowLink, PageShell } from "../../site-components";
import { Br } from "../../text";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = await pageLang(params);
  const { title, description } = demoCopy[lang];
  return pageMetadata(lang, title, description, "/demo");
}

const gestureIcons = [TapIcon, GlideIcon, CircleIcon, HoldIcon];
const sceneIcons = [MusicIcon, ReadingIcon, NavigationIcon];

export default async function DemoPage({ params }: PageProps) {
  const lang = await pageLang(params);
  const copy = demoCopy[lang];
  return (
    <PageShell lang={lang} active="/demo">
      <section className="page-heading content-width demo-heading">
        <div>
          <span className="eyebrow">{copy.heading.eyebrow}</span>
          <h1>
            <Br text={copy.heading.title} />
          </h1>
        </div>
        <div>
          <p>{copy.heading.text}</p>
          <span className="quiet-label">{copy.heading.label}</span>
        </div>
      </section>
      <section className="demo-experience" id="experience">
        <GestureExperience copy={copy.experience} />
      </section>
      <section className="page-section content-width">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{copy.guide.eyebrow}</span>
            <h2>
              <Br text={copy.guide.title} />
            </h2>
          </div>
          <p>{copy.guide.text}</p>
        </div>
        <div className="gesture-guide">
          {copy.guide.gestures.map((gesture, index) => {
            const Icon = gestureIcons[index];
            return (
              <article key={gesture.name}>
                <span className="gesture-mark">
                  <Icon />
                </span>
                <h3>{gesture.name}</h3>
                <p>{gesture.text}</p>
                <span className="guide-key">{gesture.keys}</span>
              </article>
            );
          })}
        </div>
      </section>
      <section className="scene-section content-width">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{copy.scenes.eyebrow}</span>
            <h2>{copy.scenes.title}</h2>
          </div>
          <ArrowLink href="#experience">{copy.scenes.link}</ArrowLink>
        </div>
        <div className="scene-list">
          {copy.scenes.items.map((scene, index) => {
            const Icon = sceneIcons[index];
            return (
              <article key={scene.title}>
                <span className="scene-icon">
                  <Icon />
                </span>
                <div>
                  <h3>{scene.title}</h3>
                  <p>{scene.text}</p>
                </div>
                <div>
                  <span>{copy.scenes.tryCircle}</span>
                  <p>{scene.circle}</p>
                </div>
                <span className="scene-note">{scene.note}</span>
              </article>
            );
          })}
        </div>
        <div className="demo-footnote">
          <p>{copy.scenes.keyboard}</p>
        </div>
      </section>
      <section className="page-cta content-width">
        <div>
          <span className="eyebrow">{copy.cta.eyebrow}</span>
          <h2>{copy.cta.title}</h2>
          <p>{copy.cta.text}</p>
        </div>
        <a className="button button-dark" href={localePath(lang, "/developers")}>
          {copy.cta.button}
        </a>
      </section>
    </PageShell>
  );
}
