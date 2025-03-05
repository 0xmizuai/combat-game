import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';
import { formatNumber } from '../utils/helpers';

const LeaderboardContainer = styled.div`
  background-color: rgba(66, 133, 244, 0.1);
  border: 2px solid var(--success-color);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
`;

const LeaderboardTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
  color: var(--success-color);
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  background-color: ${props => props.active ? 'var(--success-color)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  border: 1px solid var(--success-color);
  border-radius: ${props => props.active ? '4px' : '4px'};
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  transition: all 0.2s ease;
  margin: 0 5px;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--success-color)' : 'rgba(66, 133, 244, 0.2)'};
  }
`;

const LeaderboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
`;

const TableRow = styled.tr<{ alive: boolean }>`
  opacity: ${props => props.alive ? 1 : 0.6};
`;

const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const RankCell = styled(TableCell)`
  font-weight: bold;
  width: 50px;
`;

const NameCell = styled(TableCell)`
  font-weight: bold;
`;

const StatusBadge = styled.span<{ alive: boolean }>`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  margin-left: 10px;
  background-color: ${props => props.alive ? 'var(--success-color)' : 'var(--danger-color)'};
  color: white;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
  font-style: italic;
`;

type SortType = 'compute' | 'bets';

const Leaderboard: React.FC = () => {
  const { gameState } = useGame();
  const [sortBy, setSortBy] = React.useState<SortType>('compute');
  
  const sortedAgents = useMemo(() => {
    const agents = Object.values(gameState.agents);
    
    if (sortBy === 'compute') {
      return [...agents].sort((a, b) => b.computePower - a.computePower);
    } else {
      return [...agents].sort((a, b) => b.totalBets - a.totalBets);
    }
  }, [gameState.agents, sortBy]);
  
  if (sortedAgents.length === 0) {
    return null;
  }
  
  return (
    <LeaderboardContainer>
      <LeaderboardTitle>Leaderboard</LeaderboardTitle>
      
      <TabsContainer>
        <Tab 
          active={sortBy === 'compute'} 
          onClick={() => setSortBy('compute')}
        >
          By Compute Power
        </Tab>
        <Tab 
          active={sortBy === 'bets'} 
          onClick={() => setSortBy('bets')}
        >
          By Total Bets
        </Tab>
      </TabsContainer>
      
      {sortedAgents.length > 0 ? (
        <LeaderboardTable>
          <thead>
            <tr>
              <TableHeader>Rank</TableHeader>
              <TableHeader>Agent</TableHeader>
              <TableHeader>{sortBy === 'compute' ? 'Compute Power' : 'Total Bets'}</TableHeader>
              <TableHeader>Challenges</TableHeader>
            </tr>
          </thead>
          <tbody>
            {sortedAgents.map((agent, index) => (
              <TableRow key={agent.id} alive={agent.alive}>
                <RankCell>{index + 1}</RankCell>
                <NameCell>
                  {agent.name}
                  <StatusBadge alive={agent.alive}>
                    {agent.alive ? 'ALIVE' : 'ELIMINATED'}
                  </StatusBadge>
                </NameCell>
                <TableCell>
                  {formatNumber(sortBy === 'compute' ? agent.computePower : agent.totalBets)}
                </TableCell>
                <TableCell>{agent.challengesCompleted}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </LeaderboardTable>
      ) : (
        <EmptyState>No agents available</EmptyState>
      )}
    </LeaderboardContainer>
  );
};

export default Leaderboard; 