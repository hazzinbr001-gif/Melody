# Melody — Firebase Deployment Guide

This guide walks you through deploying the Melody project to Firebase Hosting.

## Prerequisites

- Node.js 18+ installed on your machine
- A Firebase project created at [Firebase Console](https://console.firebase.google.com/)
- Firebase CLI installed globally

## Installation & Setup

### 1. Install Required Tools

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install Firebase CLI globally
npm install -g firebase-tools
```

### 2. Install Project Dependencies

```bash
# Navigate to the project root
cd Melody

# Install all workspace dependencies
pnpm install
```

## Building for Firebase

### Build the Project

```bash
# Navigate to the showcase app directory
cd artifacts/showcase

# Build using the Firebase-optimized Vite configuration
npx vite build --config vite.config.firebase.ts
```

The built files will be generated in `artifacts/showcase/dist/` directory.

### Verify the Build

```bash
# Check the dist directory contents
ls -la dist/
```

You should see:
- `index.html` — Main HTML entry point
- `assets/` — Bundled CSS and JavaScript
- `favicon.svg` — Favicon
- `*.png` and `*.jpg` — Gallery and hero images
- `robots.txt` — SEO robots configuration

## Deploying to Firebase

### 1. Authenticate with Firebase

```bash
# Login to Firebase (opens browser for authentication)
firebase login
```

### 2. Initialize Firebase Project (First Time Only)

If you haven't already initialized Firebase in this directory:

```bash
# From the project root
firebase init hosting
```

When prompted:
- Select your Firebase project
- Set the public directory to: `artifacts/showcase/dist`
- Configure as a single-page app: `Yes`
- Do not overwrite existing files: `No`

### 3. Deploy to Firebase

```bash
# From the project root
firebase deploy
```

The deployment will:
1. Upload the built files from `artifacts/showcase/dist/`
2. Configure Firebase Hosting with the rewrite rules from `firebase.json`
3. Provide you with a live URL

### 4. Access Your Live Site

After deployment completes, you'll see output like:

```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/melody-birthday/overview
Hosting URL: https://melody-birthday.web.app
```

Visit the **Hosting URL** to see your live Melody experience!

## Configuration Files

### firebase.json

This file configures Firebase Hosting:

```json
{
  "hosting": {
    "public": "artifacts/showcase/dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**Key settings:**
- `public`: Points to the built output directory
- `rewrites`: Ensures all routes serve `index.html` for client-side routing (SPA support)

### vite.config.firebase.ts

This is the Firebase-optimized Vite configuration:

```typescript
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '@assets': '/../../attached_assets'
    },
    dedupe: ['react', 'react-dom']
  },
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
```

**Key features:**
- Optimized for static hosting (no server-side requirements)
- Uses only production-essential plugins
- Configured for Firebase's base path structure

## Rebuilding & Redeploying

To update your live site:

```bash
# 1. Make changes to your source code
# 2. Rebuild the project
cd artifacts/showcase
npx vite build --config vite.config.firebase.ts

# 3. Redeploy to Firebase
cd ../..
firebase deploy
```

## Troubleshooting

### Build Fails with Module Not Found

**Error:** `"@workspace/api-client-react@workspace:*" is in the dependencies but no package named "@workspace/api-client-react" is present in the workspace`

**Solution:** The workspace library is missing. The project has been configured to skip this dependency. If you need to add it back, create the missing library in the `lib/` directory.

### TypeScript Errors During Build

**Error:** `parsing /home/ubuntu/Melody/lib/api-client-react/tsconfig.json failed`

**Solution:** The TypeScript configuration has been updated to remove references to missing workspace libraries. This is expected and necessary for Firebase deployment.

### Firebase CLI Not Found

**Error:** `firebase: command not found`

**Solution:** Install Firebase CLI globally:
```bash
npm install -g firebase-tools
```

### Authentication Issues

**Error:** `Error: Not logged in. Run firebase login to authenticate`

**Solution:** Authenticate with Firebase:
```bash
firebase login
```

## Environment Variables

The Firebase build does **not** require environment variables like the default Vite config does. The following are automatically handled:

- `BASE_PATH` — Defaults to `/` for Firebase Hosting
- `PORT` — Not needed for static hosting

## Performance Optimization

The built project includes:

- **Code Splitting:** Automatic by Vite
- **CSS Minification:** Handled by Tailwind CSS
- **JavaScript Minification:** Handled by Vite
- **Asset Optimization:** Images are served as-is from the public directory
- **Gzip Compression:** Automatically enabled by Firebase Hosting

## Next Steps

1. **Custom Domain:** Add a custom domain in the Firebase Console
2. **SSL/TLS:** Automatically provided by Firebase (no additional setup needed)
3. **Analytics:** Enable Firebase Analytics in the Console
4. **Monitoring:** Use Firebase Performance Monitoring to track user experience

## Support

For more information:
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Vite Documentation](https://vitejs.dev/)
- [Melody Project Repository](https://github.com/hazzinbr001-gif/Melody)

---

**Last Updated:** May 21, 2026
