"use client";
import { useState, type FormEvent } from "react";
import { site } from "../../site";

const errors: Record<string, string> = {
  wrong_password: "That password isn’t valid, or it has been turned off.",
  rate_limited: "Too many attempts. Try again in an hour.",
};

export function PlanGate({ available }: { available: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/bp/access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) return location.reload();
      const result = await response.json().catch(() => ({}));
      setError(errors[result.error] ?? "Couldn’t open the plan. Please try again.");
    } catch {
      setError("Couldn’t reach the server. Check your connection and try again.");
    }
    setBusy(false);
  }

  return (
    <main className="bp-gate">
      <a href="/" aria-label="SynoRing home">
        <img src="/wordmark.svg" width="132" height="44" alt="SynoRing" />
      </a>
      <form className="bp-card" onSubmit={submit}>
        <p className="bp-eyebrow">Private</p>
        <h1>SynoRing business plan</h1>
        {!available ? (
          <p className="bp-lede">
            The plan isn’t available right now. Email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> and we’ll send it
            to you.
          </p>
        ) : (
          <>
            <p className="bp-lede">Enter the password we sent you.</p>
            <label className="bp-field">
              Password
              <input
                name="password"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                required
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <p className="bp-note">
              Each password is made for one person or team, and we can see
              when it’s used. Please keep the plan among the people you work
              with, and don’t forward it or the password. If someone else
              should see it, like a co-investor, just ask and we’ll send
              them their own.
            </p>
            {error && (
              <p className="bp-error" role="alert">
                {error}
              </p>
            )}
            <button className="button button-dark" disabled={busy}>
              {busy ? "Opening…" : "Open the plan"}
            </button>
            <p className="bp-help">
              Need access? Email <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          </>
        )}
      </form>
    </main>
  );
}
