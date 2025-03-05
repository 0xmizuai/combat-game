import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Agent as AgentType } from '../types';
import { truncateAddress, formatNumber } from '../utils/helpers';
import { useGame } from '../contexts/GameContext';
import { useToast } from '../contexts/ToastContext';

interface AgentProps {
  agent: AgentType;
}

const AgentCard = styled.div<{ alive: boolean }>`
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: var(--card-bg);
  position: relative;
  overflow: hidden;
  border-top: 4px solid ${props => props.alive ? 'var(--success-color)' : 'var(--danger-color)'};
  opacity: ${props => props.alive ? 1 : 0.7};
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
`;

const AgentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const AgentName = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const StatusBadge = styled.span<{ alive: boolean }>`
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: ${props => props.alive ? 'var(--success-color)' : 'var(--danger-color)'};
  color: white;
`;

const Stats = styled.div`
  margin: 20px 0;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SupportersList = styled.div`
  margin-top: 20px;
`;

const SupportersTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 10px;
  color: var(--text-secondary);
`;

const SupportersList_UL = styled.ul`
  padding-left: 20px;
  margin: 0;
  color: var(--text-secondary);
  
  li {
    margin-bottom: 5px;
    font-size: 0.9rem;
  }
`;

const Actions = styled.div`
  margin-top: 20px;
`;

const ActionGroup = styled.div`
  margin-bottom: 15px;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 5px;
`;

const ActionTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 10px;
  color: var(--text-secondary);
`;

const ActionInputs = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #2a2a2a;
  color: white;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  
  &:hover {
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

const ContributeButton = styled(Button)`
  background-color: var(--mizu-color);
  color: white;
  
  &:hover {
    background-color: #2d9147;
  }
`;

const BetButton = styled(Button)`
  background-color: var(--warning-color);
  color: black;
  
  &:hover {
    background-color: #e0a800;
  }
`;

const Agent: React.FC<AgentProps> = ({ agent }) => {
  const { contributeCompute, placeBet, userState, gameState } = useGame();
  const { showToast } = useToast();
  const [computeAmount, setComputeAmount] = useState<number>(10);
  const [betAmount, setBetAmount] = useState<number>(10);
  
  const handleContribute = async () => {
    if (!userState.connected) {
      showToast('Please connect your wallet first', 'warning');
      return;
    }
    
    if (!agent.alive) {
      showToast('Cannot contribute to eliminated agents', 'error');
      return;
    }
    
    if (computeAmount <= 0) {
      showToast('Please enter a valid amount', 'warning');
      return;
    }
    
    try {
      await contributeCompute(agent.id, computeAmount);
    } catch {
      showToast('Failed to contribute compute. Please try again.', 'error');
    }
  };
  
  const handleBet = async () => {
    if (!userState.connected) {
      showToast('Please connect your wallet first', 'warning');
      return;
    }
    
    if (!agent.alive) {
      showToast('Cannot bet on eliminated agents', 'error');
      return;
    }
    
    if (betAmount <= 0) {
      showToast('Please enter a valid amount', 'warning');
      return;
    }
    
    try {
      await placeBet(agent.id, betAmount);
    } catch {
      showToast('Failed to place bet. Please try again.', 'error');
    }
  };
  
  // Get top supporters (up to 5)
  const topSupporters = Object.entries(agent.supporters)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  
  return (
    <AgentCard alive={agent.alive}>
      <AgentHeader>
        <AgentName>{agent.name}</AgentName>
        <StatusBadge alive={agent.alive}>
          {agent.alive ? 'ALIVE' : 'ELIMINATED'}
        </StatusBadge>
      </AgentHeader>
      
      <Stats>
        <StatRow>
          <div>Compute Power</div>
          <div>{formatNumber(agent.computePower)}</div>
        </StatRow>
        <StatRow>
          <div>Total Bets</div>
          <div>{formatNumber(agent.totalBets)}</div>
        </StatRow>
        <StatRow>
          <div>Challenges Completed</div>
          <div>{agent.challengesCompleted}</div>
        </StatRow>
        <StatRow>
          <div>MIZU Pool ID</div>
          <div>{agent.mizuPoolId}</div>
        </StatRow>
      </Stats>
      
      {topSupporters.length > 0 && (
        <SupportersList>
          <SupportersTitle>Top Supporters</SupportersTitle>
          <SupportersList_UL>
            {topSupporters.map(([address, amount]) => (
              <li key={address}>
                {truncateAddress(address)}: {formatNumber(amount)} compute
              </li>
            ))}
          </SupportersList_UL>
        </SupportersList>
      )}
      
      {agent.alive && gameState.gameActive && (
        <Actions>
          <ActionGroup>
            <ActionTitle>Contribute Compute</ActionTitle>
            <ActionInputs>
              <Input
                type="number"
                min="1"
                value={computeAmount}
                onChange={(e) => setComputeAmount(parseInt(e.target.value) || 0)}
              />
            </ActionInputs>
            <ActionButtons>
              <ContributeButton 
                onClick={handleContribute}
                disabled={!userState.connected}
              >
                Contribute
              </ContributeButton>
            </ActionButtons>
          </ActionGroup>
          
          <ActionGroup>
            <ActionTitle>Place Bet</ActionTitle>
            <ActionInputs>
              <Input
                type="number"
                min="1"
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
              />
            </ActionInputs>
            <ActionButtons>
              <BetButton 
                onClick={handleBet}
                disabled={!userState.connected}
              >
                Place Bet
              </BetButton>
            </ActionButtons>
          </ActionGroup>
        </Actions>
      )}
    </AgentCard>
  );
};

export default Agent; 