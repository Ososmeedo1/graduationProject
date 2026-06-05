# Setup and Deployment Guide

## 1. Local Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Installation

```bash
# 1) Clone repository
git clone <your-repository-url>

# 2) Open frontend app
cd <repository-root>/frontend

# 3) Install packages
npm install

# 4) Create environment file
cp .env.example .env

# 5) Start development server
npm run dev
```

App default URL: `http://localhost:5173`

## 2. Environment Configuration

Configure `.env` according to your execution mode.

```env
# Data source mode
VITE_API_MODE=static
VITE_AUTH_MODE=static

# Backend URLs (used when mode is api)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_AUTH_API_URL=https://tourestaapi.runasp.net

# App metadata
VITE_APP_TITLE=RAFIQ
```

### Mode Selection

- `static` mode: Uses local mock services and data
- `api` mode: Uses remote backend endpoints through Axios

## 3. Build and Run Commands

```bash
npm run dev      # Start dev server
npm run build    # Generate production build in dist/
npm run preview  # Serve production build locally
npm run lint     # Run ESLint
```

## 4. Deployment

### Option A: Netlify (recommended for current setup)

This project already includes SPA redirect configuration in `netlify.toml`.

#### Steps

1. Push code to a Git provider (GitHub/GitLab/Bitbucket).
2. Create a Netlify site and connect repository.
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `frontend` (if repo contains multiple folders)
4. Add environment variables in Netlify dashboard (`Site settings -> Environment variables`).
5. Trigger deploy.

### Option B: Vercel

1. Import repository in Vercel.
2. Set project root directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Configure environment variables.
6. Deploy.

For SPA routing, ensure rewrites route all paths to `/index.html`.

### Option C: Docker (alternative)

A Dockerfile is not included yet, but a minimal two-stage setup can be used:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve static files
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 5. Production Readiness Checklist

- Verify `.env` values for production API endpoints
- Ensure CORS is configured on backend for frontend domain
- Run `npm run lint` and `npm run build` before deployment
- Confirm auth and protected routes behave correctly in production
- Validate browser refresh on nested routes (SPA fallback enabled)

## 6. Troubleshooting

### Development server does not start

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### API calls failing in API mode

- Confirm `VITE_API_BASE_URL` and `VITE_AUTH_API_URL`
- Check backend availability and SSL configuration
- Confirm token is being stored and sent in headers

### Route 404 after refresh in production

- Ensure platform has SPA rewrite rules (`/* -> /index.html`)
