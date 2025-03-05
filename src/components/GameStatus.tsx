import React from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';
import { formatNumber } from '../utils/helpers';

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

const GameStatus: React.FC = () => {
  const { gameState } = useGame();
  const { currentRound, difficulty } = gameState;
  
  // Count alive agents
  const aliveAgents = Object.values(gameState.agents).filter(agent => agent.alive).length;
  
  // Calculate total bets
  const totalBets = Object.values(gameState.agents).reduce((sum, agent) => sum + agent.totalBets, 0);
  
  return (
    <StatusContainer>
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
  );
};

export default GameStatus; 