# 🚀 DEPLOYMENT INSTRUCTIONS

## Your Credentials (KEEP SECURE!)
- **MongoDB URI**: `mongodb+srv://quicklink812:K1ss00IEccrxgp2L@cluster0.kxdtmkd.mongodb.net/blood-management?retryWrites=true&w=majority&appName=Cluster0`
- **Gmail**: `quicklink812@gmail.com`
- **Gmail App Password**: `swpo yavl lkbt ldir`
- **Render API Key**: `rnd_oJWFkxxEs0UbJxt1WXV6fNNBQV5k`
- **Vercel Token**: `0lt91nf5m70caTfSKea8VkYO`

## 📋 DEPLOYMENT STEPS

### STEP 1: Upload to GitHub

1. **Create GitHub Account** (if you don't have one): https://github.com
2. **Create New Repository**:
   - Go to GitHub.com
   - Click "New Repository"
   - Name: `blood-management-system`
   - Make it Public
   - Don't initialize with README (we have files already)
   - Click "Create Repository"

3. **Upload Files**:
   - Click "uploading an existing file"
   - Drag and drop ALL files from `c:\Users\quick\Documents\blood-management-system\blood-management-system\` folder
   - Commit message: "Initial deployment"
   - Click "Commit changes"

### STEP 2: Deploy Backend to Render

1. **Go to Render**: https://render.com
2. **Sign Up/Login** with GitHub
3. **Create New Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select `blood-management-system` repository
   - Configure:
     - **Name**: `blood-management-api`
     - **Environment**: `Node`
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Plan**: Free

4. **Add Environment Variables**:
   Click "Environment" tab and add:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://quicklink812:K1ss00IEccrxgp2L@cluster0.kxdtmkd.mongodb.net/blood-management?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=blood-management-super-secret-jwt-key-2024-production
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=quicklink812@gmail.com
   EMAIL_PASS=swpo yavl lkbt ldir
   EMAIL_FROM=Blood Management System <quicklink812@gmail.com>
   FRONTEND_URL=https://blood-management-frontend.vercel.app
   ```

5. **Deploy**: Click "Create Web Service"
6. **Copy Backend URL**: After deployment, copy the URL (e.g., `https://blood-management-api.onrender.com`)

### STEP 3: Deploy Frontend to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign Up/Login** with GitHub
3. **Import Project**:
   - Click "New Project"
   - Import your GitHub repository
   - Select `blood-management-system`
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend/blood-management-frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

4. **Add Environment Variables**:
   In project settings, add:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_APP_NAME=Blood Management System
   VITE_APP_VERSION=1.0.0
   ```
   (Replace `your-backend-url` with actual Render URL from Step 2)

5. **Deploy**: Click "Deploy"

### STEP 4: Update Backend with Frontend URL

1. **Go back to Render**
2. **Update Environment Variable**:
   - Change `FRONTEND_URL` to your Vercel URL (e.g., `https://blood-management-frontend.vercel.app`)
3. **Redeploy**: Click "Manual Deploy" → "Deploy latest commit"

## 🎉 YOUR WEBSITE IS NOW LIVE!

- **Frontend**: Your Vercel URL
- **Backend API**: Your Render URL
- **Database**: MongoDB Atlas

## 🔧 Testing Your Deployment

1. Visit your frontend URL
2. Try registering a new account
3. Check if email notifications work
4. Test login/logout functionality
5. Try creating donation requests

## 🚨 Troubleshooting

If something doesn't work:

1. **Check Render Logs**: Go to Render dashboard → Your service → Logs
2. **Check Vercel Logs**: Go to Vercel dashboard → Your project → Functions tab
3. **Check MongoDB**: Ensure your IP is whitelisted in MongoDB Atlas
4. **Check Environment Variables**: Ensure all variables are set correctly

## 📞 Need Help?

If you encounter issues:
1. Check the logs in Render and Vercel dashboards
2. Ensure all environment variables are correctly set
3. Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

---

**🎊 CONGRATULATIONS! Your Blood Management System is now live and accessible worldwide!**