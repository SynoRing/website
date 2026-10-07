"use client";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import type { WaitlistCopy } from "./copy/site";
import type { Lang } from "./i18n";
import { CheckIcon } from "./icons";
import { site } from "./site";
import { fill } from "./text";

/* Email signup posted to /api/waitlist. The homepage joins the waitlist;
   the pre-order review sends the same request with the chosen finish. */

type Details =
  | { source: "waitlist" }
  | { source: "preorder"; finish: string; quantity: number };

type State =
  | { status: "idle" | "sending" }
  | { status: "error"; message: ReactNode }
  | { status: "done"; created: boolean };

export function WaitlistForm({
  lang,
  copy,
  details = { source: "waitlist" },
  submitLabel,
  layout = "inline",
  done,
  onDone,
}: {
  lang: Lang;
  copy: WaitlistCopy;
  details?: Details;
  submitLabel?: string;
  layout?: "inline" | "stacked";
  done: (email: string, created: boolean) => ReactNode;
  onDone?: () => void;
}) {
  const id = useId();
  const errorMessages: Record<string, string> = {
    invalid_email: copy.invalidEmail,
    rate_limited: copy.rateLimited,
  };
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const website = new FormData(event.currentTarget).get("website");
    setState({ status: "sending" });
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...details, email, website, language: lang }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error);
      setState({ status: "done", created: result.created });
      onDone?.();
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      setState({
        status: "error",
        message: errorMessages[code] ?? (
          <>
            {copy.failed} <a href={`mailto:${site.email}`}>{site.email}</a>.
          </>
        ),
      });
    }
  }

  if (state.status === "done")
    return (
      <div className="waitlist-done" role="status">
        <CheckIcon />
        <p>{done(email.trim(), state.created)}</p>
      </div>
    );

  const sending = state.status === "sending";
  return (
    <form className={`waitlist-form waitlist-${layout}`} onSubmit={submit}>
      <div className="waitlist-field">
        <label className="sr-only" htmlFor={`${id}-email`}>
          {copy.email}
        </label>
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          autoComplete="email"
          placeholder={copy.email}
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={state.status === "error" || undefined}
          aria-describedby={`${id}-message`}
        />
        <button className="button button-dark" disabled={sending}>
          {sending ? copy.sending : (submitLabel ?? copy.join)}
        </button>
      </div>
      {/* Left empty by people; automated form fillers tend to complete it. */}
      <input
        className="waitlist-trap"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <p id={`${id}-message`} className="waitlist-message" aria-live="polite">
        {state.status === "error" && state.message}
      </p>
    </form>
  );
}

/** The homepage signup. */
export function WaitlistSignup({ lang, copy }: { lang: Lang; copy: WaitlistCopy }) {
  return (
    <WaitlistForm
      lang={lang}
      copy={copy}
      done={(email, created) => (
        <>
          <strong>{created ? copy.joined : copy.already}</strong>{" "}
          {fill(created ? copy.joinedDetail : copy.alreadyDetail, { email })}
        </>
      )}
    />
  );
}
