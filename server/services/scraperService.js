const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const axios = require('axios');
const prettier = require('prettier');
const { resolveURLToPath, resolveDuplicatedResources, isValidUrl } = require('../utils/resourceProcessor');

async function getBrowserInstance() {
  const executablePath = await chromium.executablePath();

  if (!executablePath) {
    // This is for local development
    const puppeteer = require('puppeteer');
    return await puppeteer.launch({ headless: true });
  }

  return await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
}

const scrapeWebsite = async (url, options = {}) => {
  let browser;
  try {
    browser = await getBrowserInstance();
    const page = await browser.newPage();
    
    try {
      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Set extra headers
      await page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      });

      // Enable request interception
      await page.setRequestInterception(true);
      
      const resources = [];
      const baseUrl = new URL(url);
      
      // Handle requests
      page.on('request', request => {
        const requestUrl = request.url();
        
        // Skip certain types of requests
        if (shouldSkipRequest(requestUrl)) {
          request.abort();
          return;
        }
        
        request.continue();
      });
      
      // Handle responses
      page.on('response', async response => {
        const responseUrl = response.url();
        const contentType = response.headers()['content-type'] || '';
        
        // Skip certain content types
        if (shouldSkipResponse(responseUrl, contentType, url)) {
          return;
        }
        
        try {
          await processResponse(response, resources);
        } catch (err) {
          console.log(`Error processing response for ${responseUrl}:`, err);
        }
      });

      // Wait for page to load
      console.log(`Navigating to: ${url}`);
      await page.goto(url, { 
        waitUntil: ['domcontentloaded', 'networkidle2'],
        timeout: 60000 
      });

      // Wait for any delayed resources and JavaScript execution
      console.log('Waiting for page to fully load...');
      await page.waitForTimeout(5000);

      // Try to wait for any lazy-loaded content
      try {
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
        console.log('Error during scroll: ', err);
      }

      // Wait a bit more for any final resources
      await page.waitForTimeout(3000);

      // Also capture static resources from the page
      await captureStaticResources(page, resources, baseUrl);
      
      // Process and deduplicate resources
      const processedResources = resolveDuplicatedResources(resources);
      
      console.log(`Scraped ${processedResources.length} resources from ${url}`);
      
      return {
        success: true,
        resources: processedResources,
        count: processedResources.length,
        url: url
      };
      
    } catch (error) {
      console.error('Scraping error:', error);
      throw new Error(`Failed to scrape website: ${error.message}`);
    } finally {
      await page.close();
    }
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    throw new Error(`Failed to scrape ${url}. The website may be down or blocking scrapers.`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Capture static resources from the page
 * @param {Object} page - Puppeteer page object
 * @param {Array} resources - Resources array to populate
 * @param {URL} baseUrl - Base URL of the page
 */
async function captureStaticResources(page, resources, baseUrl) {
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
function shouldSkipRequest(requestUrl) {
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
function shouldSkipResponse(responseUrl, contentType, originalUrl) {
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
async function processResponse(response, resources) {
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

module.exports = { scrapeWebsite }; 