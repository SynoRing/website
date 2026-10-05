import { authorize } from "../../../marketing/server";
import { toCsv } from "../../../waitlist.mjs";

/** The whole list as CSV. */
export async function GET(request: Request) {
  const { store, denied } = await authorize(request);
  if (denied) return denied;
  const date = new Date().toISOString().slice(0, 10);
  return new Response(toCsv(await store.list()), {
    headers: {
      "cache-control": "no-store",
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="synoring-mailing-list-${date}.csv"`,
    },
  });
}
