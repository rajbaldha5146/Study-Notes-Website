# Deployment Guide for Render

This guide will help you deploy your React app with Express backend to Render.

## Project Structure
```
├── src/                    # React frontend source
├── server/                 # Express backend
├── dist/                   # Built frontend (generated)
├── package.json           # Frontend dependencies & scripts
├── render.yaml            # Render deployment config
└── DEPLOYMENT.md          # This file
```

## Prerequisites
1. GitHub repository with your code
2. Render account (free tier available)
3. MongoDB Atlas database (or other MongoDB hosting)

## Deployment Steps

### 1. Environment Variables Setup
You'll need to set these environment variables in Render:

**Backend Service:**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLIENT_URL` - Your frontend URL (will be provided by Render)
- `NODE_ENV` - Set to "production"

**Frontend Service:**
- `VITE_API_URL` - Your backend API URL (will be provided by Render)

### 2. Deploy to Render

#### Option A: Using render.yaml (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Render will automatically detect the `render.yaml` file
4. Update the environment variables in the Render dashboard
5. Deploy!

#### Option B: Manual Setup
1. Create a new Web Service for the backend:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment: Node

2. Create a new Static Site for the frontend:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

### 3. Post-Deployment
1. Update CORS settings in your backend if needed
2. Test all API endpoints
3. Verify frontend can communicate with backend

## Local Development
```bash
# Install dependencies
npm install

# Start frontend dev server
npm run dev

# Start backend dev server (in another terminal)
npm run server:dev
```

## Production URLs
- Frontend: `https://your-app-name.onrender.com`
- Backend API: `https://your-api-name.onrender.com/api`

## Troubleshooting
- Check Render logs for deployment errors
- Ensure all environment variables are set correctly
- Verify MongoDB connection string is correct
- Check CORS configuration if frontend can't reach backend