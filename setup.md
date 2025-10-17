# Quick Setup Guide

## For New Developers

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy example files
   cp .env.example .env
   cp server/.env.example server/.env

   # Edit the .env files with your actual values
   ```

4. **Start development servers**

   ```bash
   # Terminal 1: Frontend
   npm run dev

   # Terminal 2: Backend
   npm run server:dev
   ```

## Environment Variables You Need

### Frontend (.env)

- `VITE_API_URL` - Your backend API URL

### Backend (server/.env)

- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure secret key for JWT tokens
- `CLIENT_URL` - Your frontend URL
- `NODEMAILER_USER` - Email for sending notifications (optional)
- `NODEMAILER_PASS` - Email app password (optional)

## Ready to Deploy?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.
