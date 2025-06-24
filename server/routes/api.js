const express = require('express');
const router = express.Router();
const scraperService = require('../services/scraperService');
const zipService = require('../services/zipService');
const { validateScrapeRequest, validateDownloadRequest, rateLimiter } = require('../middleware/validation');

/**
 * @route   POST /api/scrape
 * @desc    Scrape website and extract resources
 * @access  Public
 */
router.post('/scrape', rateLimiter, validateScrapeRequest, async (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    const { url, options = {} } = req.body;
    
    console.log(`[${requestId}] 🚀 Starting scrape request`);
    console.log(`[${requestId}] 📍 URL: ${url}`);
    console.log(`[${requestId}] ⚙️ Options:`, options);
    console.log(`[${requestId}] 🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`[${requestId}] 💾 Memory before:`, Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
    
    const result = await scraperService.scrapeWebsite(url, options);
    
    const totalTime = Date.now() - startTime;
    console.log(`[${requestId}] ✅ Scrape completed successfully`);
    console.log(`[${requestId}] 📊 Final stats: ${result.count} resources, ${totalTime}ms`);
    console.log(`[${requestId}] 💾 Memory after:`, Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
    
    res.json({
      ...result,
      requestId,
      serverTime: totalTime
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[${requestId}] ❌ Scrape failed after ${totalTime}ms:`, error.message);
    console.error(`[${requestId}] 📊 Error context:`, {
      url: req.body.url,
      options: req.body.options,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    });
    
    // Create detailed error response
    const errorResponse = {
      success: false,
      error: error.message,
      requestId,
      serverTime: totalTime,
      debug: {
        environment: process.env.NODE_ENV,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    };
    
    // Add stack trace in development
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = error.stack;
    }
    
    res.status(500).json(errorResponse);
  }
});

/**
 * @route   POST /api/scrape-debug
 * @desc    Scrape website with detailed debugging information
 * @access  Public
 */
router.post('/scrape-debug', rateLimiter, validateScrapeRequest, async (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    const { url, options = {} } = req.body;
    
    console.log(`[${requestId}] 🔍 Starting debug scrape request`);
    console.log(`[${requestId}] 📍 URL: ${url}`);
    console.log(`[${requestId}] ⚙️ Options:`, options);
    console.log(`[${requestId}] 🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`[${requestId}] 💾 Initial memory:`, Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
    
    const result = await scraperService.scrapeWebsite(url, options);
    const endTime = Date.now();
    
    // --- FIX: Flatten resources if fallback returns an object ---
    let allResources = [];
    if (Array.isArray(result.resources)) {
      allResources = result.resources;
    } else if (result.resources && typeof result.resources === 'object') {
      allResources = Object.values(result.resources).flat();
    }
    
    // Analyze resources
    const resourceTypes = {};
    const resourceSizes = [];
    const domains = new Set();
    const statusCodes = {};
    
    allResources.forEach(resource => {
      // Count by type
      const type = resource.type || 'unknown';
      resourceTypes[type] = (resourceTypes[type] || 0) + 1;
      
      // Track sizes
      if (resource.size) {
        resourceSizes.push(resource.size);
      }
      
      // Track domains
      try {
        const domain = new URL(resource.url).hostname;
        domains.add(domain);
      } catch (e) {
        // Skip invalid URLs
      }
      
      // Track status codes
      if (resource.status) {
        statusCodes[resource.status] = (statusCodes[resource.status] || 0) + 1;
      }
    });
    
    const analysis = {
      totalResources: allResources.length,
      uniqueDomains: domains.size,
      resourceTypes,
      statusCodes,
      totalSize: resourceSizes.reduce((sum, size) => sum + size, 0),
      sizeStats: {
        average: resourceSizes.length > 0 ? resourceSizes.reduce((sum, size) => sum + size, 0) / resourceSizes.length : 0,
        min: resourceSizes.length > 0 ? Math.min(...resourceSizes) : 0,
        max: resourceSizes.length > 0 ? Math.max(...resourceSizes) : 0
      },
      scrapeTime: endTime - startTime,
      domains: Array.from(domains),
      serverInfo: {
        environment: process.env.NODE_ENV,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform
      }
    };
    
    console.log(`[${requestId}] ✅ Debug scrape completed`);
    console.log(`[${requestId}] 📊 Analysis:`, analysis);
    
    res.json({
      ...result,
      debug: analysis,
      requestId,
      serverTime: endTime - startTime
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[${requestId}] ❌ Debug scrape failed after ${totalTime}ms:`, error.message);
    console.error(`[${requestId}] 📊 Error context:`, {
      url: req.body.url,
      options: req.body.options,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      scraperStatus: scraperService.getStatus()
    });
    
    const errorResponse = {
      success: false,
      error: error.message,
      requestId,
      serverTime: totalTime,
      debug: {
        environment: process.env.NODE_ENV,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        scraperStatus: scraperService.getStatus(),
        timestamp: new Date().toISOString()
      }
    };
    
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = error.stack;
    }
    
    res.status(500).json(errorResponse);
  }
});

/**
 * @route   POST /api/download
 * @desc    Create ZIP file from resources
 * @access  Public
 */
router.post('/download', rateLimiter, validateDownloadRequest, async (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    const { resources, options = {} } = req.body;
    
    console.log(`[${requestId}] 📦 Starting ZIP creation`);
    console.log(`[${requestId}] 📊 Resources: ${resources.length}`);
    console.log(`[${requestId}] ⚙️ Options:`, options);
    console.log(`[${requestId}] 💾 Memory before:`, Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
    
    const zipBuffer = await zipService.createZipFile(resources, options);
    const filename = zipService.generateFilename(resources);
    
    const totalTime = Date.now() - startTime;
    console.log(`[${requestId}] ✅ ZIP created successfully`);
    console.log(`[${requestId}] 📁 Filename: ${filename}`);
    console.log(`[${requestId}] 📏 Size: ${Math.round(zipBuffer.length / 1024)} KB`);
    console.log(`[${requestId}] ⏱️ Time: ${totalTime}ms`);
    console.log(`[${requestId}] 💾 Memory after:`, Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', zipBuffer.length);
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Processing-Time', totalTime);
    
    res.send(zipBuffer);
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[${requestId}] ❌ ZIP creation failed after ${totalTime}ms:`, error.message);
    console.error(`[${requestId}] 📊 Error context:`, {
      resourceCount: req.body.resources?.length,
      options: req.body.options,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    });
    
    const errorResponse = {
      success: false,
      error: error.message,
      requestId,
      serverTime: totalTime,
      debug: {
        environment: process.env.NODE_ENV,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    };
    
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = error.stack;
    }
    
    res.status(500).json(errorResponse);
  }
});

/**
 * @route   POST /api/download-with-info
 * @desc    Create ZIP file and return info
 * @access  Public
 */
router.post('/download-with-info', rateLimiter, validateDownloadRequest, async (req, res, next) => {
  try {
    const { resources, options = {} } = req.body;
    
    console.log(`Creating ZIP with ${resources.length} resources`);
    
    const zipBuffer = await zipService.createZipFile(resources, options);
    const filename = zipService.generateFilename(resources);
    const zipInfo = await zipService.getZipInfo(zipBuffer);
    
    res.json({
      success: true,
      filename,
      zipInfo,
      downloadUrl: `/api/download-direct/${encodeURIComponent(filename)}`
    });
    
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  const scraperStatus = scraperService.getStatus();
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      scraper: scraperStatus,
      zip: 'OK'
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

/**
 * @route   GET /api/status
 * @desc    Get detailed service status
 * @access  Public
 */
router.get('/status', (req, res) => {
  const scraperStatus = scraperService.getStatus();
  
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    services: {
      scraper: scraperStatus,
      zip: {
        status: 'OK',
        timestamp: new Date().toISOString()
      }
    },
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform
    }
  });
});

/**
 * @route   GET /api/test-scrape/:domain
 * @desc    Test scraping with a simple domain
 * @access  Public
 */
router.get('/test-scrape/:domain', async (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    const { domain } = req.params;
    const testUrl = `https://${domain}`;
    
    console.log(`[${requestId}] 🧪 Starting test scrape for: ${testUrl}`);
    console.log(`[${requestId}] 🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`[${requestId}] 💾 Memory before:`, Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
    
    // Test scraping using the main service (which handles fallback automatically)
    console.log(`[${requestId}] 🔧 Testing scraping service...`);
    const result = await scraperService.scrapeWebsite(testUrl, {});
    
    const totalTime = Date.now() - startTime;
    console.log(`[${requestId}] ✅ Test completed successfully in ${totalTime}ms`);
    console.log(`[${requestId}] 📊 Resources found: ${result.count}`);
    
    res.json({
      success: true,
      testUrl,
      requestId,
      serverTime: totalTime,
      resources: result.count,
      method: result.method || 'unknown',
      debug: {
        environment: process.env.NODE_ENV,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform,
        scraperStatus: scraperService.getStatus(),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[${requestId}] ❌ Test failed after ${totalTime}ms:`, error.message);
    console.error(`[${requestId}] 📊 Error context:`, {
      domain: req.params.domain,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      scraperStatus: scraperService.getStatus()
    });
    
    const errorResponse = {
      success: false,
      error: error.message,
      testUrl: `https://${req.params.domain}`,
      requestId,
      serverTime: totalTime,
      debug: {
        environment: process.env.NODE_ENV,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        scraperStatus: scraperService.getStatus(),
        timestamp: new Date().toISOString()
      }
    };
    
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = error.stack;
    }
    
    res.status(500).json(errorResponse);
  }
});

/**
 * @route   GET /api/test-environment
 * @desc    Test environment configuration and dependencies
 * @access  Public
 */
router.get('/test-environment', async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] 🔍 Testing environment configuration...`);
    
    // Check environment variables
    const skipChrome = process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD === 'true';
    console.log(`[${requestId}] 🔧 PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: ${skipChrome}`);
    
    // Test Puppeteer availability
    let puppeteerStatus = 'unknown';
    try {
      const puppeteer = require('puppeteer');
      puppeteerStatus = 'available';
      console.log(`[${requestId}] ✅ Puppeteer is available`);
    } catch (error) {
      puppeteerStatus = `error: ${error.message}`;
      console.error(`[${requestId}] ❌ Puppeteer error:`, error.message);
    }
    
    // Test browser initialization or fallback
    let browserStatus = 'unknown';
    let scraperMethod = 'unknown';
    
    if (skipChrome) {
      // Chrome is skipped, test fallback service
      try {
        const FallbackScraperService = require('../services/fallbackScraperService');
        const fallbackService = new FallbackScraperService();
        const isAvailable = await fallbackService.checkAvailability();
        
        if (isAvailable) {
          browserStatus = 'fallback-available';
          scraperMethod = 'fallback-http';
          console.log(`[${requestId}] ✅ Fallback scraper is available`);
        } else {
          browserStatus = 'fallback-unavailable';
          console.log(`[${requestId}] ❌ Fallback scraper is unavailable`);
        }
      } catch (error) {
        browserStatus = `fallback-error: ${error.message}`;
        console.error(`[${requestId}] ❌ Fallback service error:`, error.message);
      }
    } else {
      // Try to initialize Chrome browser
      try {
        const browser = await scraperService.initializeBrowser();
        browserStatus = 'initialized';
        scraperMethod = 'puppeteer';
        console.log(`[${requestId}] ✅ Browser initialized successfully`);
      } catch (error) {
        browserStatus = `error: ${error.message}`;
        scraperMethod = 'fallback-http';
        console.error(`[${requestId}] ❌ Browser initialization error:`, error.message);
      }
    }
    
    // Test network connectivity
    let networkStatus = 'unknown';
    try {
      const axios = require('axios');
      const response = await axios.get('https://httpbin.org/get', { timeout: 10000 });
      networkStatus = `connected (${response.status})`;
      console.log(`[${requestId}] ✅ Network connectivity test passed`);
    } catch (error) {
      networkStatus = `error: ${error.message}`;
      console.error(`[${requestId}] ❌ Network connectivity test failed:`, error.message);
    }
    
    // Test file system
    let fsStatus = 'unknown';
    try {
      const fs = require('fs');
      const testDir = './temp_zips';
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      fsStatus = 'writable';
      console.log(`[${requestId}] ✅ File system test passed`);
    } catch (error) {
      fsStatus = `error: ${error.message}`;
      console.error(`[${requestId}] ❌ File system test failed:`, error.message);
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`[${requestId}] ✅ Environment test completed in ${totalTime}ms`);
    
    res.json({
      success: true,
      requestId,
      serverTime: totalTime,
      tests: {
        puppeteer: puppeteerStatus,
        browser: browserStatus,
        network: networkStatus,
        filesystem: fsStatus
      },
      scraper: {
        method: scraperMethod,
        skipChrome: skipChrome,
        status: scraperService.getStatus()
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        env: process.env.NODE_ENV,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        pid: process.pid,
        cwd: process.cwd()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[${requestId}] ❌ Environment test failed:`, error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      requestId,
      serverTime: totalTime,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/test-fallback
 * @desc    Test the fallback scraper service directly
 * @access  Public
 */
router.get('/test-fallback', async (req, res) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    console.log(`[${requestId}] 🧪 Testing fallback scraper service...`);
    
    const FallbackScraperService = require('../services/fallbackScraperService');
    const fallbackService = new FallbackScraperService();
    
    // Test with a simple website
    const testUrl = 'https://example.com';
    const result = await fallbackService.scrapeWebsite(testUrl, {});
    
    const totalTime = Date.now() - startTime;
    console.log(`[${requestId}] ✅ Fallback test completed in ${totalTime}ms`);
    
    res.json({
      success: true,
      testUrl,
      requestId,
      serverTime: totalTime,
      resources: result.resources,
      method: result.method,
      debug: {
        environment: process.env.NODE_ENV,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[${requestId}] ❌ Fallback test failed:`, error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      requestId,
      serverTime: totalTime,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 