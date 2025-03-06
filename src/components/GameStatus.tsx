import React from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';
import { formatNumber } from '../utils/helpers';

const PageTitle = styled.h1`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 20px;
  background: linear-gradient(90deg, var(--success-color), var(--mizu-color), var(--danger-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
  width: 100%;
`;

const StatusContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 30px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StatItem = styled.div`
  text-align: center;
  padding: 10px;
  flex: 1;
  min-width: 120px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 5px 0;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const PhaseIndicator = styled.div<{ phase: string }>`
  background-color: ${props => {
    switch (props.phase) {
      case 'waiting': return 'rgba(251, 188, 5, 0.2)'; // warning color
      case 'preparation': return 'rgba(52, 168, 83, 0.2)'; // green color
      case 'competition': return 'rgba(66, 133, 244, 0.2)'; // blue color
      case 'locked': return 'rgba(128, 128, 128, 0.2)'; // gray color
      case 'completed': return 'rgba(234, 67, 53, 0.2)'; // red color
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.phase) {
      case 'waiting': return 'var(--warning-color)';
      case 'preparation': return '#34A853'; // green color
      case 'competition': return 'var(--success-color)';
      case 'locked': return '#808080'; // gray color
      case 'completed': return 'var(--danger-color)';
      default: return 'var(--text-color)';
    }
  }};
  padding: 5px 10px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
  text-transform: uppercase;
`;

const GameStatus: React.FC = () => {
  const { gameState } = useGame();
  const { currentRound, difficulty, gamePhase } = gameState;
  
  // Count alive agents
  const aliveAgents = Object.values(gameState.agents).filter(agent => agent.alive).length;
  
  // Calculate total bets
  const totalBets = Object.values(gameState.agents).reduce((sum, agent) => sum + agent.totalBets, 0);
  
  // Format the phase name for display
  const formatPhase = (phase: string) => {
    return phase.charAt(0).toUpperCase() + phase.slice(1);
  };
  
  return (
    <>
      <PageTitle>Current Game</PageTitle>
      <StatusContainer>
        <StatItem>
          <StatValue>
            <PhaseIndicator phase={gamePhase}>{formatPhase(gamePhase)}</PhaseIndicator>
          </StatValue>
          <StatLabel>Game Phase</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue>{currentRound}</StatValue>
          <StatLabel>Current Round</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue>{difficulty}</StatValue>
          <StatLabel>Difficulty Level</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue>{aliveAgents}</StatValue>
          <StatLabel>Agents Alive</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue>{formatNumber(totalBets)}</StatValue>
          <StatLabel>Total Bets</StatLabel>
        </StatItem>
      </StatusContainer>
    </>
  );
};

export default GameStatus; 