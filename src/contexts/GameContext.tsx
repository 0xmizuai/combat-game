import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState, Agent, Challenge, MizuPoolStats, UserState } from '../types';
import { CONFIG } from '../utils/config';
import { v4 as uuidv4 } from 'uuid';
import * as blockchainService from '../services/blockchain';
import { ToastContext, ToastContextType } from './ToastContext';
import { generateRandomName } from '../utils/helpers';

// Default game state
const initialGameState: GameState = {
  agents: {},
  gameStartTime: 0,
  lastChallengeTime: 0,
  gameActive: false,
  currentRound: 0,
  currentChallenge: null,
  challengeInProgress: false,
  difficulty: CONFIG.initialDifficulty,
  winner: null,
  challengeHistory: [],
};

// Default MIZU Pool stats
const initialMizuPoolStats: MizuPoolStats = {
  totalCompute: 0,
  activeContributors: 0,
  tasksInQueue: 0,
};

// Default user state
const initialUserState: UserState = {
  address: null,
  connected: false,
  bets: {},
  computeContributions: {},
  rewards: 0,
};

// Create the context
interface GameContextType {
  gameState: GameState;
  mizuPoolStats: MizuPoolStats;
  userState: UserState;
  startGame: () => void;
  addAgent: (name?: string) => void;
  contributeCompute: (agentId: string, amount: number) => Promise<void>;
  placeBet: (agentId: string, amount: number) => Promise<void>;
  connectWallet: () => Promise<void>;
  claimRewards: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [mizuPoolStats, setMizuPoolStats] = useState<MizuPoolStats>(initialMizuPoolStats);
  const [userState, setUserState] = useState<UserState>(initialUserState);
  const [gameLoopActive, setGameLoopActive] = useState<boolean>(false);
  const toast = useContext(ToastContext) as ToastContextType;

  // Helper function to show toast if available
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    if (toast && toast.showToast) {
      toast.showToast(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  };

  // Game loop
  useEffect(() => {
    if (!gameState.gameActive || !gameLoopActive) return;

    const currentTime = Date.now();

    // Check if it's time for a new challenge
    if (!gameState.challengeInProgress && 
        currentTime - gameState.lastChallengeTime >= CONFIG.challengeInterval) {
      startNewChallenge();
    }

    // Continue the game loop
    const timerId = setTimeout(() => {
      // Update game state
      setGameState(prevState => ({ ...prevState }));
    }, CONFIG.updateInterval);

    return () => clearTimeout(timerId);
  }, [gameState, gameLoopActive]);

  // Start a new challenge
  const startNewChallenge = () => {
    const aliveAgents = Object.values(gameState.agents).filter(agent => agent.alive);
    
    // If only one agent is left, they are the winner
    if (aliveAgents.length === 1) {
      declareWinner(aliveAgents[0].id);
      return;
    }
    
    // If no agents are left, end the game
    if (aliveAgents.length === 0) {
      endGameWithNoWinner();
      return;
    }
    
    // Select an agent to challenge
    const selectedAgent = selectAgentForChallenge(aliveAgents);
    
    // Create a challenge based on current difficulty
    const challenge = createChallenge(selectedAgent.id, gameState.difficulty);
    
    // Update game state with new challenge
    setGameState(prevState => ({
      ...prevState,
      challengeInProgress: true,
      lastChallengeTime: Date.now(),
      currentRound: prevState.currentRound + 1,
      currentChallenge: challenge,
    }));
    
    showToast(`Agent ${selectedAgent.name} is being challenged!`, 'warning');
    
    // Simulate agent response after a delay
    setTimeout(() => {
      simulateAgentResponse(selectedAgent, challenge);
    }, challenge.timeLimit);
  };

  // Select an agent for the challenge
  const selectAgentForChallenge = (aliveAgents: Agent[]): Agent => {
    // Simple random selection for now
    return aliveAgents[Math.floor(Math.random() * aliveAgents.length)];
  };

  // Create a challenge with questions based on difficulty
  const createChallenge = (agentId: string, difficulty: number): Challenge => {
    // Determine how many questions to ask based on difficulty
    let questionsCount = 1;
    for (const [level, count] of Object.entries(CONFIG.questionsPerChallenge)) {
      if (difficulty >= parseInt(level)) {
        questionsCount = count;
      }
    }
    
    // Generate questions (placeholder)
    const questions = Array(questionsCount).fill(0).map((_, i) => 
      `Question ${i + 1}: Explain how you would solve a complex problem related to AI inference optimization.`
    );
    
    return {
      id: uuidv4(),
      agentId,
      questions,
      difficulty,
      startTime: Date.now(),
      endTime: null,
      success: null,
      timeLimit: CONFIG.challengeTimeLimit,
    };
  };

  // Simulate agent response to a challenge
  const simulateAgentResponse = (agent: Agent, challenge: Challenge) => {
    // Calculate success probability based on agent's compute power and challenge difficulty
    const baseProbability = 0.7; // 70% base chance of success
    const computeFactor = agent.computePower / 100; // Normalize compute power
    const difficultyFactor = challenge.difficulty / CONFIG.maxDifficulty;
    
    // Higher compute power increases success chance, higher difficulty decreases it
    const successProbability = baseProbability + (computeFactor * 0.2) - (difficultyFactor * 0.4);
    
    // Determine if the agent succeeds
    const success = Math.random() < successProbability;
    
    // Update challenge with result
    const updatedChallenge = {
      ...challenge,
      endTime: Date.now(),
      success,
    };
    
    // Update game state
    setGameState(prevState => {
      const updatedAgents = { ...prevState.agents };
      
      if (success) {
        // Agent succeeded - update its stats
        updatedAgents[agent.id] = {
          ...updatedAgents[agent.id],
          challengesCompleted: updatedAgents[agent.id].challengesCompleted + 1,
          lastChallengeTime: Date.now(),
        };
        
        // Increase difficulty if needed
        const newDifficulty = Math.min(
          prevState.difficulty + (prevState.currentRound % 3 === 0 ? 1 : 0),
          CONFIG.maxDifficulty
        );
        
        showToast(`${agent.name} successfully completed the challenge!`, 'success');
        
        return {
          ...prevState,
          agents: updatedAgents,
          challengeInProgress: false,
          currentChallenge: updatedChallenge,
          difficulty: newDifficulty,
          challengeHistory: [...prevState.challengeHistory, updatedChallenge],
        };
      } else {
        // Agent failed - mark it as dead
        updatedAgents[agent.id] = {
          ...updatedAgents[agent.id],
          alive: false,
        };
        
        // Distribute bets from dead agent
        distributeBetsFromDeadAgent(agent.id);
        
        showToast(`${agent.name} failed the challenge and was eliminated!`, 'error');
        
        return {
          ...prevState,
          agents: updatedAgents,
          challengeInProgress: false,
          currentChallenge: updatedChallenge,
          challengeHistory: [...prevState.challengeHistory, updatedChallenge],
        };
      }
    });
  };

  // Distribute bets from a dead agent to remaining agents
  const distributeBetsFromDeadAgent = (deadAgentId: string) => {
    const deadAgent = gameState.agents[deadAgentId];
    if (!deadAgent || deadAgent.totalBets === 0) return;
    
    const aliveAgents = Object.values(gameState.agents).filter(agent => agent.alive && agent.id !== deadAgentId);
    if (aliveAgents.length === 0) return;
    
    const betPerAgent = deadAgent.totalBets / aliveAgents.length;
    
    setGameState(prevState => {
      const updatedAgents = { ...prevState.agents };
      
      aliveAgents.forEach(agent => {
        updatedAgents[agent.id] = {
          ...updatedAgents[agent.id],
          totalBets: updatedAgents[agent.id].totalBets + betPerAgent,
        };
      });
      
      return {
        ...prevState,
        agents: updatedAgents,
      };
    });
  };

  // Declare a winner
  const declareWinner = (winnerId: string) => {
    setGameState(prevState => ({
      ...prevState,
      gameActive: false,
      winner: winnerId,
    }));
    
    const winnerName = gameState.agents[winnerId]?.name || 'Unknown Agent';
    showToast(`${winnerName} is the last agent standing and wins the Battle Royale!`, 'success');
    
    // Finalize game on blockchain
    blockchainService.finalizeGameOnBlockchain(winnerId)
      .catch(error => {
        console.error('Failed to finalize game on blockchain:', error);
        showToast('Failed to record winner on the blockchain', 'error');
      });
  };

  // End game with no winner
  const endGameWithNoWinner = () => {
    setGameState(prevState => ({
      ...prevState,
      gameActive: false,
    }));
    
    showToast('Game over! All agents were eliminated.', 'info');
    
    // Finalize game on blockchain with no winner
    blockchainService.finalizeGameOnBlockchain(null)
      .catch(error => {
        console.error('Failed to finalize game on blockchain:', error);
        showToast('Failed to finalize game on the blockchain', 'error');
      });
  };

  // Start the game
  const startGame = () => {
    // Create initial agents if none exist
    if (Object.keys(gameState.agents).length === 0) {
      createInitialAgents();
    }
    
    setGameState(prevState => ({
      ...prevState,
      gameActive: true,
      gameStartTime: Date.now(),
      lastChallengeTime: Date.now(),
      currentRound: 0,
      difficulty: CONFIG.initialDifficulty,
      winner: null,
      challengeHistory: [],
      currentChallenge: null,
    }));
    
    setGameLoopActive(true);
    
    showToast('Battle Royale has started!', 'info');
    
    // Initialize game on blockchain
    blockchainService.initializeGameOnBlockchain()
      .catch(error => {
        console.error('Failed to initialize game on blockchain:', error);
        showToast('Failed to initialize game on the blockchain', 'error');
      });
  };

  // Create initial agents
  const createInitialAgents = () => {
    const initialAgents: Record<string, Agent> = {};
    
    for (let i = 0; i < CONFIG.initialAgentCount; i++) {
      const id = uuidv4();
      initialAgents[id] = {
        id,
        name: generateRandomName(),
        computePower: 100 + Math.floor(Math.random() * 100), // Random initial compute power
        alive: true,
        mizuPoolId: `pool-${id.slice(0, 8)}`,
        supporters: {},
        totalBets: 0,
        challengesCompleted: 0,
        lastChallengeTime: 0,
      };
    }
    
    setGameState(prevState => ({
      ...prevState,
      agents: initialAgents,
    }));
    
    showToast(`Created ${CONFIG.initialAgentCount} initial agents`, 'info');
  };

  // Add a new agent
  const addAgent = (name?: string) => {
    const currentAgentCount = Object.keys(gameState.agents).length;
    
    if (currentAgentCount >= CONFIG.maxAgentCount) {
      showToast('Maximum agent count reached', 'warning');
      return;
    }
    
    const id = uuidv4();
    const agentName = name || generateRandomName();
    
    const newAgent: Agent = {
      id,
      name: agentName,
      computePower: 100 + Math.floor(Math.random() * 100), // Random initial compute power
      alive: true,
      mizuPoolId: `pool-${id.slice(0, 8)}`,
      supporters: {},
      totalBets: 0,
      challengesCompleted: 0,
      lastChallengeTime: 0,
    };
    
    setGameState(prevState => ({
      ...prevState,
      agents: {
        ...prevState.agents,
        [id]: newAgent,
      },
    }));
    
    showToast(`Agent ${agentName} has been created`, 'success');
    
    // Create agent on blockchain
    if (userState.address) {
      blockchainService.createAgentOnBlockchain(id, agentName, newAgent.mizuPoolId, userState.address)
        .catch(error => {
          console.error('Failed to create agent on blockchain:', error);
          showToast('Failed to create agent on the blockchain', 'error');
        });
    }
  };

  // Contribute compute to an agent
  const contributeCompute = async (agentId: string, amount: number) => {
    if (!userState.address) {
      showToast('Wallet not connected', 'warning');
      return;
    }
    
    if (!gameState.agents[agentId]) {
      showToast('Agent not found', 'error');
      return;
    }
    
    // Update agent's compute power
    setGameState(prevState => {
      const updatedAgents = { ...prevState.agents };
      const agent = updatedAgents[agentId];
      
      // Update supporters list
      const supporters = { ...agent.supporters };
      supporters[userState.address!] = (supporters[userState.address!] || 0) + amount;
      
      updatedAgents[agentId] = {
        ...agent,
        computePower: agent.computePower + amount,
        supporters,
      };
      
      return {
        ...prevState,
        agents: updatedAgents,
      };
    });
    
    // Update user's compute contributions
    setUserState(prevState => {
      const contributions = { ...prevState.computeContributions };
      contributions[agentId] = (contributions[agentId] || 0) + amount;
      
      return {
        ...prevState,
        computeContributions: contributions,
      };
    });
    
    const agentName = gameState.agents[agentId]?.name || 'Unknown Agent';
    showToast(`Contributed ${amount} compute to ${agentName}`, 'success');
    
    // Update compute contribution on blockchain
    blockchainService.updateComputeContributionOnBlockchain(agentId, userState.address, amount)
      .catch(error => {
        console.error('Failed to update compute contribution on blockchain:', error);
        showToast('Failed to record compute contribution on the blockchain', 'error');
      });
    
    // Update MIZU Pool stats
    setMizuPoolStats(prevState => ({
      ...prevState,
      totalCompute: prevState.totalCompute + amount,
      activeContributors: prevState.activeContributors + (userState.computeContributions[agentId] ? 0 : 1),
    }));
  };

  // Place a bet on an agent
  const placeBet = async (agentId: string, amount: number) => {
    if (!userState.address) {
      showToast('Wallet not connected', 'warning');
      return;
    }
    
    if (!gameState.agents[agentId]) {
      showToast('Agent not found', 'error');
      return;
    }
    
    // Update agent's total bets
    setGameState(prevState => {
      const updatedAgents = { ...prevState.agents };
      const agent = updatedAgents[agentId];
      
      updatedAgents[agentId] = {
        ...agent,
        totalBets: agent.totalBets + amount,
      };
      
      return {
        ...prevState,
        agents: updatedAgents,
      };
    });
    
    // Update user's bets
    setUserState(prevState => {
      const bets = { ...prevState.bets };
      bets[agentId] = (bets[agentId] || 0) + amount;
      
      return {
        ...prevState,
        bets,
      };
    });
    
    const agentName = gameState.agents[agentId]?.name || 'Unknown Agent';
    showToast(`Placed a bet of ${amount} on ${agentName}`, 'success');
    
    // Record bet on blockchain
    blockchainService.recordBetOnBlockchain(agentId, userState.address, amount)
      .catch(error => {
        console.error('Failed to record bet on blockchain:', error);
        showToast('Failed to record bet on the blockchain', 'error');
      });
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      const address = await blockchainService.connectWallet();
      
      setUserState(prevState => ({
        ...prevState,
        address,
        connected: true,
      }));
      
      showToast('Wallet connected successfully', 'success');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      showToast('Failed to connect wallet', 'error');
    }
  };

  // Claim rewards
  const claimRewards = async () => {
    if (!userState.address || !gameState.winner) {
      showToast('Cannot claim rewards: wallet not connected or no winner', 'warning');
      return;
    }
    
    // Check if user bet on the winner
    const winnerBet = userState.bets[gameState.winner] || 0;
    if (winnerBet === 0) {
      showToast('No bets placed on the winner', 'warning');
      return;
    }
    
    try {
      // Claim rewards from blockchain
      const rewards = await blockchainService.claimRewardsOnBlockchain(userState.address);
      
      setUserState(prevState => ({
        ...prevState,
        rewards,
      }));
      
      showToast(`Claimed ${rewards} rewards!`, 'success');
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      showToast('Failed to claim rewards', 'error');
    }
  };

  // Context value
  const value = {
    gameState,
    mizuPoolStats,
    userState,
    startGame,
    addAgent,
    contributeCompute,
    placeBet,
    connectWallet,
    claimRewards,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 