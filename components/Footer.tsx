import { LogoMark } from "./Logo";
import { brand, footer } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-hairline px-6 md:px-16 pt-20 pb-10">
      <div className="mx-auto max-w-7xl">
        {/* Top: brand + columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8">
          <div className="md:col-span-2">
            <a
              href="#"
              className="flex items-center gap-3 text-platinum-bright text-[11px] tracking-[0.4em] uppercase font-medium mb-6"
            >
              <LogoMark />
              {brand.mark}
            </a>
            <p className="font-serif italic text-platinum text-xl leading-snug max-w-sm">
              {brand.tagline}.
            </p>
            <p className="mt-6 text-[10px] tracking-[0.25em] uppercase text-platinum-dim">
              {brand.signature}
            </p>
          </div>

          {footer.cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-[10px] tracking-[0.35em] uppercase text-platinum-dim font-medium mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-ivory-dim hover:text-platinum-bright transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom: legal */}
        <div className="mt-20 pt-8 border-t border-hairline flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-[11px] text-ivory-muted">
          <span>{footer.legal}</span>
          <span className="font-sans">{footer.small}</span>
        </div>
      </div>
    </footer>
  );
}
