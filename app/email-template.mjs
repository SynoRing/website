/* The SynoRing email layout, shared by the marketing composer's live
   preview, campaign sends, and signup confirmations. Pure string work, so it
   runs in the browser and on the server alike.

   Drafts are written as plain HTML (h1, h2, p, ul, a, img, hr). styleBody()
   inlines the house style, because most mail clients ignore stylesheets;
   <a class="button"> becomes a pill button. {{email}}, {{finish}}, and
   {{quantity}} are replaced per recipient. */

const siteUrl = "https://www.synoring.ai";
const fontStack =
  "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const tagStyles = {
  h1: "margin:0 0 16px;font-size:30px;line-height:1.15;font-weight:500;letter-spacing:-0.02em;color:#1e2420;",
  h2: "margin:28px 0 12px;font-size:21px;line-height:1.3;font-weight:500;letter-spacing:-0.01em;color:#1e2420;",
  h3: "margin:24px 0 8px;font-size:17px;line-height:1.35;font-weight:500;color:#1e2420;",
  p: "margin:0 0 16px;font-size:16px;line-height:1.6;color:#4f5952;",
  ul: "margin:0 0 16px;padding-left:22px;color:#4f5952;",
  ol: "margin:0 0 16px;padding-left:22px;color:#4f5952;",
  li: "margin:0 0 6px;font-size:16px;line-height:1.6;",
  a: "color:#4b6a3c;text-decoration:underline;",
  img: "display:block;max-width:100%;height:auto;margin:8px 0 20px;border:0;border-radius:12px;",
  hr: "margin:28px 0;border:0;border-top:1px solid #e4e8e1;",
  blockquote:
    "margin:0 0 16px;padding:2px 0 2px 16px;border-left:3px solid #d2d9ce;color:#4f5952;",
};
const buttonStyle =
  "display:inline-block;padding:15px 28px;border-radius:999px;background:#273a2f;color:#ffffff;font-size:15px;font-weight:500;line-height:1;text-decoration:none;";

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Replaces {{name}} with the recipient's value. Unknown names stay
    visible so a typo shows up in the preview. */
export function fillVariables(template, variables, escape = escapeHtml) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) =>
    variables[name] == null ? match : escape(variables[name]),
  );
}

/** Adds the house style to plain tags; tags with their own style keep it. */
export function styleBody(html) {
  return html.replace(
    /<(h1|h2|h3|p|ul|ol|li|a|img|hr|blockquote)\b([^>]*?)(\/?)>/gi,
    (tag, name, attributes, slash) => {
      if (/\sstyle\s*=/i.test(attributes)) return tag;
      const key = name.toLowerCase();
      const style =
        key === "a" && /\sclass\s*=\s*["'][^"']*\bbutton\b/i.test(attributes)
          ? buttonStyle
          : tagStyles[key];
      return `<${name}${attributes.trimEnd()} style="${style}"${slash ? " /" : ""}>`;
    },
  );
}

const entities = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };

/** A readable plain-text version for clients that do not show HTML. */
export function htmlToText(html) {
  return html
    // Source line breaks are just spaces in HTML.
    .replace(/\s*\n\s*/g, " ")
    .replace(/<(style|script|head)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(
      /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (match, href, label) => {
        const text = label.replace(/<[^>]+>/g, "").trim();
        return !text || text === href ? href : `${text} (${href})`;
      },
    )
    .replace(/<img\b[^>]*alt\s*=\s*["']([^"']*)["'][^>]*>/gi, "$1")
    .replace(/<li\b[^>]*>/gi, "• ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<hr\b[^>]*>/gi, "\n———\n")
    .replace(/<\/(p|h1|h2|h3|ul|ol|blockquote|table|div)>/gi, "\n\n")
    .replace(/<\/(li|tr)>/gi, "\n")
    .replace(/<\/td>/gi, "  ")
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (match, name) => entities[name])
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Builds the full message, with {{names}} filled in the subject, preview
    text, and body. `footer.reason` says why the person is getting
    it; `footer.unsubscribeUrl` and `footer.postalAddress` are required for
    marketing mail (CAN-SPAM) and shown on every message. */
export function renderEmail({
  subject,
  preheader = "",
  body,
  variables = {},
  footer = {},
}) {
  const plain = (value) => fillVariables(value, variables, String);
  subject = plain(subject);
  preheader = plain(preheader);
  const content = styleBody(fillVariables(body, variables));
  const textContent = htmlToText(plain(body));
  const {
    reason = "You’re receiving this because you joined the SynoRing waitlist at synoring.ai.",
    unsubscribeUrl,
    postalAddress,
    organization = "SynoRing Labs",
  } = footer;
  const company = [organization, postalAddress].filter(Boolean).join(" · ");
  const footerStyle = "color:#6b756d;text-decoration:underline;";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; background: #f1f3ee; }
  @media (max-width: 600px) {
    .email-outer { padding: 20px 10px !important; }
    .email-card { padding: 30px 22px 26px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f1f3ee;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(preheader)}${"&#847;&zwnj;&nbsp;".repeat(30)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f1f3ee;">
<tr><td align="center" class="email-outer" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
<tr><td style="padding:0 6px 22px;">
<a href="${siteUrl}" style="text-decoration:none;"><img src="${siteUrl}/email/wordmark.png" width="120" height="40" alt="SynoRing" style="display:block;width:120px;height:40px;border:0;"></a>
</td></tr>
<tr><td class="email-card" style="padding:40px 40px 34px;background:#ffffff;border-radius:20px;font-family:${fontStack};color:#4f5952;">
${content}
</td></tr>
<tr><td style="padding:22px 6px 0;font-family:${fontStack};font-size:12px;line-height:1.7;color:#8a948b;">
${escapeHtml(reason)}<br>
${unsubscribeUrl ? `<a href="${escapeHtml(unsubscribeUrl)}" style="${footerStyle}">Unsubscribe</a> · ` : ""}<a href="${siteUrl}" style="${footerStyle}">synoring.ai</a><br>
${escapeHtml(company)}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    textContent,
    "—",
    reason,
    unsubscribeUrl ? `Unsubscribe: ${unsubscribeUrl}` : "",
    company,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { subject, html, text };
}

/* Starting points for the composer. */
const productImage = `<img src="${siteUrl}/email/synoring-r1-finishes.jpg" width="480" alt="SynoRing R1 in Space Gray, Platinum, Rose Gold, and Gold" />`;

export const starterDrafts = [
  {
    name: "Product update",
    subject: "SynoRing update: what we’ve been building",
    preheader: "Progress on SynoRing R1, and what comes next.",
    body: `<h1>A closer look at SynoRing R1.</h1>
<p>Hi there,</p>
<p>Thanks for following SynoRing. Here is what the team has been working on.</p>
<h2>What’s new</h2>
<ul>
  <li>First update goes here.</li>
  <li>Second update goes here.</li>
</ul>
<h2>What’s next</h2>
<p>A sentence about the next milestone.</p>
<p><a class="button" href="${siteUrl}">See the latest</a></p>
<p>— The SynoRing team</p>`,
  },
  {
    name: "Pre-order invitation",
    subject: "SynoRing R1 is open for pre-order",
    preheader: "Reserve yours at $99 — $30 below the regular price.",
    body: `<h1>SynoRing R1 is open for pre-order.</h1>
<p>Hi there,</p>
<p>You joined the waitlist early, so you are among the first to hear: SynoRing R1 is now open for pre-order at <strong>$99</strong> (regularly $129).</p>
${productImage}
<ul>
  <li>Four finishes: Space Gray, Platinum, Rose Gold, and Gold.</li>
  <li>A sizing kit ships first, so your ring fits.</li>
  <li>Estimated to ship in Q1 2027, free within the US.</li>
</ul>
<p><a class="button" href="${siteUrl}/store">Pre-order SynoRing R1</a></p>
<p>— The SynoRing team</p>`,
  },
  {
    name: "Sizing kit on its way",
    subject: "Your SynoRing sizing kit is on its way",
    preheader: "Find your size before your ring ships.",
    body: `<h1>Your sizing kit is on its way.</h1>
<p>Hi there,</p>
<p>Thanks for pre-ordering SynoRing R1 in {{finish}}. Your sizing kit has shipped, so you can find the right fit before your ring is made.</p>
<h2>How to use it</h2>
<ol>
  <li>Wear each sample ring on the finger you plan to use, for a few hours.</li>
  <li>Choose the size that feels snug but turns over the knuckle easily.</li>
  <li>Reply to this email with your size.</li>
</ol>
<p>Your ring is estimated to ship in Q1 2027.</p>
<p>— The SynoRing team</p>`,
  },
];

/** The automatic reply to a signup. */
export function confirmationEmail(kind, details = {}) {
  if (kind === "preorder") {
    const row = (label, value, strong = false) =>
      `<tr><td style="padding:10px 0;border-bottom:1px solid #e4e8e1;font-size:15px;color:#6b756d;">${label}</td><td align="right" style="padding:10px 0;border-bottom:1px solid #e4e8e1;font-size:15px;color:${strong ? "#1e2420" : "#4f5952"};">${value}</td></tr>`;
    return {
      subject: "Your SynoRing R1 pre-order request",
      preheader: "We’ll be in touch to confirm your size and next steps.",
      body: `<h1>Pre-order request received.</h1>
<p>Thanks for your interest in SynoRing R1. Here is what you asked for:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 24px;border-top:1px solid #e4e8e1;">
${row("Product", "SynoRing R1")}
${row("Finish", "{{finish}}")}
${row("Quantity", "{{quantity}}")}
${row("Pre-order price", "$99 USD each")}
${row("Product subtotal", `$${escapeHtml(details.subtotal ?? "")} USD`, true)}
</table>
<h2>What happens next</h2>
<ol>
  <li>We’ll email you to confirm your details. Nothing has been charged.</li>
  <li>A sizing kit ships first so you can confirm your size.</li>
  <li>Your ring is estimated to ship in Q1 2027, free within the US.</li>
</ol>
<p>Questions? Just reply to this email.</p>
<p>— The SynoRing team</p>`,
      reason:
        "You’re receiving this because you requested a SynoRing R1 pre-order at synoring.ai.",
    };
  }
  return {
    subject: "You’re on the SynoRing waitlist",
    preheader: "We’ll write with launch updates and developer pilots.",
    body: `<h1>You’re on the list.</h1>
<p>Thanks for joining the SynoRing waitlist. We’ll write when there is real progress to share: production updates, developer pilots, and shipping news.</p>
${productImage}
<p>SynoRing R1 is open for pre-order at $99 (regularly $129), estimated to ship in Q1 2027 with free shipping within the US.</p>
<p><a class="button" href="${siteUrl}/store">Pre-order SynoRing R1</a></p>
<p>— The SynoRing team</p>`,
    reason:
      "You’re receiving this because you joined the SynoRing waitlist at synoring.ai.",
  };
}
