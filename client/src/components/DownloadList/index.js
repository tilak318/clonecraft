import React, { useState, useReducer, useCallback } from 'react';
import styled from 'styled-components';
import Button from '../Button';
import { FaTrash, FaDownload, FaPlus, FaCog, FaInfoCircle, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { axiosConfig } from '../../config/api';
import useSimulatedProgress from '../../hooks/useSimulatedProgress';

const GlassPanel = styled.div`
  background: ${props => props.theme.backgroundColor};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: ${props => props.theme.borderRadius};
  border: 1px solid ${props => props.theme.borderColor};
  box-shadow: ${props => props.theme.boxShadow};
  overflow: hidden;
`;

const DownloadListContainer = styled(GlassPanel)`
  /* Inherits from GlassPanel */
`;

const Section = styled.div`
  padding: 25px;
  border-bottom: 1px solid ${props => props.theme.borderColor};

  &:last-child {
    border-bottom: none;
  }
`;

const DownloadListHeader = styled.h2`
  padding: 25px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.textColor};
  margin: 0;
`;

const UrlInputSection = styled(Section)``;

const UrlInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => props.theme.borderColor};
  border-radius: ${props => props.theme.borderRadius};
  font-size: 16px;
  transition: ${props => props.theme.transition};
  background: rgba(0, 0, 0, 0.2);
  color: ${props => props.theme.textColor};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.primaryColor};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
  align-items: center;
`;

const DownloadListItems = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const DownloadListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 25px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
  transition: ${props => props.theme.transition};
  
  &:hover {
    background-color: ${props => props.theme.lightColor};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => props.highlighted && `
    background-color: ${props.theme.primaryColor}10;
    border-left: 4px solid ${props.theme.primaryColor};
  `}
`;

const ItemUrl = styled.div`
  flex: 1;
  font-size: 16px;
  color: ${props => props.theme.textColor};
  word-break: break-all;
`;

const ItemInfo = styled.div`
  font-size: 12px;
  color: ${props => props.theme.secondaryColor};
  margin-top: 5px;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid ${props => props.theme.borderColor};
  border-top: 2px solid ${props => props.theme.primaryColor};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const OptionsSection = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${props => props.theme.borderColor};
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const OptionLabel = styled.label`
  font-size: 14px;
  color: ${props => props.theme.textColor};
  cursor: pointer;
`;

const Toggle = styled.input`
  width: 40px;
  height: 20px;
  appearance: none;
  background-color: ${props => props.theme.borderColor};
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: ${props => props.theme.transition};
  
  &:checked {
    background-color: ${props => props.theme.primaryColor};
  }
  
  &:before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: white;
    top: 2px;
    left: 2px;
    transition: ${props => props.theme.transition};
  }
  
  &:checked:before {
    transform: translateX(20px);
  }
`;

const Message = styled.div`
  padding: 15px 20px;
  border-radius: ${props => props.theme.borderRadius};
  margin: 20px 25px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid;
`;

const ErrorMessage = styled(Message)`
  background-color: rgba(255, 61, 113, 0.1);
  border-color: ${props => props.theme.dangerColor};
  color: ${props => props.theme.dangerColor};
`;

const SuccessMessage = styled(Message)`
  background-color: rgba(0, 230, 118, 0.1);
  border-color: ${props => props.theme.successColor};
  color: ${props => props.theme.successColor};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: ${props => props.theme.borderColor};
  border-radius: 2px;
  overflow: hidden;
  margin-top: 10px;
`;
  
const ProgressFill = styled.div`
  height: 100%;
  background-color: ${props => props.theme.primaryColor};
    width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const DebugInfo = styled(GlassPanel)`
  margin: 20px 25px;
  padding: 20px 25px;
`;

const DebugTitle = styled.h3`
  margin: 0 0 15px 0;
  color: ${props => props.theme.successColor};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DebugGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const DebugItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
`;

const DebugKey = styled.span`
  font-size: 12px;
  color: ${props => props.theme.secondaryColor};
`;

const DebugValue = styled.span`
  font-size: 12px;
  color: ${props => props.theme.textColor};
  font-weight: 600;
`;

const ScrapeReport = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: ${props => props.theme.borderRadius};
  border: 1px solid ${props => props.theme.borderColor};
`;

const ReportDetails = styled.div``;

const ReportActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const EmptyState = styled.div`
  padding: 40px 25px;
  text-align: center;
  color: ${props => props.theme.secondaryColor};
  font-style: italic;
`;

const DownloadList = () => {
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useSimulatedProgress(isDownloading);
  const [options, setOptions] = useState({
    ignoreNoContentFile: true,
    beautifyFile: true,
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const handleAddUrl = useCallback(async () => {
    if (!url.trim()) return;
    
    setIsScraping(true);
    setError('');
    setScrapeResult(null);
    
    try {
      console.log('🚀 Starting scrape request...');
      console.log('📍 URL:', url.trim());
      console.log('⚙️ Options:', options);
      console.log('🌐 API Base URL:', axiosConfig.baseURL);
      
      const response = await axios.post('/api/scrape-debug', {
        url: url.trim(),
        options
      }, axiosConfig);
      
      console.log('✅ Scrape response received:', response.data);
      
      if (response.data.success) {
        setScrapeResult({
          url: response.data.url,
          resources: response.data.resources,
          debug: response.data.debug,
          requestId: response.data.requestId,
          serverTime: response.data.serverTime
        });
        setUrl('');
      } else {
        throw new Error(response.data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('❌ Scraping error:', error);
      
      let errorMessage = 'Failed to scrape website. Please check the URL and try again.';
      let errorDetails = '';
      
      if (error.response) {
        // Server responded with error status
        console.error('📊 Server error response:', error.response.data);
        const serverError = error.response.data;
        
        errorMessage = serverError.error || errorMessage;
        
        if (serverError.debug) {
          errorDetails = `Server Details:
- Environment: ${serverError.debug.environment}
- Memory Usage: ${Math.round(serverError.debug.memoryUsage?.heapUsed / 1024 / 1024)}MB
- Uptime: ${Math.round(serverError.debug.uptime)}s
- Request ID: ${serverError.requestId}
- Server Time: ${serverError.serverTime}ms`;
        }
        
        if (serverError.stack && process.env.NODE_ENV === 'development') {
          errorDetails += `\n\nStack Trace:\n${serverError.stack}`;
        }
        
      } else if (error.request) {
        // Request was made but no response received
        console.error('📡 Network error - no response received');
        errorMessage = 'Network error: No response from server. Please check your connection and try again.';
        errorDetails = `Network Details:
- Request made to: ${error.config?.url}
- Method: ${error.config?.method}
- Timeout: ${error.config?.timeout}ms`;
        
      } else {
        // Something else happened
        console.error('🔧 Other error:', error.message);
        errorMessage = `Error: ${error.message}`;
      }
      
      // Log detailed error information
      console.error('📋 Error Summary:', {
        message: errorMessage,
        details: errorDetails,
        originalError: error
      });
      
      setError(`${errorMessage}${errorDetails ? '\n\n' + errorDetails : ''}`);
    } finally {
      setIsScraping(false);
    }
  }, [url, options]);

  const handleDownload = useCallback(async (item) => {
    setIsDownloading(true);
    try {
      console.log('📦 Starting download...');
      console.log('📊 Resources:', item.resources.length);
      console.log('⚙️ Options:', options);
      
      const response = await axios.post('/api/download', {
        resources: item.resources,
        options
      }, {
        ...axiosConfig,
        responseType: 'blob',
        timeout: 120000 // 2 minutes for large files
      });
      
      console.log('✅ Download response received');
      console.log('📏 Response size:', response.data.size, 'bytes');
      console.log('📋 Headers:', response.headers);
      
      setDownloadProgress(100);
      
      // Create download link
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${new URL(item.url).hostname}.zip`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      link.remove();
      
      console.log('✅ Download completed successfully');
      
    } catch (error) {
      console.error('❌ Download error:', error);
      
      let errorMessage = 'Failed to download file. Please try again.';
      let errorDetails = '';
      
      if (error.response) {
        console.error('📊 Server download error:', error.response.data);
        
        // Try to parse error response
        if (error.response.data instanceof Blob) {
          // Convert blob to text to read error message
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result);
              console.error('📋 Parsed error data:', errorData);
              setError(`Download failed: ${errorData.error || 'Unknown server error'}`);
            } catch (parseError) {
              console.error('❌ Failed to parse error response:', parseError);
              setError('Download failed: Invalid server response');
            }
          };
          reader.readAsText(error.response.data);
        } else {
          errorMessage = error.response.data.error || errorMessage;
          if (error.response.data.debug) {
            errorDetails = `Server Details:
- Environment: ${error.response.data.debug.environment}
- Memory Usage: ${Math.round(error.response.data.debug.memoryUsage?.heapUsed / 1024 / 1024)}MB
- Request ID: ${error.response.data.requestId}
- Server Time: ${error.response.data.serverTime}ms`;
          }
          setError(`${errorMessage}${errorDetails ? '\n\n' + errorDetails : ''}`);
        }
        
      } else if (error.request) {
        console.error('📡 Network error during download');
        setError('Network error during download. Please check your connection and try again.');
        
      } else {
        console.error('🔧 Other download error:', error.message);
        setError(`Download error: ${error.message}`);
      }
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
      }, 500);
    }
  }, [options, setDownloadProgress]);

  const handleOptionChange = useCallback((key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Test environment function
  const testEnvironment = useCallback(async () => {
    setIsTesting(true);
    setError('');
    setTestResults(null);
    
    try {
      console.log('🧪 Testing environment...');
      
      // Test environment endpoint
      const envResponse = await axios.get('/api/test-environment', axiosConfig);
      console.log('✅ Environment test response:', envResponse.data);
      
      // Test simple scrape
      const scrapeResponse = await axios.get('/api/test-scrape/example.com', axiosConfig);
      console.log('✅ Test scrape response:', scrapeResponse.data);
      
      setTestResults({
        environment: envResponse.data,
        scrape: scrapeResponse.data
      });
      
    } catch (error) {
      console.error('❌ Environment test failed:', error);
      
      let errorMessage = 'Environment test failed.';
      let errorDetails = '';
      
      if (error.response) {
        console.error('📊 Server test error:', error.response.data);
        errorMessage = error.response.data.error || errorMessage;
        
        if (error.response.data.debug) {
          errorDetails = `Test Details:
- Environment: ${error.response.data.debug.environment}
- Memory Usage: ${Math.round(error.response.data.debug.memoryUsage?.heapUsed / 1024 / 1024)}MB
- Request ID: ${error.response.data.requestId}
- Server Time: ${error.response.data.serverTime}ms`;
        }
      } else if (error.request) {
        errorMessage = 'Network error during test. Please check your connection.';
        errorDetails = `Network Details:
- Request made to: ${error.config?.url}
- Method: ${error.config?.method}`;
      } else {
        errorMessage = `Test error: ${error.message}`;
      }
      
      setError(`${errorMessage}${errorDetails ? '\n\n' + errorDetails : ''}`);
    } finally {
      setIsTesting(false);
    }
  }, []);

  return (
    <DownloadListContainer>
      <DownloadListHeader>Download List</DownloadListHeader>
      
      <OptionsSection>
        <OptionItem>
          <OptionLabel>Ignore files with no content</OptionLabel>
          <Toggle
            type="checkbox"
            checked={options.ignoreNoContentFile}
            onChange={(e) => handleOptionChange('ignoreNoContentFile', e.target.checked)}
          />
        </OptionItem>
        <OptionItem>
          <OptionLabel htmlFor="beautifyFile">Beautify files (HTML, CSS, JS, JSON)</OptionLabel>
          <Toggle id="beautifyFile" type="checkbox" checked={options.beautifyFile} onChange={e => handleOptionChange('beautifyFile', e.target.checked)} />
        </OptionItem>
      </OptionsSection>
      
      <UrlInputSection>
        <UrlInput
          type="url"
          placeholder="Enter website URL (e.g., https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
          disabled={isScraping}
        />
        <ButtonGroup>
          <Button
            onClick={handleAddUrl}
            disabled={isScraping || !url.trim()}
            color="primary"
          >
            {isScraping ? (
              <><Spinner /> Scraping...</>
            ) : (
              <><FaPlus /> Add URL</>
            )}
          </Button>
        </ButtonGroup>
        
        {error && (
          <ErrorMessage>
            <FaExclamationTriangle /> {error}
          </ErrorMessage>
        )}
        
        {scrapeResult && (
          <ScrapeReport>
            <ReportDetails>
              <DebugTitle>
                <FaCheckCircle /> Scrape Successful
              </DebugTitle>

              <DebugItem style={{ marginBottom: '20px' }}>
                <DebugKey>URL</DebugKey>
                <DebugValue>{scrapeResult.url}</DebugValue>
              </DebugItem>

              <DebugGrid>
                <DebugItem>
                  <DebugKey>Total Resources</DebugKey>
                  <DebugValue>{scrapeResult.debug.totalResources}</DebugValue>
                </DebugItem>
                <DebugItem>
                  <DebugKey>Total Size</DebugKey>
                  <DebugValue>{formatFileSize(scrapeResult.debug.totalSize)}</DebugValue>
                </DebugItem>
                <DebugItem>
                  <DebugKey>Scrape Time</DebugKey>
                  <DebugValue>{scrapeResult.debug.scrapeTime}ms</DebugValue>
                </DebugItem>
                <DebugItem>
                  <DebugKey>Unique Domains</DebugKey>
                  <DebugValue>{scrapeResult.debug.uniqueDomains}</DebugValue>
                </DebugItem>
              </DebugGrid>
            </ReportDetails>
            <ReportActions>
              <Button
                onClick={() => handleDownload(scrapeResult)}
                disabled={isDownloading}
                color="primary"
                progress={isDownloading ? downloadProgress : 0}
              >
                {isDownloading ? (
                  `Downloading... ${downloadProgress}%`
                ) : (
                  <><FaDownload /> Download</>
                )}
              </Button>
              <Button
                onClick={() => setScrapeResult(null)} 
                color="danger"
              >
                <FaTrash /> Delete
              </Button>
            </ReportActions>
          </ScrapeReport>
        )}
      </UrlInputSection>
      
      {!scrapeResult && (
        <EmptyState>
          No results yet. Enter a URL above to start scraping.
        </EmptyState>
        )}
    </DownloadListContainer>
  );
};

export default DownloadList; 