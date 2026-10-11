/* Pre-order requests reported to X Ads through its Conversion API, so ad
   campaigns can count and optimize for them. The request matches X's
   official server-side tag: a Pixel access token from Events Manager, no
   OAuth. Server only; plain JavaScript so the tests run it directly. */
import { createHash } from "node:crypto";

/** The Events Manager pixel and its pre-order event (Install with Conversion API). */
export const xPixelId = "rgxw1";
export const xPreorderEventId = "tw-rgxw1-rgxwh";

/** SHA-256 hex, unsalted, as X matches emails. */
export function hashEmail(email) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

/** One pre-order request as a conversion. Identifiers that are missing are left out. */
export function preorderConversion({
  email,
  finish,
  name,
  quantity,
  price,
  twclid = "",
  ip = "",
  userAgent = "",
  sourceUrl = "",
  now = new Date(),
}) {
  const identifier = {
    ...(twclid ? { twclid } : {}),
    hashed_email: hashEmail(email),
    ...(ip ? { ip_address: ip } : {}),
    ...(userAgent ? { user_agent: userAgent } : {}),
  };
  return {
    conversion_timestamp: now.getTime(),
    identifiers: [identifier],
    event_id: xPreorderEventId,
    ...(sourceUrl ? { event_source_url: sourceUrl } : {}),
    value: price * quantity,
    price_currency: "USD",
    contents: [
      { content_id: finish, content_name: name, content_price: price, num_items: quantity },
    ],
    number_items: quantity,
  };
}

export function createXConversions({ token, pixelId = xPixelId, fetch: send = fetch }) {
  const endpoint = `https://ads-api.x.com/12/measurement/conversions/${pixelId}`;
  return {
    /** Sends one conversion; resolves with X's reply. */
    async send(conversion) {
      const response = await send(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", "x-pixel-token": token },
        body: JSON.stringify({ conversions: [conversion] }),
        cache: "no-store",
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(`X Conversion API responded ${response.status} ${detail.slice(0, 300)}`);
      }
      return response.json().catch(() => ({}));
    },
  };
}

/** Production only, so previews and local runs never count as ad conversions. */
export function xConversionsFromEnv(env = process.env) {
  if (env.VERCEL_ENV !== "production" || !env.X_PIXEL_TOKEN) return null;
  return createXConversions({ token: env.X_PIXEL_TOKEN });
}
