import { PageShell, ArrowLink } from "../site-components";
import { developerEmail, pageMetadata, site } from "../site";
import { GitHubIcon, PlusIcon } from "../icons";

export const metadata = pageMetadata(
  "Developers",
  "Explore SynoRing’s developer direction: gesture inputs for spatial applications, integration planning, and early developer pilot interest.",
  "/developers",
);

export default function DevelopersPage() {
  return (
    <PageShell active="/developers">
      <section className="developer-hero content-width">
        <div className="developer-hero-copy">
          <span className="eyebrow">SynoRing for developers</span>
          <h1>
            Give your spatial app
            <br />a sense of touch.
          </h1>
          <p>
            Explore a new input surface for AR. Map a tap, a glide, or a
            circular movement to the actions that matter in your application.
          </p>
          <div className="inline-actions">
            <a
              className="button button-dark"
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon />
              View on GitHub
            </a>
            <ArrowLink href={developerEmail}>
              Discuss a developer pilot
            </ArrowLink>
          </div>
          <span className="quiet-label">
            Early development · Public SDK not yet available
          </span>
        </div>
        <div
          className="developer-console"
          aria-label="Conceptual gesture mapping"
        >
          <div className="console-header">
            <span className="live-dot" />
            Gesture mapping<span>Concept</span>
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
            <span>Mapped action</span>
            <strong>
              Increase text size <PlusIcon />
            </strong>
          </div>
        </div>
      </section>
      <section className="page-section content-width" id="integration">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Integration direction</span>
            <h2>
              Keep the input small.
              <br />
              Make the application yours.
            </h2>
          </div>
          <p>
            We are exploring a phone-side SDK that connects ring input with AR
            ecosystems. The following describes the intended flow, rather than
            an available API contract.
          </p>
        </div>
        <div className="integration-grid">
          <article>
            <span>01 / Sense</span>
            <h3>Ring input</h3>
            <p>
              Capture thumb interactions and movement of the ring-bearing
              finger.
            </p>
            <ul>
              <li>Touch and glide</li>
              <li>Motion and rotation</li>
            </ul>
          </article>
          <article>
            <span>02 / Interpret</span>
            <h3>Software layer</h3>
            <p>
              Translate sensing into gestures that applications can map to
              actions.
            </p>
            <ul>
              <li>Gesture interpretation</li>
              <li>Connection state</li>
            </ul>
          </article>
          <article>
            <span>03 / Respond</span>
            <h3>Your application</h3>
            <p>Decide what each gesture does in the active screen or mode.</p>
            <ul>
              <li>Context-aware actions</li>
              <li>Visible user feedback</li>
            </ul>
          </article>
        </div>
      </section>
      <section className="developer-mappings content-width">
        <div>
          <span className="eyebrow">Start with the interaction</span>
          <h2>
            Same input.
            <br />
            Your meaning.
          </h2>
          <p>
            A circle can change volume, scale text, or zoom a scene. Start with
            the action your user needs, then choose a gesture that feels
            predictable.
          </p>
          <ArrowLink href="/demo">See these mappings in action</ArrowLink>
        </div>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">
              Example mappings used in our browser demo
            </caption>
            <thead>
              <tr>
                <th>Input</th>
                <th>Application action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Tap</th>
                <td>Select / Confirm / Play</td>
              </tr>
              <tr>
                <th>Glide</th>
                <td>Scroll / Browse / Move focus</td>
              </tr>
              <tr>
                <th>Clockwise circle</th>
                <td>Increase / Zoom in</td>
              </tr>
              <tr>
                <th>Counterclockwise circle</th>
                <td>Decrease / Zoom out</td>
              </tr>
              <tr>
                <th>Hold</th>
                <td>Open the app launcher</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="pilot-panel content-width" id="pilots">
        <div>
          <span className="eyebrow">Early collaboration</span>
          <h2>
            Bring a use case.
            <br />
            Help shape the interface.
          </h2>
          <p>
            We want to understand what you are building before defining the
            integration around it.
          </p>
          <a className="button" href={developerEmail}>
            Tell us about your project
          </a>
        </div>
        <div className="pilot-checklist">
          <article>
            <span>01</span>
            <div>
              <h3>Your application</h3>
              <p>
                What task should someone complete without reaching for a screen?
              </p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>Your target environment</h3>
              <p>
                Which glasses, operating system, and companion device are you
                working with?
              </p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Your input needs</h3>
              <p>
                Selection, scrolling, continuous adjustment, or another
                interaction?
              </p>
            </div>
          </article>
        </div>
      </section>
      <section className="release-status content-width">
        <h2>Where things stand</h2>
        <div>
          <article>
            <h3>Available now</h3>
            <p>
              The browser interaction demo and direct conversations about
              integration needs.
            </p>
          </article>
          <article>
            <h3>Still in development</h3>
            <p>
              The SDK, hardware pilot program, supported-device list, and
              technical specifications. No package installation or hardware
              access is available from this page yet.
            </p>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
