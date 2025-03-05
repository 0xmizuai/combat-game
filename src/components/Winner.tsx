import React from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';
import { formatNumber } from '../utils/helpers';

const WinnerSection = styled.div<{ visible: boolean }>`
  text-align: center;
  padding: 30px;
  margin-top: 30px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  display: ${props => props.visible ? 'block' : 'none'};
  animation: ${props => props.visible ? 'fadeIn 1s ease-in-out' : 'none'};
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const WinnerDisplay = styled.h2`
  font-size: 2rem;
  margin-bottom: 20px;
  color: var(--success-color);
`;

const WinnerInfo = styled.div`
  margin: 20px 0;
  font-size: 1.2rem;
`;

const ClaimButton = styled.button`
  background-color: var(--warning-color);
  color: black;
  padding: 12px 24px;
  font-size: 1.2rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  margin-top: 20px;
  
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

const Winner: React.FC = () => {
  const { gameState, userState, claimRewards } = useGame();
  const { winner } = gameState;
  
  if (!winner) return null;
  
  const winnerAgent = gameState.agents[winner];
  if (!winnerAgent) return null;
  
  const userBet = userState.bets[winner] || 0;
  const canClaimRewards = userState.connected && userBet > 0;
  
  const handleClaimRewards = async () => {
    await claimRewards();
  };
  
  return (
    <WinnerSection visible={!!winner}>
      <WinnerDisplay>
        🏆 {winnerAgent.name} is the Champion! 🏆
      </WinnerDisplay>
      
      <WinnerInfo>
        <p>
          After completing {winnerAgent.challengesCompleted} challenges, 
          {winnerAgent.name} is the last agent standing!
        </p>
        
        <p>
          Total prize pool: {formatNumber(winnerAgent.totalBets)} tokens
        </p>
        
        {userState.connected && (
          <p>
            Your bet on this agent: {formatNumber(userBet)} tokens
          </p>
        )}
        
        {userState.rewards > 0 && (
          <p>
            Your rewards: {formatNumber(userState.rewards)} tokens
          </p>
        )}
      </WinnerInfo>
      
      {canClaimRewards && userState.rewards === 0 && (
        <ClaimButton onClick={handleClaimRewards}>
          Claim Rewards
        </ClaimButton>
      )}
    </WinnerSection>
  );
};

export default Winner; 