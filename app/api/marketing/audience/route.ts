import { authorize, json } from "../../../(tools)/marketing/server";
import { normalizeEmail, selectAudience } from "../../../waitlist.mjs";

/** Every entry, newest first, with counts for each audience. */
export async function GET(request: Request) {
  const { store, denied } = await authorize(request);
  if (denied) return denied;
  const entries = (await store.list()).reverse();
  return json(200, {
    entries,
    counts: {
      total: entries.length,
      all: selectAudience(entries, "all").length,
      preorder: selectAudience(entries, "preorder").length,
      waitlist: selectAudience(entries, "waitlist").length,
      unsubscribed: entries.filter((entry) => entry.unsubscribedAt).length,
    },
  });
}

/** Removes one person, for example when they ask to be deleted. */
export async function DELETE(request: Request) {
  const { store, denied } = await authorize(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);
  if (!email) return json(400, { error: "invalid_email" });
  await store.remove(email);
  return json(200, { ok: true });
}
