## Deployment (Vercel)

This project uses Vercel Git integration for CI/CD. The production deployment is
configured to track the `development` branch in Vercel settings.

### Vercel configuration

- **Production branch:** `development`
- **Framework preset:** Next.js
- **Build command:** `npm run build`
- **Install command:** `npm install`
- **Output directory:** `.next`

### Required environment variables

Set these in Vercel Project Settings → Environment Variables:

- `NEXT_PUBLIC_API_URL` (example: `https://your-backend-domain/api/v1`)

### How deployments work

- Every push to `development` triggers a new production deployment.
- Preview deployments can be enabled for feature branches as needed.

### Local note

The production branch is a Vercel setting (not stored in the repo). This file
documents the intended CI/CD configuration for reference.
