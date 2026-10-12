"use client";

import { useEffect, useRef } from "react";

/** A silent screen recording that loads and plays only while it is in view,
    and stays paused once the visitor pauses it. Visitors who prefer reduced
    motion start it themselves with the controls. */
export function DemoVideo({
  src,
  poster,
  label,
}: {
  src: string;
  poster: string;
  label: string;
}) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let pausedByVisitor = false;
    let pausingForScroll = false;
    const onPause = () => {
      pausedByVisitor = !pausingForScroll;
      pausingForScroll = false;
    };
    const onPlay = () => {
      pausedByVisitor = false;
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!pausedByVisitor) element.play().catch(() => {});
        } else if (!element.paused) {
          pausingForScroll = true;
          element.pause();
        }
      },
      { threshold: 0.5 },
    );
    element.addEventListener("pause", onPause);
    element.addEventListener("play", onPlay);
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.removeEventListener("pause", onPause);
      element.removeEventListener("play", onPlay);
    };
  }, []);

  return (
    <video
      ref={video}
      src={src}
      poster={poster}
      aria-label={label}
      muted
      loop
      playsInline
      controls
      preload="none"
    />
  );
}
