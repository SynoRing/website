import { Fragment } from "react";

/** Copy with line breaks: each "\n" becomes a <br />. */
export function Br({ text }: { text: string }) {
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      {line}
    </Fragment>
  ));
}

/** Fills {name} placeholders. */
export const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (match, key) => String(values[key] ?? match));
