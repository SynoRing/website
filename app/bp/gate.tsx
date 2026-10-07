"use client";
import { useState, type FormEvent } from "react";
import { site } from "../site";
import { terms } from "./terms";

const errors: Record<string, string> = {
  wrong_password: "That password isn’t valid, or it has been turned off.",
  rate_limited: "Too many attempts. Try again in an hour.",
  invalid_name: "Enter your name.",
  invalid_email: "Enter a valid email address.",
  terms_not_accepted: "Please accept the confidentiality terms.",
};

export function PlanGate({ available }: { available: boolean }) {
  const [form, setForm] = useState({ password: "", name: "", email: "", agree: false });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (field: keyof typeof form) => (value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/bp/access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
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
        <p className="bp-eyebrow">Confidential</p>
        <h1>SynoRing business plan</h1>
        {!available ? (
          <p className="bp-lede">
            The plan isn’t available right now. Email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> and we’ll send it
            to you.
          </p>
        ) : (
          <>
            <p className="bp-lede">
              Enter the password you were given, then confirm who you are and
              agree to keep the plan confidential.
            </p>
            <label className="bp-field">
              Password
              <input
                name="password"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                required
                autoFocus
                value={form.password}
                onChange={(event) => set("password")(event.target.value)}
              />
            </label>
            <div className="bp-pair">
              <label className="bp-field">
                Full name
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={(event) => set("name")(event.target.value)}
                />
              </label>
              <label className="bp-field">
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(event) => set("email")(event.target.value)}
                />
              </label>
            </div>
            <section
              className="bp-terms"
              tabIndex={0}
              aria-labelledby="bp-terms-title"
            >
              <h2 id="bp-terms-title">Confidentiality terms</h2>
              <p>By opening the business plan, you agree with SynoRing Labs that:</p>
              <ol>
                {terms.map((term) => (
                  <li key={term}>{term}</li>
                ))}
              </ol>
              <p>
                When you accept, we record your name, email, IP address, and the
                time.
              </p>
            </section>
            <label className="bp-check">
              <input
                type="checkbox"
                required
                checked={form.agree}
                onChange={(event) => set("agree")(event.target.checked)}
              />
              I have read and agree to these confidentiality terms.
            </label>
            {error && (
              <p className="bp-error" role="alert">
                {error}
              </p>
            )}
            <button className="button button-dark" disabled={busy}>
              {busy ? "Opening…" : "Agree and open the plan"}
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
