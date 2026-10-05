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
  CheckIcon,
  CircleIcon,
  CloseIcon,
  MusicIcon,
  NavigationIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  ReadingIcon,
} from "./icons";
import { WorldScene } from "./world-scenes";
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

/** The ring's pointer: a green circle that fills its outer track while held. */
function RingCursor() {
  return (
    <svg viewBox="0 0 56 56" fill="none" aria-hidden="true">
      <circle className="cursor-hold-track" cx="28" cy="28" r="24" />
      <circle
        className="cursor-hold-progress"
        cx="28"
        cy="28"
        r="24"
        pathLength="1"
        transform="rotate(-90 28 28)"
      />
      <circle className="cursor-ring" cx="28" cy="28" r="13" />
      <circle className="cursor-dot" cx="28" cy="28" r="2.4" />
    </svg>
  );
}

/** HUD corner marks show the edge of the glasses' display. */
function HudCorners() {
  return (
    <span className="hud-corners" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
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
        <WorldScene active="music" className="ar-card-world" />
        <div className="ar-card-hud" aria-hidden="true">
          <HudCorners />
          <div className="hud-head">
            <span className="hud-app">
              <MusicIcon />
              Music
            </span>
            <span className="hud-meta">1 / 5</span>
          </div>
          <span className="hud-label">Now playing</span>
          <strong>Open spaces</strong>
          <span className="hud-sub">Morning collection</span>
          <span className="hud-track">
            <span>1:12</span>
            <i>
              <b style={{ width: "34%" }} />
            </i>
            <span>3:42</span>
          </span>
        </div>
        <div className="ar-card-cursor" aria-hidden="true">
          <RingCursor />
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
      <WorldScene
        active={state.scene}
        scenes={["music", "reading", "navigation"]}
        className="ar-environment"
      />
      <header className="ar-demo-header">
        <div>
          <img src="/logo.svg" alt="" width="26" height="26" />
          <span id="ar-demo-title">
            SynoRing{" "}
            <span className="ar-title-detail">/ Smart glasses demo</span>
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
          aria-label="Close the demo"
        >
          <CloseIcon />
          <span>Exit</span>
        </button>
      </header>
      <div
        ref={world}
        className="ar-world"
        role="region"
        aria-label="Smart glasses view"
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
        <div
          className="ar-hud"
          key={state.scene}
          inert={state.launcher}
          aria-hidden={state.launcher}
        >
          <HudCorners />
          {state.scene === "music" && (
            <>
              <div className="hud-head">
                <span className="hud-app">
                  <MusicIcon />
                  Music
                </span>
                <span className="hud-meta">Demo playlist · silent</span>
              </div>
              <div className="hud-music">
                <div className="hud-now">
                  <span className="hud-label">
                    {state.playing ? "Now playing" : "Paused"}
                  </span>
                  <h3>{track.title}</h3>
                  <p>{track.artist}</p>
                  <div
                    className={`hud-eq ${state.playing ? "is-playing" : ""}`}
                    aria-hidden="true"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <i
                        key={i}
                        style={
                          {
                            "--bar-height": `${6 + ((i * 19) % 20)}px`,
                            "--delay": `${i * 0.07}s`,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                  <button
                    className="hud-round"
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
                <div className="hud-list">
                  {tracks.map((item, index) => (
                    <button
                      key={item.title}
                      className={
                        state.selectedTrack === index ? "is-selected" : ""
                      }
                      aria-pressed={state.selectedTrack === index}
                      onClick={() => send({ type: "track", index })}
                    >
                      <span className="hud-index">
                        {state.activeTrack === index && state.playing ? (
                          <MusicIcon />
                        ) : (
                          `0${index + 1}`
                        )}
                      </span>
                      <span className="hud-row-title">
                        <strong>{item.title}</strong>
                        <small>{item.artist}</small>
                      </span>
                      <span className="hud-time">{item.duration}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="hud-meter">
                <span>Volume</span>
                <span
                  className="hud-bar"
                  role="meter"
                  aria-label="Demo volume"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={state.volume}
                >
                  <i style={{ width: `${state.volume}%` }} />
                </span>
                <output aria-label="Volume level">{state.volume}%</output>
              </div>
            </>
          )}
          {state.scene === "reading" && (
            <>
              <div className="hud-head">
                <span className="hud-app">
                  <ReadingIcon />
                  Field notes / 01
                </span>
                <button
                  className={`hud-pill ${state.saved ? "is-on" : ""}`}
                  aria-pressed={state.saved}
                  onClick={() => send({ type: "select" })}
                >
                  {state.saved ? <CheckIcon /> : <PlusIcon />}
                  {state.saved ? "Bookmarked" : "Bookmark"}
                </button>
              </div>
              <div
                ref={article}
                className="hud-article"
                style={{ fontSize: `${17 * state.textScale}px` }}
              >
                <h3>A calmer way to compute.</h3>
                <p className="hud-article-intro">
                  Information within reach. The rest of the world in view.
                </p>
                {paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                <span className="hud-label">End of article</span>
              </div>
              <div className="hud-meter">
                <span>Read</span>
                <span
                  className="hud-bar"
                  role="progressbar"
                  aria-label="Reading progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(state.readingProgress)}
                >
                  <i style={{ width: `${state.readingProgress}%` }} />
                </span>
                <output>{Math.round(state.readingProgress)}%</output>
                <span className="hud-meter-extra">
                  Text {Math.round(state.textScale * 100)}%
                </span>
              </div>
            </>
          )}
          {state.scene === "navigation" && (
            <>
              <div className="hud-head">
                <span className="hud-app">
                  <NavigationIcon />
                  Riverside walk
                </span>
                <button
                  className={`hud-pill ${state.navigating ? "is-on" : ""}`}
                  onClick={() => send({ type: "select" })}
                >
                  {state.navigating ? <PauseIcon /> : <PlayIcon />}
                  {state.navigating ? "Pause" : "Start"}
                </button>
              </div>
              <div className="hud-nav">
                <div className="hud-turn">
                  <NavigationIcon className="hud-turn-icon" />
                  <strong>{waypoint.distance}</strong>
                  <p>{waypoint.instruction}</p>
                </div>
                <div className="hud-map">
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
                        className="hud-map-river"
                        d="M-30 280Q140 320 205 140T555 65"
                      />
                      <path
                        className="hud-map-road"
                        d="M-20 45L570 290M45 -25L465 400M100 400L470 -50"
                      />
                      <path
                        className="hud-map-route"
                        d="M100 275L160 275Q205 275 205 235L205 175Q205 145 245 145L305 145L380 145Q420 145 420 90"
                      />
                      {waypoints.map((point, index) => (
                        <g key={point.title}>
                          <circle
                            className={
                              state.waypoint === index
                                ? "hud-map-stop is-active"
                                : "hud-map-stop"
                            }
                            cx={point.x}
                            cy={point.y}
                            r={state.waypoint === index ? 9 : 5}
                          />
                          {state.waypoint === index && (
                            <text x={point.x + 16} y={point.y - 12}>
                              {point.title}
                            </text>
                          )}
                        </g>
                      ))}
                    </g>
                  </svg>
                  <span className="hud-map-zoom">
                    {state.zoom.toFixed(2)}×
                  </span>
                </div>
              </div>
              <div className="hud-stops">
                {waypoints.map((point, index) => (
                  <button
                    key={point.title}
                    aria-label={`Navigate to ${point.title}`}
                    aria-pressed={state.waypoint === index}
                    onClick={() => send({ type: "waypoint", index })}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {state.launcher && (
          <div className="ar-launcher">
            <div className="hud-launcher">
              <HudCorners />
              <span className="hud-label">Where next?</span>
              <div className="hud-apps">
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
                className="hud-back"
                onClick={() => send({ type: "launcher", open: false })}
              >
                <ArrowIcon className="icon-back" />
                Back to view
              </button>
              <span className="hud-hint">Or tap outside to go back</span>
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
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div ref={cursor} className="ar-ring-cursor" aria-hidden="true">
          <RingCursor />
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
            {adjustment}; counterclockwise decreases it. Press and hold until
            the ring fills to open your apps.
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
