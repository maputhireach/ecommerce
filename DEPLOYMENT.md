# 🚀 Deployment Guide

## Environment Configuration

### For Local Development
1. Copy `.env.example` to `.env.local`
2. Update the API URL if your backend runs on a different port:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

### For Production Deployment

#### Option 1: Same Domain Deployment
If your frontend and backend are deployed on the same server:
- Set `VITE_API_BASE_URL=/api` or let it auto-detect
- The app will automatically use `window.location.origin + '/api'`

#### Option 2: Different Domain Deployment
If your backend is on a different domain:
1. Set the production API URL:
   ```
   VITE_API_BASE_URL=https://your-backend-domain.com/api
   ```

## GitHub Pages Deployment

### Setup
1. Go to your GitHub repository settings
2. Navigate to "Pages" section
3. Enable GitHub Actions as the source

### Configure Secrets
1. Go to Settings → Secrets and variables → Actions
2. Add a new secret:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://your-backend-domain.com/api`

### Deploy
Push to your main branch and GitHub Actions will automatically build and deploy.

## Other Platforms

### Vercel
1. Connect your GitHub repository
2. Add environment variable:
   - `VITE_API_BASE_URL`: Your backend API URL

### Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variable:
   - `VITE_API_BASE_URL`: Your backend API URL

## Backend Deployment

Your backend also needs to be deployed and accessible. Popular options:
- **Railway**: Easy Node.js deployment
- **Render**: Free tier available
- **Heroku**: Popular choice
- **DigitalOcean**: VPS option
- **AWS/GCP/Azure**: Cloud platforms

## CORS Configuration

Make sure your backend allows requests from your frontend domain:

```javascript
// In your backend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'https://your-frontend-domain.com'  // Add your production domain
  ],
  credentials: true
}));
```

## Troubleshooting

### "API connection failed" Error
1. Check if `VITE_API_BASE_URL` is set correctly
2. Verify backend is accessible from the deployment environment
3. Check browser console for CORS errors
4. Ensure backend allows your frontend domain

### Environment Variables Not Working
- Environment variables must start with `VITE_` in Vite
- Restart dev server after changing environment files
- Check browser console for the logged API URL

## Testing

Before deploying, test locally:
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```