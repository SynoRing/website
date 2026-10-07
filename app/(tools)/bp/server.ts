import { cookies } from "next/headers";
import { businessPlanFromEnv } from "../../business-plan.mjs";

/* Shared by the /bp page, the dashboard's preview, and the routes that
   serve the plan's PDF. */

export type Plan = NonNullable<ReturnType<typeof businessPlanFromEnv>>;
export type Version = Record<string, string>;

export const viewerCookie = "synoring_bp";

/** The visitor's viewer record and recipient, if they have accepted the
    terms and their recipient's password is still on. */
export async function currentViewer(plan: Plan) {
  return plan.session((await cookies()).get(viewerCookie)?.value);
}

export const longDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

/** "Version 3 · October 6, 2026", or "Latest · updated October 7, 2026"
    for the live plan. */
export const versionLabel = (version: Version) =>
  version.number
    ? `Version ${version.number} · ${longDate(version.lockedAt)}`
    : `Latest · updated ${longDate(version.updatedAt)}`;

/** Streams a version's PDF part by part. A streamed response isn't held to
    Vercel's 4.5 MB response limit. */
export function pdfResponse(plan: Plan, version: Version, { download = false } = {}) {
  const parts = Number(version.pdfParts);
  let index = 0;
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (index >= parts) return controller.close();
      const part = await plan.readPart(version.pdfUpload, index++);
      if (part === null) return controller.error(new Error("Business plan part missing"));
      controller.enqueue(new Uint8Array(Buffer.from(part, "base64")));
    },
  });
  const name = version.number
    ? `SynoRing business plan v${version.number}.pdf`
    : "SynoRing business plan.pdf";
  return new Response(body, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `${download ? "attachment" : "inline"}; filename="${name}"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

export const notFound = () =>
  new Response("Not found", {
    status: 404,
    headers: { "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
