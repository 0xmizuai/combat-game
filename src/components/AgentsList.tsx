import React from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';
import Agent from './Agent';

const AgentsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background-color: var(--card-bg);
  border-radius: 10px;
  grid-column: 1 / -1;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: var(--text-secondary);
`;

const EmptyStateText = styled.p`
  color: var(--text-secondary);
  margin-bottom: 20px;
`;

const AgentsList: React.FC = () => {
  const { gameState } = useGame();
  const agents = Object.values(gameState.agents);
  
  // Sort agents: alive first, then by compute power
  const sortedAgents = [...agents].sort((a, b) => {
    if (a.alive && !b.alive) return -1;
    if (!a.alive && b.alive) return 1;
    return b.computePower - a.computePower;
  });
  
  if (sortedAgents.length === 0) {
    return (
      <AgentsContainer>
        <EmptyState>
          <EmptyStateTitle>No Agents Yet</EmptyStateTitle>
          <EmptyStateText>
            Add some agents to start the Battle Royale!
          </EmptyStateText>
        </EmptyState>
      </AgentsContainer>
    );
  }
  
  return (
    <AgentsContainer>
      {sortedAgents.map(agent => (
        <Agent key={agent.id} agent={agent} />
      ))}
    </AgentsContainer>
  );
};

export default AgentsList; 