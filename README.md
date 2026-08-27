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
manifest.

## Production

The `master` branch is the production branch. Vercel detects the project as
Next.js and runs `npm run build`.
