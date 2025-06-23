import React, { useReducer } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import Header from './components/Header';
import DownloadList from './components/DownloadList';
import Features from './components/Features';
import { useAppTheme } from './hooks/useAppTheme';
import { appReducers, appInitialState } from './store/reducers';

const AppWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  color: ${props => props.theme.textColor};
  padding: 1px; // Prevents margin collapse
`;

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.main``;
const SideContent = styled.aside``;

const App = () => {
  const [state, dispatch] = useReducer(appReducers, appInitialState);
  const theme = useAppTheme();

  return (
    <ThemeProvider theme={theme}>
      <AppWrapper>
        <AppContainer>
          <Header />
          <ContentGrid>
            <MainContent>
              <DownloadList />
            </MainContent>
            <SideContent>
              <Features />
            </SideContent>
          </ContentGrid>
        </AppContainer>
      </AppWrapper>
    </ThemeProvider>
  );
};

export default App; 