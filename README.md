# SynoRing website

The official SynoRing product and early-access website, built with the native
Next.js App Router and deployed on Vercel.

## Stack

- Next.js 16
- React 19
- TypeScript
- Vercel

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation

```bash
npm test
```

The test command creates a production Next.js build and verifies the rendered
homepage metadata, structured data, `robots.txt`, `sitemap.xml`, and web app
manifest. It also checks circle recognition, input normalization, and the AR
demo’s scene controls.

## Production

The `master` branch is the production branch. Vercel detects the project as
Next.js and runs the native Next.js production build.

## Product artwork

The redesign uses the existing brand assets and lightweight SVG/CSS concept
visuals until the final product renders are ready. Add the finished files to
`public/images/`, then set their URLs in `productMedia` in
`app/product-visual.tsx`:

- `hero`: transparent product render for the cool gray opening scene.
- `detail`: transparent product close-up for the white product introduction.
- `lifestyle`: wide lifestyle image; replaces the entire ambient placeholder.
- `closing`: transparent product render for the early-access section.
- `exploded`: transparent exploded-view render for the technology section.

A `null` product slot keeps its concept placeholder. The lifestyle section is
hidden until an image is supplied; it no longer displays an empty scene.
The exploded assembly is schematic and does not assert final component placement.
Early access uses the existing prefilled email link.

## AR experience

`app/ar-experience.tsx` contains the full-viewport modal and three simulated
scenes: music, reading, and navigation. `app/gesture-input.mjs` holds circle
recognition and scene state, with focused tests in `tests/gesture-input.test.mjs`.

- Move the pointer to move the ring cursor; click to select.
- Wheel/trackpad scrolling simulates touch gliding. On a phone, swipe vertically.
- Draw a near-complete clockwise/counterclockwise circle to increase/decrease
  volume, text size, or map zoom. The rotation buttons provide an alternative.
- Press and hold a blank part of the view for 650 ms to open the app launcher.
- Keyboard: focus the view, use Up/Down to glide, Left/Right to rotate, Enter
  to select, H for apps, and Escape to close.

Playback is visual and silent. The route is fictional. The demo requests no
hardware, camera, audio, location, or browser fullscreen permissions.
Closing it restores page scrolling and focus to Try it.

## Site pages

- `/`: product story, interactive preview, technology, integration direction, and development stages.
- `/demo`: full AR experience with gesture and scene guides.
- `/developers`: proposed integration flow, example mappings, and pilot enquiry.
- `/store`: four-finish product gallery, $99 pre-order pricing ($129 regular), quantity selection, email enquiry review, and grouped technical specifications.
- `/about`: product rationale, design principles, development, and contact.

Shared navigation and footer live in `app/site-components.tsx`; route metadata
and links are in `app/site.ts`. The editorial layouts are in `app/pages.css`.
All contact buttons open a prefilled email; there is no signup backend or SDK download.

### Store pre-orders

`app/store/product.ts` defines the four finishes, $99 USD pre-order price,
$129 USD regular price, and per-finish artwork slots (`storeRenders`).
The Pre-order button opens a review with the selected finish, quantity,
savings, and subtotal. Email pre-order enquiry opens a prefilled mailto;
no payment is collected and no order is persisted. Unknown hardware details
remain marked as to be announced in the specifications table.
