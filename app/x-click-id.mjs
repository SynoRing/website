/* The X click ID: X ads open the site with ?twclid=, and the site keeps it
   in a first-party cookie until a pre-order is reported (x-conversions.mjs).
   Shared by the browser and the server, so nothing here is server only. */

export const clickIdCookie = "twclid";
export const clickIdPattern = /^[\w-]{1,200}$/;

/** The stored X click ID from a Cookie header, or "". */
export function clickIdFrom(cookieHeader) {
  for (const part of (cookieHeader ?? "").split(";")) {
    const [name, value = ""] = part.trim().split("=");
    if (name === clickIdCookie && clickIdPattern.test(value)) return value;
  }
  return "";
}
