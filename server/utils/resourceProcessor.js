const { URL } = require('url');

/**
 * Resolves URL to file path for saving
 * @param {string} cUrl - The URL to resolve
 * @param {string} cType - Content type
 * @param {string} cContent - Content
 * @returns {Object} Object with path, name, and dataURI properties
 */
const resolveURLToPath = (cUrl, cType, cContent) => {
  let filepath, filename, isDataURI;
  let foundIndex = cUrl.search(/:\/\//);
  
  // Check if it's a data URI
  if (foundIndex === -1 || foundIndex >= 10) {
    isDataURI = true;
    if (cUrl.indexOf('data:') === 0) {
      let dataURIInfo = cUrl
        .split(';')[0]
        .split(',')[0]
        .substring(0, 30)
        .replace(/[^A-Za-z0-9]/g, '.');
      filename = dataURIInfo + '.' + Math.random().toString(16).substring(2) + '.txt';
    } else {
      filename = 'data.' + Math.random().toString(16).substring(2) + '.txt';
    }
    filepath = '_DataURI/' + filename;
  } else {
    isDataURI = false;
    
    // Handle relative URLs
    if (cUrl.startsWith('//')) {
      cUrl = 'https:' + cUrl;
    } else if (cUrl.startsWith('/')) {
      // This is a relative URL, we need a base URL to resolve it
      // For now, we'll treat it as absolute
      cUrl = 'https://example.com' + cUrl;
    }
    
    if (cUrl.split('://')[0].includes('http')) {
      filepath = cUrl.split('://')[1].split('?')[0];
    } else {
      filepath = cUrl.replace('://', '---').split('?')[0];
    }
    
    // Handle root path
    if (filepath.charAt(filepath.length - 1) === '/') {
      filepath = filepath + 'index.html';
    }
    
    filename = filepath.substring(filepath.lastIndexOf('/') + 1);
  }

  // Remove query string and hash
  filename = filename.split(';')[0].split('#')[0];
  filepath = filepath.substring(0, filepath.lastIndexOf('/') + 1) + filename;

  const noExtension = filename.search(/\./) === -1;
  if (noExtension) {
    let haveExtension = null;
    if (cType && cContent) {
      // Handle images
      if (cType.indexOf('image') !== -1) {
        if (cContent.charAt(0) === '/') {
          filepath = filepath + '.jpg';
          haveExtension = 'jpg';
        } else if (cContent.charAt(0) === 'R') {
          filepath = filepath + '.gif';
          haveExtension = 'gif';
        } else if (cContent.charAt(0) === 'i') {
          filepath = filepath + '.png';
          haveExtension = 'png';
        } else if (cContent.charAt(0) === 'U') {
          filepath = filepath + '.webp';
          haveExtension = 'webp';
        } else if (cContent.charAt(0) === 'P') {
          filepath = filepath + '.png';
          haveExtension = 'png';
        } else {
          filepath = filepath + '.jpg';
          haveExtension = 'jpg';
        }
      }
      // Handle stylesheets
      else if (cType.indexOf('stylesheet') !== -1 || cType.indexOf('css') !== -1) {
        filepath = filepath + '.css';
        haveExtension = 'css';
      }
      // Handle JSON
      else if (cType.indexOf('json') !== -1) {
        filepath = filepath + '.json';
        haveExtension = 'json';
      }
      // Handle JavaScript
      else if (cType.indexOf('javascript') !== -1 || cType.indexOf('js') !== -1) {
        filepath = filepath + '.js';
        haveExtension = 'js';
      }
      // Handle HTML
      else if (cType.indexOf('html') !== -1 || cType.indexOf('xml') !== -1) {
        filepath = filepath + '.html';
        haveExtension = 'html';
      }
      // Handle fonts
      else if (cType.indexOf('font') !== -1 || cType.indexOf('woff') !== -1 || cType.indexOf('ttf') !== -1) {
        if (cType.indexOf('woff2') !== -1) {
          filepath = filepath + '.woff2';
          haveExtension = 'woff2';
        } else if (cType.indexOf('woff') !== -1) {
          filepath = filepath + '.woff';
          haveExtension = 'woff';
        } else if (cType.indexOf('ttf') !== -1) {
          filepath = filepath + '.ttf';
          haveExtension = 'ttf';
        } else if (cType.indexOf('otf') !== -1) {
          filepath = filepath + '.otf';
          haveExtension = 'otf';
        } else {
          filepath = filepath + '.font';
          haveExtension = 'font';
        }
      }
      // Handle SVG
      else if (cType.indexOf('svg') !== -1) {
        filepath = filepath + '.svg';
        haveExtension = 'svg';
      }

      if (!haveExtension) {
        filepath = filepath + '.html';
        haveExtension = 'html';
      }
    } else {
      // Add default html for text document
      filepath = filepath + '.html';
      haveExtension = 'html';
    }
    filename = filename + '.' + haveExtension;
  }

  // Clean path - remove invalid characters
  filepath = filepath
    .replace(/:|\\|=|\*|\.$|"|'|\?|~|\||<|>/g, '')
    .replace(/\/\//g, '/')
    .replace(/(\s|\.)\//g, '/')
    .replace(/\/(\s|\.)/g, '/')
    .replace(/[^\x00-\x7F]/g, '_'); // Remove non-ASCII characters

  filename = filename
    .replace(/:|\\|=|\*|\.$|"|'|\?|~|\||<|>/g, '')
    .replace(/[^\x00-\x7F]/g, '_'); // Remove non-ASCII characters

  // Decode URI
  if (filepath.indexOf('%') !== -1) {
    try {
      filepath = decodeURIComponent(filepath);
      filename = decodeURIComponent(filename);
    } catch (err) {
      console.log('Error decoding URI:', err);
    }
  }

  // Strip double slashes
  while (filepath.includes('//')) {
    filepath = filepath.replace('//', '/');
  }

  // Strip the first slash '/src/...' -> 'src/...'
  if (filepath.charAt(0) === '/') {
    filepath = filepath.slice(1);
  }

  // Ensure we have a valid filename
  if (!filename || filename.length === 0) {
    filename = 'index.html';
    filepath = filepath + filename;
  }

  return {
    path: filepath,
    name: filename,
    dataURI: isDataURI && cUrl,
  };
};

/**
 * Resolves duplicate resources by path
 * @param {Array} resourceList - Array of resources
 * @returns {Array} Deduplicated resources
 */
const resolveDuplicatedResources = (resourceList = []) => {
  const resolvedListByKey = {};
  const result = [];
  const resourceListUniqByUrl = Object.values(
    resourceList.reduce(
      (list, res) => ({
        ...list,
        ...(!list[res.url] || !list[res.url].content || res.content
          ? {
              [res.url]: res,
            }
          : {}),
      }),
      {}
    )
  );
  
  resourceListUniqByUrl
    .filter((r) => r && r.saveAs && r.saveAs.path && r.saveAs.name)
    .sort((rA, rB) => rA.saveAs.path.localeCompare(rB.saveAs.path))
    .forEach((r) => {
      resolvedListByKey[r.saveAs.path] = (resolvedListByKey[r.saveAs.path] || []).concat([r]);
    });
    
  Object.values(resolvedListByKey).forEach((rGroup) => {
    result.push(
      ...(rGroup.length < 2
        ? rGroup
        : rGroup.map((r, rIndex) =>
            rIndex === 0
              ? r
              : {
                  ...r,
                  saveAs: {
                    ...r.saveAs,
                    name: r.saveAs.name.replace(/(\.)(?!.*\.)/g, ` (${rIndex}).`),
                    path: r.saveAs.path.replace(/(\.)(?!.*\.)/g, ` (${rIndex}).`),
                  },
                }
          ))
    );
  });
  return result;
};

/**
 * Beautifies content based on file type
 * @param {string} content - Content to beautify
 * @param {string} fileType - File type extension
 * @returns {string} Beautified content
 */
const beautifyContent = (content, fileType) => {
  if (!content || typeof content !== 'string') return content;
  
  try {
    const prettier = require('prettier');
    switch (fileType) {
      case 'js':
        return prettier.format(content, { parser: 'babel' });
      case 'json':
        return prettier.format(content, { parser: 'json' });
      case 'html':
        return prettier.format(content, { parser: 'html' });
      case 'css':
        return prettier.format(content, { parser: 'css' });
      case 'xml':
        return prettier.format(content, { parser: 'xml' });
      default:
        return content;
    }
  } catch (err) {
    console.log('Beautify error:', err);
    return content;
  }
};

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extracts domain from URL
 * @param {string} url - URL to extract domain from
 * @returns {string} Domain name
 */
const extractDomain = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
};

/**
 * Normalizes URL (resolves relative URLs)
 * @param {string} url - URL to normalize
 * @param {string} baseUrl - Base URL for resolving relative URLs
 * @returns {string} Normalized URL
 */
const normalizeUrl = (url, baseUrl) => {
  try {
    if (url.startsWith('//')) {
      return 'https:' + url;
    } else if (url.startsWith('/')) {
      const base = new URL(baseUrl);
      return base.origin + url;
    } else if (!url.startsWith('http')) {
      const base = new URL(baseUrl);
      return new URL(url, base).href;
    }
    return url;
  } catch {
    return url;
  }
};

/**
 * Gets file extension from URL or content type
 * @param {string} url - URL
 * @param {string} contentType - Content type
 * @returns {string} File extension
 */
const getFileExtension = (url, contentType) => {
  // Try to get extension from URL first
  const urlMatch = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
  if (urlMatch) {
    return urlMatch[1].toLowerCase();
  }
  
  // Try to get extension from content type
  if (contentType) {
    if (contentType.includes('javascript')) return 'js';
    if (contentType.includes('css')) return 'css';
    if (contentType.includes('html')) return 'html';
    if (contentType.includes('json')) return 'json';
    if (contentType.includes('xml')) return 'xml';
    if (contentType.includes('svg')) return 'svg';
    if (contentType.includes('png')) return 'png';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg';
    if (contentType.includes('gif')) return 'gif';
    if (contentType.includes('webp')) return 'webp';
    if (contentType.includes('woff2')) return 'woff2';
    if (contentType.includes('woff')) return 'woff';
    if (contentType.includes('ttf')) return 'ttf';
    if (contentType.includes('otf')) return 'otf';
  }
  
  return 'html'; // Default
};

module.exports = {
  resolveURLToPath,
  resolveDuplicatedResources,
  beautifyContent,
  isValidUrl,
  extractDomain,
  normalizeUrl,
  getFileExtension
}; 