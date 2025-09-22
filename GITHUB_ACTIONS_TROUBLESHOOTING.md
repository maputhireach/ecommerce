# GitHub Actions Deployment Troubleshooting

## Error: "The process '/usr/bin/git' failed with exit code 128"

This error indicates a Git authentication or permissions issue during GitHub Actions deployment.

## Root Causes & Solutions

### 1. GitHub Pages Configuration Issue
**Problem**: GitHub Pages is not properly configured in repository settings.

**Solution**: 
1. Go to your repository on GitHub
2. Settings → Pages
3. Under "Source", select "GitHub Actions"
4. Save the configuration

### 2. Insufficient Permissions
**Problem**: The workflow doesn't have proper permissions to deploy to GitHub Pages.

**Solution Applied**: 
✅ Added proper permissions to the workflow:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### 3. Branch Protection Rules
**Problem**: Branch protection rules prevent the deployment action from pushing to gh-pages branch.

**Solution**: 
1. Go to Settings → Branches
2. Edit branch protection rules for main/master
3. Allow GitHub Actions to bypass restrictions

### 4. Repository Visibility
**Problem**: Private repositories might have additional restrictions.

**Solution**: 
- Ensure repository is public, OR
- Configure proper access tokens for private repos

## Applied Fixes

### Updated Workflow (.github/workflows/deploy.yml)
1. ✅ Added proper permissions for GitHub Pages
2. ✅ Added concurrency control to prevent conflicts
3. ✅ Updated to use actions/deploy-pages@v4
4. ✅ Added fetch-depth: 0 for complete Git history
5. ✅ Used upload-pages-artifact for better reliability

### Alternative Workflow (deploy-alternative.yml)
- Backup deployment method using peaceiris/actions-gh-pages@v4
- Includes force_orphan and explicit user configuration
- Can be activated if main workflow fails

## Manual Steps to Enable GitHub Pages

1. **Repository Settings**:
   - Go to `https://github.com/maputhireach/ecommerce/settings/pages`
   - Set Source to "GitHub Actions"
   - Click "Save"

2. **Verify Workflow Permissions**:
   - Go to Settings → Actions → General
   - Under "Workflow permissions", select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"
   - Click "Save"

3. **Re-run Failed Workflow**:
   - Go to Actions tab
   - Click on the failed workflow run
   - Click "Re-run all jobs"

## Alternative Deployment Options

If GitHub Pages continues to fail:

### Option 1: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Option 2: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 3: Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize and deploy
firebase init hosting
firebase deploy
```

## Monitoring

After applying fixes:
1. Push changes to trigger new deployment
2. Monitor Actions tab for successful completion
3. Check deployment at: `https://maputhireach.github.io/ecommerce`

## Quick Fix Commands

If you need to quickly re-enable deployment:

```bash
# Delete and recreate gh-pages branch
git branch -D gh-pages
git push origin --delete gh-pages

# Re-run deployment
git add .
git commit -m "Fix deployment permissions"
git push origin main
```