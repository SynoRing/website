/* Helpers shared by the dashboard's views. */

const errorText: Record<string, string> = {
  storage_unavailable: "The database isn’t connected yet.",
  email_unavailable:
    "Email sending isn’t set up yet. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_EMAIL_TOKEN in Vercel.",
  postal_address_missing:
    "Add MAIL_POSTAL_ADDRESS in Vercel first. US law requires a postal address in marketing email.",
  empty_audience: "Nobody is in this audience yet.",
  invalid_email: "Enter a valid email address.",
  missing_content: "Add a subject and a body first.",
  invalid_label: "Say who this password is for.",
  invalid_password: "Passwords need 8 to 64 characters.",
  password_taken: "Another recipient already has that password.",
  not_found: "That recipient no longer exists. Refresh the page.",
  not_pdf: "Choose a PDF file.",
  too_large: "That file is too large.",
  upload_incomplete: "The upload didn’t finish. Try again.",
  empty_draft: "Write the web version or attach a PDF first.",
};

export class ApiError extends Error {}

export async function api(path: string, method = "GET", body?: object) {
  const response = await fetch(`/api/marketing/${path}`, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 401) location.reload();
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(
      errorText[data.error] ?? data.detail ?? `Request failed (${response.status}).`,
    );
  return data;
}

export const message = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong.";

export const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

export type Notify = (notice: { tone: "error" | "ok"; text: string } | null) => void;
