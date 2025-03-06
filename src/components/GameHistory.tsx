import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';

const HistoryContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
`;

const HistoryHeader = styled.div<{ expanded: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.expanded ? '20px' : '0'};
  cursor: pointer;
`;

const HistoryTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  color: var(--text-secondary);
`;

const ToggleIcon = styled.span<{ expanded: boolean }>`
  font-size: 1.5rem;
  transition: transform 0.3s ease;
  transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0)'};
`;

const HistoryContent = styled.div<{ expanded: boolean }>`
  max-height: ${props => props.expanded ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.5s ease;
`;

const HistoryList = styled.div`
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

const ChallengeNumber = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
`;

const ChallengeTime = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const ChallengeStatus = styled.div<{ evaluated: boolean }>`
  font-weight: bold;
  color: ${props => props.evaluated ? 'var(--success-color)' : 'var(--warning-color)'};
`;

const WinnerInfo = styled.div`
  margin-top: 10px;
  font-weight: bold;
`;

const WinnerName = styled.span`
  color: var(--success-color);
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

const ResponsesInfo = styled.div`
  margin-top: 10px;
  font-size: 0.9rem;
  color: var(--text-secondary);
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
  round: number;
  time: number;
  evaluated: boolean;
  winnerId: string | null;
  winnerName: string | null;
  questions: string[];
  responseCount: number;
}

const GameHistory: React.FC = () => {
  const { gameState } = useGame();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Create a history of challenges from the game state
  const challengeHistory = useMemo(() => {
    const history: ChallengeHistoryItem[] = [];
    let round = gameState.currentRound;
    
    // Add the current challenge if it exists
    if (gameState.currentChallenge) {
      const winnerAgent = gameState.currentChallenge.winner 
        ? gameState.agents[gameState.currentChallenge.winner] 
        : null;
      
      history.push({
        id: gameState.currentChallenge.id,
        round: round,
        time: gameState.currentChallenge.startTime,
        evaluated: gameState.currentChallenge.evaluated,
        winnerId: gameState.currentChallenge.winner,
        winnerName: winnerAgent ? winnerAgent.name : null,
        questions: gameState.currentChallenge.questions,
        responseCount: Object.keys(gameState.currentChallenge.responses).length
      });
      
      round--;
    }
    
    // Add past challenges from history
    gameState.challengeHistory.forEach((challenge, index) => {
      const winnerAgent = challenge.winner 
        ? gameState.agents[challenge.winner] 
        : null;
      
      history.push({
        id: challenge.id,
        round: round - index,
        time: challenge.startTime,
        evaluated: challenge.evaluated,
        winnerId: challenge.winner,
        winnerName: winnerAgent ? winnerAgent.name : null,
        questions: challenge.questions,
        responseCount: Object.keys(challenge.responses).length
      });
    });
    
    // Sort challenges by time (most recent first)
    return history.sort((a, b) => b.time - a.time);
  }, [gameState.currentChallenge, gameState.challengeHistory, gameState.agents, gameState.currentRound]);
  
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  
  const toggleSection = () => {
    setIsExpanded(!isExpanded);
  };
  
  if (challengeHistory.length === 0 && !gameState.gameActive) {
    return null;
  }
  
  return (
    <HistoryContainer>
      <HistoryHeader onClick={toggleSection} expanded={isExpanded}>
        <HistoryTitle>Challenge History</HistoryTitle>
        <ToggleIcon expanded={isExpanded}>▼</ToggleIcon>
      </HistoryHeader>
      
      <HistoryContent expanded={isExpanded}>
        <HistoryList>
          {challengeHistory.length > 0 ? (
            challengeHistory.map(challenge => (
              <HistoryItem key={challenge.id}>
                <HistoryItemHeader>
                  <ChallengeNumber>Challenge {challenge.round}</ChallengeNumber>
                  <ChallengeTime>
                    {new Date(challenge.time).toLocaleTimeString()}
                  </ChallengeTime>
                </HistoryItemHeader>
                
                <ChallengeStatus evaluated={challenge.evaluated}>
                  {challenge.evaluated ? 'Evaluated' : 'In Progress...'}
                </ChallengeStatus>
                
                {challenge.evaluated && (
                  <WinnerInfo>
                    Winner: {challenge.winnerName ? (
                      <WinnerName>{challenge.winnerName}</WinnerName>
                    ) : (
                      'No winner'
                    )}
                  </WinnerInfo>
                )}
                
                <ResponsesInfo>
                  {challenge.responseCount} agent{challenge.responseCount !== 1 ? 's' : ''} responded
                </ResponsesInfo>
                
                <ToggleButton onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(challenge.id);
                }}>
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
            <EmptyState>No challenges have been completed yet.</EmptyState>
          )}
        </HistoryList>
      </HistoryContent>
    </HistoryContainer>
  );
};

export default GameHistory; 