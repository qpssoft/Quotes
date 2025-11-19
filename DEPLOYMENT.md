# Deployment Guide - Quotes Platform

This guide explains how to deploy the Quotes Platform from the `quotes-platform` subfolder to GitHub Pages at `https://qpssoft.github.io/Quotes/`.

## 🚀 Automatic Deployment (GitHub Actions)

The repository is configured for automatic deployment via GitHub Actions.

### How It Works

1. **Trigger**: Any push to the `main` branch automatically triggers deployment
2. **Build**: GitHub Actions builds the Angular app from `quotes-platform/` subfolder
3. **Deploy**: Artifacts are deployed to GitHub Pages
4. **Live URL**: https://qpssoft.github.io/Quotes/

### Workflow Configuration

The workflow is defined in `.github/workflows/deploy.yml`:

```yaml
- Installs Node.js 20
- Runs npm ci in quotes-platform/
- Builds with: npm run build:gh-pages
- Creates 404.html for SPA routing
- Adds .nojekyll to disable Jekyll processing
- Deploys to GitHub Pages
```

### Verify Deployment

After pushing to `main`:

1. Go to **Actions** tab in GitHub repository
2. Check the "Deploy to GitHub Pages" workflow status
3. Wait for both "build" and "deploy" jobs to complete (usually 2-3 minutes)
4. Visit: https://qpssoft.github.io/Quotes/

## 🔧 Manual Deployment

### Prerequisites

```bash
# Install gh-pages globally (one time)
npm install -g gh-pages

# Or use it via npx (no installation needed)
```

### Deploy from quotes-platform folder

```bash
# Navigate to quotes-platform
cd quotes-platform

# Install dependencies (if not already done)
npm install

# Deploy to GitHub Pages
npm run deploy:gh-pages
```

This command will:
1. Build the production bundle with correct base href (`/Quotes/`)
2. Copy index.html to 404.html for SPA routing
3. Add .nojekyll file to disable Jekyll
4. Push the `dist/quotes-platform/browser/` folder to `gh-pages` branch

### Verify Manual Deployment

After deployment completes:
1. Check the `gh-pages` branch exists in your repository
2. Wait 1-2 minutes for GitHub Pages to update
3. Visit: https://qpssoft.github.io/Quotes/

## ⚙️ Configuration Details

### Base Href Configuration

The application MUST be built with the correct base href for GitHub Pages subdirectory:

**angular.json** (production configuration):
```json
"production": {
  "baseHref": "/Quotes/"
}
```

**package.json** (build script):
```json
"build:gh-pages": "ng build --configuration production --base-href /Quotes/"
```

### Important Files

1. **`.nojekyll`**: Disables Jekyll processing (prevents underscore folder issues)
2. **`404.html`**: Copy of index.html for proper SPA routing on GitHub Pages
3. **`gh-pages` branch**: Automatically created branch containing deployed files

## 🔍 Troubleshooting

### Issue: 404 Error on Refresh

**Problem**: Page loads initially but shows 404 when refreshing or accessing direct URLs

**Solution**: Ensure `404.html` is created (automatically done in build scripts)

### Issue: Assets Not Loading (404 for JS/CSS)

**Problem**: JavaScript/CSS files return 404 errors

**Solutions**:
1. Verify `baseHref` is set to `/Quotes/` in angular.json production config
2. Check that `.nojekyll` file exists in deployed folder
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: Blank Page or White Screen

**Problem**: Page loads but shows blank/white screen

**Solutions**:
1. Open browser DevTools Console (F12) and check for errors
2. Verify the base href matches the repository name:
   - Repository: `Quotes` → Base href: `/Quotes/`
3. Check Network tab for 404 errors on resource files
4. Ensure build completed successfully without errors

### Issue: Deployment Workflow Fails

**Problem**: GitHub Actions workflow fails during build or deploy

**Solutions**:
1. Check **Actions** tab for error details
2. Verify `package-lock.json` is committed in `quotes-platform/`
3. Ensure Node.js version matches (20.x) in workflow
4. Check that GitHub Pages is enabled in repository settings:
   - Settings → Pages → Source: "GitHub Actions"

### Issue: Old Version Still Showing

**Problem**: Deployed new changes but old version still appears

**Solutions**:
1. Wait 2-5 minutes for GitHub Pages CDN to update
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try incognito/private browsing mode
4. Check if workflow completed successfully in Actions tab
5. Verify the `gh-pages` branch has latest commit

### Issue: Manual Deployment Fails with Permission Error

**Problem**: `gh-pages` command fails with authentication error

**Solutions**:
1. Ensure you're authenticated with GitHub:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your-email@example.com"
   ```
2. Generate a Personal Access Token (PAT):
   - GitHub → Settings → Developer settings → Personal access tokens
   - Create token with `repo` scope
   - Use token as password when prompted

3. Or use SSH authentication instead of HTTPS

## 🎯 Repository Structure

```
Quotes/                                    # Root of repository
├── .github/
│   └── workflows/
│       └── deploy.yml                     # Automatic deployment workflow
├── quotes-platform/                       # Angular application subfolder
│   ├── src/                               # Source code
│   ├── public/
│   │   └── .nojekyll                      # Included in build output
│   ├── package.json                       # Contains deploy scripts
│   └── angular.json                       # baseHref config
└── DEPLOYMENT.md                          # This file
```

## 📋 Deployment Checklist

Before deploying:

- [ ] All changes committed and pushed to `main` branch
- [ ] Tests passing (`npm test` in quotes-platform/)
- [ ] Build succeeds locally (`npm run build:gh-pages`)
- [ ] `baseHref` is set to `/Quotes/` in angular.json
- [ ] `.nojekyll` file exists in `quotes-platform/public/`
- [ ] GitHub Actions workflow enabled in repository settings
- [ ] GitHub Pages enabled with source "GitHub Actions"

After deploying:

- [ ] GitHub Actions workflow completed successfully
- [ ] Site accessible at https://qpssoft.github.io/Quotes/
- [ ] All routes work (test navigation)
- [ ] Assets load correctly (images, audio, fonts)
- [ ] SPA routing works (refresh on sub-routes)
- [ ] No console errors in browser DevTools

## 🔐 GitHub Pages Settings

Verify repository settings are correct:

1. Go to: **Settings → Pages**
2. **Source**: Should be "GitHub Actions" (not "Deploy from a branch")
3. **Custom domain**: Leave empty (using default github.io domain)
4. **Enforce HTTPS**: Should be checked ✅

## 📊 Deployment Timeline

| Stage | Duration | What's Happening |
|-------|----------|------------------|
| Build | 1-2 min | Installing deps, compiling TypeScript, bundling |
| Upload | 10-30 sec | Uploading artifacts to GitHub Pages |
| Deploy | 1-2 min | GitHub Pages processing and CDN distribution |
| **Total** | **2-5 min** | From push to live site |

## 🆘 Need Help?

If you encounter issues not covered here:

1. Check GitHub Actions logs in the **Actions** tab
2. Review browser DevTools Console for client-side errors
3. Verify GitHub Pages status: https://www.githubstatus.com/
4. Create an issue in the repository with:
   - Error message/screenshot
   - Steps to reproduce
   - Browser and OS information

## 🎉 Success!

Once deployment is complete, your Quotes Platform will be live at:

**https://qpssoft.github.io/Quotes/**

Share this URL to provide daily Buddhist wisdom and Vietnamese cultural quotes! 🙏
