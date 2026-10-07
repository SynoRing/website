"use client";
import { useEffect, useState } from "react";

/* Shows the PDF inline on wide screens. Phones can't show a PDF inside a
   page, so they get a button that opens it in their own viewer. */
export function PlanFrame({ src }: { src: string }) {
  const [wide, setWide] = useState<boolean | null>(null);
  useEffect(() => {
    const query = matchMedia("(min-width: 760px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (wide === null) return <div className="bp-stage" />;
  if (wide)
    return (
      <iframe
        className="bp-frame"
        src={`${src}#view=FitH`}
        title="SynoRing business plan"
      />
    );
  return (
    <div className="bp-stage">
      <p>The PDF opens in your phone’s viewer.</p>
      <a className="button button-dark" href={src} target="_blank" rel="noopener">
        Open the PDF
      </a>
    </div>
  );
}
