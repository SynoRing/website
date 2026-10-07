"use client";
import { useState, type FormEvent } from "react";

const errors: Record<string, string> = {
  wrong_password: "That password isn’t right.",
  rate_limited: "Too many attempts. Try again in an hour.",
};

export function SignIn({ message }: { message?: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/marketing/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (response.ok) return location.reload();
    const result = await response.json().catch(() => ({}));
    setError(errors[result.error] ?? "Couldn’t sign in. Please try again.");
    setBusy(false);
  }

  return (
    <main className="mk-signin">
      <img src="/wordmark.svg" width="132" height="44" alt="SynoRing" />
      <form className="mk-signin-card" onSubmit={submit}>
        <h1>Marketing</h1>
        {message ? (
          <p>{message}</p>
        ) : (
          <>
            <label htmlFor="mk-password">Password</label>
            <input
              id="mk-password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error && <p className="mk-error">{error}</p>}
            <button className="button button-dark" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </>
        )}
      </form>
    </main>
  );
}
