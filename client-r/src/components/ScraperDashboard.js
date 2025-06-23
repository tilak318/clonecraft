import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaDownload, FaGlobe, FaCog, FaPlay } from 'react-icons/fa';
import api from '../api';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const CardTitle = styled.h2`
  color: white;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: white;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    border-color: #ffd700;
    outline: none;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  
  &:focus {
    border-color: #ffd700;
    outline: none;
  }
  
  option {
    background: #333;
    color: white;
  }
`;

const Button = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ProgressContainer = styled.div`
  margin-top: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.p`
  color: white;
  margin-top: 0.5rem;
  text-align: center;
`;

const StatusMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
  color: white;
  background: ${props => 
    props.type === 'success' ? 'rgba(76, 175, 80, 0.3)' :
    props.type === 'error' ? 'rgba(244, 67, 54, 0.3)' :
    'rgba(33, 150, 243, 0.3)'
  };
  border: 1px solid ${props => 
    props.type === 'success' ? 'rgba(76, 175, 80, 0.5)' :
    props.type === 'error' ? 'rgba(244, 67, 54, 0.5)' :
    'rgba(33, 150, 243, 0.5)'
  };
`;

const ScraperDashboard = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [scrapingMode, setScrapingMode] = useState('single');
  const [maxPages, setMaxPages] = useState(10);
  const [includeAssets, setIncludeAssets] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [jobId, setJobId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) {
      setStatus({ type: 'error', message: 'Please enter a URL' });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setStatus({ type: 'info', message: 'Starting scraping job...' });

    try {
      let response;
      
      if (scrapingMode === 'single') {
        response = await api.post('/scraper/scrape', { url });
        setStatus({ type: 'success', message: 'Page scraped successfully!' });
        // For single page, we can show results immediately
        navigate(`/results/${response.data.jobId}`);
      } else {
        response = await api.post('/scraper/clone', {
          url,
          maxPages: parseInt(maxPages),
          includeAssets
        });
        
        setJobId(response.data.jobId);
        setStatus({ type: 'info', message: 'Website cloning started. Monitoring progress...' });
        
        // Start monitoring progress
        monitorProgress(response.data.jobId);
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.error || 'An error occurred while scraping' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const monitorProgress = async (jobId) => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/scraper/progress/${jobId}`);
        const job = response.data;
        
        setProgress(job.progress);
        
        if (job.status === 'completed') {
          setStatus({ type: 'success', message: 'Website cloned successfully!' });
          clearInterval(interval);
          navigate(`/results/${jobId}`);
        } else if (job.status === 'failed') {
          setStatus({ type: 'error', message: `Cloning failed: ${job.error}` });
          clearInterval(interval);
        } else {
          setStatus({ 
            type: 'info', 
            message: `Progress: ${job.progress}% - ${job.completedPages} pages processed` 
          });
        }
      } catch (error) {
        setStatus({ type: 'error', message: 'Error monitoring progress' });
        clearInterval(interval);
      }
    }, 2000);
  };

  return (
    <DashboardContainer>
      <Card>
        <CardTitle>
          <FaGlobe />
          Scrape Website
        </CardTitle>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Website URL</Label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <Label>Scraping Mode</Label>
            <Select
              value={scrapingMode}
              onChange={(e) => setScrapingMode(e.target.value)}
            >
              <option value="single">Single Page</option>
              <option value="full">Full Website Clone</option>
            </Select>
          </InputGroup>
          
          {scrapingMode === 'full' && (
            <>
              <InputGroup>
                <Label>Maximum Pages</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={maxPages}
                  onChange={(e) => setMaxPages(e.target.value)}
                />
              </InputGroup>
              
              <InputGroup>
                <Label>
                  <input
                    type="checkbox"
                    checked={includeAssets}
                    onChange={(e) => setIncludeAssets(e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Include Assets (CSS, JS, Images)
                </Label>
              </InputGroup>
            </>
          )}
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <FaCog style={{ animation: 'spin 1s linear infinite' }} />
                Processing...
              </>
            ) : (
              <>
                <FaPlay />
                Start Scraping
              </>
            )}
          </Button>
        </Form>
        
        {isLoading && (
          <ProgressContainer>
            <ProgressBar>
              <ProgressFill $progress={progress} />
            </ProgressBar>
            <ProgressText>{progress}% Complete</ProgressText>
          </ProgressContainer>
        )}
        
        {status && (
          <StatusMessage type={status.type}>
            {status.message}
          </StatusMessage>
        )}
      </Card>
      
      <Card>
        <CardTitle>
          <FaDownload />
          Features
        </CardTitle>
        <div style={{ color: 'white' }}>
          <h3>Single Page Scraping</h3>
          <p>Extract content, links, images, and assets from a single webpage.</p>
          
          <h3>Full Website Cloning</h3>
          <p>Clone entire websites by following internal links and downloading all assets.</p>
          
          <h3>Asset Download</h3>
          <p>Download CSS, JavaScript, images, and other resources automatically.</p>
          
          <h3>ZIP Export</h3>
          <p>Download all scraped content as a compressed ZIP file.</p>
          
          <h3>Progress Tracking</h3>
          <p>Monitor scraping progress in real-time with detailed status updates.</p>
        </div>
      </Card>
    </DashboardContainer>
  );
};

export default ScraperDashboard; 