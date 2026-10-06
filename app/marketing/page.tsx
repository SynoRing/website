import type { Metadata } from "next";
import { Dashboard } from "./dashboard";
import { setupStatus } from "./server";
import { isSignedIn } from "./session";
import { SignIn } from "./sign-in";
import "./marketing.css";

// Always checks the session cookie, never prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marketing",
  robots: { index: false, follow: false },
};

/* The marketing dashboard: the mailing list, an email composer with live
   preview, and campaign sends. Behind WAITLIST_ADMIN_PASSWORD. */
export default async function Marketing() {
  if (!process.env.WAITLIST_ADMIN_PASSWORD)
    return (
      <SignIn message="Set WAITLIST_ADMIN_PASSWORD in the Vercel project settings to turn on the dashboard." />
    );
  if (!(await isSignedIn())) return <SignIn />;
  return <Dashboard setup={setupStatus()} />;
}
