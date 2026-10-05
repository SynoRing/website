import type { ReactNode } from "react";
import { ArrowIcon, GitHubIcon, PlusIcon, XIcon } from "./icons";
import { MobileNavigation } from "./interactions";
import { navigation, site } from "./site";

export function Note({ number }: { number: number }) {
  return (
    <sup className="note-ref">
      <a
        href={`#product-note-${number}`}
        aria-label={`See product note ${number}`}
      >
        {number}
      </a>
    </sup>
  );
}

export function SiteHeader({
  active = "/",
  home = false,
}: {
  active?: string;
  home?: boolean;
}) {
  return (
    <header className={`nav-wrap${home ? "" : " nav-solid"}`}>
      <a className="brand" href="/" aria-label="SynoRing home">
        <img
          className="brand-wordmark"
          src="/wordmark.svg"
          alt=""
          width="368"
          height="122"
        />
      </a>
      <nav className="desktop-navigation" aria-label="Main navigation">
        {navigation.map(([href, label]) => (
          <a
            key={href}
            href={href}
            aria-current={active === href ? "page" : undefined}
          >
            {label}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <a
          className={`button button-small${home ? "" : " button-dark"}`}
          href="/store#early-access"
        >
          Get early access
        </a>
        <MobileNavigation active={active} />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer content-width">
      <div className="footer-top">
        <div className="footer-brand">
          <a
            className="footer-wordmark"
            href="/"
            aria-label="SynoRing — back to top"
          >
            <img src="/wordmark.svg" alt="" width="368" height="122" />
          </a>
          <p>Gesture becomes intent.</p>
          <div className="footer-social">
            {site.social.map((profile) => (
              <a
                key={profile.name}
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`SynoRing on ${profile.name}`}
              >
                {profile.id === "github" ? <GitHubIcon /> : <XIcon />}
              </a>
            ))}
          </div>
        </div>
        <div className="footer-link-groups">
          <div>
            <span>Explore</span>
            <a href="/#why">The ring</a>
            <a href="/demo">Demo</a>
            <a href="/store">Store</a>
          </div>
          <div>
            <span>Build with us</span>
            <a href="/developers">Developers</a>
            <a href="/#technology">Technology</a>
            <a href="/about#development">Development</a>
          </div>
          <div>
            <span>SynoRing</span>
            <a href="/about">About</a>
            <a href="mailto:hello@synoring.com">Contact</a>
            <a href="/#faq">Questions</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 SynoRing Labs</span>
        <span>Designed in the US. Manufactured in China.</span>
      </div>
      <details className="product-notes" id="product-notes">
        <summary>
          Product notes <PlusIcon />
        </summary>
        <ol>
          <li id="product-note-1">
            Product imagery is a concept rendering for illustrative purposes.
            Final industrial design, materials, dimensions, controls, and finish
            may change.
          </li>
          <li id="product-note-2">
            Roadmap stages and launch timing reflect current development plans
            and may change as testing and validation progress.
          </li>
          <li id="product-note-3">
            Features, materials, compatibility, sensing architecture, and other
            specifications are development targets, not final shipping
            specifications.
          </li>
          <li id="product-note-4">
            Joining early access is free and is not a purchase, deposit,
            reservation, or guarantee of prototype access or product
            availability.
          </li>
          <li id="product-note-5">
            The browser demo is an interaction concept. Music is silent, the
            route is fictional, and final hardware mappings may evolve.
          </li>
        </ol>
      </details>
    </footer>
  );
}

export function PageShell({
  active,
  children,
}: {
  active: string;
  children: ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="site-frame inner-site" id="top">
        <SiteHeader active={active} />
        <main id="main">{children}</main>
        <SiteFooter />
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

export function DevelopmentSteps() {
  return (
    <ol className="development-steps">
      <li className="current">
        <span>01 / Current focus</span>
        <h3>Interaction prototype</h3>
        <p>Refining the gestures, feedback, and everyday control experience.</p>
      </li>
      <li>
        <span>02 / Next</span>
        <h3>Developer pilots</h3>
        <p>
          Explore real applications and device integrations with early partners.
        </p>
      </li>
      <li>
        <span>03 / Ahead</span>
        <h3>Production validation</h3>
        <p>
          Validate the hardware and publish confirmed specifications before
          launch.
        </p>
      </li>
    </ol>
  );
}
