import Script from "next/script";

/* Visitor analytics with OpenPanel, self-hosted at op.synoring.ai: page
   views, outgoing links, and the store and waitlist events sent with
   track(). Cookieless. The client ID is public; the project only accepts
   events from synoring.ai. Production only, so previews and local runs
   never count as visits. */
export const openPanel = {
  clientId: "4085c604-cc70-43eb-b12b-2c5ad34b609f",
  apiUrl: "https://op.synoring.ai/api",
  scriptUrl: "https://op.synoring.ai/op1.js",
};

declare global {
  interface Window {
    op?: (...args: unknown[]) => void;
  }
}

/** OpenPanel's loader: queues calls until its script arrives. */
const queue =
  'window.op=window.op||function(){var n=[];return new Proxy(function(){arguments.length&&n.push([].slice.call(arguments))},{get:function(t,r){return"q"===r?n:function(){n.push([r].concat([].slice.call(arguments)))}},has:function(t,r){return"q"===r}})}();';

export function Analytics() {
  if (process.env.VERCEL_ENV !== "production") return null;
  const init = {
    clientId: openPanel.clientId,
    apiUrl: openPanel.apiUrl,
    trackScreenViews: true,
    trackOutgoingLinks: true,
    trackAttributes: true,
  };
  return (
    <>
      <Script id="openpanel" strategy="afterInteractive">
        {`${queue}window.op("init",${JSON.stringify(init)});`}
      </Script>
      <Script src={openPanel.scriptUrl} strategy="afterInteractive" />
    </>
  );
}

/** Records an event once analytics is on the page; does nothing otherwise. */
export function track(
  name: string,
  properties?: Record<string, string | number | boolean>,
) {
  window.op?.("track", name, properties);
}
