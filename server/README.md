# Server Documentation

This directory contains the Node.js/Express backend for the Resources Saver website.

## Directory Structure

```
server/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── errorHandler.js      # Error handling middleware
│   └── validation.js        # Request validation middleware
├── routes/
│   └── api.js              # API route definitions
├── services/
│   ├── scraperService.js    # Web scraping service
│   └── zipService.js        # ZIP file creation service
├── utils/
│   └── resourceProcessor.js # Resource processing utilities
├── index.js                 # Main server file
└── README.md               # This file
```

## Architecture Overview

### Services Layer
- **ScraperService**: Handles web scraping using Puppeteer
- **ZipService**: Manages ZIP file creation and processing

### Middleware Layer
- **Error Handling**: Centralized error handling and logging
- **Validation**: Request validation and rate limiting
- **Security**: CORS, Helmet, and other security measures

### Routes Layer
- **API Routes**: RESTful API endpoints for scraping and downloading

### Utils Layer
- **Resource Processing**: URL to file path conversion, deduplication, beautification

## API Endpoints

### POST /api/scrape
Scrapes a website and returns all resources.

**Request:**
```json
{
  "url": "https://example.com",
  "options": {
    "ignoreNoContentFile": true,
    "beautifyFile": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "resources": [...],
  "count": 150,
  "url": "https://example.com"
}
```

### POST /api/download
Creates and returns a ZIP file with all resources.

**Request:**
```json
{
  "resources": [...],
  "options": {
    "ignoreNoContentFile": true,
    "beautifyFile": true
  }
}
```

**Response:** ZIP file (blob)

### GET /api/health
Health check endpoint.

### GET /api/status
Detailed service status.

## Services

### ScraperService
- **scrapeWebsite(url, options)**: Main scraping function
- **initializeBrowser()**: Initialize Puppeteer browser
- **closeBrowser()**: Close browser instance
- **getStatus()**: Get service status

### ZipService
- **createZipFile(resources, options)**: Create ZIP from resources
- **generateFilename(resources)**: Generate filename based on domain
- **getZipInfo(zipBuffer)**: Get ZIP file information
- **validateResources(resources)**: Validate resource structure

## Middleware

### Error Handling
- **errorLogger**: Logs errors with context
- **errorHandler**: Handles errors and sends appropriate responses
- **notFoundHandler**: Handles 404 errors
- **validationErrorHandler**: Handles validation errors

### Validation
- **validateScrapeRequest**: Validates scrape requests
- **validateDownloadRequest**: Validates download requests
- **rateLimiter**: Basic rate limiting (10 requests per 15 minutes)

## Configuration

### Environment Variables
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

### Database Configuration
Currently using in-memory storage, but can be extended to use:
- MongoDB
- PostgreSQL
- Redis (for caching)

## Error Handling

The server implements comprehensive error handling:

1. **Validation Errors**: 400 Bad Request
2. **Rate Limiting**: 429 Too Many Requests
3. **Not Found**: 404 Not Found
4. **Server Errors**: 500 Internal Server Error

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Basic request limiting
- **Input Validation**: Request validation
- **Error Sanitization**: Hide sensitive info in production

## Performance Features

- **Compression**: Gzip compression
- **Caching**: Basic in-memory caching
- **Graceful Shutdown**: Proper cleanup on shutdown
- **Request Logging**: Request/response logging

## Development

### Running in Development
```bash
npm run dev
```

### Running in Production
```bash
npm start
```

### Testing
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test scraping
curl -X POST http://localhost:5000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## Monitoring

### Health Checks
- `/health`: Basic health check
- `/api/status`: Detailed service status

### Logging
- Request/response logging
- Error logging with stack traces
- Service status logging

## Future Enhancements

1. **Database Integration**: Add persistent storage
2. **Caching**: Redis for better performance
3. **Authentication**: User authentication system
4. **Job Queue**: Background job processing
5. **Metrics**: Application metrics and monitoring
6. **WebSocket**: Real-time progress updates 