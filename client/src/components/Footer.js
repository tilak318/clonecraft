import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { FaCog, FaExclamationTriangle } from 'react-icons/fa';
import Button from './Button';
import axios from 'axios';
import { axiosConfig } from '../config/api';

const FooterBar = styled.footer`
  width: 100%;
  background: rgba(10, 20, 40, 0.95);
  border-top: 1px solid #223;
  padding: 32px 0 24px 0;
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 -2px 16px rgba(0,0,0,0.08);
`;

const Card = styled.div`
  max-width: 480px;
  width: 100%;
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 24px 32px;
  margin: 0 auto;
`;

const ButtonGroup = styled.div`
  margin-bottom: 15px;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #334;
  border-top: 2px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Footer = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [error, setError] = useState(null);

  const testEnvironment = useCallback(async () => {
    setIsTesting(true);
    setError(null);
    setTestResults(null);
    try {
      const envResponse = await axios.get('/api/test-environment', axiosConfig);
      const scrapeResponse = await axios.get('/api/test-scrape/example.com', axiosConfig);
      setTestResults({
        environment: envResponse.data,
        scrape: scrapeResponse.data
      });
    } catch (error) {
      let errorMessage = 'Environment test failed.';
      let errorDetails = '';
      if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
        if (error.response.data.debug) {
          errorDetails = `Test Details:\n- Environment: ${error.response.data.debug.environment}\n- Memory Usage: ${Math.round(error.response.data.debug.memoryUsage?.heapUsed / 1024 / 1024)}MB\n- Request ID: ${error.response.data.requestId}\n- Server Time: ${error.response.data.serverTime}ms`;
        }
      } else if (error.request) {
        errorMessage = 'Network error during test. Please check your connection.';
        errorDetails = `Network Details:\n- Request made to: ${error.config?.url}\n- Method: ${error.config?.method}`;
      } else {
        errorMessage = `Test error: ${error.message}`;
      }
      setError(`${errorMessage}${errorDetails ? '\n\n' + errorDetails : ''}`);
    } finally {
      setIsTesting(false);
    }
  }, []);

  return (
    <FooterBar>
      <Card>
        <h3 style={{ margin: '0 0 15px 0', color: '#fff', textAlign: 'center' }}>🔧 Environment Test</h3>
        <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#ccc', textAlign: 'center' }}>
          Test your deployment environment to identify issues
        </p>
        <ButtonGroup>
          <Button onClick={testEnvironment} disabled={isTesting} color="secondary">
            {isTesting ? (<><Spinner /> Testing...</>) : (<><FaCog /> Test Environment</>)}
          </Button>
        </ButtonGroup>
        {error && (
          <div style={{ color: '#ff6b6b', marginBottom: 10, textAlign: 'center' }}>
            <FaExclamationTriangle /> {error}
          </div>
        )}
        {testResults && (
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50', textAlign: 'center' }}>✅ Test Results</h4>
            <div style={{ marginBottom: '15px' }}>
              <h5 style={{ margin: '0 0 5px 0', color: '#fff' }}>Environment Tests:</h5>
              <ul style={{ margin: '0', paddingLeft: '20px', color: '#ccc' }}>
                <li>Puppeteer: <span style={{ color: testResults.environment.tests.puppeteer.includes('error') ? '#ff6b6b' : '#4CAF50' }}>{testResults.environment.tests.puppeteer}</span></li>
                <li>Browser: <span style={{ color: testResults.environment.tests.browser.includes('error') ? '#ff6b6b' : '#4CAF50' }}>{testResults.environment.tests.browser}</span></li>
                <li>Network: <span style={{ color: testResults.environment.tests.network.includes('error') ? '#ff6b6b' : '#4CAF50' }}>{testResults.environment.tests.network}</span></li>
                <li>File System: <span style={{ color: testResults.environment.tests.filesystem.includes('error') ? '#ff6b6b' : '#4CAF50' }}>{testResults.environment.tests.filesystem}</span></li>
              </ul>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <h5 style={{ margin: '0 0 5px 0', color: '#fff' }}>Scrape Test:</h5>
              <p style={{ margin: '0', color: '#ccc' }}>
                {testResults.scrape.success ? (
                  <>✅ Successfully scraped <strong>{testResults.scrape.testUrl}</strong> (Title: {testResults.scrape.title})</>
                ) : (
                  <>❌ Failed to scrape: {testResults.scrape.error}</>
                )}
              </p>
            </div>
            <div>
              <h5 style={{ margin: '0 0 5px 0', color: '#fff' }}>Server Info:</h5>
              <p style={{ margin: '0', fontSize: '12px', color: '#ccc' }}>
                Node: {testResults.environment.environment.nodeVersion} | 
                Platform: {testResults.environment.environment.platform} | 
                Memory: {Math.round(testResults.environment.environment.memoryUsage.heapUsed / 1024 / 1024)}MB | 
                Uptime: {Math.round(testResults.environment.environment.uptime)}s
              </p>
            </div>
          </div>
        )}
      </Card>
      <div style={{marginTop: 24, color: '#888', fontSize: 13, textAlign: 'center'}}>
        &copy; {new Date().getFullYear()} CloneCraft. All rights reserved.
      </div>
    </FooterBar>
  );
};

export default Footer; 