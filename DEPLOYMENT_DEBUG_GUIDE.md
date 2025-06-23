# Deployment Debug Guide

## Overview
This guide helps you identify and fix common deployment issues with your scraping website. The enhanced error handling will now provide detailed information about what's failing.

## Common Deployment Issues

### 1. Puppeteer/Chrome Issues (Most Common)
**Symptoms:**
- Browser initialization fails
- "Failed to launch browser" errors
- Timeout errors during scraping

**Solutions:**
- **Render.com**: Add buildpack for Chrome
  ```bash
  # In your deployment settings, add this buildpack:
  https://github.com/CoffeeAndCode/puppeteer-heroku-buildpack
  ```
- **Heroku**: Use the official Puppeteer buildpack
  ```bash
  heroku buildpacks:add --index 1 https://github.com/heroku/heroku-buildpack-google-chrome
  heroku buildpacks:add --index 2 https://github.com/heroku/heroku-buildpack-nodejs
  ```
- **Vercel**: Not recommended for Puppeteer (serverless limitations)
- **Railway**: Should work with default setup

### 2. Memory Limitations
**Symptoms:**
- Out of memory errors
- Browser crashes
- Slow performance

**Solutions:**
- Increase memory allocation in deployment platform
- Add memory monitoring to your app
- Implement resource cleanup

### 3. Network/Timeout Issues
**Symptoms:**
- Request timeouts
- Network connectivity errors
- CORS issues

**Solutions:**
- Increase timeout values
- Check firewall settings
- Verify CORS configuration

### 4. Environment Variables
**Symptoms:**
- Missing dependencies
- Configuration errors

**Solutions:**
- Set `NODE_ENV=production`
- Ensure all required environment variables are set
- Check build process

## Using the Debug Tools

### 1. Environment Test
Click the "Test Environment" button to run comprehensive tests:
- Puppeteer availability
- Browser initialization
- Network connectivity
- File system access

### 2. Console Logs
Check the browser console for detailed error information:
- Request/response details
- Memory usage
- Timing information
- Error stack traces

### 3. Server Logs
Monitor your deployment platform's logs for:
- Browser initialization errors
- Memory usage spikes
- Network timeouts
- Process crashes

## Debug Steps

### Step 1: Run Environment Test
1. Deploy your updated code
2. Open the website
3. Click "Test Environment" button
4. Check the results for any failed tests

### Step 2: Check Console Logs
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try to scrape a website
4. Look for detailed error messages

### Step 3: Monitor Server Logs
1. Check your deployment platform's logs
2. Look for error messages with request IDs
3. Monitor memory usage and performance

### Step 4: Test Simple Scraping
1. Try scraping a simple website first (e.g., example.com)
2. Check if basic functionality works
3. Gradually test more complex websites

## Platform-Specific Solutions

### Render.com
```bash
# Add to your package.json
{
  "scripts": {
    "build": "npm install && npm run build:client",
    "start": "node server/index.js"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}

# Environment variables
NODE_ENV=production
PORT=10000
```

### Heroku
```bash
# Procfile
web: node server/index.js

# Buildpacks
heroku buildpacks:add --index 1 https://github.com/heroku/heroku-buildpack-google-chrome
heroku buildpacks:add --index 2 https://github.com/heroku/heroku-buildpack-nodejs
```

### Railway
```bash
# No special configuration needed
# Just ensure NODE_ENV=production is set
```

## Error Messages Explained

### Browser Initialization Errors
- **"Failed to launch browser"**: Chrome not available in deployment environment
- **"Timeout"**: Memory or resource constraints
- **"Permission denied"**: Security restrictions in deployment environment

### Network Errors
- **"ECONNREFUSED"**: Server not reachable
- **"ETIMEDOUT"**: Request timeout
- **"ENOTFOUND"**: DNS resolution failed

### Memory Errors
- **"JavaScript heap out of memory"**: Insufficient memory allocation
- **"Process terminated"**: Memory limit exceeded

## Performance Optimization

### 1. Memory Management
- Close browser pages after use
- Implement proper cleanup
- Monitor memory usage

### 2. Timeout Configuration
- Increase timeout values for slow websites
- Implement retry logic
- Add fallback mechanisms

### 3. Resource Limits
- Limit concurrent requests
- Implement rate limiting
- Add request queuing

## Troubleshooting Checklist

- [ ] Environment test passes
- [ ] Browser initializes successfully
- [ ] Network connectivity works
- [ ] File system is writable
- [ ] Memory usage is within limits
- [ ] Timeouts are appropriate
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Build process completes successfully
- [ ] Server starts without errors

## Getting Help

If you're still experiencing issues:

1. **Run the environment test** and share the results
2. **Check console logs** for detailed error messages
3. **Monitor server logs** for backend issues
4. **Test with simple websites** first
5. **Check your deployment platform's documentation**

The enhanced error handling will now provide much more detailed information to help identify the root cause of any issues. 