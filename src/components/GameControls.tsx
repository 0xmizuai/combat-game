import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';
import { CONFIG } from '../utils/config';
import { useToast } from '../contexts/ToastContext';
import { validateAPIKey } from '../services/mizuai';
import { formatTime } from '../utils/helpers';

// Styled components
const ControlsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
`;

const Button = styled.button`
  background-color: var(--mizu-color);
  color: white;
  padding: 12px 24px;
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const StartGameButton = styled(Button)`
  background-color: var(--success-color);
  
  &:hover {
    background-color: #3b77db;
  }
`;

const AddAgentButton = styled(Button)`
  background-color: var(--mizu-color);
  
  &:hover {
    background-color: #2d9147;
  }
`;

const Modal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--card-bg);
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h2`
  color: var(--text-color);
  margin-top: 0;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0 20px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  color: var(--text-color);
  font-size: 16px;
  height: 40px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: var(--mizu-color);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin: 10px 0 20px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  color: var(--text-color);
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: var(--mizu-color);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const CancelButton = styled(Button)`
  background-color: #444;
  
  &:hover {
    background-color: #555;
  }
`;

const CreateButton = styled(Button)`
  background-color: var(--mizu-color);
  
  &:hover {
    background-color: #2d9147;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: var(--text-color);
`;

const ErrorMessage = styled.p`
  color: var(--danger-color);
  font-size: 14px;
  margin-top: 5px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-left: 10px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const PhaseIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
`;

const PhaseTitle = styled.h2`
  margin: 0 0 10px 0;
  color: var(--text-color);
`;

const PhaseDescription = styled.p`
  margin: 0 0 10px 0;
  color: var(--text-secondary);
  text-align: center;
`;

const CountdownTimer = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: var(--warning-color);
  margin: 10px 0;
`;

const GameControls: React.FC = () => {
  const { gameState, addAgent, checkGamePhase } = useGame();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [initialBet, setInitialBet] = useState(1); // Default initial bet of 1
  const [isValidating, setIsValidating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  // Update the countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      let targetTime = 0;
      
      if (gameState.gamePhase === 'waiting') {
        targetTime = gameState.waitingPeriodEndTime;
      } else if (gameState.gamePhase === 'preparation') {
        targetTime = gameState.preparationEndTime;
      } else if (gameState.gamePhase === 'competition') {
        targetTime = gameState.competitionEndTime;
      } else if (gameState.gamePhase === 'locked') {
        targetTime = gameState.lockoutEndTime;
      }
      
      const remaining = Math.max(0, targetTime - currentTime);
      setTimeLeft(remaining);
      
      // Check if we need to transition to the next phase
      if (remaining === 0) {
        checkGamePhase();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameState.gamePhase, gameState.waitingPeriodEndTime, gameState.preparationEndTime, gameState.competitionEndTime, gameState.lockoutEndTime]);
  
  const handleAddAgentClick = () => {
    if (gameState.gamePhase !== 'waiting') {
      showToast('Agents can only be added during the waiting period', 'warning');
      return;
    }
    
    if (Object.keys(gameState.agents).length >= CONFIG.maxAgentCount) {
      showToast(`Maximum number of agents (${CONFIG.maxAgentCount}) reached`, 'warning');
      return;
    }
    
    setIsModalOpen(true);
    // Reset form fields
    setAgentName('');
    setApiKey('');
    setModel('');
    setInitialBet(1); // Default initial bet
  };
  
  const handleCreateAgent = async () => {
    if (!apiKey) {
      showToast('MIZU API key is required', 'error');
      return;
    }
    
    if (!model.trim()) {
      showToast('Model name is required', 'error');
      return;
    }
    
    if (!initialBet || initialBet <= 0) {
      showToast('Initial bet is required and must be greater than 0', 'error');
      return;
    }
    
    // Validate API key and model before creating agent
    setIsValidating(true);
    
    try {
      // Using mock validation which always passes
      const isValid = await validateAPIKey(apiKey);
      
      // Create the agent (validation will always pass in mock mode)
      const name = agentName.trim() || undefined; // Use undefined to trigger random name generation
      
      // Add agent with initial bet
      addAgent(name, model, apiKey, initialBet);
      
      // Reset form and close modal
      setAgentName('');
      setApiKey('');
      setModel('');
      setInitialBet(1);
      setIsModalOpen(false);
      
    } catch (error) {
      console.error('Error validating MIZU API key:', error);
      showToast('Error validating MIZU API key', 'error');
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleCancel = () => {
    setIsModalOpen(false);
    setAgentName('');
    setApiKey('');
    setModel('');
    setInitialBet(1);
  };
  
  const renderPhaseInfo = () => {
    switch (gameState.gamePhase) {
      case 'waiting':
        return (
          <PhaseIndicator>
            <PhaseTitle>Waiting Period (1 min)</PhaseTitle>
            <PhaseDescription>
              Quick! Add your agents now. Only 1 minute to join before the preparation phase.
            </PhaseDescription>
            <CountdownTimer>
              Time remaining: {formatTime(timeLeft)}
            </CountdownTimer>
          </PhaseIndicator>
        );
      case 'preparation':
        return (
          <PhaseIndicator>
            <PhaseTitle>Preparation Period (1 min)</PhaseTitle>
            <PhaseDescription>
              Get ready! Competition begins in 1 minute. No new agents can be added.
            </PhaseDescription>
            <CountdownTimer>
              Competition begins in: {formatTime(timeLeft)}
            </CountdownTimer>
          </PhaseIndicator>
        );
      case 'locked':
        return (
          <PhaseIndicator>
            <PhaseTitle>Game Locked (1 min)</PhaseTitle>
            <PhaseDescription>
              No agents were added. Game is locked for 1 minute before a new waiting period.
            </PhaseDescription>
            <CountdownTimer>
              New waiting period begins in: {formatTime(timeLeft)}
            </CountdownTimer>
          </PhaseIndicator>
        );
      case 'competition':
        return (
          <PhaseIndicator>
            <PhaseTitle>Competition in Progress (1 min)</PhaseTitle>
            <PhaseDescription>
              Fast-paced challenge round! Agents have 1 minute to compete. Place your bets quickly!
            </PhaseDescription>
            <CountdownTimer>
              Competition ends in: {formatTime(timeLeft)}
            </CountdownTimer>
          </PhaseIndicator>
        );
      case 'completed':
        return (
          <PhaseIndicator>
            <PhaseTitle>Competition Completed</PhaseTitle>
            <PhaseDescription>
              {gameState.winner 
                ? `The winner is ${gameState.agents[gameState.winner]?.name || 'Unknown Agent'}!` 
                : 'No winner was determined.'}
            </PhaseDescription>
          </PhaseIndicator>
        );
      default:
        return null;
    }
  };
  
  return (
    <>
      {renderPhaseInfo()}
      
      <ControlsContainer>
        <AddAgentButton 
          onClick={handleAddAgentClick}
          disabled={gameState.gamePhase !== 'waiting'}
        >
          Add Agent
        </AddAgentButton>
      </ControlsContainer>
      
      <Modal isOpen={isModalOpen}>
        <ModalContent>
          <ModalTitle>Add New Agent</ModalTitle>
          
          <FormGroup>
            <Label>Agent Name (optional)</Label>
            <Input
              type="text"
              placeholder="Leave blank for random name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>MIZU API Key</Label>
            <Input
              type="password"
              placeholder="Enter your MIZU API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Model</Label>
            <Input
              type="text"
              placeholder="e.g., gpt-3.5-turbo"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Initial Bet (required)</Label>
            <Input
              type="number"
              min="1"
              placeholder="Enter initial bet amount"
              value={initialBet}
              onChange={(e) => setInitialBet(Math.max(1, parseInt(e.target.value) || 0))}
              required
            />
          </FormGroup>
          
          <ModalButtons>
            <CancelButton onClick={handleCancel}>
              Cancel
            </CancelButton>
            <CreateButton 
              onClick={handleCreateAgent}
              disabled={isValidating}
            >
              Create Agent
              {isValidating && <LoadingSpinner />}
            </CreateButton>
          </ModalButtons>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GameControls; 