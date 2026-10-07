"use client";

/** Saves the web version as a PDF through the browser's print dialog. */
export function PrintButton() {
  return (
    <button className="button button-small button-dark bp-download" onClick={() => print()}>
      Save as PDF
    </button>
  );
}
