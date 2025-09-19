# 🚀 Deployment Guide

## Quick Start

### 1. Environment Setup
First, copy the environment template:
```bash
cp .env.example .env.local
```

For production, update `.env.production` with your actual backend URL.

### 2. Local Testing
```bash
# Test the production build locally
npm run build
npm run preview
```

### 3. Deploy to GitHub Pages
1. Push your code to GitHub
2. Enable GitHub Pages in repository settings
3. The GitHub Action will automatically deploy on push to main/master

## Environment Configuration

### Development (.env.local)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

### Production (.env.production)
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_APP_ENV=production
```

## Deployment Platforms

### GitHub Pages (Recommended)
**Setup:**
1. Go to repository Settings → Pages
2. Set source to "GitHub Actions"
3. Add repository secret:
   - `VITE_API_BASE_URL`: Your backend API URL

**Auto-deploy:** Pushes to main/master trigger deployment

### Vercel
1. Connect your GitHub repository
2. Set environment variables:
   - `VITE_API_BASE_URL`: Your backend API URL
   - `VITE_APP_ENV`: production
3. Deploy automatically on push

### Netlify
1. Connect repository
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Environment variables:
   - `VITE_API_BASE_URL`: Your backend API URL

## Backend Deployment

Your backend needs to be deployed separately. Popular options:

### Railway (Recommended)
1. Connect your GitHub repository
2. Select the `backend` folder
3. Set environment variables
4. Deploy automatically

### Render
1. Create new Web Service
2. Connect repository
3. Build command: `cd backend && npm install && npm run build`
4. Start command: `cd backend && npm start`

### Heroku
1. Create Heroku app
2. Set buildpack to Node.js
3. Configure environment variables
4. Deploy via Git

## CORS Configuration

Update your backend CORS settings to include your frontend domain:

```javascript
// backend/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:5175',
    'https://yourusername.github.io',  // GitHub Pages
    'https://your-frontend-domain.com' // Your production domain
  ],
  credentials: true
}));
```

```

## Troubleshooting

### Common Issues

#### "API connection failed" Error
1. **Check environment variables:**
   ```bash
   echo $VITE_API_BASE_URL  # Should show your API URL
   ```
2. **Verify backend is accessible:**
   - Test: `curl https://your-backend-domain.com/api/health`
3. **Check browser console for CORS errors**
4. **Ensure backend allows your frontend domain**

#### Build Failures
1. **TypeScript errors:**
   ```bash
   npm run build  # Shows specific errors
   ```
2. **Missing dependencies:**
   ```bash
   npm install  # Reinstall dependencies
   ```
3. **Environment variable issues:**
   - Ensure variables start with `VITE_`
   - Restart dev server after changes

#### GitHub Actions Deployment Fails
1. **Check repository secrets:**
   - Go to Settings → Secrets and variables → Actions
   - Ensure `VITE_API_BASE_URL` is set
2. **Check workflow logs:**
   - Go to Actions tab in your repository
   - Click on failed workflow for details

### Testing Before Deployment

```bash
# 1. Install dependencies
npm install
cd backend && npm install && cd ..

# 2. Build both frontend and backend
npm run build
cd backend && npm run build && cd ..

# 3. Test production build locally
npm run preview
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Backend deployed and accessible
- [ ] CORS configured for your domain
- [ ] Frontend builds without errors
- [ ] Local preview works
- [ ] Repository secrets set (for GitHub Pages)
- [ ] GitHub Pages enabled in repository settings

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify network requests in DevTools
3. Test API endpoints directly
4. Check deployment platform logs

## Security Notes

- Never commit `.env` files with sensitive data
- Use repository secrets for production credentials
- Ensure HTTPS in production
- Validate all user inputs on the backend