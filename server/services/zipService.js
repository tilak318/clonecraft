const JSZip = require('jszip');
const { beautifyContent, extractDomain } = require('../utils/resourceProcessor');

class ZipService {
  /**
   * Create ZIP file from resources
   * @param {Array} resources - Array of resources to include in ZIP
   * @param {Object} options - Options for ZIP creation
   * @returns {Promise<Buffer>} ZIP file as buffer
   */
  async createZipFile(resources, options = {}) {
    if (!resources || !Array.isArray(resources)) {
      throw new Error('Resources array is required');
    }

    console.log(`Creating ZIP with ${resources.length} resources`);
    
    const zip = new JSZip();
    
    for (const resource of resources) {
      try {
        let content = resource.content;
        
        // Beautify if requested
        if (options.beautifyFile && content && typeof content === 'string') {
          const fileExt = resource.saveAs.name.match(/\.([0-9a-z]+)(?:[\?#]|$)/);
          if (fileExt) {
            content = beautifyContent(content, fileExt[1]);
          }
        }
        
        // Skip if no content and ignoreNoContentFile is true
        if (!content && options.ignoreNoContentFile) {
          console.log(`Skipping ${resource.url} - no content`);
          continue;
        }
        
        // Add to zip
        if (content) {
          zip.file(resource.saveAs.path, content);
          console.log(`Added to ZIP: ${resource.saveAs.path}`);
        }
        
      } catch (err) {
        console.log(`Error adding ${resource.url} to ZIP:`, err);
      }
    }
    
    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });
    
    return zipBuffer;
  }

  /**
   * Generate filename for ZIP based on domain
   * @param {Array} resources - Resources array
   * @returns {string} Filename
   */
  generateFilename(resources) {
    if (!resources || resources.length === 0) {
      return 'website.zip';
    }
    
    const hostname = extractDomain(resources[0].url);
    const filename = hostname ? hostname.replace(/([^A-Za-z0-9.])/g, '_') : 'website';
    return `${filename}.zip`;
  }

  /**
   * Get ZIP file info
   * @param {Buffer} zipBuffer - ZIP file buffer
   * @returns {Promise<Object>} ZIP file information
   */
  async getZipInfo(zipBuffer) {
    try {
      const zip = new JSZip();
      const zipData = await zip.loadAsync(zipBuffer);
      
      const files = [];
      zipData.forEach((relativePath, zipEntry) => {
        files.push({
          name: zipEntry.name,
          size: zipEntry._data.uncompressedSize,
          compressedSize: zipEntry._data.compressedSize,
          isDirectory: zipEntry.dir
        });
      });
      
      return {
        fileCount: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        compressedSize: zipBuffer.length,
        files: files
      };
    } catch (error) {
      throw new Error(`Failed to get ZIP info: ${error.message}`);
    }
  }

  /**
   * Validate resources before creating ZIP
   * @param {Array} resources - Resources to validate
   * @returns {Object} Validation result
   */
  validateResources(resources) {
    if (!resources || !Array.isArray(resources)) {
      return { valid: false, error: 'Resources must be an array' };
    }

    if (resources.length === 0) {
      return { valid: false, error: 'Resources array is empty' };
    }

    const invalidResources = resources.filter(resource => {
      return !resource.url || !resource.saveAs || !resource.saveAs.path;
    });

    if (invalidResources.length > 0) {
      return { 
        valid: false, 
        error: `${invalidResources.length} resources have invalid structure` 
      };
    }

    return { valid: true };
  }

  /**
   * Create ZIP with progress callback
   * @param {Array} resources - Resources array
   * @param {Object} options - Options
   * @param {Function} progressCallback - Progress callback function
   * @returns {Promise<Buffer>} ZIP buffer
   */
  async createZipWithProgress(resources, options = {}, progressCallback = null) {
    const validation = this.validateResources(resources);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const zip = new JSZip();
    let processedCount = 0;
    
    for (const resource of resources) {
      try {
        let content = resource.content;
        
        // Beautify if requested
        if (options.beautifyFile && content && typeof content === 'string') {
          const fileExt = resource.saveAs.name.match(/\.([0-9a-z]+)(?:[\?#]|$)/);
          if (fileExt) {
            content = beautifyContent(content, fileExt[1]);
          }
        }
        
        // Skip if no content and ignoreNoContentFile is true
        if (!content && options.ignoreNoContentFile) {
          processedCount++;
          if (progressCallback) {
            progressCallback(resource, processedCount, resources.length);
          }
          continue;
        }
        
        // Add to zip
        if (content) {
          zip.file(resource.saveAs.path, content);
        }
        
        processedCount++;
        if (progressCallback) {
          progressCallback(resource, processedCount, resources.length);
        }
        
      } catch (err) {
        console.log(`Error adding ${resource.url} to ZIP:`, err);
        processedCount++;
        if (progressCallback) {
          progressCallback(resource, processedCount, resources.length);
        }
      }
    }
    
    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });
    
    return zipBuffer;
  }
}

module.exports = new ZipService(); 