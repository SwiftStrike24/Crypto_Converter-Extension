import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { darkTheme } from './styles/theme';
import CurrencyConverter from './components/CurrencyConverter';

const AppContainer = styled.div`
  width: 350px;
  min-height: 400px;
  padding: 20px;
  background: ${props => props.theme.background};
  color: ${props => props.theme.text};
`;

const App: React.FC = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <GlobalStyles />
      <AppContainer>
        <CurrencyConverter />
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
