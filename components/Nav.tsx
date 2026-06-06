import { LogoMark } from "./Logo";
import { brand, nav } from "@/lib/content";

export function Nav() {
  return (
    <nav className="absolute top-8 left-16 right-16 z-10 flex items-center justify-between text-[11px] uppercase tracking-[0.25em] font-medium">
      <a
        href="#"
        className="flex items-center gap-3 text-platinum-bright tracking-[0.4em]"
      >
        <LogoMark />
        {brand.mark}
      </a>

      <ul className="hidden md:flex items-center gap-9 text-ivory">
        {nav.links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="opacity-55 hover:opacity-100 transition-opacity"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="text-[10px] tracking-[0.25em] opacity-50">
        {nav.langs.map((l, i) => (
          <span key={l}>
            {l}
            {i < nav.langs.length - 1 && " / "}
          </span>
        ))}
      </div>
    </nav>
  );
}
