import type { ReactNode } from "react";
import { siteCopy } from "./copy/site";
import { fill } from "./text";
import { languageOptions, localePath, type Lang } from "./i18n";
import { ArrowIcon, GitHubIcon, PlusIcon, XIcon } from "./icons";
import { MobileNavigation } from "./interactions";
import { LanguageOptions } from "./language-options";
import { navigation, site, type NavigationPath } from "./site";
import { breadcrumb, jsonLd } from "./structured-data";

export function Note({ lang, number }: { lang: Lang; number: number }) {
  return (
    <sup className="note-ref">
      <a
        href={`#product-note-${number}`}
        aria-label={fill(siteCopy[lang].noteLabel, { number })}
      >
        {number}
      </a>
    </sup>
  );
}

export function SiteHeader({
  lang,
  active = "/",
  home = false,
}: {
  lang: Lang;
  active?: NavigationPath;
  home?: boolean;
}) {
  const copy = siteCopy[lang];
  const languageChoices = languageOptions(lang, active);
  return (
    <header className={`nav-wrap${home ? "" : " nav-solid"}`}>
      <a className="brand" href={localePath(lang, "/")} aria-label={copy.homeLabel}>
        <img
          className="brand-wordmark"
          src="/wordmark.svg"
          alt=""
          width="368"
          height="122"
        />
      </a>
      <nav className="desktop-navigation" aria-label={copy.mainNavigation}>
        {navigation.map((href) => (
          <a
            key={href}
            href={localePath(lang, href)}
            aria-current={active === href ? "page" : undefined}
          >
            {copy.navigation[href]}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <div className="language-switch">
          <LanguageOptions options={languageChoices} />
        </div>
        <a
          className={`button button-small${home ? "" : " button-dark"}`}
          href={localePath(lang, "/store#early-access")}
        >
          {copy.earlyAccess}
        </a>
        <MobileNavigation
          active={active}
          copy={copy.mobileNavigation}
          links={navigation.map((href) => [localePath(lang, href), copy.navigation[href], href])}
          languages={languageChoices}
        />
      </div>
    </header>
  );
}

export function SiteFooter({ lang }: { lang: Lang }) {
  const { footer } = siteCopy[lang];
  return (
    <footer className="footer content-width">
      <div className="footer-top">
        <div className="footer-brand">
          <a
            className="footer-wordmark"
            href={localePath(lang, "/")}
            aria-label={footer.backToTop}
          >
            <img src="/wordmark.svg" alt="" width="368" height="122" />
          </a>
          <p>{footer.tagline}</p>
          <div className="footer-social">
            {site.social.map((profile) => (
              <a
                key={profile.name}
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={fill(footer.social, { name: profile.name })}
              >
                {profile.id === "github" ? <GitHubIcon /> : <XIcon />}
              </a>
            ))}
          </div>
        </div>
        <div className="footer-link-groups">
          {footer.groups.map((group) => (
            <div key={group.title}>
              <span>{group.title}</span>
              {group.links.map(([href, label]) => (
                <a
                  key={href}
                  href={href.startsWith("/") ? localePath(lang, href) : href}
                >
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>{footer.copyright}</span>
        <span>{footer.origin}</span>
      </div>
      <details className="product-notes" id="product-notes">
        <summary>
          {footer.notesTitle} <PlusIcon />
        </summary>
        <ol>
          {footer.notes.map((note, index) => (
            <li key={index} id={`product-note-${index + 1}`}>
              {note}
            </li>
          ))}
        </ol>
      </details>
    </footer>
  );
}

export function PageShell({
  lang,
  active,
  structuredData = [],
  children,
}: {
  lang: Lang;
  active: NavigationPath;
  /** schema.org items for this page; a breadcrumb is always added. */
  structuredData?: object[];
  children: ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(...structuredData, breadcrumb(lang, active)),
        }}
      />
      <a className="skip-link" href="#main">
        {siteCopy[lang].skipLink}
      </a>
      <div className="site-frame inner-site" id="top">
        <SiteHeader lang={lang} active={active} />
        <main id="main">{children}</main>
        <SiteFooter lang={lang} />
      </div>
    </>
  );
}

export function ArrowLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a className="arrow-link" href={href}>
      {children}
      <ArrowIcon />
    </a>
  );
}

export function DevelopmentSteps({ lang }: { lang: Lang }) {
  return (
    <ol className="development-steps">
      {siteCopy[lang].developmentSteps.map((step, index) => (
        <li key={step.stage} className={index === 0 ? "current" : undefined}>
          <span>{step.stage}</span>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
