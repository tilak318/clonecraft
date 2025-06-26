# Glitch Deployment Guide

This guide will help you deploy the Resources Saver server on Glitch platform.

## ⚠️ **IMPORTANT: Node.js Version Issue**

**Problem**: Glitch sometimes uses Node.js 10.24.1 by default, which is incompatible with modern dependencies.

**Solution**: We've added configuration files to force Glitch to use Node.js 18+:
- `.nvmrc` - Specifies Node.js version 18
- `package.json` - Contains `engines` field requiring Node.js >=16
- `.glitchrc` - Glitch-specific configuration

## Quick Setup

1. **Create a new Glitch project**
   - Go to [glitch.com](https://glitch.com)
   - Click "New Project" → "Import from GitHub"
   - Or create a new project and upload the server files

2. **Upload Server Files**
   - Upload all files from the `server/` directory to your Glitch project
   - Make sure `index.js` is in the root of your Glitch project
   - **Important**: Include `.nvmrc`, `.glitchrc`, and `package.json`

3. **Configure Glitch Settings**
   - In your Glitch project, go to Settings
   - Set "Main File" to `index.js`
   - Set "Start Command" to `node index.js`
   - **Check that Node.js version shows 18+ in the logs**

4. **Install Dependencies**
   - Glitch will automatically run `npm install` when it detects `package.json`
   - If you see Node.js 10.x in logs, try refreshing the project

## Troubleshooting Common Issues

### 1. Node.js Version Too Old
**Error**: `No Node version was specified; we are using default version 10`
**Solution**: 
- Make sure `.nvmrc` file is uploaded to Glitch
- Refresh the project (click the refresh button)
- Check logs to confirm Node.js 18+ is being used

### 2. Axios Import Error
**Error**: `SyntaxError: Unexpected identifier` with axios
**Solution**: ✅ **FIXED** - We've downgraded axios to version 0.27.2 which is compatible with Glitch

### 3. Puppeteer Installation Failed
**Error**: `puppeteer@22.15.0 postinstall: node install.mjs`
**Solution**: ✅ **FIXED** - Downgraded to Puppeteer 19.11.1 which is compatible with Node.js 16+

### 4. Module Resolution Errors
**Error**: `Cannot find module 'node:stream'`
**Solution**: ✅ **FIXED** - Downgraded dependencies to versions compatible with Node.js 16+

### 5. Port Issues
**Error**: Server won't start
**Solution**: ✅ **FIXED** - The server uses `process.env.PORT` which Glitch provides automatically

### 6. CORS Issues
**Error**: Frontend can't connect to API
**Solution**: ✅ **FIXED** - CORS is configured to allow Glitch domains

### 7. Memory Issues
**Error**: Out of memory errors
**Solution**: The server is optimized for low-memory environments:
- Disables unnecessary browser features
- Uses compression
- Implements proper cleanup

## Testing Your Deployment

1. **Health Check**
   ```
   GET https://your-project-name.glitch.me/health
   ```
   Should return:
   ```json
   {
     "status": "OK",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "platform": "Glitch",
     "port": 3000
   }
   ```

2. **API Test**
   ```
   GET https://your-project-name.glitch.me/api
   ```
   Should return API information

## Environment Variables

Glitch automatically provides:
- `process.env.PORT` - The port your app should listen on
- `process.env.PROJECT_DOMAIN` - Your project's domain name

## File Structure on Glitch

Your Glitch project should look like this:
```
/
├── index.js              # Main server file
├── package.json          # Dependencies (with engines field)
├── .nvmrc               # Node.js version specification
├── .glitchrc            # Glitch configuration
├── package-lock.json     # Lock file (auto-generated)
├── glitch-setup.js       # Setup script (optional)
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

## Performance Tips

1. **Keep the app alive**: Glitch puts apps to sleep after 5 minutes of inactivity
2. **Monitor logs**: Check the console for any errors
3. **Test regularly**: Use the health endpoint to verify the server is running
4. **Check Node.js version**: Ensure logs show Node.js 18+ not 10.x

## Support

If you encounter issues:
1. **Check Node.js version in logs** - Should be 18+, not 10.x
2. Check the console logs in Glitch
3. Verify all files are uploaded correctly (especially `.nvmrc`)
4. Ensure `index.js` is set as the main file
5. Try refreshing the project
6. If still using Node.js 10, try creating a new project

## Common Commands

```bash
# View logs
# (Use Glitch console)

# Restart app
# (Use Glitch "Refresh" button)

# Install dependencies
npm install

# Run setup script (if needed)
node glitch-setup.js

# Check Node.js version
node --version
```

## Dependency Versions Used

- **Node.js**: >=16.0.0 (specified in engines)
- **axios**: 0.27.2 (CommonJS compatible)
- **puppeteer**: 19.11.1 (Node.js 16+ compatible)
- **helmet**: 6.1.5 (Node.js 16+ compatible)
- **cheerio**: 1.0.0-rc.12 (Node.js 16+ compatible) 