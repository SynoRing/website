/** @typedef {{ x: number, y: number, time?: number }} GesturePoint */

/**
 * Recognize a near-complete circle in screen coordinates (positive Y is down).
 * Reject small jitter, straight swipes, open arcs, and backtracking scribbles.
 * @param {GesturePoint[]} points
 * @returns {"clockwise" | "counterclockwise" | null}
 */
export function detectCircle(points) {
  if (points.length < 18) return null;
  // A closed path that cancels its own area is a scribble, not a rotation.
  const extentX =
    Math.max(...points.map((p) => p.x)) - Math.min(...points.map((p) => p.x));
  const extentY =
    Math.max(...points.map((p) => p.y)) - Math.min(...points.map((p) => p.y));
  const endpointGap = Math.hypot(
    points[0].x - points[points.length - 1].x,
    points[0].y - points[points.length - 1].y,
  );
  const area =
    points.reduce((sum, point, index) => {
      const next = points[(index + 1) % points.length];
      return sum + point.x * next.y - next.x * point.y;
    }, 0) / 2;
  if (
    endpointGap < Math.min(extentX, extentY) * 0.4 &&
    Math.abs(area) < extentX * extentY * 0.25
  )
    return null;
  for (let start = 0; start <= points.length - 18; start += 3) {
    const loop = points.slice(start);
    const xs = loop.map((p) => p.x);
    const ys = loop.map((p) => p.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    if (
      width < 54 ||
      height < 54 ||
      width / height < 0.48 ||
      width / height > 2.1
    )
      continue;
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const first = loop[0];
    const last = loop[loop.length - 1];
    if (
      Math.hypot(first.x - last.x, first.y - last.y) >
      Math.min(width, height) * 0.42
    )
      continue;
    let signedTurn = 0;
    let totalTurn = 0;
    let pathLength = 0;
    for (let i = 1; i < loop.length; i++) {
      const before = loop[i - 1];
      const point = loop[i];
      let delta =
        Math.atan2(point.y - cy, point.x - cx) -
        Math.atan2(before.y - cy, before.x - cx);
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      signedTurn += delta;
      totalTurn += Math.abs(delta);
      pathLength += Math.hypot(point.x - before.x, point.y - before.y);
    }
    const radii = loop.map((p) =>
      Math.hypot((p.x - cx) / width, (p.y - cy) / height),
    );
    const mean = radii.reduce((sum, radius) => sum + radius, 0) / radii.length;
    const variation =
      Math.sqrt(
        radii.reduce((sum, radius) => sum + (radius - mean) ** 2, 0) /
          radii.length,
      ) / mean;
    if (
      pathLength < 170 ||
      Math.abs(signedTurn) < Math.PI * 1.72 ||
      Math.abs(signedTurn) > Math.PI * 2.7 ||
      Math.abs(signedTurn) / totalTurn < 0.88 ||
      variation > 0.27
    )
      continue;
    return signedTurn > 0 ? "clockwise" : "counterclockwise";
  }
  return null;
}

/** @param {number} delta @param {number} mode @param {number} pageHeight */
export function wheelPixels(delta, mode, pageHeight) {
  return delta * (mode === 1 ? 16 : mode === 2 ? pageHeight : 1);
}

export const sceneNames = /** @type {const} */ ([
  "music",
  "reading",
  "navigation",
]);
/* Track and stop names live with the demo's copy (copy/demo.ts), in the
   same order. */
export const tracks = [
  { duration: "3:42" },
  { duration: "4:08" },
  { duration: "3:16" },
  { duration: "2:54" },
  { duration: "4:21" },
];
export const waypoints = [
  { x: 100, y: 275 },
  { x: 205, y: 235 },
  { x: 305, y: 145 },
  { x: 420, y: 90 },
];

/** What the status line says after each action. The demo turns these into
    sentences in the page's language, naming the current track or stop. */
export const feedbackKeys = /** @type {const} */ ([
  "intro",
  "scene",
  "apps-open",
  "apps-closed",
  "glide",
  "rotate-up",
  "rotate-down",
  "track",
  "heading",
  "playing",
  "paused",
  "bookmarked",
  "unbookmarked",
  "navigation-paused",
]);

export const initialDemoState = {
  scene: /** @type {"music" | "reading" | "navigation"} */ ("music"),
  selectedTrack: 0,
  activeTrack: 0,
  playing: false,
  volume: 50,
  readingProgress: 0,
  textScale: 1,
  saved: false,
  waypoint: 0,
  zoom: 1,
  navigating: false,
  launcher: false,
  feedback: /** @type {(typeof feedbackKeys)[number]} */ ("intro"),
};
/** @typedef {typeof initialDemoState} DemoState */
/** @typedef {{type:"scene", scene:DemoState["scene"]} | {type:"slide", amount:number} | {type:"rotate", direction:1|-1} | {type:"select"} | {type:"track", index:number} | {type:"waypoint", index:number} | {type:"launcher", open:boolean} | {type:"reset"}} DemoAction */
const clamp = (
  /** @type {number} */ value,
  /** @type {number} */ min,
  /** @type {number} */ max,
) => Math.max(min, Math.min(max, value));

/** @param {DemoState} state @param {DemoAction} action @returns {DemoState} */
export function demoReducer(state, action) {
  switch (action.type) {
    case "reset":
      return { ...initialDemoState };
    case "scene":
      return {
        ...state,
        scene: action.scene,
        launcher: false,
        feedback: "scene",
      };
    case "launcher":
      return {
        ...state,
        launcher: action.open,
        feedback: action.open ? "apps-open" : "apps-closed",
      };
    case "slide": {
      if (state.launcher) return state;
      if (state.scene === "music")
        return {
          ...state,
          selectedTrack: clamp(
            state.selectedTrack + Math.sign(action.amount),
            0,
            tracks.length - 1,
          ),
          feedback: "glide",
        };
      if (state.scene === "reading")
        return {
          ...state,
          readingProgress: clamp(state.readingProgress + action.amount, 0, 100),
          feedback: "glide",
        };
      return {
        ...state,
        waypoint: clamp(
          state.waypoint + Math.sign(action.amount),
          0,
          waypoints.length - 1,
        ),
        feedback: "glide",
      };
    }
    case "rotate": {
      if (state.launcher) return state;
      const feedback = action.direction > 0 ? "rotate-up" : "rotate-down";
      if (state.scene === "music")
        return {
          ...state,
          volume: clamp(state.volume + action.direction * 10, 0, 100),
          feedback,
        };
      if (state.scene === "reading")
        return {
          ...state,
          textScale:
            Math.round(
              clamp(state.textScale + action.direction * 0.1, 0.8, 1.6) * 10,
            ) / 10,
          feedback,
        };
      return {
        ...state,
        zoom:
          Math.round(
            clamp(state.zoom + action.direction * 0.25, 0.75, 2.5) * 100,
          ) / 100,
        feedback,
      };
    }
    case "track":
      return {
        ...state,
        selectedTrack: action.index,
        activeTrack: action.index,
        playing: true,
        feedback: "track",
      };
    case "waypoint":
      return {
        ...state,
        waypoint: action.index,
        navigating: true,
        feedback: "heading",
      };
    case "select": {
      if (state.launcher) return state;
      if (state.scene === "music") {
        const playing =
          state.selectedTrack !== state.activeTrack || !state.playing;
        return {
          ...state,
          activeTrack: state.selectedTrack,
          playing,
          feedback: playing ? "playing" : "paused",
        };
      }
      if (state.scene === "reading")
        return {
          ...state,
          saved: !state.saved,
          feedback: state.saved ? "unbookmarked" : "bookmarked",
        };
      return {
        ...state,
        navigating: !state.navigating,
        feedback: state.navigating ? "navigation-paused" : "heading",
      };
    }
    default:
      return state;
  }
}
