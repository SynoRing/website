"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowIcon } from "../../icons";

/* Presents the slides one at a time, as large as fits between the top bar
   and the footer. The arrow keys, Page Up and Down, and Space turn pages,
   as do a click (on the left third it goes back), the mouse wheel and a
   swipe. Esc goes back to the scrolling view, at the slide shown last. */
export function Presenter() {
  const [current, setCurrent] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const start = useRef<HTMLButtonElement>(null);
  const refocus = useRef(false);
  const presenting = current !== null;

  const slides = () =>
    [...document.querySelectorAll<HTMLElement>(".bp-viewer .deck > .slide")];

  useEffect(() => setTotal(slides().length), []);

  // Shows the current slide and pauses videos on the others.
  useEffect(() => {
    if (current === null) {
      if (refocus.current) start.current?.focus();
      refocus.current = false;
      return;
    }
    document.querySelector(".bp-viewer")?.classList.add("bp-presenting");
    slides().forEach((slide, index) => {
      slide.toggleAttribute("data-current", index === current);
      if (index !== current)
        slide.querySelectorAll("video").forEach((video) => video.pause());
    });
  }, [current]);

  function begin() {
    // Start from the slide in view: the first one that reaches past the top bar.
    const bar = document.querySelector(".bp-bar")?.getBoundingClientRect().bottom ?? 0;
    const all = slides();
    const inView = all.findIndex((slide) => slide.getBoundingClientRect().bottom > bar + 80);
    setCurrent(Math.max(inView, 0));
  }

  function end() {
    const all = slides();
    const shown = current === null ? undefined : all[current];
    document.querySelector(".bp-viewer")?.classList.remove("bp-presenting");
    all.forEach((slide) => slide.removeAttribute("data-current"));
    setCurrent(null);
    shown?.scrollIntoView({ block: "center", behavior: "instant" });
    refocus.current = true;
  }

  function go(step: number) {
    setCurrent((index) =>
      index === null ? index : Math.min(Math.max(index + step, 0), total - 1),
    );
  }

  // Keys, clicks, the wheel and swipes, only while presenting.
  const latest = useRef({ go, end, total });
  latest.current = { go, end, total };
  useEffect(() => {
    if (!presenting) return;
    const stage = document.querySelector<HTMLElement>(".bp-deck-page");
    const control = (target: EventTarget | null) =>
      target instanceof Element &&
      Boolean(target.closest("a, button, video, input, textarea, select, label"));

    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const { go, end, total } = latest.current;
      const steps: Record<string, number> = {
        ArrowRight: 1,
        ArrowDown: 1,
        PageDown: 1,
        ArrowLeft: -1,
        ArrowUp: -1,
        PageUp: -1,
        Home: -total,
        End: total,
      };
      if (event.key === "Escape") end();
      else if (event.key === " " && !control(target)) go(event.shiftKey ? -1 : 1);
      else if (event.key in steps) go(steps[event.key]);
      else return;
      event.preventDefault();
    }

    function onClick(event: MouseEvent) {
      if (!stage || control(event.target)) return;
      const box = stage.getBoundingClientRect();
      latest.current.go(event.clientX < box.left + box.width / 3 ? -1 : 1);
    }

    // One page per wheel gesture: trackpads keep sending events while they
    // coast, so the next page waits for a short pause.
    let travel = 0;
    let turned = false;
    let pause: ReturnType<typeof setTimeout> | undefined;
    function onWheel(event: WheelEvent) {
      clearTimeout(pause);
      pause = setTimeout(() => {
        travel = 0;
        turned = false;
      }, 220);
      if (turned) return;
      travel +=
        Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(travel) < 40) return;
      turned = true;
      latest.current.go(travel > 0 ? 1 : -1);
    }

    let touch: { x: number; y: number } | null = null;
    function onTouchStart(event: TouchEvent) {
      const point = event.touches[0];
      touch = control(event.target) ? null : { x: point.clientX, y: point.clientY };
    }
    function onTouchEnd(event: TouchEvent) {
      const point = event.changedTouches[0];
      if (!touch) return;
      const dx = point.clientX - touch.x;
      const dy = point.clientY - touch.y;
      touch = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) latest.current.go(dx < 0 ? 1 : -1);
    }

    window.addEventListener("keydown", onKey);
    stage?.addEventListener("click", onClick);
    stage?.addEventListener("wheel", onWheel, { passive: true });
    stage?.addEventListener("touchstart", onTouchStart, { passive: true });
    stage?.addEventListener("touchend", onTouchEnd);
    return () => {
      clearTimeout(pause);
      window.removeEventListener("keydown", onKey);
      stage?.removeEventListener("click", onClick);
      stage?.removeEventListener("wheel", onWheel);
      stage?.removeEventListener("touchstart", onTouchStart);
      stage?.removeEventListener("touchend", onTouchEnd);
    };
  }, [presenting]);

  if (total === 0) return null;
  if (current === null)
    return (
      <button ref={start} className="button button-small bp-present-start" onClick={begin}>
        Present
      </button>
    );
  return (
    <div className="bp-present" role="group" aria-label="Presentation">
      <button
        className="bp-step bp-step-back"
        aria-label="Previous slide"
        disabled={current === 0}
        onClick={() => go(-1)}
      >
        <ArrowIcon />
      </button>
      <output aria-live="polite">
        {current + 1} / {total}
      </output>
      <button
        className="bp-step"
        aria-label="Next slide"
        disabled={current === total - 1}
        onClick={() => go(1)}
      >
        <ArrowIcon />
      </button>
      <button className="button button-small bp-present-end" onClick={end}>
        Exit
      </button>
    </div>
  );
}
