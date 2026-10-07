"use client";

import { useRef, useState } from "react";
import type { LanguageOption } from "./i18n";
import { CloseIcon } from "./icons";
import { LanguageOptions } from "./language-options";

export function MobileNavigation({
  active,
  copy,
  links,
  languages,
}: {
  active: string;
  copy: { label: string; open: string; close: string };
  /** [href in this language, label, page path] */
  links: [string, string, string][];
  /** "中文 / EN", shown here on narrow phones. */
  languages: LanguageOption[];
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div className="mobile-navigation">
      <button
        ref={trigger}
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? copy.close : copy.open}
        onClick={() => setOpen(!open)}
      >
        {open ? (
          <CloseIcon />
        ) : (
          <>
            <span />
            <span />
          </>
        )}
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label={copy.label}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              trigger.current?.focus();
            }
          }}
        >
          {links.map(([href, label, path]) => (
            <a
              key={href}
              href={href}
              aria-current={active === path ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="menu-language">
            <LanguageOptions options={languages} />
          </div>
        </nav>
      )}
    </div>
  );
}
