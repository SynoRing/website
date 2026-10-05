import assert from "node:assert/strict";
import test from "node:test";
import {
  detectCircle,
  demoReducer,
  initialDemoState,
  wheelPixels,
} from "../app/gesture-input.mjs";

function circle(direction = 1, radius = 85, end = Math.PI * 2, count = 70) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / (count - 1)) * end * direction;
    return {
      x: 350 + Math.cos(angle) * radius,
      y: 250 + Math.sin(angle) * radius,
      time: i * 16,
    };
  });
}

test("recognizes clockwise and counterclockwise input in screen coordinates", () => {
  assert.equal(detectCircle(circle(1)), "clockwise");
  assert.equal(detectCircle(circle(-1)), "counterclockwise");
});

test("tolerates imperfect human circles and a lead-in pointer movement", () => {
  const oval = circle(-1).map((point, i) => ({
    ...point,
    x: point.x + Math.sin(i * 2) * 3,
    y: 250 + (point.y - 250) * 0.7 + Math.cos(i) * 2,
  }));
  assert.equal(
    detectCircle([
      { x: 20, y: 15 },
      { x: 150, y: 70 },
      { x: 300, y: 120 },
      ...oval,
    ]),
    "counterclockwise",
  );
});

test("does not turn scrolling strokes, partial arcs, or cursor jitter into rotation", () => {
  assert.equal(
    detectCircle(
      Array.from({ length: 60 }, (_, i) => ({
        x: 100 + (i % 3),
        y: 20 + i * 5,
      })),
    ),
    null,
  );
  assert.equal(detectCircle(circle(1, 80, Math.PI * 1.4)), null);
  assert.equal(detectCircle(circle(1, 12)), null);
  assert.equal(detectCircle(circle(1).slice(0, 12)), null);
});

test("rejects figure-eight and backtracking scribbles", () => {
  const eight = Array.from({ length: 90 }, (_, i) => {
    const t = (i / 89) * Math.PI * 2;
    return { x: 300 + Math.sin(t) * 90, y: 250 + Math.sin(t * 2) * 65 };
  });
  assert.equal(detectCircle(eight), null);
  const arc = circle(1, 80, Math.PI * 1.2, 35);
  assert.equal(detectCircle([...arc, ...arc.toReversed()]), null);
});

test("normalizes trackpad, line-wheel, and page-wheel units", () => {
  assert.equal(wheelPixels(12, 0, 600), 12);
  assert.equal(wheelPixels(-3, 1, 600), -48);
  assert.equal(wheelPixels(1, 2, 600), 600);
});

test("music gliding selects a track without playing until a tap", () => {
  let state = demoReducer(initialDemoState, { type: "slide", amount: 1 });
  assert.equal(state.selectedTrack, 1);
  assert.equal(state.activeTrack, 0);
  assert.equal(state.playing, false);
  state = demoReducer(state, { type: "select" });
  assert.equal(state.activeTrack, 1);
  assert.equal(state.playing, true);
  state = demoReducer(state, { type: "select" });
  assert.equal(state.playing, false);
});

test("rotation controls the current scene and clamps physical ranges", () => {
  let state = { ...initialDemoState };
  for (let i = 0; i < 30; i++)
    state = demoReducer(state, { type: "rotate", direction: 1 });
  assert.equal(state.volume, 100);
  for (let i = 0; i < 30; i++)
    state = demoReducer(state, { type: "rotate", direction: -1 });
  assert.equal(state.volume, 0);
  state = demoReducer(state, { type: "scene", scene: "reading" });
  for (let i = 0; i < 30; i++)
    state = demoReducer(state, { type: "rotate", direction: 1 });
  assert.equal(state.textScale, 1.6);
  state = demoReducer(state, { type: "scene", scene: "navigation" });
  for (let i = 0; i < 30; i++)
    state = demoReducer(state, { type: "rotate", direction: -1 });
  assert.equal(state.zoom, 0.75);
  assert.equal(state.volume, 0);
});

test("reading and route controls preserve their own state across scene switches", () => {
  let state = demoReducer(initialDemoState, {
    type: "scene",
    scene: "reading",
  });
  state = demoReducer(state, { type: "slide", amount: 43 });
  state = demoReducer(state, { type: "select" });
  state = demoReducer(state, { type: "scene", scene: "navigation" });
  state = demoReducer(state, { type: "slide", amount: 1 });
  state = demoReducer(state, { type: "select" });
  assert.equal(state.waypoint, 1);
  assert.equal(state.navigating, true);
  state = demoReducer(state, { type: "scene", scene: "reading" });
  assert.equal(state.readingProgress, 43);
  assert.equal(state.saved, true);
});

test("the app launcher isolates the underlying scene from gestures", () => {
  const state = demoReducer(initialDemoState, { type: "launcher", open: true });
  assert.equal(demoReducer(state, { type: "rotate", direction: 1 }).volume, 50);
  assert.equal(
    demoReducer(state, { type: "slide", amount: 1 }).selectedTrack,
    0,
  );
  assert.equal(demoReducer(state, { type: "select" }).playing, false);
  assert.equal(
    demoReducer(state, { type: "scene", scene: "reading" }).launcher,
    false,
  );
});
