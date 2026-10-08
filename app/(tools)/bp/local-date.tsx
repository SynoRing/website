"use client";
import { useSyncExternalStore } from "react";

// The server runs in UTC, so it renders dates in our home time zone; the
// browser then shows them in the viewer's own.
const homeZone = "America/Chicago";
const viewerZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const noChanges = () => () => {};

/** "October 7, 2026", on the day it was in the viewer's time zone. */
export function LocalDate({ value }: { value: string }) {
  const timeZone = useSyncExternalStore(noChanges, viewerZone, () => homeZone);
  return (
    <time dateTime={value}>
      {new Date(value).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone,
      })}
    </time>
  );
}
