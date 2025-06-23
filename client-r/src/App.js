import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Header from './components/Header';
import ScraperDashboard from './components/ScraperDashboard';
import ResultsView from './components/ResultsView';
import GlobalStyles from './styles/GlobalStyles';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const MainContent = styled.main`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

function App() {
  return (
    <Router>
      <GlobalStyles />
      <AppContainer>
        <Header />
        <MainContent>
          <Routes>
            <Route path="/" element={<ScraperDashboard />} />
            <Route path="/results/:jobId" element={<ResultsView />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

export default App; 