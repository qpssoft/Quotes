# Deployment Quick Check

Quick verification checklist for GitHub Pages deployment from `quotes-platform/` subfolder to https://qpssoft.github.io/Quotes/

## ✅ Pre-Deployment Checklist

- [ ] Code changes committed and pushed to `main` branch
- [ ] Build passes locally: `cd quotes-platform && npm run build:gh-pages`
- [ ] No TypeScript errors
- [ ] No ESLint errors: `npm run lint`

## 🔧 Configuration Verification

### Angular Configuration (angular.json)
```json
"production": {
  "baseHref": "/Quotes/"  // ✅ Must match repository name
}
```

### Package Scripts (package.json)
```json
"build:gh-pages": "ng build --configuration production --base-href /Quotes/"
```

### GitHub Actions (.github/workflows/deploy.yml)
- [ ] Workflow uses `working-directory: ./quotes-platform`
- [ ] Builds with `npm run build:gh-pages`
- [ ] Creates 404.html for SPA routing
- [ ] Adds .nojekyll file
- [ ] Uploads from `./quotes-platform/dist/quotes-platform/browser`

### Static Files (quotes-platform/public/)
- [ ] `.nojekyll` file exists (disables Jekyll)

## 🚀 Deployment Methods

### Method 1: Automatic (Recommended)
```bash
git add .
git commit -m "Your commit message"
git push origin main
```
Then wait 2-5 minutes and check: https://qpssoft.github.io/Quotes/

### Method 2: Manual
```bash
cd quotes-platform
npm run deploy:gh-pages
```

## 🔍 Post-Deployment Verification

### GitHub Actions
- [ ] Go to repository → **Actions** tab
- [ ] Latest workflow shows ✅ green checkmark
- [ ] Both "build" and "deploy" jobs completed successfully

### GitHub Pages Settings
- [ ] Repository → **Settings** → **Pages**
- [ ] Source: "GitHub Actions" (not "Deploy from a branch")
- [ ] Shows: "Your site is live at https://qpssoft.github.io/Quotes/"

### Live Site Testing
- [ ] Visit: https://qpssoft.github.io/Quotes/
- [ ] Page loads without blank screen
- [ ] No console errors (F12 → Console tab)
- [ ] Quote rotation works
- [ ] Controls work (Play/Pause/Next)
- [ ] Search works
- [ ] Grid displays quotes
- [ ] Audio notification plays (after first interaction)
- [ ] Refresh page works (no 404)
- [ ] Direct URL access works (e.g., /Quotes/some-route)

### Network Verification
- [ ] F12 → Network tab → Refresh page
- [ ] All assets load (200 status codes)
- [ ] No 404 errors for .js, .css, or other files
- [ ] Check: main.*.js, polyfills.*.js, styles.*.css
- [ ] Check: quotes.json from /Quotes/data/quotes.json

### Browser Cache
If you see old version:
```bash
Ctrl+Shift+Delete (Clear cache)
# OR
Ctrl+Shift+R (Hard refresh)
# OR
Try incognito/private mode
```

## 🐛 Common Issues & Quick Fixes

### Issue: 404 on Assets (JS/CSS not loading)
**Check**: 
- [ ] `baseHref` is `/Quotes/` in angular.json
- [ ] `.nojekyll` exists in deployed folder
- [ ] Hard refresh browser (Ctrl+Shift+R)

### Issue: Blank Page
**Check**:
- [ ] Browser console for errors (F12)
- [ ] Network tab for 404s
- [ ] Base href matches repository name exactly

### Issue: 404 on Refresh/Direct URLs
**Check**:
- [ ] `404.html` was created (should be copy of index.html)
- [ ] Workflow includes step to create 404.html

### Issue: Workflow Fails
**Check**:
- [ ] Actions tab for error details
- [ ] package-lock.json exists in quotes-platform/
- [ ] Node version is 20.x in workflow

### Issue: Old Version Shows
**Wait**: 2-5 minutes for CDN
**Then**:
- [ ] Clear cache
- [ ] Check gh-pages branch has latest commit
- [ ] Try incognito mode

## 📊 Expected Timings

| Action | Expected Duration |
|--------|------------------|
| GitHub Actions Build | 1-2 minutes |
| GitHub Actions Deploy | 30 seconds |
| CDN Propagation | 1-3 minutes |
| **Total** | **2-5 minutes** |

## 🎯 Success Indicators

✅ **Deployment Successful When**:
1. GitHub Actions workflow shows ✅ green checkmark
2. https://qpssoft.github.io/Quotes/ loads the app
3. No console errors in browser DevTools
4. All network requests return 200 status
5. Page refresh doesn't cause 404
6. All features work as expected

## 📞 Need Help?

If issues persist:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting
2. Review GitHub Actions logs for build errors
3. Check browser DevTools Console and Network tabs
4. Verify GitHub Pages settings in repository

---

Last Updated: 2025-01-24
