const axios = require('axios');
const cheerio = require('cheerio');
const { resolveURLToPath, resolveDuplicatedResources, isValidUrl } = require('../utils/resourceProcessor');

class FallbackScraperService {
  constructor() {
    this.isAvailable = true;
  }

  /**
   * Check if this service is available
   */
  async checkAvailability() {
    return this.isAvailable;
  }

  /**
   * Scrape website using HTTP requests instead of browser
   * @param {string} url - URL to scrape
   * @param {Object} options - Scraping options
   * @returns {Promise<Object>} Scraping result
   */
  async scrapeWebsite(url, options = {}) {
    console.log(`🌐 Starting fallback scrape for: ${url}`);
    console.log(`⚙️ Options:`, options);
    
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL provided');
    }

    const startTime = Date.now();
    const resources = {
      html: null,
      css: [],
      js: [],
      images: [],
      fonts: [],
      other: []
    };

    try {
      // Fetch the main HTML page
      console.log('📄 Fetching main HTML page...');
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      const html = response.data;
      const $ = cheerio.load(html);
      
      // Store the HTML
      resources.html = html;

      // Extract CSS files
      $('link[rel="stylesheet"]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href) {
          const resolvedUrl = resolveURLToPath(href, url);
          resources.css.push({
            url: resolvedUrl,
            originalUrl: href,
            type: 'css'
          });
        }
      });

      // Extract inline styles
      $('style').each((i, elem) => {
        const content = $(elem).html();
        if (content) {
          resources.css.push({
            url: `inline-style-${i}`,
            content: content,
            type: 'inline-css'
          });
        }
      });

      // Extract JavaScript files
      $('script[src]').each((i, elem) => {
        const src = $(elem).attr('src');
        if (src) {
          const resolvedUrl = resolveURLToPath(src, url);
          resources.js.push({
            url: resolvedUrl,
            originalUrl: src,
            type: 'js'
          });
        }
      });

      // Extract inline scripts
      $('script:not([src])').each((i, elem) => {
        const content = $(elem).html();
        if (content && content.trim()) {
          resources.js.push({
            url: `inline-script-${i}`,
            content: content,
            type: 'inline-js'
          });
        }
      });

      // Extract images
      $('img[src]').each((i, elem) => {
        const src = $(elem).attr('src');
        if (src) {
          const resolvedUrl = resolveURLToPath(src, url);
          resources.images.push({
            url: resolvedUrl,
            originalUrl: src,
            type: 'image'
          });
        }
      });

      // Extract fonts
      $('link[rel="preload"][as="font"]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href) {
          const resolvedUrl = resolveURLToPath(href, url);
          resources.fonts.push({
            url: resolvedUrl,
            originalUrl: href,
            type: 'font'
          });
        }
      });

      // Extract other resources (favicon, manifest, etc.)
      $('link[rel="icon"], link[rel="shortcut icon"], link[rel="manifest"]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href) {
          const resolvedUrl = resolveURLToPath(href, url);
          resources.other.push({
            url: resolvedUrl,
            originalUrl: href,
            type: 'other'
          });
        }
      });

      // Remove duplicates
      resources.css = resolveDuplicatedResources(resources.css);
      resources.js = resolveDuplicatedResources(resources.js);
      resources.images = resolveDuplicatedResources(resources.images);
      resources.fonts = resolveDuplicatedResources(resources.fonts);
      resources.other = resolveDuplicatedResources(resources.other);

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ Fallback scrape completed in ${duration}ms`);
      console.log(`📊 Resources found:`, {
        css: resources.css.length,
        js: resources.js.length,
        images: resources.images.length,
        fonts: resources.fonts.length,
        other: resources.other.length
      });

      return {
        success: true,
        url: url,
        resources: resources,
        duration: duration,
        timestamp: new Date().toISOString(),
        method: 'fallback-http'
      };

    } catch (error) {
      console.error('❌ Fallback scrape failed:', error.message);
      throw new Error(`Fallback scraping failed: ${error.message}`);
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      available: this.isAvailable,
      method: 'fallback-http',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = FallbackScraperService; 