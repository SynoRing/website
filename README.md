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

The V11 renders live in `public/images/` as transparent WebP files
(`synoring-<finish>-600.webp` and `-1200.webp`), cropped to the ring from the
1800 px masters. `ringRenders` in `app/product-visual.tsx` maps them to the
store finishes, and `productMedia` assigns them to page slots:

- `detail`: Rose Gold in the product introduction.
- `lifestyle`: none yet; the section stays hidden until an image is supplied.
- `exploded`: none yet; the schematic assembly drawing is shown instead.

The homepage opening screen uses the Space Gray front orthographic view
(`synoring-front-*.webp`, `ringFrontView`), cropped so the bore centre is the
image centre. It is sized from the height left under the headline and centred
on the hero's bottom edge, so only the upper half of the ring shows.
The early-access section lines up all four finishes. The renders carry no
background or shadow; the `--render-shadow` token in `app/globals.css`
grounds them on whatever section they sit on. A `null` slot keeps its drawn
placeholder. The store gallery and pre-order review use the render for the
selected finish (`storeRenders` in `app/store/product.ts`).

The store's technical specifications open with a dimension drawing built
from the V11 Space Gray orthographic renders (`synoring-view-front`, `-side`,
`-top`; transparent 1000 px WebP). All three share one camera scale, so the
18 mm and 8 mm dimension lines in `app/pages.css` are placed as percentages
of the source frame. Re-measure them if the views are re-rendered.

## AR experience

`app/ar-experience.tsx` contains the full-viewport modal and three simulated
scenes: music, reading, and navigation. It renders a smart-glasses display:
a monochrome green, line-only HUD (`--hud` tokens in `app/ar-experience.css`)
over an illustrated world drawn in `app/world-scenes.tsx`: a city street for
music, a café window seat for reading, and a riverside path for navigation.
The scenes are SVG built on one shared perspective, so they need no image
files. `app/gesture-input.mjs` holds circle
recognition and scene state, with focused tests in `tests/gesture-input.test.mjs`.

- Move the pointer to move the ring cursor; click to select.
- Wheel/trackpad scrolling simulates touch gliding. On a phone, swipe vertically.
- Draw a near-complete clockwise/counterclockwise circle to increase/decrease
  volume, text size, or map zoom. The rotation buttons provide an alternative.
- Press and hold a blank part of the view; the circular cursor fills its outer
  ring over 650 ms and then opens the app launcher. Tap outside the launcher
  or use Back to view to return.
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
