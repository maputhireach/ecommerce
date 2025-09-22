# Build Troubleshooting Guide

## Current Issue: crypto.hash is not a function

This error occurs during GitHub Actions deployment due to Node.js version compatibility issues with Vite and PostCSS.

## Applied Fixes

### 1. GitHub Actions Workflow Updates (.github/workflows/deploy.yml)
- ✅ Updated Node.js version from 18 to 20
- ✅ Replaced `npm ci` with `npm install` for better compatibility
- ✅ Added `npm cache clean --force` step
- ✅ Added `NODE_ENV=production` environment variable

### 2. Vite Configuration Updates (vite.config.ts)
- ✅ Added `optimizeDeps` configuration
- ✅ Added CSS development sourcemap settings
- ✅ Enhanced build optimization

## If Build Still Fails

### Alternative Fix 1: Downgrade Node.js Version
```yaml
# In .github/workflows/deploy.yml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18.17.1'  # Specific stable version
    cache: 'npm'
```

### Alternative Fix 2: Add PostCSS Configuration
Create `postcss.config.js`:
```javascript
module.exports = {
  plugins: {
    autoprefixer: {}
  }
}
```

### Alternative Fix 3: Lock Package Versions
Add to package.json:
```json
{
  "overrides": {
    "postcss": "^8.4.20"
  }
}
```

### Alternative Fix 4: Environment Variables
Add to GitHub Actions:
```yaml
env:
  NODE_OPTIONS: "--max-old-space-size=4096"
  DISABLE_OPENCOLLECTIVE: true
```

## Monitor Deployment

1. Go to your GitHub repository
2. Click "Actions" tab
3. Watch the latest deployment workflow
4. Check for successful completion

The deployment should now work with the applied fixes.