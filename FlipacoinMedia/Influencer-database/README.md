# Influencer Management (React + Vite, plain CSS)

A professional influencer directory with filters (genre, location, search) and sorting (total/IG/YT followers or name).

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy (Netlify)

- Build command: `npm run build`
- Publish directory: `dist`

## Deploy (Vercel)

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Deploy (GitHub Pages)

- In `vite.config.js`, set `base: '/<REPO_NAME>/'`
- Commit & push
- Use Pages (from `dist`) or a workflow to auto-deploy.
