import type { Metadata } from "next";
import { verifyUnsubscribe } from "../mailer.mjs";
import { site } from "../site";
import { waitlistFromEnv } from "../waitlist.mjs";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

/* Opened from the footer of every email. Unsubscribing takes a click, so
   link scanners that open the URL do not unsubscribe anyone. */
export default async function Unsubscribe({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string; done?: string }>;
}) {
  const { e: email = "", t: token = "", done } = await searchParams;
  const store = waitlistFromEnv();
  const valid =
    !done && store ? verifyUnsubscribe(await store.secret(), email, token) : false;

  return (
    <main className="unsubscribe-page">
      <a href="/" aria-label="SynoRing home">
        <img src="/wordmark.svg" width="132" height="44" alt="SynoRing" />
      </a>
      <div className="unsubscribe-card">
        {done ? (
          <>
            <h1>You’re unsubscribed.</h1>
            <p>
              You won’t receive SynoRing emails anymore. Joining the waitlist
              again will sign you back up.
            </p>
            <a className="button button-dark" href="/">
              Back to SynoRing
            </a>
          </>
        ) : valid ? (
          <>
            <h1>Unsubscribe from SynoRing emails?</h1>
            <p>
              <strong>{email}</strong> will stop receiving launch updates and
              other emails from us.
            </p>
            <form method="post" action="/api/unsubscribe">
              <input type="hidden" name="e" value={email} />
              <input type="hidden" name="t" value={token} />
              <button className="button button-dark">Unsubscribe</button>
            </form>
          </>
        ) : (
          <>
            <h1>This link didn’t work.</h1>
            <p>
              It may be incomplete. Email{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a> and we’ll remove
              you from the list.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
