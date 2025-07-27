# Deployment Guide - Blood Management System

This guide provides step-by-step instructions for deploying the Blood Management System to various hosting platforms.

## 📋 Prerequisites

Before deploying, ensure you have:
- MongoDB database (local or MongoDB Atlas)
- Email service credentials (Gmail, SendGrid, etc.)
- Domain name (optional but recommended)
- SSL certificate (for production)

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Prepare the build**
   ```bash
   cd frontend/blood-management-frontend
   pnpm install
   pnpm run build
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel login
   vercel --prod
   ```

3. **Configure Environment Variables**
   In Vercel dashboard, add:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   VITE_APP_NAME=Blood Management System
   VITE_APP_VERSION=1.0.0
   ```

### Option 2: Netlify

1. **Build the project**
   ```bash
   cd frontend/blood-management-frontend
   pnpm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=dist
   ```

3. **Configure Environment Variables**
   In Netlify dashboard, add the same environment variables as above.

### Option 3: GitHub Pages

1. **Install gh-pages**
   ```bash
   cd frontend/blood-management-frontend
   pnpm add -D gh-pages
   ```

2. **Add deploy script to package.json**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Build and deploy**
   ```bash
   pnpm run build
   pnpm run deploy
   ```

## 🖥️ Backend Deployment

### Option 1: Render (Recommended)

1. **Create render.yaml**
   ```yaml
   services:
     - type: web
       name: blood-management-api
       env: node
       plan: free
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 10000
   ```

2. **Environment Variables**
   Set in Render dashboard:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blood-management
   JWT_SECRET=your-super-secret-jwt-key-for-production
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@bloodbank.com
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

### Option 2: Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set MONGODB_URI=your-mongodb-uri
   railway variables set JWT_SECRET=your-jwt-secret
   # ... add other variables
   ```

### Option 3: Heroku

1. **Install Heroku CLI and login**
   ```bash
   heroku login
   ```

2. **Create Heroku app**
   ```bash
   cd backend
   heroku create blood-management-api
   ```

3. **Set environment variables**
   ```bash
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account
   - Create a new cluster

2. **Configure Database Access**
   - Create a database user
   - Add your IP address to the whitelist (or 0.0.0.0/0 for all IPs)

3. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/blood-management?retryWrites=true&w=majority
   ```

4. **Initialize Database**
   The application will automatically create collections on first run.

### Local MongoDB (Development)

1. **Install MongoDB**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mongodb
   
   # macOS
   brew install mongodb-community
   
   # Windows
   # Download from MongoDB website
   ```

2. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   ```

3. **Connection String**
   ```
   mongodb://localhost:27017/blood-management
   ```

## 📧 Email Service Setup

### Gmail SMTP

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Enable 2FA

2. **Generate App Password**
   - Go to App passwords section
   - Generate password for "Mail"

3. **Environment Variables**
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### SendGrid

1. **Create SendGrid Account**
   - Sign up at [SendGrid](https://sendgrid.com)
   - Verify your sender identity

2. **Generate API Key**
   - Go to Settings > API Keys
   - Create a new API key

3. **Environment Variables**
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=your-sendgrid-api-key
   ```

## 🐳 Docker Deployment

### Docker Compose (Full Stack)

1. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   
   services:
     mongodb:
       image: mongo:latest
       container_name: blood-management-db
       restart: always
       ports:
         - "27017:27017"
       environment:
         MONGO_INITDB_ROOT_USERNAME: admin
         MONGO_INITDB_ROOT_PASSWORD: password
       volumes:
         - mongodb_data:/data/db
   
     backend:
       build: ./backend
       container_name: blood-management-api
       restart: always
       ports:
         - "5000:5000"
       environment:
         MONGODB_URI: mongodb://admin:password@mongodb:27017/blood-management?authSource=admin
         JWT_SECRET: your-jwt-secret
         NODE_ENV: production
       depends_on:
         - mongodb
   
     frontend:
       build: ./frontend/blood-management-frontend
       container_name: blood-management-web
       restart: always
       ports:
         - "80:80"
       environment:
         VITE_API_URL: http://localhost:5000/api
       depends_on:
         - backend
   
   volumes:
     mongodb_data:
   ```

2. **Create Dockerfiles**

   **Backend Dockerfile** (`backend/Dockerfile`):
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   
   EXPOSE 5000
   
   CMD ["npm", "start"]
   ```

   **Frontend Dockerfile** (`frontend/blood-management-frontend/Dockerfile`):
   ```dockerfile
   FROM node:18-alpine as build
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci
   
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   
   EXPOSE 80
   
   CMD ["nginx", "-g", "daemon off;"]
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker-compose up --build -d
   ```

## 🔒 SSL/HTTPS Setup

### Using Cloudflare (Recommended)

1. **Add your domain to Cloudflare**
2. **Enable SSL/TLS encryption**
3. **Set SSL/TLS encryption mode to "Full"**
4. **Enable "Always Use HTTPS"**

### Using Let's Encrypt (Certbot)

1. **Install Certbot**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Generate SSL Certificate**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Auto-renewal**
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

## 🔧 Production Optimizations

### Backend Optimizations

1. **Enable Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Set Security Headers**
   ```javascript
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'"],
         scriptSrc: ["'self'"],
         imgSrc: ["'self'", "data:", "https:"],
       },
     },
   }));
   ```

3. **Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

### Frontend Optimizations

1. **Enable Gzip Compression**
   Configure your web server to enable gzip compression.

2. **Optimize Images**
   Use WebP format and appropriate sizing.

3. **Code Splitting**
   React Router already implements code splitting.

4. **Service Worker**
   Add PWA capabilities for offline functionality.

## 📊 Monitoring and Analytics

### Application Monitoring

1. **Error Tracking (Sentry)**
   ```bash
   npm install @sentry/node @sentry/react
   ```

2. **Performance Monitoring**
   - Use New Relic or DataDog
   - Monitor API response times
   - Track database performance

3. **Uptime Monitoring**
   - Use UptimeRobot or Pingdom
   - Set up alerts for downtime

### Analytics

1. **Google Analytics**
   Add tracking code to frontend

2. **Custom Analytics**
   Track user actions and blood donation metrics

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install and Build
        run: |
          cd frontend/blood-management-frontend
          npm ci
          npm run build
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: frontend/blood-management-frontend

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Render
        # Add Render deployment steps
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure FRONTEND_URL is correctly set in backend
   - Check CORS configuration

2. **Database Connection Issues**
   - Verify MongoDB URI
   - Check network access in MongoDB Atlas

3. **Email Not Sending**
   - Verify email credentials
   - Check spam folder
   - Ensure less secure apps is enabled (Gmail)

4. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

### Performance Issues

1. **Slow API Responses**
   - Add database indexes
   - Implement caching
   - Optimize queries

2. **Large Bundle Size**
   - Analyze bundle with webpack-bundle-analyzer
   - Implement code splitting
   - Remove unused dependencies

## 📞 Support

For deployment support:
- Create an issue in the repository
- Contact: support@bloodbank.com
- Emergency: +1 (555) 123-4567

---

**Happy Deploying! 🚀**

