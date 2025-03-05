import React from 'react';
import { Routes, Route } from 'react-router-dom'
import styled from '@emotion/styled'
import { Global, css } from '@emotion/react'
import { CONFIG } from './utils/config'
import { GameProvider } from './contexts/GameContext'
import { ToastProvider } from './contexts/ToastContext'
import WalletConnect from './components/WalletConnect'
import MizuPoolStats from './components/MizuPoolStats'
import GameStatus from './components/GameStatus'
import GameControls from './components/GameControls'
import Challenge from './components/Challenge'
import AgentsList from './components/AgentsList'
import GameResults from './components/GameResults'
import Leaderboard from './components/Leaderboard'
import GameHistory from './components/GameHistory'
import About from './components/About'
import Header from './components/Header'
import NotFound from './components/NotFound'
import './App.css'

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

const HomePage = () => (
  <>
    <Header />
    <WalletConnect />
    <MizuPoolStats />
    <GameStatus />
    <GameControls />
    <Challenge />
    <GameResults />
    <Leaderboard />
    <GameHistory />
    <AgentsList />
    <About />
  </>
)

function App() {
  return (
    <ToastProvider>
      <GameProvider>
        <Global styles={globalStyles} />
        <AppWrapper>
          <Container>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Container>
        </AppWrapper>
      </GameProvider>
    </ToastProvider>
  )
}

export default App
