"use client";
import { useEffect, useState } from "react";

/* Shows the PDF inline on wide screens. Phones can't show a PDF inside a
   page, so they get a button that opens it in their own viewer. */
export function PlanFrame() {
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
        src="/api/bp/document#view=FitH"
        title="SynoRing business plan"
      />
    );
  return (
    <div className="bp-stage">
      <p>The plan opens in your phone’s PDF viewer.</p>
      <a
        className="button button-dark"
        href="/api/bp/document"
        target="_blank"
        rel="noopener"
      >
        Open the business plan
      </a>
    </div>
  );
}
