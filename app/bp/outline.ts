/* The starting outline for the business plan and the snippets the editor
   can insert. Classes here are styled by doc.css. */

export const planTemplate = `<h1>SynoRing</h1>
<p class="lede">Gesture control for AR glasses, worn as a ring.</p>

<div class="metrics">
  <div><strong>$99</strong><span>Pre-order price</span></div>
  <div><strong>[number]</strong><span>Waitlist signups</span></div>
  <div><strong>[date]</strong><span>Target ship date</span></div>
</div>

<h2>Summary</h2>
<p>[Two or three sentences: what SynoRing is, who it is for, and why now.]</p>

<h2>Problem</h2>
<p>[What makes controlling AR and smart glasses hard today.]</p>

<h2>Product</h2>
<p>SynoRing R1 turns small finger gestures into input for AR glasses, phones, laptops, and robots.</p>
<ul>
  <li>[Key capability]</li>
  <li>[Key capability]</li>
</ul>

<h2>Market</h2>
<table>
  <thead><tr><th>Segment</th><th>Size</th><th>Source</th></tr></thead>
  <tbody>
    <tr><td>[Segment]</td><td>[$]</td><td>[Source]</td></tr>
  </tbody>
</table>

<h2>Business model</h2>
<p>[How SynoRing makes money: hardware margin, software, licensing.]</p>

<h2>Go-to-market</h2>
<p>[First customers and how you reach them.]</p>

<h2>Competition</h2>
<p>[Alternatives and why SynoRing wins.]</p>

<h2>Traction</h2>
<p>[Pilots, signups, partners, research.]</p>

<h2>Team</h2>
<p>[Founders and key people.]</p>

<h2>Financials</h2>
<table>
  <thead><tr><th></th><th>2027</th><th>2028</th><th>2029</th></tr></thead>
  <tbody>
    <tr><td>Units</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
    <tr><td>Revenue</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
  </tbody>
</table>

<h2>The ask</h2>
<p class="callout">[How much you are raising and what it funds.]</p>
`;

export const planSnippets = [
  ["Section", "<h2>Section title</h2>\n<p>Write something here.</p>"],
  ["Paragraph", "<p>Write something here.</p>"],
  ["List", "<ul>\n  <li>First point</li>\n  <li>Second point</li>\n</ul>"],
  [
    "Key numbers",
    '<div class="metrics">\n  <div><strong>$0</strong><span>Label</span></div>\n  <div><strong>0</strong><span>Label</span></div>\n  <div><strong>0%</strong><span>Label</span></div>\n</div>',
  ],
  [
    "Table",
    "<table>\n  <thead><tr><th>Column</th><th>Column</th></tr></thead>\n  <tbody>\n    <tr><td>Value</td><td>Value</td></tr>\n  </tbody>\n</table>",
  ],
  ["Callout", '<p class="callout">Something to stand out.</p>'],
  [
    "Image",
    '<figure>\n  <img src="https://www.synoring.ai/email/synoring-r1-finishes.jpg" alt="" />\n  <figcaption>Caption</figcaption>\n</figure>',
  ],
  ["Page break", '<hr class="page-break" />'],
] as const;
