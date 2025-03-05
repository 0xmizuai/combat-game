import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';
import { useToast } from '../contexts/ToastContext';
import { CONFIG } from '../utils/config';

const ControlsContainer = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Button = styled.button`
  padding: 12px 30px;
  font-size: 1.2rem;
  margin: 10px;
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

const StartGameButton = styled(Button)`
  background-color: var(--success-color);
  color: white;
  
  &:hover {
    background-color: #3b77db;
  }
`;

const AddAgentButton = styled(Button)`
  background-color: var(--mizu-color);
  color: white;
  
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
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
`;

const ModalTitle = styled.h2`
  margin-top: 0;
  color: var(--mizu-color);
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 10px 0 20px 0;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #2a2a2a;
  color: white;
  font-size: 1rem;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const CancelButton = styled(Button)`
  background-color: #555;
  color: white;
  padding: 8px 16px;
  font-size: 1rem;
  
  &:hover {
    background-color: #666;
  }
`;

const CreateButton = styled(Button)`
  background-color: var(--mizu-color);
  color: white;
  padding: 8px 16px;
  font-size: 1rem;
`;

const GameControls: React.FC = () => {
  const { startGame, addAgent, gameState } = useGame();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agentName, setAgentName] = useState('');
  
  const handleStartGame = () => {
    if (Object.keys(gameState.agents).length === 0) {
      showToast('You need to add at least one agent to start the game', 'warning');
      return;
    }
    startGame();
    showToast('Battle Royale has begun!', 'info');
  };
  
  const handleAddAgentClick = () => {
    if (gameState.gameActive) {
      showToast('Cannot add agents while the game is active', 'warning');
      return;
    }
    
    if (Object.keys(gameState.agents).length >= CONFIG.maxAgentCount) {
      showToast(`Maximum number of agents (${CONFIG.maxAgentCount}) reached`, 'warning');
      return;
    }
    
    setIsModalOpen(true);
  };
  
  const handleCreateAgent = () => {
    if (agentName.trim()) {
      addAgent(agentName.trim());
      showToast(`Agent "${agentName.trim()}" has been created`, 'success');
    } else {
      addAgent(); // Use random name
      showToast('New agent has been created with a random name', 'success');
    }
    setAgentName('');
    setIsModalOpen(false);
  };
  
  const handleCancel = () => {
    setAgentName('');
    setIsModalOpen(false);
  };
  
  const agentCount = Object.keys(gameState.agents).length;
  
  return (
    <>
      <ControlsContainer>
        {!gameState.gameActive && (
          <StartGameButton 
            onClick={handleStartGame}
            disabled={agentCount === 0}
          >
            Start Battle Royale
          </StartGameButton>
        )}
        
        <AddAgentButton 
          onClick={handleAddAgentClick}
          disabled={gameState.gameActive || agentCount >= CONFIG.maxAgentCount}
        >
          Add Agent
        </AddAgentButton>
      </ControlsContainer>
      
      <Modal isOpen={isModalOpen}>
        <ModalContent>
          <ModalTitle>Create New Agent</ModalTitle>
          <p>Enter a name for your new agent or leave blank for a random name.</p>
          
          <label htmlFor="agent-name">Agent Name</label>
          <Input
            id="agent-name"
            type="text"
            placeholder="Enter agent name"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
          />
          
          <ModalButtons>
            <CancelButton onClick={handleCancel}>
              Cancel
            </CancelButton>
            <CreateButton onClick={handleCreateAgent}>
              Create Agent
            </CreateButton>
          </ModalButtons>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GameControls; 