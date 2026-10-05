import { PageShell, DevelopmentSteps } from "../site-components";
import { developerEmail, pageMetadata } from "../site";
import { ArrowIcon } from "../icons";

export const metadata = pageMetadata(
  "About",
  "Learn why SynoRing is exploring touch and motion as a natural input for AR glasses, and follow our development approach.",
  "/about",
);

export default function AboutPage() {
  return (
    <PageShell active="/about">
      <section className="about-hero content-width">
        <span className="eyebrow">About SynoRing</span>
        <h1>
          Spatial computing
          <br />
          needs a smaller gesture.
        </h1>
        <div className="about-intro">
          <p>
            AR glasses change where information lives.
            <br />
            We are exploring how we interact with it.
          </p>
          <div>
            <p>
              SynoRing is a wearable gesture controller in development at
              SynoRing Labs Inc. Our focus is simple: give your hand a subtle,
              accessible way to control a spatial interface.
            </p>
            <p>
              Combining thumb touches with finger movements lets us explore
              selection, navigation, and continuous adjustment in a familiar
              form—a ring.
            </p>
          </div>
        </div>
      </section>
      <section className="about-statement">
        <div className="content-width">
          <div className="about-emblem">
            <img
              src="/logo.svg"
              width="220"
              height="220"
              alt="SynoRing symbol"
            />
          </div>
          <div>
            <span className="eyebrow">The question behind the ring</span>
            <h2>
              What if controlling your glasses
              <br />
              did not interrupt
              <br />
              <em>what you were doing?</em>
            </h2>
            <p>
              Changing a track. Moving through a page. Bringing a map closer.
              These are small actions. We think the physical interaction should
              feel small, too.
            </p>
          </div>
        </div>
      </section>
      <section className="page-section content-width">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Design principles</span>
            <h2>What guides the work.</h2>
          </div>
          <p>
            We use these principles to evaluate the experience as the product
            develops.
          </p>
        </div>
        <div className="principle-grid">
          <article>
            <span>01</span>
            <h3>Intentional input</h3>
            <p>
              A gesture should feel deliberate and its result should be
              understandable. Clear feedback matters as much as recognition.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Everyday discretion</h3>
            <p>
              Control should fit the setting. We are exploring small movements
              and touch as an alternative to spoken commands and reaching into
              space.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Context comes first</h3>
            <p>
              The same gesture should serve the current task. A circle changes
              volume in music and scale in a map.
            </p>
          </article>
        </div>
      </section>
      <section className="about-development content-width" id="development">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Development, openly</span>
            <h2>Prototype. Learn. Refine.</h2>
          </div>
          <p>
            We are refining the interaction prototype. Developer pilots and
            production validation are planned next; dates and shipping
            specifications are not yet confirmed.
          </p>
        </div>
        <DevelopmentSteps />
      </section>
      <section className="about-contact content-width">
        <div>
          <span className="eyebrow">SynoRing Labs Inc.</span>
          <h2>
            Let’s make the
            <br />
            next interaction better.
          </h2>
          <p>
            Designed in Illinois.
            <br />
            Exploring a more natural connection to spatial computing.
          </p>
        </div>
        <div className="contact-rows">
          <a href="mailto:hello@synoring.com">
            <span>
              <small>General enquiries</small>
              <strong>hello@synoring.com</strong>
            </span>
            <ArrowIcon />
          </a>
          <a href={developerEmail}>
            <span>
              <small>For builders</small>
              <strong>Developer conversations</strong>
            </span>
            <ArrowIcon />
          </a>
          <a href="/demo">
            <span>
              <small>See the idea in action</small>
              <strong>Try the AR experience</strong>
            </span>
            <ArrowIcon />
          </a>
        </div>
      </section>
    </PageShell>
  );
}
