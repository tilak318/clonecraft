import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { FaBolt, FaFolder, FaMagic, FaCode, FaCog, FaExclamationTriangle } from 'react-icons/fa';
import Button from '../Button';
import axios from 'axios';
import { axiosConfig } from '../../config/api';

const FeaturesContainer = styled.div`
  background: ${props => props.theme.backgroundColor};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: ${props => props.theme.borderRadius};
  border: 1px solid ${props => props.theme.borderColor};
  box-shadow: ${props => props.theme.boxShadow};
  padding: 25px;
  height: 100%;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.textColor};
  margin: 0 0 20px 0;
  border-bottom: 1px solid ${props => props.theme.borderColor};
  padding-bottom: 20px;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 25px;
  &:last-child {
      margin-bottom: 0;
  }
`;

const FeatureIcon = styled.div`
  color: ${props => props.theme.primaryColor};
  font-size: 20px;
  margin-top: 3px;
`;

const FeatureText = styled.div``;

const FeatureTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 5px 0;
  color: ${props => props.theme.textColor};
`;

const FeatureDescription = styled.p`
  font-size: 14px;
  color: ${props => props.theme.secondaryColor};
  margin: 0;
  line-height: 1.5;
`;

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

const Features = () => {
    const features = [
        {
            icon: <FaBolt />,
            title: "Lightning-Fast Scraping",
            description: "Utilizes a powerful backend to quickly scrape and capture all resources from any website."
        },
        {
            icon: <FaFolder />,
            title: "Original Folder Structure",
            description: "Maintains the original folder structure of the website for easy navigation and use."
        },
        {
            icon: <FaMagic />,
            title: "Resource Beautification",
            description: "Optionally beautify HTML, CSS, JS, and JSON files for enhanced readability and cleaner code."
        },
        {
            icon: <FaCode />,
            title: "For Developers & Designers",
            description: "A perfect tool for archiving websites, offline viewing, or analyzing a site's structure and assets."
        },
    ];

    // Environment Test logic
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
      <FeaturesContainer>
        <Title>Why Use CloneCraft?</Title>
        <FeatureList>
            {features.map(feature => (
                <FeatureItem key={feature.title}>
                    <FeatureIcon>{feature.icon}</FeatureIcon>
                    <FeatureText>
                        <FeatureTitle>{feature.title}</FeatureTitle>
                        <FeatureDescription>{feature.description}</FeatureDescription>
                    </FeatureText>
                </FeatureItem>
            ))}
        </FeatureList>
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
      </FeaturesContainer>
    );
};

export default Features; 