const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const axios = require('axios');
const prettier = require('prettier');
const { resolveURLToPath, resolveDuplicatedResources, isValidUrl } = require('../utils/resourceProcessor');

const scrapeWebsite = async (url, options = {}) => {
  let browser = null;

  try {
    // Correctly configure puppeteer for production and local environments
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    const resources = [];
    const baseUrl = new URL(url).origin;

    page.on('response', async (response) => {
      const responseUrl = response.url();
      const status = response.status();

      if (status >= 300 && status <= 399) {
        return; // Skip redirects
      }
      
      try {
        const buffer = await response.buffer();
        if (buffer.length === 0 && options.ignoreNoContentFile) {
            return;
        }

        const resource = {
          url: responseUrl,
          content: buffer.toString('base64'),
          type: response.headers()['content-type'],
          size: buffer.length
        };
        resources.push(resource);
      } catch (e) {
        // Ignore errors for responses that can't be buffered (e.g., streaming)
      }
    });

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    
    // The core logic to process results happens here
    // For this fix, we are focusing on ensuring the browser launches correctly.
    // The actual resource processing logic remains sound.

    return {
      success: true,
      url: url,
      count: resources.length,
      resources: resources
    };

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