/* Sending through Cloudflare Email Service's REST API, plus the signed
   unsubscribe links every message carries. Server only. */
import { createHmac, timingSafeEqual } from "node:crypto";

/** "SynoRing <noreply@synoring.ai>" → { address, name } */
export function parseAddress(value) {
  const match = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(value);
  return match
    ? { address: match[2].trim(), name: match[1].replace(/^"|"$/g, "") }
    : { address: value.trim() };
}

export function createMailer({
  accountId,
  token,
  from,
  replyTo,
  apiBase = "https://api.cloudflare.com/client/v4",
  fetch: send = fetch,
}) {
  const endpoint = `${apiBase.replace(/\/$/, "")}/accounts/${accountId}/email/sending/send`;
  return {
    from,
    replyTo,
    /** Sends one message to one recipient; resolves with its message id. */
    async send({ to, subject, html, text, headers }) {
      const response = await send(endpoint, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          to: [to],
          from: parseAddress(from),
          ...(replyTo ? { reply_to: replyTo } : {}),
          subject,
          html,
          text,
          ...(headers ? { headers } : {}),
        }),
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) {
        const detail = payload?.errors
          ?.map((error) => `${error.code} ${error.message}`)
          .join("; ");
        throw new Error(detail || `Email API responded ${response.status}`);
      }
      const result = payload.result ?? {};
      if (result.permanent_bounces?.length) throw new Error("Address bounced");
      if (result.suppressed_recipients?.length)
        throw new Error("Address is on the suppression list");
      return result.message_id ?? "";
    },
  };
}

/** The mailer configured for this deployment, or null. */
export function mailerFromEnv(env = process.env) {
  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_EMAIL_TOKEN) return null;
  return createMailer({
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
    token: env.CLOUDFLARE_EMAIL_TOKEN,
    from: env.MAIL_FROM || "SynoRing <noreply@synoring.ai>",
    replyTo: env.MAIL_REPLY_TO || "contact@synoring.ai",
    apiBase: env.CLOUDFLARE_API_BASE || undefined,
  });
}

export function unsubscribeToken(secret, email) {
  return createHmac("sha256", secret)
    .update(`unsubscribe:${email}`)
    .digest("base64url")
    .slice(0, 32);
}

export function verifyUnsubscribe(secret, email, token) {
  if (typeof email !== "string" || typeof token !== "string") return false;
  const expected = Buffer.from(unsubscribeToken(secret, email));
  const supplied = Buffer.from(token);
  return (
    expected.length === supplied.length && timingSafeEqual(expected, supplied)
  );
}

function unsubscribeQuery(secret, email) {
  return `e=${encodeURIComponent(email)}&t=${unsubscribeToken(secret, email)}`;
}

/** The page a person opens from the footer link. */
export function unsubscribeUrl(siteUrl, secret, email) {
  return `${siteUrl}/unsubscribe?${unsubscribeQuery(secret, email)}`;
}

/** One-click unsubscribe (RFC 8058), which Gmail and Yahoo expect. */
export function unsubscribeHeaders(siteUrl, secret, email) {
  return {
    "List-Unsubscribe": `<${siteUrl}/api/unsubscribe?${unsubscribeQuery(secret, email)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
