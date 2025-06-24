import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { FaCog, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Button from './Button';
import axios from 'axios';

const Card = styled.div`
  margin-top: 30px;
  padding: 25px;
  background: rgba(0,0,0,0.2);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const ButtonGroup = styled.div`
  margin-bottom: 15px;
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

const EnvironmentTestCard = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [error, setError] = useState(null);

  const testEnvironment = useCallback(async () => {
    setIsTesting(true);
    setError(null);
    setTestResults(null);
    try {
      const response = await axios.get('/api/test-environment');
      setTestResults(response.data);
    } catch (err) {
      setError(err.message || 'Test failed');
    } finally {
      setIsTesting(false);
    }
  }, []);

  return (
    <Card>
      <h3 style={{ margin: '0 0 15px 0', color: '#fff' }}>🔧 Environment Test</h3>
      <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#ccc' }}>
        Test your deployment environment to identify issues
      </p>
      <ButtonGroup>
        <Button onClick={testEnvironment} disabled={isTesting} color="secondary">
          {isTesting ? (<><Spinner /> Testing...</>) : (<><FaCog /> Test Environment</>)}
        </Button>
      </ButtonGroup>
      {error && (
        <div style={{ color: '#ff6b6b', marginBottom: 10 }}>
          <FaExclamationTriangle /> {error}
        </div>
      )}
      {testResults && (
        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>✅ Test Results</h4>
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
  );
};

export default EnvironmentTestCard; 