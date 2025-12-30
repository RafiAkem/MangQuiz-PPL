# Vercel Deployment Guide

## Overview

This project is a full-stack application with a React frontend and Express backend. The deployment has been configured to work with Vercel's serverless functions.

## Files Created/Modified for Vercel Deployment

### 1. `vercel.json`

- Configures Vercel to use the API function for all routes
- Sets up build command to build the client before deployment
- Configures serverless function timeout

### 2. `api/index.ts`

- Serverless function that handles both API routes and serves the built client
- Serves static files from `dist/public` directory
- Handles SPA routing by serving `index.html` for non-API routes

### 3. `package.json`

- Added `build:client` script for building the frontend

### 4. `.vercelignore`

- Excludes unnecessary files from deployment

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:

   ```bash
   vercel
   ```

4. **For production deployment**:
   ```bash
   vercel --prod
   ```

## Build Process

The deployment process will:

1. Run `npm run build:client` to build the React app
2. Create the `dist/public` directory with built files
3. Deploy the API function that serves both API routes and static files

## Testing the Deployment

1. **Test API**: Visit `https://your-app.vercel.app/api/test`
2. **Test Frontend**: Visit `https://your-app.vercel.app/`

## Troubleshooting

### If you see source code instead of the web app:

- Make sure the build process completed successfully
- Check that `dist/public` directory exists and contains `index.html`
- Verify the API function is working by testing `/api/test` endpoint

### If build fails:

- Check that all dependencies are installed
- Ensure Vite configuration is correct
- Look for any TypeScript compilation errors

### If API routes don't work:

- Check the server/routes.ts file
- Verify the API function is properly configured
- Test with the `/api/test` endpoint

## Environment Variables

If your app requires environment variables, add them in the Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add any required environment variables

## Local Development

For local development, use:

```bash
npm run dev
```

This will start the development server with hot reloading.
