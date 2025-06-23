import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaDownload, FaArrowLeft, FaEye, FaCode, FaImage, FaLink } from 'react-icons/fa';
import api from '../api';

const ResultsContainer = styled.div`
  margin-top: 2rem;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
`;

const CardTitle = styled.h2`
  color: white;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DownloadButton = styled.button`
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
  gap: 0.5rem;
  margin-bottom: 2rem;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #ffd700;
`;

const StatLabel = styled.div`
  color: white;
  margin-top: 0.5rem;
`;

const TabsContainer = styled.div`
  margin-top: 2rem;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 1rem;
`;

const Tab = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const TabContent = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
`;

const ListItem = styled.div`
  padding: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  
  &:last-child {
    border-bottom: none;
  }
`;

const LinkItem = styled.a`
  color: #ffd700;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ImagePreview = styled.img`
  max-width: 100px;
  max-height: 100px;
  border-radius: 4px;
  margin-right: 1rem;
`;

const ResultsView = () => {
  const { jobId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, [jobId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/scraper/progress/${jobId}`);
      setResults(response.data);
    } catch (error) {
      setError('Failed to load results');
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/scraper/download/${jobId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `scraped-website-${jobId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    }
  };

  if (loading) {
    return (
      <ResultsContainer>
        <BackButton to="/">
          <FaArrowLeft />
          Back to Dashboard
        </BackButton>
        <Card>
          <div style={{ color: 'white', textAlign: 'center' }}>Loading results...</div>
        </Card>
      </ResultsContainer>
    );
  }

  if (error || !results) {
    return (
      <ResultsContainer>
        <BackButton to="/">
          <FaArrowLeft />
          Back to Dashboard
        </BackButton>
        <Card>
          <div style={{ color: 'white', textAlign: 'center' }}>
            {error || 'No results found'}
          </div>
        </Card>
      </ResultsContainer>
    );
  }

  const totalPages = results.pages?.length || 0;
  const totalAssets = results.assets?.length || 0;
  const totalLinks = results.pages?.reduce((sum, page) => sum + (page.links?.length || 0), 0) || 0;
  const totalImages = results.pages?.reduce((sum, page) => sum + (page.images?.length || 0), 0) || 0;

  return (
    <ResultsContainer>
      <BackButton to="/">
        <FaArrowLeft />
        Back to Dashboard
      </BackButton>

      <Card>
        <CardTitle>
          <FaEye />
          Scraping Results
        </CardTitle>

        {results.status === 'completed' && (
          <DownloadButton onClick={handleDownload}>
            <FaDownload />
            Download All Content (ZIP)
          </DownloadButton>
        )}

        <StatsGrid>
          <StatCard>
            <StatNumber>{totalPages}</StatNumber>
            <StatLabel>Pages Scraped</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{totalAssets}</StatNumber>
            <StatLabel>Assets Downloaded</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{totalLinks}</StatNumber>
            <StatLabel>Links Found</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{totalImages}</StatNumber>
            <StatLabel>Images Found</StatLabel>
          </StatCard>
        </StatsGrid>

        <TabsContainer>
          <Tabs>
            <Tab 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </Tab>
            <Tab 
              active={activeTab === 'pages'} 
              onClick={() => setActiveTab('pages')}
            >
              Pages
            </Tab>
            <Tab 
              active={activeTab === 'assets'} 
              onClick={() => setActiveTab('assets')}
            >
              Assets
            </Tab>
            <Tab 
              active={activeTab === 'links'} 
              onClick={() => setActiveTab('links')}
            >
              Links
            </Tab>
          </Tabs>

          <TabContent>
            {activeTab === 'overview' && (
              <div style={{ color: 'white' }}>
                <h3>Scraping Summary</h3>
                <p>Base URL: {results.pages?.[0]?.url || 'N/A'}</p>
                <p>Status: {results.status}</p>
                <p>Progress: {results.progress}%</p>
                {results.errors?.length > 0 && (
                  <div>
                    <h4>Errors ({results.errors.length})</h4>
                    {results.errors.map((error, index) => (
                      <div key={index} style={{ color: '#ff6b6b', marginBottom: '0.5rem' }}>
                        {error.url}: {error.error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pages' && results.pages && (
              <div>
                {results.pages.map((page, index) => (
                  <ListItem key={index}>
                    <strong>{page.title || 'No Title'}</strong>
                    <br />
                    <LinkItem href={page.url} target="_blank" rel="noopener noreferrer">
                      {page.url}
                    </LinkItem>
                    <br />
                    <small>Links: {page.links?.length || 0} | Images: {page.images?.length || 0}</small>
                  </ListItem>
                ))}
              </div>
            )}

            {activeTab === 'assets' && results.assets && (
              <div>
                {results.assets.map((asset, index) => (
                  <ListItem key={index}>
                    <strong>{asset.fileName}</strong>
                    <br />
                    <LinkItem href={asset.url} target="_blank" rel="noopener noreferrer">
                      {asset.url}
                    </LinkItem>
                    <br />
                    <small>Size: {asset.size} bytes | Type: {asset.contentType}</small>
                  </ListItem>
                ))}
              </div>
            )}

            {activeTab === 'links' && results.pages && (
              <div>
                {results.pages.map((page, pageIndex) => (
                  <div key={pageIndex}>
                    <h4>{page.title || `Page ${pageIndex + 1}`}</h4>
                    {page.links?.map((link, linkIndex) => (
                      <ListItem key={linkIndex}>
                        <LinkItem href={link.absolute || link.href} target="_blank" rel="noopener noreferrer">
                          {link.text || link.href}
                        </LinkItem>
                        <br />
                        <small>{link.absolute || link.href}</small>
                      </ListItem>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </TabContent>
        </TabsContainer>
      </Card>
    </ResultsContainer>
  );
};

export default ResultsView; 