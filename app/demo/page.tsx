import { GestureExperience } from "../ar-experience";
import { PageShell, ArrowLink } from "../site-components";
import { pageMetadata } from "../site";
import {
  CircleIcon,
  GlideIcon,
  HoldIcon,
  MusicIcon,
  NavigationIcon,
  ReadingIcon,
  TapIcon,
} from "../icons";

export const metadata = pageMetadata(
  "Demo",
  "Try SynoRing gestures in an interactive smart glasses concept. Explore music, reading, and navigation using your mouse or touch screen.",
  "/demo",
);

export default function DemoPage() {
  return (
    <PageShell active="/demo">
      <section className="page-heading content-width demo-heading">
        <div>
          <span className="eyebrow">The interactive demo</span>
          <h1>
            A little movement.
            <br />
            See what happens.
          </h1>
        </div>
        <div>
          <p>
            Step into the view through smart glasses. Your cursor becomes the
            ring; your gestures control the display.
          </p>
          <span className="quiet-label">
            Runs in your browser · No hardware needed
          </span>
        </div>
      </section>
      <section className="demo-experience" id="experience">
        <GestureExperience />
      </section>
      <section className="page-section content-width">
        <div className="section-heading">
          <div>
            <span className="eyebrow">How to play</span>
            <h2>
              Four gestures.
              <br />A familiar way to interact.
            </h2>
          </div>
          <p>
            Start with a click and a scroll. Then draw a circle with your cursor
            and watch the same gesture adapt to each scene.
          </p>
        </div>
        <div className="gesture-guide">
          <article>
            <span className="gesture-mark">
              <TapIcon />
            </span>
            <h3>Tap</h3>
            <p>Click to select an item or play and pause the current track.</p>
            <span className="guide-key">Mouse click / Touch tap</span>
          </article>
          <article>
            <span className="gesture-mark">
              <GlideIcon />
            </span>
            <h3>Glide</h3>
            <p>Scroll through tracks, move down a page, or choose a stop.</p>
            <span className="guide-key">Scroll wheel / Vertical swipe</span>
          </article>
          <article>
            <span className="gesture-mark">
              <CircleIcon />
            </span>
            <h3>Circle</h3>
            <p>Draw clockwise to increase; counterclockwise to decrease.</p>
            <span className="guide-key">Draw a circle / Rotate buttons</span>
          </article>
          <article>
            <span className="gesture-mark">
              <HoldIcon />
            </span>
            <h3>Hold</h3>
            <p>Press and hold an open area to bring up the app launcher.</p>
            <span className="guide-key">Press and hold / H key</span>
          </article>
        </div>
      </section>
      <section className="scene-section content-width">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Inside the experience</span>
            <h2>One language. Three scenes.</h2>
          </div>
          <ArrowLink href="#experience">Launch the experience</ArrowLink>
        </div>
        <div className="scene-list">
          <article>
            <span className="scene-icon">
              <MusicIcon />
            </span>
            <div>
              <h3>Music</h3>
              <p>Browse a playlist and select a track.</p>
            </div>
            <div>
              <span>Try a circle</span>
              <p>Turn the volume up or down.</p>
            </div>
            <span className="scene-note">Visual playback</span>
          </article>
          <article>
            <span className="scene-icon">
              <ReadingIcon />
            </span>
            <div>
              <h3>Reading</h3>
              <p>Move through an article and bookmark it.</p>
            </div>
            <div>
              <span>Try a circle</span>
              <p>Make the text larger or smaller.</p>
            </div>
            <span className="scene-note">Adjustable type</span>
          </article>
          <article>
            <span className="scene-icon">
              <NavigationIcon />
            </span>
            <div>
              <h3>Navigation</h3>
              <p>Explore a route and select a waypoint.</p>
            </div>
            <div>
              <span>Try a circle</span>
              <p>Zoom the map in or out.</p>
            </div>
            <span className="scene-note">Simulated route</span>
          </article>
        </div>
        <div className="demo-footnote">
          <p>
            Prefer a keyboard? Focus the view, then use ↑ ↓ to glide, ← → to
            rotate, Enter to select, H for apps, and Esc to exit.
          </p>
        </div>
      </section>
      <section className="page-cta content-width">
        <div>
          <span className="eyebrow">Make it your own</span>
          <h2>What would you control?</h2>
          <p>
            We are interested in how these inputs can work inside your spatial
            application.
          </p>
        </div>
        <a className="button button-dark" href="/developers">
          Explore Developers
        </a>
      </section>
    </PageShell>
  );
}
