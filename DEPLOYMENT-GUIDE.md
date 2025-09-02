# Customer Management App - Render Deployment Guide

## Prerequisites

1. **GitHub Account**: Your code needs to be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)

## Step 1: Prepare Your Repository

1. **Create a GitHub Repository**:
   - Go to GitHub and create a new repository
   - Clone your Replit project to your local machine or download it as ZIP
   - Push all your code to the GitHub repository

2. **Verify Required Files**:
   Make sure these files exist in your repository:
   - `render.yaml` (deployment configuration)
   - `package.json` (dependencies)
   - `scripts/setup-production-db.js` (database setup)
   - `.env.production.example` (environment variables template)

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. **Connect Repository**:
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New +" → "Blueprint"
   - Connect your GitHub account
   - Select your repository
   - Render will automatically detect the `render.yaml` file

2. **Configure Environment**:
   - Render will create both the web service and PostgreSQL database
   - The database connection will be automatically configured

3. **Deploy**:
   - Click "Apply" to start the deployment
   - Wait for the build to complete (5-10 minutes)

### Option B: Manual Setup

1. **Create Database**:
   - Go to Render Dashboard → "New +" → "PostgreSQL"
   - Name: `customer-management-db`
   - Plan: Choose "Starter" (free for 90 days)
   - Click "Create Database"
   - Copy the "External Database URL" from the database info page

2. **Create Web Service**:
   - Go to Render Dashboard → "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure settings:
     - **Name**: `customer-management-app`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Choose "Starter" (free tier available)

3. **Set Environment Variables**:
   - In your web service settings → "Environment"
   - Add these variables:
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: (paste the External Database URL from step 1)

## Step 3: Initialize Database

After deployment, you need to set up your database schema:

1. **Access Web Service Shell**:
   - Go to your web service → "Shell" tab
   - Run: `node scripts/setup-production-db.js`

2. **Alternative - Local Setup**:
   ```bash
   # Set your production database URL
   export DATABASE_URL="your-production-database-url"
   
   # Run the setup script
   npm run db:push
   ```

## Step 4: Verify Deployment

1. **Check Health Endpoint**:
   - Visit: `https://your-app-name.onrender.com/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}"`

2. **Test Application**:
   - Visit: `https://your-app-name.onrender.com`
   - Verify all features work correctly
   - Test creating, editing, and deleting customers

## Step 5: Configure Custom Domain (Optional)

1. Go to your web service → "Settings" → "Custom Domains"
2. Add your domain name
3. Configure DNS records as instructed by Render

## Important Notes

### Database Considerations
- **Free tier**: PostgreSQL databases are deleted after 90 days
- **Paid tier**: Starts at $7/month for persistent database
- **Connection pooling**: Automatically handled by Render

### Performance Tips
- **Cold starts**: Free tier services sleep after 15 minutes of inactivity
- **Paid tier**: Eliminates cold starts with always-on instances
- **Starter plan**: $25/month includes 2GB RAM, 1 CPU

### Monitoring
- **Logs**: Available in Render dashboard → your service → "Logs"
- **Metrics**: Monitor CPU, memory, and response times
- **Alerts**: Set up email notifications for service issues

## Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check build logs in Render dashboard
   - Verify all dependencies are in package.json
   - Ensure Node.js version compatibility

2. **Database Connection Error**:
   - Verify DATABASE_URL environment variable
   - Check database status in Render dashboard
   - Ensure database schema is initialized

3. **404 Errors**:
   - Verify build command generates dist folder
   - Check start command points to correct file
   - Ensure static files are served correctly

4. **Environment Variables**:
   - Double-check all required variables are set
   - Restart service after adding new variables
   - Use Render's built-in secret management

### Getting Help
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Community**: [community.render.com](https://community.render.com)
- **Support**: Available through Render dashboard

## Cost Breakdown

### Free Tier
- **Web Service**: 750 hours/month (enough for hobby projects)
- **Database**: 90 days, then deleted
- **Limitations**: Cold starts, limited resources

### Paid Tier (Recommended for Production)
- **Web Service**: $25/month (Starter) - 2GB RAM, 1 CPU
- **Database**: $7/month (Starter) - 1GB storage, persistent
- **Total**: ~$32/month for small-medium applications

Your application is now ready for production deployment on Render! 🚀