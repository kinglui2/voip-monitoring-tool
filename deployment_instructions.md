# Deployment Instructions for VoIP Monitoring Tool

## Backend Deployment on Render

1. **Push Backend Code to Git Repository**
   - Ensure your backend code in `voip tool/backend` is committed and pushed to a Git repository (GitHub, GitLab, etc.).

2. **Create a New Web Service on Render**
   - Log in to [Render](https://render.com).
   - Click on "New" > "Web Service".
   - Connect your Git repository containing the backend code.

3. **Configure Environment Variables**
   - In the Render service settings, add the following environment variables:
     - `MONGODB_URI` - Your MongoDB connection string.
     - `PORT` - Set to `5000` or your preferred port.
     - `JWT_SECRET` - Your JWT secret key.
     - Any other environment variables your backend requires.

4. **Set Start Command**
   - Use `npm run dev` or `node server.js` as the start command.

5. **Deploy**
   - Deploy the service.
   - Once deployed, note the public URL of your backend service (e.g., `https://your-backend.onrender.com`).

---

## Frontend Deployment on Netlify

1. **Modify Frontend API Base URL**
   - Edit `voip tool/frontend/src/services/api.js` to use environment variable for the API base URL:
   ```js
   import axios from 'axios';

   const api = axios.create({
       baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
   });

   export default api;
   ```

2. **Set Environment Variable for Netlify**
   - In your frontend project root (`voip tool/frontend`), create a `.env` file (do not commit this file):
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   ```
   - Alternatively, set `VITE_API_BASE_URL` in Netlify site settings under "Build & Deploy" > "Environment".

3. **Build Frontend**
   - Run `npm run build` in `voip tool/frontend`.
   - This generates a `dist` folder with production-ready files.

4. **Deploy to Netlify**
   - Log in to [Netlify](https://netlify.com).
   - Create a new site by connecting your Git repository or drag and drop the `dist` folder.
   - If using Git, set the build command to `npm run build` and publish directory to `dist`.
   - Ensure the environment variable `VITE_API_BASE_URL` is set in Netlify.

---

## Summary

- Backend runs on Render, connected to MongoDB.
- Frontend runs on Netlify, configured to call the backend API via environment variable.
- Make sure both services are running and accessible publicly.

If you want, I can help you implement the frontend code changes now.
