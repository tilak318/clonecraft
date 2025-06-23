const express = require('express');
const router = express.Router();
const { scrapeWebsite } = require('../services/scraperService');
const zipService = require('../services/zipService');
const { validateScrapeRequest, validateDownloadRequest, rateLimiter } = require('../middleware/validation');

/**
 * @route   POST /api/scrape
 * @desc    Scrape website and extract resources
 * @access  Public
 */
router.post('/scrape', rateLimiter, validateScrapeRequest, async (req, res, next) => {
  try {
    const { url, options = {} } = req.body;
    
    console.log(`Starting scrape for: ${url}`);
    
    const result = await scrapeWebsite(url, options);
    
    console.log(`Scraped ${result.count} resources from ${url}`);
    
    res.json(result);
    
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/scrape-debug
 * @desc    Scrape website with detailed debugging information
 * @access  Public
 */
router.post('/scrape-debug', rateLimiter, validateScrapeRequest, async (req, res, next) => {
  try {
    const { url, options = {} } = req.body;
    
    console.log(`Starting debug scrape for: ${url}`);
    
    const startTime = Date.now();
    const result = await scrapeWebsite(url, options);
    const endTime = Date.now();
    
    // Analyze resources
    const resourceTypes = {};
    const resourceSizes = [];
    const domains = new Set();
    
    result.resources.forEach(resource => {
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
    });
    
    const analysis = {
      totalResources: result.count,
      uniqueDomains: domains.size,
      resourceTypes,
      totalSize: resourceSizes.reduce((sum, size) => sum + size, 0),
      sizeStats: {
        average: resourceSizes.length > 0 ? resourceSizes.reduce((sum, size) => sum + size, 0) / resourceSizes.length : 0,
        min: resourceSizes.length > 0 ? Math.min(...resourceSizes) : 0,
        max: resourceSizes.length > 0 ? Math.max(...resourceSizes) : 0
      },
      scrapeTime: endTime - startTime,
      domains: Array.from(domains)
    };
    
    res.json({
      ...result,
      debug: analysis
    });
    
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/download
 * @desc    Create ZIP file from resources
 * @access  Public
 */
router.post('/download', rateLimiter, validateDownloadRequest, async (req, res, next) => {
  try {
    const { resources, options = {} } = req.body;
    
    console.log(`Creating ZIP with ${resources.length} resources`);
    
    const zipBuffer = await zipService.createZipFile(resources, options);
    const filename = zipService.generateFilename(resources);
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', zipBuffer.length);
    
    res.send(zipBuffer);
    
  } catch (error) {
    next(error);
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
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/status
 * @desc    Get detailed service status
 * @access  Public
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/test-scrape/:domain
 * @desc    Test scraping with a simple domain
 * @access  Public
 */
router.get('/test-scrape/:domain', async (req, res, next) => {
  try {
    const { domain } = req.params;
    const testUrl = `https://${domain}`;
    
    console.log(`Testing scrape with: ${testUrl}`);
    
    const result = await scrapeWebsite(testUrl, {});
    
    res.json({
      success: true,
      testUrl,
      result
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router; 