import { Fragment } from "react";
import type { LanguageOption } from "./i18n";

/** "中文 / EN": the page's language in bold, the other a link to the same
    page in that language. Shared with the phone menu. */
export function LanguageOptions({ options }: { options: LanguageOption[] }) {
  return options.map((option, index) => (
    <Fragment key={option.href}>
      {index > 0 && <span aria-hidden="true">/</span>}
      {option.current ? (
        <strong lang={option.htmlLang} aria-current="true">
          {option.label}
        </strong>
      ) : (
        <a
          href={option.href}
          hrefLang={option.htmlLang}
          lang={option.htmlLang}
          aria-label={option.name}
        >
          {option.label}
        </a>
      )}
    </Fragment>
  ));
}
