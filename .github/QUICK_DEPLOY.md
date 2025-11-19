# 🚀 Quick Deploy Guide

**Deploy Quotes Platform from `quotes-platform/` subfolder to https://qpssoft.github.io/Quotes/**

## ⚡ Deploy in 3 Steps

### Option A: Automatic (Recommended)
```bash
git add .
git commit -m "Your commit message"
git push origin main
```
✅ Wait 2-5 minutes → Site is live!

### Option B: Manual
```bash
cd quotes-platform
npm run deploy:gh-pages
```
✅ Wait 1-2 minutes → Site is live!

## ✅ Verify Deployment

Visit: **https://qpssoft.github.io/Quotes/**

Should see:
- ✅ Quotes rotating every 15 seconds
- ✅ Play/Pause/Next controls working
- ✅ Search box functional
- ✅ Grid showing quotes
- ✅ No errors in browser console (F12)

## 🐛 Quick Troubleshooting

### Blank page?
1. Open browser console (F12)
2. Check for errors
3. Hard refresh: `Ctrl+Shift+R`

### 404 on assets?
1. Verify base href: Check `angular.json` has `"baseHref": "/Quotes/"`
2. Check `.nojekyll` exists in `quotes-platform/public/`
3. Clear browser cache

### Old version showing?
1. Wait 2-5 minutes for CDN
2. Clear cache: `Ctrl+Shift+Delete`
3. Try incognito mode

### GitHub Actions failed?
1. Go to **Actions** tab
2. Click on failed workflow
3. Check error logs
4. Common fix: Delete `node_modules` and `package-lock.json`, then `npm install`

## 📚 Need More Help?

- **Full Guide**: [DEPLOYMENT.md](../DEPLOYMENT.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **What Changed**: [DEPLOYMENT_FIX_SUMMARY.md](./DEPLOYMENT_FIX_SUMMARY.md)

---

**That's it!** Your site should be live at https://qpssoft.github.io/Quotes/ 🎉
