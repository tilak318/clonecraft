const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const cheerio = require('cheerio');
const axios = require('axios');
const archiver = require('archiver');
const fs = require('fs-extra');
const path = require('path');
const { URL } = require('url');

class ScraperService {
  constructor() {
    this.jobs = new Map();
    this.downloadsDir = path.join(__dirname, '../downloads');
    fs.ensureDirSync(this.downloadsDir);
  }

  async scrapePage(url, options = {}) {
    let browser = null;

    try {
      if (process.env.RENDER) {
        // Production environment on Render
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
        });
      } else {
        // Local development environment
        browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        });
      }

      const page = await browser.newPage();
      
      // Set user agent to avoid being blocked
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get the HTML content
      const html = await page.content();
      
      // Parse with Cheerio
      const $ = cheerio.load(html);
      
      // Extract basic information
      const title = $('title').text() || 'No title';
      const description = $('meta[name="description"]').attr('content') || '';
      
      // Extract all links
      const links = [];
      $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        if (href && !href.startsWith('#')) {
          links.push({
            text: $(el).text().trim(),
            href: href,
            absolute: this.resolveUrl(url, href)
          });
        }
      });
      
      // Extract images
      const images = [];
      $('img[src]').each((i, el) => {
        const src = $(el).attr('src');
        if (src) {
          images.push({
            alt: $(el).attr('alt') || '',
            src: src,
            absolute: this.resolveUrl(url, src)
          });
        }
      });
      
      // Extract CSS files
      const cssFiles = [];
      $('link[rel="stylesheet"]').each((i, el) => {
        const href = $(el).attr('href');
        if (href) {
          cssFiles.push({
            href: href,
            absolute: this.resolveUrl(url, href)
          });
        }
      });
      
      // Extract JavaScript files
      const jsFiles = [];
      $('script[src]').each((i, el) => {
        const src = $(el).attr('src');
        if (src) {
          jsFiles.push({
            src: src,
            absolute: this.resolveUrl(url, src)
          });
        }
      });

      return {
        url,
        title,
        description,
        html,
        links,
        images,
        cssFiles,
        jsFiles,
        timestamp: new Date().toISOString()
      };
      
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async cloneWebsite(baseUrl, options = {}) {
    const { maxPages = 10, includeAssets = true } = options;
    const jobId = this.generateJobId();
    
    // Initialize job
    this.jobs.set(jobId, {
      status: 'running',
      progress: 0,
      totalPages: 0,
      completedPages: 0,
      pages: [],
      assets: [],
      errors: []
    });

    try {
      const baseUrlObj = new URL(baseUrl);
      const visitedUrls = new Set();
      const pagesToVisit = [baseUrl];
      const scrapedPages = [];
      const assets = [];

      while (pagesToVisit.length > 0 && scrapedPages.length < maxPages) {
        const currentUrl = pagesToVisit.shift();
        
        if (visitedUrls.has(currentUrl)) continue;
        visitedUrls.add(currentUrl);

        try {
          // Update progress
          const job = this.jobs.get(jobId);
          job.completedPages++;
          job.progress = Math.round((job.completedPages / maxPages) * 100);

          // Scrape the page
          const scrapedPage = await this.scrapePage(currentUrl);
          scrapedPages.push(scrapedPage);

          // Add new links to visit (only from same domain)
          scrapedPage.links.forEach(link => {
            if (link.absolute && 
                new URL(link.absolute).hostname === baseUrlObj.hostname &&
                !visitedUrls.has(link.absolute) &&
                pagesToVisit.length < maxPages) {
              pagesToVisit.push(link.absolute);
            }
          });

          // Collect assets if requested
          if (includeAssets) {
            const pageAssets = [
              ...scrapedPage.images.map(img => img.absolute),
              ...scrapedPage.cssFiles.map(css => css.absolute),
              ...scrapedPage.jsFiles.map(js => js.absolute)
            ].filter(Boolean);

            for (const assetUrl of pageAssets) {
              if (!assets.includes(assetUrl)) {
                assets.push(assetUrl);
              }
            }
          }

        } catch (error) {
          const job = this.jobs.get(jobId);
          job.errors.push({ url: currentUrl, error: error.message });
        }
      }

      // Download assets
      const downloadedAssets = [];
      if (includeAssets) {
        for (const assetUrl of assets) {
          try {
            const asset = await this.downloadAsset(assetUrl, jobId);
            if (asset) {
              downloadedAssets.push(asset);
            }
          } catch (error) {
            console.error(`Failed to download asset: ${assetUrl}`, error);
          }
        }
      }

      // Update job status
      const job = this.jobs.get(jobId);
      job.status = 'completed';
      job.pages = scrapedPages;
      job.assets = downloadedAssets;
      job.progress = 100;

      return {
        jobId,
        baseUrl,
        pages: scrapedPages,
        assets: downloadedAssets,
        totalPages: scrapedPages.length,
        totalAssets: downloadedAssets.length
      };

    } catch (error) {
      const job = this.jobs.get(jobId);
      job.status = 'failed';
      job.error = error.message;
      throw error;
    }
  }

  async downloadAsset(url, jobId) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const urlObj = new URL(url);
      const fileName = path.basename(urlObj.pathname) || 'index.html';
      const filePath = path.join(this.downloadsDir, jobId, 'assets', fileName);
      
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, response.data);

      return {
        url,
        fileName,
        filePath,
        size: response.data.length,
        contentType: response.headers['content-type']
      };
    } catch (error) {
      console.error(`Failed to download asset: ${url}`, error);
      return null;
    }
  }

  async createZipDownload(jobId) {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'completed') {
      throw new Error('Job not found or not completed');
    }

    const zipPath = path.join(this.downloadsDir, `${jobId}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', () => resolve(zipPath));
      archive.on('error', reject);
      archive.pipe(output);

      // Add pages
      job.pages.forEach((page, index) => {
        const fileName = index === 0 ? 'index.html' : `page-${index}.html`;
        archive.append(page.html, { name: fileName });
      });

      // Add assets
      job.assets.forEach(asset => {
        archive.file(asset.filePath, { name: `assets/${asset.fileName}` });
      });

      // Add metadata
      const metadata = {
        jobId,
        baseUrl: job.pages[0]?.url,
        totalPages: job.pages.length,
        totalAssets: job.assets.length,
        timestamp: new Date().toISOString()
      };
      archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });

      archive.finalize();
    });
  }

  async cleanupZip(zipPath) {
    try {
      await fs.remove(zipPath);
    } catch (error) {
      console.error('Failed to cleanup zip file:', error);
    }
  }

  getProgress(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    return job;
  }

  resolveUrl(baseUrl, relativeUrl) {
    try {
      return new URL(relativeUrl, baseUrl).href;
    } catch {
      return null;
    }
  }

  generateJobId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = new ScraperService(); 