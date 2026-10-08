import { cookies } from "next/headers";
import { businessPlanFromEnv, partBytes } from "../../business-plan.mjs";

/* Shared by the /bp page, the dashboard's preview, and the routes that
   serve the plan's PDF. */

export type Plan = NonNullable<ReturnType<typeof businessPlanFromEnv>>;
export type Version = Record<string, string>;

export const viewerCookie = "synoring_bp";

/** The visitor's viewer record and recipient, if they have signed in and
    their recipient's password is still on. */
export async function currentViewer(plan: Plan) {
  return plan.session((await cookies()).get(viewerCookie)?.value);
}

type StoredFile = { upload: string; parts: string | number; size: string | number };

/** Streams a stored file part by part, or the byte range asked for, so
    videos can seek. A streamed response isn't held to Vercel's 4.5 MB
    response limit. */
export function fileResponse(
  plan: Plan,
  file: StoredFile,
  headers: Record<string, string>,
  range?: string | null,
) {
  const size = Number(file.size);
  let start = 0;
  let end = size - 1;
  const match = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (range && match && (match[1] || match[2])) {
    if (match[1]) {
      start = Number(match[1]);
      if (match[2]) end = Math.min(Number(match[2]), size - 1);
    } else start = Math.max(0, size - Number(match[2]));
    if (start > end || start >= size)
      return new Response(null, {
        status: 416,
        headers: { "content-range": `bytes */${size}` },
      });
  }
  let part = Math.floor(start / partBytes);
  const last = Math.floor(end / partBytes);
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (part > last) return controller.close();
      const data = await plan.readPart(file.upload, part);
      if (data === null) return controller.error(new Error("Stored file part missing"));
      const bytes = Buffer.from(data, "base64");
      const offset = part * partBytes;
      const from = Math.max(start - offset, 0);
      const to = Math.min(end - offset + 1, bytes.length);
      part++;
      controller.enqueue(new Uint8Array(bytes.subarray(from, to)));
    },
  });
  const partial = start !== 0 || end !== size - 1;
  return new Response(body, {
    status: partial ? 206 : 200,
    headers: {
      ...headers,
      "accept-ranges": "bytes",
      "content-length": String(end - start + 1),
      ...(partial ? { "content-range": `bytes ${start}-${end}/${size}` } : {}),
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

/** A version's PDF, inline or as a download. */
export function pdfResponse(plan: Plan, version: Version, { download = false } = {}) {
  const name = version.number
    ? `SynoRing business plan v${version.number}.pdf`
    : "SynoRing business plan.pdf";
  return fileResponse(
    plan,
    { upload: version.pdfUpload, parts: version.pdfParts, size: version.pdfSize },
    {
      "content-type": "application/pdf",
      "content-disposition": `${download ? "attachment" : "inline"}; filename="${name}"`,
      "cache-control": "private, no-store",
    },
  );
}

export const notFound = () =>
  new Response("Not found", {
    status: 404,
    headers: { "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
