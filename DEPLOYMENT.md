# Deployment Guide

## Where Data is Saved

### Option 1: File System (Local Development Only)

- **Location**: `/data/locations.json`
- **Works on**: Local development, traditional servers with persistent storage
- **Does NOT work on**: Vercel, Netlify, or other serverless platforms (file system is read-only)
- **Setup**: No setup needed! Works automatically if MongoDB is not configured.

### Option 2: MongoDB (Recommended for Deployment)

- **Location**: MongoDB Atlas (cloud database)
- **Works on**: All platforms including Vercel, Netlify, etc.
- **Setup**: Add `MONGODB_URI` to your environment variables

## Local Development Setup

### Using File System (Default - No Setup Required)

The app works out of the box using file system storage. Just run:

```bash
npm run dev
```

Data will be saved to `/data/locations.json`.

### Using MongoDB Locally (Optional)

If you want to test MongoDB locally:

1. **Create `.env.local` file** in the project root:

   ```bash
   cp .env.local.example .env.local
   ```

2. **Get MongoDB Connection String:**

   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free account and cluster
   - Click "Connect" → "Connect your application"
   - Copy the connection string

3. **Edit `.env.local`** and add your MongoDB URI:

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/location-app?retryWrites=true&w=majority
   ```

   Replace `username`, `password`, and `cluster` with your actual values.

4. **Restart the dev server:**
   ```bash
   npm run dev
   ```

## How to Deploy

### For Vercel/Serverless Platforms (Recommended):

1. **Get Free MongoDB Database:**

   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free account
   - Create a new cluster (free tier available)
   - Get your connection string

2. **Add Environment Variable:**

   - In Vercel: Go to Project Settings → Environment Variables
   - Add `MONGODB_URI` with your MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/location-app?retryWrites=true&w=majority`

3. **Deploy:**
   - Push to GitHub
   - Connect to Vercel
   - Deploy!

### For Traditional Servers:

- The file system approach will work
- Data will be saved to `/data/locations.json`
- Make sure the `data` directory has write permissions

## How It Works

The app automatically detects which storage to use:

- **If `MONGODB_URI` is set** (in `.env.local` or Vercel environment variables): Uses MongoDB (works everywhere)
- **If `MONGODB_URI` is NOT set**: Uses file system (local only, won't work on serverless)

## Data File in Git

The `data/locations.json` file is now tracked in git (for your personal use). This means:

- ✅ You can see location history in git
- ✅ Data is backed up in your repository
- ⚠️ On serverless platforms, new locations won't be saved to this file (use MongoDB instead)
