
# 🚀 Deployment Guide for IntelliHire AI

This application is built with React (Frontend) and Node.js (Backend). It is designed to be easily deployed on standard cloud platforms.

## 1. Deploying Frontend (Vercel)

Vercel is the recommended platform for the frontend.

1.  **Push to GitHub**: Ensure your code is in a GitHub repository.
2.  **Import to Vercel**:
    *   Go to [Vercel Dashboard](https://vercel.com).
    *   Click "Add New" -> "Project" -> Import your repo.
3.  **Configure Project**:
    *   **Framework**: Vite
    *   **Root Directory**: `frontend`
    *   **Environment Variables**:
        *   `VITE_API_URL`: The URL of your deployed backend (e.g., `https://intellihire-api.onrender.com`).
4.  **Deploy**: Click "Deploy". Vercel will build and host your site automatically.

## 2. Deploying Backend (Render / Railway)

Render or Railway are great for hosting Node.js APIs.

### Option A: Render
1.  **New Web Service**: Connect your GitHub repo.
2.  **Root Directory**: `backend`
3.  **Build Command**: `npm install`
4.  **Start Command**: `npm start`
5.  **Environment Variables** (Add these in Dashboard):
    *   `MONGO_URL`: Your MongoDB Atlas connection string.
    *   `UPSTASH_REDIS_REST_URL`: Your Upstash Redis URL.
    *   `UPSTASH_REDIS_REST_TOKEN`: Your Upstash Redis Token.
    *   `GEMINI_API_KEY`: Your Google Gemini API Key.
    *   `ADZUNA_APP_ID`: Adzuna ID.
    *   `ADZUNA_APP_KEY`: Adzuna Key.
    *   `JWT_SECRET`: A secure random string.
    *   `PORT`: value `10000` (Render default).

### Option B: Railway
1.  **New Project**: Deploy from GitHub repo.
2.  **Root Directory**: Set via Railway settings or `railway.toml`.
3.  **Variables**: Add same variables as above.

## 3. Database & Cache

*   **MongoDB**: Use [MongoDB Atlas](https://www.mongodb.com/atlas) (Free Tier available).
*   **Redis**: Use [Upstash](https://upstash.com/) (Serverless & Free Tier).

## 4. Final Steps

1.  After deploying the backend, copy its URL (e.g., `https://my-api.onrender.com`).
2.  Update your Vercel frontend `VITE_API_URL` variable with this URL.
3.  Redeploy Vercel to apply the change.

✅ Your Full Stack AI Application is now live!
