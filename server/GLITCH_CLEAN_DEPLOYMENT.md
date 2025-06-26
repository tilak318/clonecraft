# Clean Glitch Deployment Guide

## 🚨 **Problem**: File Structure Issues on Glitch

When there are errors in the file structure, Glitch can't properly import from GitHub or run the project. This guide will help you create a clean deployment.

## 🧹 **Step 1: Clean Up Files**

Run this command in your server directory to remove problematic files:

```bash
node prepare-for-glitch.js
```

This will remove:
- ❌ `node_modules/` (will be installed by Glitch)
- ❌ `package-lock.json` (can cause conflicts)
- ❌ `temp_zips/` (large files that cause issues)
- ❌ `.git/` (can cause conflicts)
- ❌ Extra setup files

## 📁 **Step 2: Verify Clean Structure**

After cleanup, your directory should look like this:

```
server/
├── index.js              # Main server file
├── package.json          # Dependencies (clean version)
├── .nvmrc               # Node.js version 18
├── .glitchrc            # Glitch configuration
├── .gitignore           # Exclude problematic files
├── README.md            # Simple Glitch README
├── routes/
│   └── api.js
├── services/
│   ├── scraperService.js
│   └── zipService.js
├── middleware/
│   └── errorHandler.js
├── utils/
│   └── resourceProcessor.js
└── config/
    └── database.js
```

## 🚀 **Step 3: Deploy to Glitch**

### Option A: Manual Upload (Recommended)
1. Go to [glitch.com](https://glitch.com)
2. Create a **new project** (don't import from GitHub)
3. Upload all files from the cleaned `server/` directory
4. Make sure `index.js` is in the root of your Glitch project

### Option B: GitHub Import (If Manual Upload Fails)
1. Create a new GitHub repository
2. Upload only the cleaned files (no node_modules, no .git)
3. Import from GitHub on Glitch

## ⚙️ **Step 4: Configure Glitch**

1. In your Glitch project settings:
   - Set **Main File** to `index.js`
   - Set **Start Command** to `node index.js`

2. Check the logs to confirm:
   - Node.js version shows 18+ (not 10.x)
   - No compatibility warnings
   - Successful dependency installation

## 🧪 **Step 5: Test Deployment**

1. **Health Check**:
   ```
   GET https://your-project-name.glitch.me/health
   ```

2. **Expected Response**:
   ```json
   {
     "status": "OK",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "platform": "Glitch",
     "port": 3000
   }
   ```

## 🔧 **Troubleshooting**

### If Glitch Still Uses Node.js 10:
1. **Refresh the project** (click refresh button)
2. **Check .nvmrc file** is present and contains "18"
3. **Verify package.json** has engines field
4. **Try new project** if issues persist

### If Dependencies Fail to Install:
1. **Check package.json** has exact versions (no ^ symbols)
2. **Remove package-lock.json** if present
3. **Refresh project** to trigger reinstall

### If Import from GitHub Fails:
1. **Use manual upload** instead
2. **Create new repository** with only clean files
3. **Check repository** doesn't contain node_modules or .git

## 📋 **Quick Checklist**

Before uploading to Glitch:
- ✅ Run `node prepare-for-glitch.js`
- ✅ Verify no `node_modules/` directory
- ✅ Verify no `package-lock.json`
- ✅ Verify no `.git/` directory
- ✅ Verify no `temp_zips/` directory
- ✅ Verify `index.js` is in root
- ✅ Verify `.nvmrc` contains "18"

After uploading to Glitch:
- ✅ Check Node.js version in logs (should be 18+)
- ✅ Verify dependencies install successfully
- ✅ Test health endpoint
- ✅ Check console for any errors

## 🆘 **If All Else Fails**

1. **Create completely new Glitch project**
2. **Upload files one by one** starting with essential files:
   - `index.js`
   - `package.json`
   - `.nvmrc`
   - `.glitchrc`
3. **Then upload directories** one by one
4. **Test after each upload**

## 📞 **Support**

If you still have issues:
1. Check Glitch community forums
2. Verify all essential files are present
3. Try different Glitch project templates
4. Consider using a different deployment platform 