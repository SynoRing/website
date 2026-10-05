"use client";

import { useRef, useState } from "react";
import { CloseIcon } from "./icons";
import { navigation } from "./site";

export function MobileNavigation({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div className="mobile-navigation">
      <button
        ref={trigger}
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close navigation" : "Open navigation"}
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
          aria-label="Mobile navigation"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              trigger.current?.focus();
            }
          }}
        >
          {navigation.map(([href, label]) => (
            <a
              key={href}
              href={href}
              aria-current={active === href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
