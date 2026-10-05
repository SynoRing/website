"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/** Cycles through words in place. The slot eases to each word's width so the
    surrounding line stays centred. Screen readers get the full sentence from
    the heading instead, so this is hidden from them. */
export function RotatingWords({
  words,
  interval = 2200,
}: {
  words: readonly string[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [widths, setWidths] = useState<number[] | null>(null);
  const items = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const measure = () =>
      setWidths(
        items.current.map((item) => item?.getBoundingClientRect().width ?? 0),
      );
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = still.matches
      ? undefined
      : window.setInterval(
          () => setIndex((current) => (current + 1) % words.length),
          interval,
        );
    return () => {
      window.removeEventListener("resize", measure);
      window.clearInterval(timer);
    };
  }, [words.length, interval]);

  const previous = (index - 1 + words.length) % words.length;
  return (
    <span
      className={`word-rotator${widths ? " is-ready" : ""}`}
      style={
        widths ? ({ "--word-width": `${widths[index]}px` } as CSSProperties) : undefined
      }
      aria-hidden="true"
    >
      <span className="word-rotator-strut">{"​"}</span>
      {words.map((word, i) => (
        <span
          key={word}
          ref={(element) => {
            items.current[i] = element;
          }}
          className={
            i === index ? "is-active" : i === previous ? "is-leaving" : undefined
          }
        >
          {word}
        </span>
      ))}
    </span>
  );
}
