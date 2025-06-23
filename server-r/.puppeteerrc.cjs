const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: process.env.RENDER
    ? '/opt/render/.cache/puppeteer'
    : join(__dirname, '.cache', 'puppeteer'),
}; 