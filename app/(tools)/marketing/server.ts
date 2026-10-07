import { businessPlanFromEnv } from "../../business-plan.mjs";
import { renderEmail } from "../../email-template.mjs";
import {
  mailerFromEnv,
  unsubscribeHeaders,
  unsubscribeUrl,
} from "../../mailer.mjs";
import { site } from "../../site";
import { finishes } from "../../store/product";
import { waitlistFromEnv } from "../../waitlist.mjs";
import { isSignedIn } from "./session";

/* Shared by the dashboard's API routes. */

type Store = NonNullable<ReturnType<typeof waitlistFromEnv>>;
type Mailer = NonNullable<ReturnType<typeof mailerFromEnv>>;
type Plan = NonNullable<ReturnType<typeof businessPlanFromEnv>>;

export function json(status: number, body: object) {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
}

/** Signed-in, same-origin requests get the store; anything else gets the
    response to send back. */
export async function authorize(
  request: Request,
): Promise<{ store: Store; denied?: never } | { denied: Response; store?: never }> {
  if (!(await isSignedIn())) return { denied: json(401, { error: "unauthorized" }) };
  const origin = request.headers.get("origin");
  if (request.method !== "GET" && origin && origin !== new URL(request.url).origin)
    return { denied: json(403, { error: "forbidden" }) };
  const store = waitlistFromEnv();
  if (!store) return { denied: json(503, { error: "storage_unavailable" }) };
  return { store };
}

/** Like authorize, for the business plan's routes. */
export async function authorizePlan(
  request: Request,
): Promise<{ plan: Plan; denied?: never } | { denied: Response; plan?: never }> {
  const { denied } = await authorize(request);
  return denied ? { denied } : { plan: businessPlanFromEnv()! };
}

export function postalAddress() {
  return process.env.MAIL_POSTAL_ADDRESS?.trim() ?? "";
}

/** What the dashboard needs to know about this deployment's setup. */
export function setupStatus() {
  const mailer = mailerFromEnv();
  return {
    storage: Boolean(waitlistFromEnv()),
    email: Boolean(mailer),
    from: mailer?.from ?? process.env.MAIL_FROM ?? "SynoRing <noreply@synoring.ai>",
    replyTo: mailer?.replyTo ?? process.env.MAIL_REPLY_TO ?? site.email,
    postalAddress: postalAddress(),
  };
}

export type Message = {
  subject: string;
  preheader?: string;
  body: string;
  reason?: string;
};

/** Renders a message for one person, with their unsubscribe link, and
    sends it. */
export async function deliver(
  store: Store,
  mailer: Mailer,
  to: string,
  message: Message,
  variables: Record<string, string> = {},
) {
  const secret = await store.secret();
  const { subject, html, text } = renderEmail({
    subject: message.subject,
    preheader: message.preheader,
    body: message.body,
    variables: { email: to, ...variables },
    footer: {
      reason: message.reason,
      unsubscribeUrl: unsubscribeUrl(site.url, secret, to),
      postalAddress: postalAddress(),
      organization: site.organization,
    },
  });
  return mailer.send({
    to,
    subject,
    html,
    text,
    headers: unsubscribeHeaders(site.url, secret, to),
  });
}

/** Per-recipient values for {{finish}} and {{quantity}}. */
export function recipientVariables(entry: Record<string, string>) {
  return {
    finish: finishes.find((item) => item.id === entry.finish)?.name ?? "",
    quantity: entry.quantity ?? "",
  };
}
