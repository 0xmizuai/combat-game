import React from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';
import { formatNumber } from '../utils/helpers';
import { useToast } from '../contexts/ToastContext';

const ResultsContainer = styled.div<{ visible: boolean }>`
  background-color: rgba(66, 133, 244, 0.1);
  border: 2px solid var(--success-color);
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 30px;
  text-align: center;
  display: ${props => props.visible ? 'block' : 'none'};
  animation: fadeIn 0.8s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ResultsTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 20px;
  color: var(--success-color);
`;

const WinnerSection = styled.div`
  margin: 30px 0;
`;

const WinnerName = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  background: linear-gradient(90deg, var(--success-color), var(--mizu-color), var(--warning-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
`;

const WinnerStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 20px 0;
  flex-wrap: wrap;
`;

const StatBox = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  padding: 15px 25px;
  border-radius: 8px;
  min-width: 150px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 5px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const NoWinnerMessage = styled.div`
  font-size: 1.5rem;
  margin: 30px 0;
  color: var(--text-secondary);
`;

const ClaimRewardsButton = styled.button`
  background-color: var(--warning-color);
  color: black;
  padding: 12px 30px;
  font-size: 1.2rem;
  margin: 20px 0;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  
  &:hover {
    background-color: #e0a800;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const PlayAgainButton = styled.button`
  background-color: var(--mizu-color);
  color: white;
  padding: 12px 30px;
  font-size: 1.2rem;
  margin: 20px 0;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  
  &:hover {
    background-color: #2d9147;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const GameResults: React.FC = () => {
  const { gameState, userState, claimRewards, startGame } = useGame();
  const { showToast } = useToast();
  
  // Only show results when the game is not active and has been started
  const shouldShowResults = !gameState.gameActive && gameState.gameStartTime > 0;
  
  if (!shouldShowResults) return null;
  
  const handleClaimRewards = async () => {
    try {
      await claimRewards();
    } catch {
      showToast('Failed to claim rewards. Please try again.', 'error');
    }
  };
  
  const handlePlayAgain = () => {
    startGame();
    showToast('Starting a new Battle Royale!', 'info');
  };
  
  // If there's a winner, get their details
  const winner = gameState.winner ? gameState.agents[gameState.winner] : null;
  
  // Check if user bet on the winner
  const userBetOnWinner = winner && userState.bets[winner.id] > 0;
  
  return (
    <ResultsContainer visible={shouldShowResults}>
      <ResultsTitle>Game Over</ResultsTitle>
      
      {winner ? (
        <WinnerSection>
          <div>The winner is</div>
          <WinnerName>{winner.name}</WinnerName>
          
          <WinnerStats>
            <StatBox>
              <StatLabel>Compute Power</StatLabel>
              <StatValue>{formatNumber(winner.computePower)}</StatValue>
            </StatBox>
            
            <StatBox>
              <StatLabel>Total Bets</StatLabel>
              <StatValue>{formatNumber(winner.totalBets)}</StatValue>
            </StatBox>
            
            <StatBox>
              <StatLabel>Challenges Completed</StatLabel>
              <StatValue>{winner.challengesCompleted}</StatValue>
            </StatBox>
          </WinnerStats>
          
          {userState.connected && userBetOnWinner && (
            <>
              <div>You bet {formatNumber(userState.bets[winner.id])} on the winner!</div>
              <ClaimRewardsButton onClick={handleClaimRewards} disabled={userState.rewards > 0}>
                {userState.rewards > 0 ? 'Rewards Claimed' : 'Claim Rewards'}
              </ClaimRewardsButton>
            </>
          )}
        </WinnerSection>
      ) : (
        <NoWinnerMessage>
          All agents were eliminated. There is no winner.
        </NoWinnerMessage>
      )}
      
      <PlayAgainButton onClick={handlePlayAgain}>
        Play Again
      </PlayAgainButton>
    </ResultsContainer>
  );
};

export default GameResults; 