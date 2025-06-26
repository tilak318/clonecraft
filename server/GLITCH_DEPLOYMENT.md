# Glitch Deployment Guide

This guide will help you deploy the Resources Saver server on Glitch platform.

## Quick Setup

1. **Create a new Glitch project**
   - Go to [glitch.com](https://glitch.com)
   - Click "New Project" → "Import from GitHub"
   - Or create a new project and upload the server files

2. **Upload Server Files**
   - Upload all files from the `server/` directory to your Glitch project
   - Make sure `index.js` is in the root of your Glitch project

3. **Configure Glitch Settings**
   - In your Glitch project, go to Settings
   - Set "Main File" to `index.js`
   - Set "Start Command" to `node index.js`

4. **Install Dependencies**
   - Glitch will automatically run `npm install` when it detects `package.json`
   - If not, you can run it manually in the console

## Troubleshooting Common Issues

### 1. Axios Import Error
**Error**: `SyntaxError: Unexpected identifier` with axios
**Solution**: ✅ **FIXED** - We've downgraded axios to version 0.27.2 which is compatible with Glitch

### 2. Puppeteer Issues
**Error**: Browser initialization fails
**Solution**: The server is configured with Glitch-compatible Puppeteer settings:
- Uses `--no-sandbox` and `--disable-setuid-sandbox` flags
- Disables GPU and other resource-intensive features
- Has fallback configurations if the primary setup fails

### 3. Port Issues
**Error**: Server won't start
**Solution**: ✅ **FIXED** - The server uses `process.env.PORT` which Glitch provides automatically

### 4. CORS Issues
**Error**: Frontend can't connect to API
**Solution**: ✅ **FIXED** - CORS is configured to allow Glitch domains

### 5. Memory Issues
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
├── package.json          # Dependencies
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

## Support

If you encounter issues:
1. Check the console logs in Glitch
2. Verify all files are uploaded correctly
3. Ensure `index.js` is set as the main file
4. Try restarting the project

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
``` 