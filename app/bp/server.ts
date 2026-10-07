import { cookies } from "next/headers";
import { businessPlanFromEnv } from "../business-plan.mjs";

/* Shared by the /bp page and the routes that serve the plan. */

export type Plan = NonNullable<ReturnType<typeof businessPlanFromEnv>>;

export const viewerCookie = "synoring_bp";

/** The visitor's viewer record and recipient, if they have accepted the
    terms and their recipient's password is still on. */
export async function currentViewer(plan: Plan) {
  return plan.session((await cookies()).get(viewerCookie)?.value);
}

/** Streams the stored PDF part by part. A streamed response isn't held to
    Vercel's 4.5 MB response limit. */
export function documentResponse(
  plan: Plan,
  document: Record<string, string>,
  { download = false } = {},
) {
  const parts = Number(document.parts);
  let index = 0;
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (index >= parts) return controller.close();
      const part = await plan.readPart(document.version, index++);
      if (part === null) return controller.error(new Error("Business plan part missing"));
      controller.enqueue(new Uint8Array(Buffer.from(part, "base64")));
    },
  });
  return new Response(body, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `${download ? "attachment" : "inline"}; filename="SynoRing business plan.pdf"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
