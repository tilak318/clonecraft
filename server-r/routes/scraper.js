const express = require('express');
const router = express.Router();
const scraperService = require('../services/scraperService');

// Scrape a single page
router.post('/scrape', async (req, res) => {
  try {
    const { url, options = {} } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const scrapedPage = await scraperService.scrapePage(url, options);
    const jobId = scraperService.generateJobId();
    const job = {
      status: 'completed',
      progress: 100,
      totalPages: 1,
      completedPages: 1,
      pages: [scrapedPage],
      assets: [],
      errors: [],
    };
    scraperService.jobs.set(jobId, job);

    res.json({ jobId });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clone entire website
router.post('/clone', async (req, res) => {
  try {
    const { url, maxPages = 10, includeAssets = true } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const result = await scraperService.cloneWebsite(url, { maxPages, includeAssets });
    res.json(result);
  } catch (error) {
    console.error('Cloning error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get scraping progress
router.get('/progress/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const progress = await scraperService.getProgress(jobId);
    res.json(progress);
  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download scraped content as ZIP
router.get('/download/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const zipPath = await scraperService.createZipDownload(jobId);
    
    res.download(zipPath, `scraped-website-${jobId}.zip`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up the zip file after download
      scraperService.cleanupZip(zipPath);
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 