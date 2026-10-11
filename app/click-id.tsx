"use client";
import { useEffect } from "react";
import { clickIdCookie, clickIdPattern } from "./x-click-id.mjs";

/* Keeps the X click ID an ad visit arrives with (?twclid=) for 30 days, so a
   pre-order made later, on any page, is credited to that ad. */
export function ClickId() {
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("twclid");
    if (id && clickIdPattern.test(id))
      document.cookie = `${clickIdCookie}=${id}; path=/; max-age=${30 * 86400}; samesite=lax; secure`;
  }, []);
  return null;
}
