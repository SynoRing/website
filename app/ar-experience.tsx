"use client";

import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  detectCircle,
  demoReducer,
  initialDemoState,
  tracks,
  waypoints,
  wheelPixels,
} from "./gesture-input.mjs";
import type { DemoAction, DemoState, GesturePoint } from "./gesture-input.mjs";
import {
  AppsIcon,
  ArrowIcon,
  CircleIcon,
  CloseIcon,
  MusicIcon,
  NavigationIcon,
  PauseIcon,
  PlayIcon,
  ReadingIcon,
} from "./icons";
import "./ar-experience.css";

type Scene = DemoState["scene"];
const scenes: { id: Scene; title: string; Icon: typeof MusicIcon }[] = [
  { id: "music", title: "Music", Icon: MusicIcon },
  { id: "reading", title: "Reading", Icon: ReadingIcon },
  { id: "navigation", title: "Navigation", Icon: NavigationIcon },
];
const paragraphs = [
  "A walk can be a walk again. Your next turn is there when you need it, while the trees, the light, and the people around you stay in view.",
  "Spatial computing puts information into the world around us. The next question is how to interact with it without constantly reaching for another screen.",
  "A ring offers a small, familiar place for that interaction. A touch can select a track. A glide can move through this page. A circular movement can make the text a little larger.",
  "The same gesture can do something different in another setting. In your music player, a clockwise circle turns the volume up. In a map, it brings the route closer. Here, it gives the words more room.",
  "Try it as you read. Scroll to move down the page. Draw a clockwise circle with your cursor to increase the text size, or go counterclockwise to reduce it. Click the bookmark to save your place.",
  "Keeping the interaction small makes room for everything around it. You can stay with the task in front of you and let the controls sit quietly within reach.",
  "This is an interactive concept of the experience we are exploring. Hardware gestures and software mappings will continue to develop through testing.",
  "You have reached the end. Hold anywhere in the open view to bring up your apps, then try the same movements in music or navigation.",
];

function RingCursor() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <ellipse
        cx="24"
        cy="24"
        rx="13"
        ry="18"
        transform="rotate(-32 24 24)"
        stroke="#e7efdd"
        strokeWidth="5"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="13"
        ry="18"
        transform="rotate(-32 24 24)"
        stroke="#819884"
        strokeWidth="1"
      />
      <circle cx="24" cy="24" r="2" fill="white" />
    </svg>
  );
}

export function GestureExperience() {
  const [open, setOpen] = useState(false);
  const [entry, setEntry] = useState({ x: 0, y: 0, scaleX: 1, scaleY: 1 });
  const card = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }
  return (
    <>
      <div ref={card} className="ar-experience-card content-width">
        <div className="ar-card-world" aria-hidden="true">
          <div className="ar-room-window" />
          <div className="ar-room-floor" />
          <div className="ar-room-bench" />
          <div className="ar-preview-pane">
            <div className="ar-preview-cover">
              <span>
                OPEN
                <br />
                SPACES
              </span>
              <i />
            </div>
            <div className="ar-preview-track">
              <span>Now playing</span>
              <strong>Open spaces</strong>
              <span>Morning collection</span>
              <div className="ar-preview-bars">
                {Array.from({ length: 20 }, (_, i) => (
                  <i key={i} style={{ height: `${12 + ((i * 17) % 31)}px` }} />
                ))}
              </div>
            </div>
            <span className="ar-preview-play">
              <PauseIcon />
            </span>
          </div>
          <div className="ar-preview-dock">
            <span>
              <MusicIcon />
            </span>
            <span>
              <ReadingIcon />
            </span>
            <span>
              <NavigationIcon />
            </span>
          </div>
          <div className="ar-preview-cursor">
            <RingCursor />
          </div>
        </div>
        <div className="ar-card-copy">
          <h2>
            See through the glasses.
            <br />
            Control it with the ring.
          </h2>
          <p>Music, reading, navigation. Try the gestures for yourself.</p>
        </div>
        <button
          ref={trigger}
          className="button ar-try-button"
          onClick={() => {
            const rect = card.current?.getBoundingClientRect();
            if (rect)
              setEntry({
                x: rect.left + rect.width / 2 - window.innerWidth / 2,
                y: rect.top + rect.height / 2 - window.innerHeight / 2,
                scaleX: rect.width / window.innerWidth,
                scaleY: rect.height / window.innerHeight,
              });
            setOpen(true);
          }}
        >
          Try it
        </button>
      </div>
      {open &&
        createPortal(<ARDemo onClose={close} entry={entry} />, document.body)}
    </>
  );
}

function ARDemo({
  onClose,
  entry,
}: {
  onClose: () => void;
  entry: { x: number; y: number; scaleX: number; scaleY: number };
}) {
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const [help, setHelp] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const trace = useRef<SVGPolylineElement>(null);
  const article = useRef<HTMLDivElement>(null);
  const current = useRef(state);
  const points = useRef<GesturePoint[]>([]);
  const lastCircle = useRef(0);
  const wheelAmount = useRef(0);
  const lastWheel = useRef(0);
  const lastWheelEvent = useRef(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const down = useRef<{
    x: number;
    y: number;
    time: number;
    type: string;
    moved: boolean;
    held: boolean;
    circle: boolean;
  } | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  current.current = state;

  const clearHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    cursor.current?.classList.remove("is-holding");
  };
  function clearTrace() {
    points.current = [];
    trace.current?.setAttribute("points", "");
  }
  function send(action: DemoAction) {
    dispatch(action);
  }
  function switchScene(scene: Scene) {
    clearHold();
    clearTrace();
    down.current = null;
    wheelAmount.current = 0;
    send({ type: "scene", scene });
    world.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    const element = dialog.current;
    const stage = world.current;
    const beforeOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    stage?.focus({ preventScroll: true });
    function wheel(event: WheelEvent) {
      // Browser pinch zoom stays available; only the simulation consumes normal wheel input.
      if (event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      if (current.current.launcher) return;
      const pixels = wheelPixels(
        event.deltaY || event.deltaX,
        event.deltaMode,
        stage?.clientHeight ?? 600,
      );
      if (current.current.scene === "reading") {
        dispatch({
          type: "slide",
          amount: Math.max(-15, Math.min(15, pixels * 0.07)),
        });
        return;
      }
      const now = performance.now();
      if (
        now - lastWheelEvent.current > 220 ||
        Math.sign(wheelAmount.current) !== Math.sign(pixels)
      )
        wheelAmount.current = 0;
      lastWheelEvent.current = now;
      wheelAmount.current += pixels;
      if (
        Math.abs(wheelAmount.current) >= 48 &&
        now - lastWheel.current > 100
      ) {
        dispatch({ type: "slide", amount: Math.sign(wheelAmount.current) });
        wheelAmount.current = 0;
        lastWheel.current = now;
      }
    }
    const cancelPointer = () => {
      clearHold();
      down.current = null;
      clearTrace();
      cursor.current?.classList.remove("is-visible");
    };
    stage?.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("blur", cancelPointer);
    return () => {
      clearHold();
      if (hideTimer.current) clearTimeout(hideTimer.current);
      stage?.removeEventListener("wheel", wheel);
      window.removeEventListener("blur", cancelPointer);
      element?.close();
      document.body.style.overflow = beforeOverflow;
    };
  }, []);

  useEffect(() => {
    const element = article.current;
    if (element)
      element.scrollTop =
        (state.readingProgress / 100) *
        (element.scrollHeight - element.clientHeight);
  }, [state.readingProgress, state.textScale, state.scene]);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left,
      y = event.clientY - bounds.top;
    if (cursor.current) {
      cursor.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      cursor.current.classList.add("is-visible");
    }
    if (
      down.current &&
      Math.hypot(x - down.current.x, y - down.current.y) > 12
    ) {
      down.current.moved = true;
      clearHold();
    }
    if (current.current.launcher) return;
    const now = performance.now();
    if (now - lastCircle.current < 650) return;
    const previous = points.current.at(-1);
    if (previous && Math.hypot(x - previous.x, y - previous.y) < 3) return;
    if (previous && now - (previous.time ?? 0) > 250) points.current = [];
    points.current = [
      ...points.current.filter((p) => now - (p.time ?? 0) < 2500),
      { x, y, time: now },
    ].slice(-110);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(clearTrace, 550);
    trace.current?.setAttribute(
      "points",
      points.current
        .slice(-42)
        .map((p) => `${p.x},${p.y}`)
        .join(" "),
    );
    const direction = detectCircle(points.current);
    if (direction) {
      send({ type: "rotate", direction: direction === "clockwise" ? 1 : -1 });
      if (down.current) down.current.circle = true;
      lastCircle.current = now;
      clearHold();
      clearTrace();
      cursor.current?.animate(
        [
          { filter: "drop-shadow(0 0 0px #d3edc0)" },
          { filter: "drop-shadow(0 0 13px #d3edc0)" },
          { filter: "drop-shadow(0 0 0px #d3edc0)" },
        ],
        { duration: 450 },
      );
    }
  }
  function start(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    clearHold();
    const bounds = event.currentTarget.getBoundingClientRect();
    down.current = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      time: performance.now(),
      type: event.pointerType,
      moved: false,
      held: false,
      circle: false,
    };
    const target = event.target as HTMLElement;
    if (target.closest("button")) return;
    if (current.current.launcher) {
      // Tapping the open view around the launcher returns to the scene.
      if (target.classList.contains("ar-launcher")) {
        down.current.held = true;
        send({ type: "launcher", open: false });
      }
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    cursor.current?.classList.add("is-holding");
    holdTimer.current = setTimeout(() => {
      if (down.current && !down.current.moved) {
        down.current.held = true;
        send({ type: "launcher", open: true });
        clearTrace();
        cursor.current?.classList.remove("is-holding");
      }
    }, 650);
  }
  function end(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary) return;
    clearHold();
    const origin = down.current;
    if (!origin) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    const bounds = event.currentTarget.getBoundingClientRect();
    const dy = event.clientY - bounds.top - origin.y;
    if (
      origin.type === "touch" &&
      origin.moved &&
      !origin.circle &&
      !origin.held &&
      Math.abs(dy) > 35
    )
      send({
        type: "slide",
        amount:
          current.current.scene === "reading" ? -dy * 0.13 : -Math.sign(dy),
      });
    // Keep this until click capture has suppressed clicks generated by a hold or drag.
    if (event.pointerType === "touch")
      cursor.current?.classList.remove("is-visible");
  }
  function clickCapture(event: MouseEvent<HTMLDivElement>) {
    const origin = down.current;
    down.current = null;
    if (origin && (origin.held || origin.moved || origin.circle)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (!(event.target as HTMLElement).closest("button") && !state.launcher)
      send({ type: "select" });
  }
  function keyboard(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (state.launcher) send({ type: "launcher", open: false });
      else if (help) setHelp(false);
      else onClose();
      return;
    }
    if ((event.target as HTMLElement).closest("button, input, a")) return;
    const keys: Record<string, DemoAction> = {
      ArrowDown: { type: "slide", amount: 12 },
      ArrowUp: { type: "slide", amount: -12 },
      ArrowRight: { type: "rotate", direction: 1 },
      ArrowLeft: { type: "rotate", direction: -1 },
      Enter: { type: "select" },
      " ": { type: "select" },
      h: { type: "launcher", open: !state.launcher },
    };
    if (keys[event.key]) {
      event.preventDefault();
      send(keys[event.key]);
    }
  }
  const adjustment =
    state.scene === "music"
      ? "volume"
      : state.scene === "reading"
        ? "text size"
        : "map zoom";
  const track = tracks[state.activeTrack],
    waypoint = waypoints[state.waypoint];
  return (
    <dialog
      ref={dialog}
      className={`ar-demo ar-scene-${state.scene}`}
      style={
        {
          "--ar-entry-x": `${entry.x}px`,
          "--ar-entry-y": `${entry.y}px`,
          "--ar-entry-scale-x": entry.scaleX,
          "--ar-entry-scale-y": entry.scaleY,
        } as CSSProperties
      }
      aria-labelledby="ar-demo-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={keyboard}
    >
      <div className="ar-environment" aria-hidden="true">
        <div className="ar-room-window" />
        <div className="ar-room-floor" />
        <div className="ar-room-bench" />
        <div className="ar-outdoor-hill" />
        <div className="ar-outdoor-path" />
      </div>
      <header className="ar-demo-header">
        <div>
          <img src="/logo.svg" alt="" width="27" height="27" />
          <span id="ar-demo-title">
            SynoRing <span className="ar-title-detail">/ AR experience</span>
          </span>
        </div>
        <nav className="ar-scene-switcher" aria-label="Demo scenes">
          {scenes.map((scene) => (
            <button
              key={scene.id}
              aria-pressed={state.scene === scene.id}
              onClick={() => switchScene(scene.id)}
            >
              {scene.title}
            </button>
          ))}
        </nav>
        <button
          className="ar-close"
          onClick={onClose}
          aria-label="Close AR experience"
        >
          <CloseIcon />
          <span>Exit</span>
        </button>
      </header>
      <div
        ref={world}
        className="ar-world"
        role="region"
        aria-label="AR interaction area"
        aria-describedby="ar-controls-hint"
        tabIndex={0}
        onPointerMove={move}
        onPointerDown={start}
        onPointerUp={end}
        onPointerCancel={() => {
          clearHold();
          down.current = null;
          clearTrace();
        }}
        onPointerLeave={() => {
          if (!down.current) {
            cursor.current?.classList.remove("is-visible");
            clearTrace();
          }
        }}
        onClickCapture={clickCapture}
      >
        <div className="ar-lens" aria-hidden="true" />
        <div className="ar-view-caption">
          <span className="ar-live-dot" /> Your view through the glasses
        </div>
        <div
          className="ar-window"
          key={state.scene}
          inert={state.launcher}
          aria-hidden={state.launcher}
        >
          {state.scene === "music" && (
            <>
              <div className="ar-window-heading">
                <span>Music</span>
                <span>Demo playlist · silent playback</span>
              </div>
              <div className="ar-music-layout">
                <div className="ar-now-playing">
                  <div className={`ar-album ar-album-${state.activeTrack % 3}`}>
                    <span>
                      OPEN
                      <br />
                      SPACES
                    </span>
                    <i />
                    <i />
                    <i />
                  </div>
                  <h3>{track.title}</h3>
                  <p>{track.artist}</p>
                  <div
                    className={`ar-equalizer ${state.playing ? "is-playing" : ""}`}
                    aria-hidden="true"
                  >
                    {Array.from({ length: 28 }, (_, i) => (
                      <i
                        key={i}
                        style={
                          {
                            "--bar-height": `${8 + ((i * 19) % 22)}px`,
                            "--delay": `${i * 0.07}s`,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                  <button
                    className="ar-play"
                    onClick={() => send({ type: "select" })}
                    aria-label={
                      state.playing
                        ? "Pause selected track"
                        : "Play selected track"
                    }
                  >
                    {state.playing ? <PauseIcon /> : <PlayIcon />}
                  </button>
                </div>
                <div className="ar-playlist">
                  <h4>Your morning mix</h4>
                  {tracks.map((item, index) => (
                    <button
                      key={item.title}
                      className={
                        state.selectedTrack === index ? "is-selected" : ""
                      }
                      aria-pressed={state.selectedTrack === index}
                      onClick={() => send({ type: "track", index })}
                    >
                      <span className="ar-track-index">
                        {state.activeTrack === index && state.playing ? (
                          <MusicIcon />
                        ) : (
                          `0${index + 1}`
                        )}
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.artist}</small>
                      </span>
                      <span>{item.duration}</span>
                    </button>
                  ))}
                  <div className="ar-adjustment">
                    <span>Volume</span>
                    <meter
                      aria-label="Demo volume"
                      min="0"
                      max="100"
                      value={state.volume}
                    />
                    <output aria-label="Volume level">{state.volume}%</output>
                  </div>
                </div>
              </div>
            </>
          )}
          {state.scene === "reading" && (
            <>
              <div className="ar-window-heading">
                <span>Reading</span>
                <button
                  className={`ar-save ${state.saved ? "is-saved" : ""}`}
                  aria-pressed={state.saved}
                  onClick={() => send({ type: "select" })}
                >
                  {state.saved ? "Bookmarked ✓" : "Bookmark +"}
                </button>
              </div>
              <div className="ar-reading-meta">
                <span>FIELD NOTES / 01</span>
                <span>Text size {Math.round(state.textScale * 100)}%</span>
              </div>
              <div
                ref={article}
                className="ar-article"
                style={{ fontSize: `${17 * state.textScale}px` }}
              >
                <h3>
                  A calmer way
                  <br />
                  to compute.
                </h3>
                <p className="ar-article-intro">
                  Information within reach.
                  <br />
                  The rest of the world in view.
                </p>
                {paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                <span className="ar-article-end">End of article</span>
              </div>
              <div className="ar-reading-progress">
                <span>Reading progress</span>
                <progress
                  aria-label="Reading progress"
                  value={state.readingProgress}
                  max="100"
                />
                <output>{Math.round(state.readingProgress)}%</output>
              </div>
            </>
          )}
          {state.scene === "navigation" && (
            <>
              <div className="ar-window-heading">
                <span>Navigation</span>
                <span>Riverside walk · demo route</span>
              </div>
              <div className="ar-map">
                <svg
                  viewBox="0 0 520 350"
                  role="img"
                  aria-label={`Route map, ${state.zoom} times zoom, ${waypoint.title} selected`}
                >
                  <g
                    style={{
                      transform: `scale(${state.zoom})`,
                      transformOrigin: "260px 175px",
                      transition: "transform 350ms ease",
                    }}
                  >
                    <path
                      className="ar-map-river"
                      d="M-30 280Q140 320 205 140T555 65"
                    />
                    <path
                      className="ar-map-road"
                      d="M-20 45L570 290M45 -25L465 400M100 400L470 -50"
                    />
                    <path
                      className="ar-map-route"
                      d="M100 275L160 275Q205 275 205 235L205 175Q205 145 245 145L305 145L380 145Q420 145 420 90"
                    />
                    {waypoints.map((point, index) => (
                      <g key={point.title}>
                        <circle
                          className={
                            state.waypoint === index
                              ? "ar-map-stop active"
                              : "ar-map-stop"
                          }
                          cx={point.x}
                          cy={point.y}
                          r={state.waypoint === index ? 10 : 5}
                        />
                        <text x={point.x + 14} y={point.y - 13}>
                          {point.title}
                        </text>
                      </g>
                    ))}
                  </g>
                </svg>
                <span className="ar-map-zoom">{state.zoom.toFixed(2)}×</span>
              </div>
              <div className="ar-route-detail">
                <span className="ar-route-arrow">
                  <NavigationIcon />
                </span>
                <div>
                  <span>{waypoint.distance}</span>
                  <h3>{waypoint.instruction}</h3>
                </div>
                <button onClick={() => send({ type: "select" })}>
                  {state.navigating ? "Pause" : "Start"}
                </button>
              </div>
              <div className="ar-route-stops">
                {waypoints.map((point, index) => (
                  <button
                    key={point.title}
                    aria-label={`Navigate to ${point.title}`}
                    aria-pressed={state.waypoint === index}
                    onClick={() => send({ type: "waypoint", index })}
                  >
                    <span />
                    {index + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {state.launcher && (
          <div className="ar-launcher">
            <div>
              <h3>Where next?</h3>
              <p>Tap an app, or tap outside to go back.</p>
              <div className="ar-launcher-apps">
                {scenes.map((scene) => (
                  <button key={scene.id} onClick={() => switchScene(scene.id)}>
                    <span>
                      <scene.Icon />
                    </span>
                    {scene.title}
                  </button>
                ))}
              </div>
              <button
                className="ar-launcher-back"
                onClick={() => send({ type: "launcher", open: false })}
              >
                <ArrowIcon className="icon-back" />
                Back to view
              </button>
            </div>
          </div>
        )}
        <div className="ar-feedback" role="status">
          <span className="ar-live-dot" />
          {state.feedback}
        </div>
        <svg className="ar-gesture-trail" aria-hidden="true">
          <polyline
            ref={trace}
            fill="none"
            stroke="rgba(228,247,215,.5)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div ref={cursor} className="ar-ring-cursor" aria-hidden="true">
          <RingCursor />
          <i />
        </div>
      </div>
      <footer className="ar-demo-footer">
        <div className="ar-input-legend" id="ar-controls-hint">
          <span>
            <b>Click</b> Select
          </span>
          <span>
            <b>Scroll / swipe</b> Glide
          </span>
          <span>
            <b>Draw a circle</b> {adjustment}
          </span>
          <span>
            <b>Hold</b> Apps
          </span>
        </div>
        <div className="ar-fallback-controls">
          <button
            onClick={() => send({ type: "rotate", direction: -1 })}
            aria-label={`Rotate counterclockwise to decrease ${adjustment}`}
          >
            <CircleIcon className="icon-ccw" />
          </button>
          <span>{adjustment}</span>
          <button
            onClick={() => send({ type: "rotate", direction: 1 })}
            aria-label={`Rotate clockwise to increase ${adjustment}`}
          >
            <CircleIcon />
          </button>
          <button
            onClick={() => send({ type: "launcher", open: !state.launcher })}
            aria-label="Open app launcher"
          >
            <AppsIcon />
          </button>
          <button
            aria-label="Show interaction help"
            aria-expanded={help}
            onClick={() => setHelp(!help)}
          >
            ?
          </button>
        </div>
      </footer>
      {help && (
        <aside className="ar-help">
          <button
            onClick={() => setHelp(false)}
            aria-label="Close interaction help"
          >
            <CloseIcon />
          </button>
          <h3>Your mouse is the ring.</h3>
          <p>
            Move the ring cursor over a control and click to select. Use your
            wheel or trackpad to simulate a thumb glide.
          </p>
          <p>
            Draw a complete circle anywhere in the view. Clockwise increases{" "}
            {adjustment}; counterclockwise decreases it. Hold still for a moment
            with the mouse button down to open your apps.
          </p>
          <p>
            On touch screens, swipe to scroll, draw circles to adjust, and
            long-press for apps. The rotate buttons work too.
          </p>
          <p>
            <b>Keyboard:</b> Focus the view, then use ↑ ↓ to glide, ← → to
            rotate, Enter to select, H for apps, and Esc to exit.
          </p>
          <small>
            Interactive concept. Final hardware gesture mappings may change.
          </small>
        </aside>
      )}
    </dialog>
  );
}
