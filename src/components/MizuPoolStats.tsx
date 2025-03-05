import React from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';
import { formatNumber } from '../utils/helpers';

const StatsContainer = styled.div`
  background-color: rgba(52, 168, 83, 0.1);
  border: 2px solid var(--mizu-color);
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
  min-width: 150px;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--mizu-color);
  margin: 5px 0;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const MizuPoolStats: React.FC = () => {
  const { mizuPoolStats } = useGame();
  const { totalCompute, activeContributors, tasksInQueue } = mizuPoolStats;
  
  return (
    <StatsContainer>
      <StatItem>
        <StatValue>{formatNumber(totalCompute)}</StatValue>
        <StatLabel>Total Compute Power</StatLabel>
      </StatItem>
      
      <StatItem>
        <StatValue>{formatNumber(activeContributors)}</StatValue>
        <StatLabel>Active Contributors</StatLabel>
      </StatItem>
      
      <StatItem>
        <StatValue>{formatNumber(tasksInQueue)}</StatValue>
        <StatLabel>Tasks in Queue</StatLabel>
      </StatItem>
    </StatsContainer>
  );
};

export default MizuPoolStats; 