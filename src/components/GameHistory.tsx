import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';

const HistoryContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
`;

const HistoryTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 20px;
  text-align: center;
  color: var(--text-secondary);
`;

const HistoryList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--text-secondary);
    border-radius: 4px;
  }
`;

const HistoryItem = styled.div`
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  background-color: var(--card-bg);
  border-left: 4px solid var(--text-secondary);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateX(5px);
  }
`;

const HistoryItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const AgentName = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
`;

const ChallengeTime = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const ChallengeResult = styled.div<{ success: boolean | null }>`
  font-weight: bold;
  color: ${props => 
    props.success === null 
      ? 'var(--warning-color)' 
      : props.success 
        ? 'var(--success-color)' 
        : 'var(--danger-color)'
  };
`;

const ChallengeQuestions = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  font-size: 0.9rem;
  
  ol {
    margin: 0;
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 5px;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 5px;
  margin-top: 5px;
  text-decoration: underline;
  
  &:hover {
    color: var(--text-color);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
  font-style: italic;
`;

interface ChallengeHistoryItem {
  id: string;
  agentId: string;
  agentName: string;
  time: number;
  success: boolean | null;
  questions: string[];
}

const GameHistory: React.FC = () => {
  const { gameState } = useGame();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  // Create a history of challenges from the game state
  const challengeHistory = useMemo(() => {
    const history: ChallengeHistoryItem[] = [];
    
    // Add the current challenge if it exists
    if (gameState.currentChallenge) {
      const agent = gameState.agents[gameState.currentChallenge.agentId];
      if (agent) {
        history.push({
          id: gameState.currentChallenge.id,
          agentId: agent.id,
          agentName: agent.name,
          time: gameState.currentChallenge.startTime,
          success: gameState.currentChallenge.success,
          questions: gameState.currentChallenge.questions,
        });
      }
    }
    
    // Add past challenges from history
    gameState.challengeHistory.forEach(challenge => {
      const agent = gameState.agents[challenge.agentId];
      if (agent) {
        history.push({
          id: challenge.id,
          agentId: agent.id,
          agentName: agent.name,
          time: challenge.startTime,
          success: challenge.success,
          questions: challenge.questions,
        });
      }
    });
    
    // Sort challenges by time (most recent first)
    return history.sort((a, b) => b.time - a.time);
  }, [gameState.currentChallenge, gameState.challengeHistory, gameState.agents]);
  
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  
  if (challengeHistory.length === 0 && !gameState.gameActive) {
    return null;
  }
  
  return (
    <HistoryContainer>
      <HistoryTitle>Challenge History</HistoryTitle>
      
      <HistoryList>
        {challengeHistory.length > 0 ? (
          challengeHistory.map(challenge => (
            <HistoryItem key={challenge.id}>
              <HistoryItemHeader>
                <AgentName>{challenge.agentName}</AgentName>
                <ChallengeTime>
                  {new Date(challenge.time).toLocaleTimeString()}
                </ChallengeTime>
              </HistoryItemHeader>
              
              <ChallengeResult success={challenge.success}>
                {challenge.success === null 
                  ? 'In Progress...' 
                  : challenge.success 
                    ? 'SUCCESS' 
                    : 'FAILED'}
              </ChallengeResult>
              
              <ToggleButton onClick={() => toggleExpand(challenge.id)}>
                {expandedItems[challenge.id] ? 'Hide Questions' : 'Show Questions'}
              </ToggleButton>
              
              {expandedItems[challenge.id] && (
                <ChallengeQuestions>
                  <ol>
                    {challenge.questions.map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ol>
                </ChallengeQuestions>
              )}
            </HistoryItem>
          ))
        ) : (
          <EmptyState>No challenges yet</EmptyState>
        )}
      </HistoryList>
    </HistoryContainer>
  );
};

export default GameHistory; 