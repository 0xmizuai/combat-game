import React from 'react';
import { Routes, Route } from 'react-router-dom'
import styled from '@emotion/styled'
import { Global, css } from '@emotion/react'
import { CONFIG } from './utils/config'
import { GameProvider } from './contexts/GameContext'
import { ToastProvider } from './contexts/ToastContext'
import { WalletProvider } from './contexts/WalletContext'
import NotFound from './components/NotFound'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LeaderboardPage from './pages/LeaderboardPage'
import AboutPage from './pages/AboutPage'
import './App.css'
import './styles/rainbowkit-override.css'

// Define global CSS variables
const globalStyles = css`
  :root {
    --mizu-color: ${CONFIG.colors.mizuColor};
    --danger-color: ${CONFIG.colors.dangerColor};
    --success-color: ${CONFIG.colors.successColor};
    --warning-color: ${CONFIG.colors.warningColor};
    --dark-bg: ${CONFIG.colors.darkBg};
    --card-bg: ${CONFIG.colors.cardBg};
    --text-color: ${CONFIG.colors.textColor};
    --text-secondary: ${CONFIG.colors.textSecondary};
  }
  
  body {
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
    background-color: var(--dark-bg);
    color: var(--text-color);
    min-height: 100vh;
  }
`

const AppWrapper = styled.div`
  min-height: 100vh;
  background-color: var(--dark-bg);
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`

function App() {
  return (
    <ToastProvider>
      <WalletProvider>
        <GameProvider>
          <Global styles={globalStyles} />
          <AppWrapper>
            <Container>
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Container>
          </AppWrapper>
        </GameProvider>
      </WalletProvider>
    </ToastProvider>
  )
}

export default App
