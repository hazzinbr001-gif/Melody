# Melody Birthday — Firebase Deployment Guide

## One-time setup

```bash
npm install -g pnpm firebase-tools
pnpm install
```

## Build for Firebase

```bash
cd artifacts/showcase
npx vite build --config vite.config.firebase.ts
```

The built files will be in `artifacts/showcase/dist/`.

## Deploy to Firebase

```bash
firebase login
firebase deploy
```

That's it. The site will be live on your Firebase Hosting URL.

---

> The music ambient layer uses the Web Audio API (no external files needed).
> All photos are in `artifacts/showcase/public/`.
