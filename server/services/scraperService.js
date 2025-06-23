const puppeteer = require('puppeteer');
const { resolveURLToPath, resolveDuplicatedResources, isValidUrl } = require('../utils/resourceProcessor');

class ScraperService {
  constructor() {
    this.browser = null;
    this.isInitializing = false;
    this.lastError = null;
  }

  /**
   * Initialize browser instance with enhanced error handling
   */
  async initializeBrowser() {
    if (this.isInitializing) {
      console.log('Browser initialization already in progress...');
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.browser;
    }

    if (!this.browser) {
      this.isInitializing = true;
      try {
        console.log('🚀 Starting browser initialization...');
        console.log('📊 Environment:', process.env.NODE_ENV);
        console.log('💾 Available memory:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
        
        // Enhanced browser configuration for deployment
        const browserOptions = {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-field-trial-config',
            '--disable-ipc-flooding-protection',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images',
            '--disable-javascript',
            '--disable-css',
            '--disable-fonts',
            '--disable-default-apps',
            '--disable-sync',
            '--disable-translate',
            '--hide-scrollbars',
            '--mute-audio',
            '--no-default-browser-check',
            '--disable-component-extensions-with-background-pages',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-client-side-phishing-detection',
            '--disable-default-apps',
            '--disable-extensions',
            '--disable-hang-monitor',
            '--disable-prompt-on-repost',
            '--disable-sync',
            '--disable-web-resources',
            '--metrics-recording-only',
            '--no-first-run',
            '--safebrowsing-disable-auto-update',
            '--enable-automation',
            '--password-store=basic',
            '--use-mock-keychain'
          ],
          timeout: 60000,
          ignoreDefaultArgs: ['--disable-extensions'],
          executablePath: process.env.GOOGLE_CHROME_BIN || '/usr/bin/google-chrome'
        };

        console.log('🔧 Browser options configured');
        
        this.browser = await puppeteer.launch(browserOptions);
        
        // Test browser functionality
        const testPage = await this.browser.newPage();
        await testPage.goto('data:text/html,<html><body>Test</body></html>', { timeout: 10000 });
        await testPage.close();
        
        console.log('✅ Browser initialized successfully');
        this.lastError = null;
        
      } catch (error) {
        console.error('❌ Failed to initialize browser with primary configuration:', error.message);
        this.lastError = error;
        
        // Try alternative configurations
        const fallbackConfigs = [
          {
            name: 'Minimal configuration',
            options: {
              headless: true,
              args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
              timeout: 30000
            }
          },
          {
            name: 'No sandbox configuration',
            options: {
              headless: true,
              args: ['--no-sandbox', '--disable-setuid-sandbox'],
              timeout: 30000
            }
          },
          {
            name: 'Basic configuration',
            options: {
              headless: true,
              timeout: 30000
            }
          }
        ];

        for (const config of fallbackConfigs) {
          try {
            console.log(`🔄 Trying ${config.name}...`);
            this.browser = await puppeteer.launch(config.options);
            
            // Test the browser
            const testPage = await this.browser.newPage();
            await testPage.goto('data:text/html,<html><body>Test</body></html>', { timeout: 10000 });
            await testPage.close();
            
            console.log(`✅ Browser initialized with ${config.name}`);
            this.lastError = null;
            break;
            
          } catch (fallbackError) {
            console.error(`❌ ${config.name} failed:`, fallbackError.message);
            this.lastError = fallbackError;
          }
        }

        if (!this.browser) {
          const errorMsg = `Browser initialization failed after all attempts. Last error: ${this.lastError?.message}`;
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
      } finally {
        this.isInitializing = false;
      }
    }
    return this.browser;
  }

  /**
   * Close browser instance
   */
  async closeBrowser() {
    if (this.browser) {
      try {
        await this.browser.close();
        console.log('🔒 Browser closed successfully');
      } catch (error) {
        console.error('❌ Error closing browser:', error.message);
      }
      this.browser = null;
    }
  }

  /**
   * Scrape website and extract all resources with enhanced error handling
   * @param {string} url - URL to scrape
   * @param {Object} options - Scraping options
   * @returns {Promise<Object>} Scraping result
   */
  async scrapeWebsite(url, options = {}) {
    console.log(`🌐 Starting scrape for: ${url}`);
    console.log(`⚙️ Options:`, options);
    
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL provided');
    }

    let browser = null;
    let page = null;
    const startTime = Date.now();
    
    try {
      // Initialize browser with error handling
      browser = await this.initializeBrowser();
      console.log(`✅ Browser ready, creating new page...`);
      
      page = await browser.newPage();
      console.log(`✅ Page created successfully`);
      
      // Enhanced page configuration
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Set extra headers
      await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });

      console.log(`🔧 Page configured, enabling request interception...`);

      // Enable request interception with error handling
      await page.setRequestInterception(true);
      
      const resources = [];
      const baseUrl = new URL(url);
      let requestCount = 0;
      let responseCount = 0;
      let errorCount = 0;
      
      // Handle requests with detailed logging
      page.on('request', request => {
        requestCount++;
        const requestUrl = request.url();
        
        try {
          // Skip certain types of requests
          if (this.shouldSkipRequest(requestUrl)) {
            request.abort();
            return;
          }
          
          request.continue();
        } catch (error) {
          errorCount++;
          console.error(`❌ Request error for ${requestUrl}:`, error.message);
          request.abort();
        }
      });
      
      // Handle responses with detailed logging
      page.on('response', async response => {
        responseCount++;
        const responseUrl = response.url();
        const contentType = response.headers()['content-type'] || '';
        
        try {
          // Skip certain content types
          if (this.shouldSkipResponse(responseUrl, contentType, url)) {
            return;
          }
          
          await this.processResponse(response, resources);
        } catch (err) {
          errorCount++;
          console.error(`❌ Response processing error for ${responseUrl}:`, err.message);
        }
      });

      // Handle page errors
      page.on('error', error => {
        console.error(`❌ Page error:`, error.message);
        errorCount++;
      });

      page.on('pageerror', error => {
        console.error(`❌ Page JavaScript error:`, error.message);
        errorCount++;
      });

      // Navigate to the page with enhanced error handling
      console.log(`🚀 Navigating to: ${url}`);
      const navigationStart = Date.now();
      
      try {
        await page.goto(url, { 
          waitUntil: ['domcontentloaded', 'networkidle2'],
          timeout: 60000 
        });
        
        const navigationTime = Date.now() - navigationStart;
        console.log(`✅ Navigation completed in ${navigationTime}ms`);
        
      } catch (navigationError) {
        console.error(`❌ Navigation failed:`, navigationError.message);
        
        // Try with different wait conditions
        try {
          console.log(`🔄 Retrying navigation with different wait conditions...`);
          await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
          });
          console.log(`✅ Navigation completed with fallback method`);
        } catch (fallbackError) {
          throw new Error(`Navigation failed: ${navigationError.message}. Fallback also failed: ${fallbackError.message}`);
        }
      }

      // Wait for page to load with error handling
      console.log('⏳ Waiting for page to fully load...');
      try {
        await new Promise(r => setTimeout(r, 5000));
        
        // Try to wait for any lazy-loaded content
        await page.evaluate(() => {
          return new Promise((resolve) => {
            let lastHeight = document.body.scrollHeight;
            let scrollAttempts = 0;
            const maxScrollAttempts = 3;
            
            const scrollDown = () => {
              window.scrollTo(0, document.body.scrollHeight);
              setTimeout(() => {
                const newHeight = document.body.scrollHeight;
                if (newHeight > lastHeight && scrollAttempts < maxScrollAttempts) {
                  lastHeight = newHeight;
                  scrollAttempts++;
                  scrollDown();
                } else {
                  resolve();
                }
              }, 1000);
            };
            
            scrollDown();
          });
        });
      } catch (err) {
        console.log('⚠️ Error during scroll: ', err.message);
      }

      // Wait a bit more for any final resources
      await new Promise(r => setTimeout(r, 3000));

      // Capture static resources from the page
      console.log('📦 Capturing static resources...');
      await this.captureStaticResources(page, resources, baseUrl);
      
      // Process and deduplicate resources
      console.log('🔄 Processing and deduplicating resources...');
      const processedResources = resolveDuplicatedResources(resources);
      
      const totalTime = Date.now() - startTime;
      
      console.log(`✅ Scraping completed successfully!`);
      console.log(`📊 Statistics:`);
      console.log(`   - Total time: ${totalTime}ms`);
      console.log(`   - Requests processed: ${requestCount}`);
      console.log(`   - Responses processed: ${responseCount}`);
      console.log(`   - Errors encountered: ${errorCount}`);
      console.log(`   - Resources found: ${processedResources.length}`);
      
      return {
        success: true,
        resources: processedResources,
        count: processedResources.length,
        url: url,
        debug: {
          totalTime,
          requestCount,
          responseCount,
          errorCount,
          memoryUsage: process.memoryUsage(),
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error('❌ Scraping error:', error.message);
      console.error('📊 Error context:', {
        url,
        totalTime,
        memoryUsage: process.memoryUsage(),
        browserStatus: !!browser,
        pageStatus: !!page
      });
      
      throw new Error(`Failed to scrape website: ${error.message}. Time taken: ${totalTime}ms`);
      
    } finally {
      // Clean up
      if (page) {
        try {
          await page.close();
          console.log('🔒 Page closed');
        } catch (error) {
          console.error('❌ Error closing page:', error.message);
        }
      }
    }
  }

  /**
   * Capture static resources from the page
   * @param {Object} page - Puppeteer page object
   * @param {Array} resources - Resources array to populate
   * @param {URL} baseUrl - Base URL of the page
   */
  async captureStaticResources(page, resources, baseUrl) {
    try {
      const staticResources = await page.evaluate((baseUrl) => {
        const resources = [];
        
        // Get all images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          if (img.src) {
            resources.push({
              url: img.src,
              type: 'image',
              element: 'img'
            });
          }
        });

        // Get all stylesheets
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        stylesheets.forEach(link => {
          if (link.href) {
            resources.push({
              url: link.href,
              type: 'stylesheet',
              element: 'link'
            });
          }
        });

        // Get all scripts
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
          if (script.src) {
            resources.push({
              url: script.src,
              type: 'script',
              element: 'script'
            });
          }
        });

        // Get all fonts
        const fonts = document.querySelectorAll('link[rel="preload"][as="font"], link[rel="stylesheet"][href*="font"]');
        fonts.forEach(font => {
          if (font.href) {
            resources.push({
              url: font.href,
              type: 'font',
              element: 'link'
            });
          }
        });

        // Get inline styles that might contain URLs
        const styleElements = document.querySelectorAll('style');
        styleElements.forEach(style => {
          const content = style.textContent;
          const urlMatches = content.match(/url\(['"]?([^'"]+)['"]?\)/g);
          if (urlMatches) {
            urlMatches.forEach(match => {
              const url = match.replace(/url\(['"]?([^'"]+)['"]?\)/, '$1');
              if (url && !url.startsWith('data:')) {
                resources.push({
                  url: url,
                  type: 'inline-style-url',
                  element: 'style'
                });
              }
            });
          }
        });

        return resources;
      }, baseUrl);

      // Fetch static resources that weren't captured by network requests
      for (const resource of staticResources) {
        try {
          const response = await fetch(resource.url);
          if (response.ok) {
            const contentType = response.headers.get('content-type') || '';
            let content;
            
            if (contentType.includes('text/') || contentType.includes('application/json') || contentType.includes('application/javascript')) {
              content = await response.text();
            } else {
              const buffer = await response.arrayBuffer();
              content = Buffer.from(buffer).toString('base64');
            }
            
            const saveAs = resolveURLToPath(resource.url, contentType, content);
            
            // Check if this resource is already in the array
            const existingIndex = resources.findIndex(r => r.url === resource.url);
            if (existingIndex === -1) {
              resources.push({
                url: resource.url,
                type: contentType,
                content: content,
                saveAs: saveAs,
                source: 'STATIC',
                size: content.length,
                timestamp: new Date().toISOString()
              });
            }
          }
        } catch (err) {
          console.log(`Error fetching static resource ${resource.url}:`, err);
        }
      }
    } catch (err) {
      console.log('Error capturing static resources:', err);
    }
  }

  /**
   * Check if request should be skipped
   * @param {string} requestUrl - Request URL
   * @returns {boolean} True if should skip
   */
  shouldSkipRequest(requestUrl) {
    const skipPatterns = [
      'chrome-extension://',
      'moz-extension://',
      'data:',
      'blob:',
      'file:',
      'about:',
      'chrome:',
      'moz:',
      'safari-extension://',
      'ms-browser-extension://'
    ];
    
    return skipPatterns.some(pattern => requestUrl.includes(pattern));
  }

  /**
   * Check if response should be skipped
   * @param {string} responseUrl - Response URL
   * @param {string} contentType - Content type
   * @param {string} originalUrl - Original URL being scraped
   * @returns {boolean} True if should skip
   */
  shouldSkipResponse(responseUrl, contentType, originalUrl) {
    // Skip HTML responses that are not the main page
    if (contentType.includes('text/html') && responseUrl !== originalUrl) {
      return true;
    }
    
    // Skip certain content types
    const skipContentTypes = [
      'application/octet-stream',
      'application/x-shockwave-flash',
      'application/x-msdownload',
      'application/x-executable'
    ];
    
    return skipContentTypes.some(type => contentType.includes(type));
  }

  /**
   * Process response and extract resource
   * @param {Object} response - Puppeteer response object
   * @param {Array} resources - Resources array to populate
   */
  async processResponse(response, resources) {
    const responseUrl = response.url();
    const contentType = response.headers()['content-type'] || '';
    
    try {
      let content;
      const buffer = await response.buffer();
      
      if (contentType.includes('text/') || 
          contentType.includes('application/json') || 
          contentType.includes('application/javascript') ||
          contentType.includes('application/xml') ||
          contentType.includes('text/xml')) {
        content = buffer.toString('utf8');
      } else {
        content = buffer.toString('base64');
      }
      
      const saveAs = resolveURLToPath(responseUrl, contentType, content);
      
      resources.push({
        url: responseUrl,
        type: contentType,
        content: content,
        saveAs: saveAs,
        source: 'NETWORK',
        size: buffer.length,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.log(`Error processing response for ${responseUrl}:`, err);
    }
  }

  /**
   * Get browser status
   * @returns {Object} Browser status
   */
  getStatus() {
    return {
      browserOpen: !!this.browser,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new ScraperService(); 