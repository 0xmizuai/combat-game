import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { GameState, Agent, Challenge, MizuPoolStats, UserState, AgentResponse } from '../types';
import { CONFIG } from '../utils/config';
import { v4 as uuidv4 } from 'uuid';
import * as blockchainService from '../services/blockchain';
import { ToastContext, ToastContextType } from './ToastContext';
import { generateRandomName, delay } from '../utils/helpers';
import { useToast } from './ToastContext';
import { performInference } from '../services/mizuai';

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
  gamePhase: 'waiting',
  waitingPeriodEndTime: 0,
  preparationEndTime: 0,
  competitionEndTime: 0,
  lockoutEndTime: 0,
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
  addAgent: (name?: string, model?: string, apiKey?: string, initialBet?: number) => void;
  contributeCompute: (agentId: string, amount: number) => Promise<void>;
  placeBet: (agentId: string, amount: number) => Promise<void>;
  connectWallet: () => Promise<void>;
  claimRewards: () => Promise<void>;
  checkGamePhase: () => void;
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

  // Initialize the game when the component mounts
  useEffect(() => {
    initializeWaitingPeriod();
  }, []);

  // Check game phase periodically
  useEffect(() => {
    const checkPhaseInterval = setInterval(() => {
      checkGamePhase();
    }, CONFIG.updateInterval);

    return () => clearInterval(checkPhaseInterval);
  }, [gameState.gamePhase, gameState.waitingPeriodEndTime, gameState.competitionEndTime]);

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
    
    // Create a challenge for all agents based on current difficulty
    const challenge = generateChallenge(gameState.difficulty);
    
    // Update game state with new challenge
    setGameState(prevState => ({
      ...prevState,
      challengeInProgress: true,
      lastChallengeTime: Date.now(),
      currentRound: prevState.currentRound + 1,
      currentChallenge: challenge,
    }));
    
    showToast(`New challenge posted! All agents must respond within the time limit.`, 'warning');
    
    // Set a timeout to evaluate responses after the time limit
    setTimeout(() => {
      evaluateResponses(challenge);
    }, challenge.timeLimit);
  };

  // Generate a challenge for all agents
  const generateChallenge = (difficulty: number): Challenge => {
    // Determine number of questions based on difficulty
    let questionsCount = 1; // Default to 1 question
    
    // Find the closest difficulty level in the config
    const difficultyLevels = [1, 3, 5, 7, 9]; // Hardcoded levels from CONFIG.questionsPerChallenge
    
    for (let i = difficultyLevels.length - 1; i >= 0; i--) {
      if (difficulty >= difficultyLevels[i]) {
        const level = difficultyLevels[i] as 1 | 3 | 5 | 7 | 9;
        questionsCount = CONFIG.questionsPerChallenge[level];
        break;
      }
    }
    
    // Generate questions (placeholder)
    const questions = Array(questionsCount).fill(0).map((_, i) => 
      `Question ${i + 1}: Explain how you would solve a complex problem related to AI inference optimization.`
    );
    
    return {
      id: uuidv4(),
      questions,
      difficulty,
      startTime: Date.now(),
      endTime: null,
      timeLimit: CONFIG.challengeTimeLimit,
      responses: {},
      winner: null,
      evaluated: false
    };
  };

  // Process agent response to a challenge
  const submitAgentResponse = async (agentId: string, challenge: Challenge, responseText: string) => {
    try {
      // Create the agent response object
      const agentResponse: AgentResponse = {
        agentId,
        response: responseText,
        submittedAt: Date.now(),
        score: null
      };
      
      // Update the challenge with the new response
      setGameState(prevState => {
        if (!prevState.currentChallenge) return prevState;
        
        const updatedResponses = {
          ...prevState.currentChallenge.responses,
          [agentId]: agentResponse
        };
        
        const updatedChallenge = {
          ...prevState.currentChallenge,
          responses: updatedResponses
        };
        
        return {
          ...prevState,
          currentChallenge: updatedChallenge
        };
      });
      
      // Check if all alive agents have responded
      const aliveAgents = Object.values(gameState.agents).filter(agent => agent.alive);
      const allResponded = aliveAgents.every(agent => 
        gameState.currentChallenge?.responses[agent.id] !== undefined
      );
      
      // If all agents have responded, evaluate the responses immediately
      if (allResponded && gameState.currentChallenge) {
        evaluateResponses(gameState.currentChallenge);
      }
      
      showToast(`Agent ${gameState.agents[agentId].name} has submitted a response!`, 'info');
    } catch (error) {
      console.error('Error submitting agent response:', error);
      showToast('Failed to submit agent response', 'error');
    }
  };

  // Simulate responses from agents with API keys
  const simulateAgentResponse = async (agent: Agent, challenge: Challenge) => {
    try {
      // If agent has API key and model, use MIZU API for inference
      if (agent.apiKey && agent.model) {
        // Prepare the prompt for the model
        const prompt = `You are an AI agent named ${agent.name} participating in the MIZU Pool Battle Royale.
You need to answer the following questions to survive:

${challenge.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Please provide brief, concise answers to each question.`;

        // Perform inference using MIZU API
        const response = await performInference(agent.model, agent.apiKey, prompt);
        
        // Submit the response
        await submitAgentResponse(agent.id, challenge, response);
      } else {
        // If no API key or model, generate a placeholder response
        const placeholderResponse = `[Simulated response from ${agent.name}]\n\n` + 
          challenge.questions.map((q, i) => 
            `Answer to Question ${i + 1}: This is a simulated response based on compute power.`
          ).join('\n\n');
        
        // Add a very short random delay to simulate quick thinking time
        // For the fast-paced game, responses should come in quickly
        const delay = Math.random() * (challenge.timeLimit * 0.5);
        setTimeout(() => {
          submitAgentResponse(agent.id, challenge, placeholderResponse);
        }, delay);
      }
    } catch (error) {
      console.error('Error simulating agent response:', error);
      showToast(`Failed to generate response for ${agent.name}`, 'error');
    }
  };

  // Evaluate all agent responses and determine the winner
  const evaluateResponses = (challenge: Challenge) => {
    // If the challenge has already been evaluated, do nothing
    if (challenge.evaluated) return;
    
    const aliveAgents = Object.values(gameState.agents).filter(agent => agent.alive);
    
    // Get all responses
    const responses = Object.values(challenge.responses);
    
    // If no responses, eliminate all agents
    if (responses.length === 0) {
      aliveAgents.forEach(agent => {
        setGameState(prevState => {
          const updatedAgents = { ...prevState.agents };
          updatedAgents[agent.id] = {
            ...agent,
            alive: false,
            lastChallengeTime: Date.now(),
          };
          
          return {
            ...prevState,
            agents: updatedAgents
          };
        });
        
        showToast(`${agent.name} failed to respond and was eliminated!`, 'error');
      });
      
      // End the challenge
      endChallenge(challenge, null);
      return;
    }
    
    // Score each response (in a real implementation, this would use GPT to evaluate)
    const scoredResponses: Record<string, AgentResponse> = {};
    
    responses.forEach(response => {
      const agent = gameState.agents[response.agentId];
      
      // Calculate scores based on agent's compute power (simulating evaluation)
      const computeFactor = agent.computePower / 100; // Normalize compute power
      const difficultyFactor = challenge.difficulty / CONFIG.maxDifficulty;
      
      // Base scores with some randomness
      const correctnessBase = 0.7 + (computeFactor * 0.2) - (difficultyFactor * 0.3);
      const completenessBase = 0.6 + (computeFactor * 0.3) - (difficultyFactor * 0.2);
      
      // Add randomness
      const correctness = Math.min(1, Math.max(0, correctnessBase + (Math.random() * 0.2 - 0.1)));
      const completeness = Math.min(1, Math.max(0, completenessBase + (Math.random() * 0.2 - 0.1)));
      
      // Calculate total score with correctness weighted higher (0.7 vs 0.3)
      const total = (correctness * 0.7) + (completeness * 0.3);
      
      // Update the response with scores
      scoredResponses[response.agentId] = {
        ...response,
        score: {
          correctness: parseFloat(correctness.toFixed(2)),
          completeness: parseFloat(completeness.toFixed(2)),
          total: parseFloat(total.toFixed(2))
        }
      };
    });
    
    // Find the winner (agent with highest total score)
    let winnerId: string | null = null;
    let highestScore = -1;
    
    Object.values(scoredResponses).forEach(response => {
      if (response.score && response.score.total > highestScore) {
        highestScore = response.score.total;
        winnerId = response.agentId;
      }
    });
    
    // Eliminate agents who didn't respond or scored below threshold
    const eliminationThreshold = 0.5; // Agents with scores below 0.5 are eliminated
    
    aliveAgents.forEach(agent => {
      const response = scoredResponses[agent.id];
      const shouldEliminate = !response || 
                             (response.score && response.score.total < eliminationThreshold);
      
      if (shouldEliminate) {
        setGameState(prevState => {
          const updatedAgents = { ...prevState.agents };
          updatedAgents[agent.id] = {
            ...agent,
            alive: false,
            lastChallengeTime: Date.now(),
          };
          
          return {
            ...prevState,
            agents: updatedAgents
          };
        });
        
        const reason = !response ? 'failed to respond' : 'scored too low';
        showToast(`${agent.name} ${reason} and was eliminated!`, 'error');
        
        // Distribute bets from the dead agent
        distributeBetsFromDeadAgent(agent.id);
      } else {
        // Update agent with successful challenge completion
        setGameState(prevState => {
          const updatedAgents = { ...prevState.agents };
          updatedAgents[agent.id] = {
            ...agent,
            challengesCompleted: agent.challengesCompleted + 1,
            lastChallengeTime: Date.now(),
          };
          
          return {
            ...prevState,
            agents: updatedAgents
          };
        });
      }
    });
    
    // End the challenge with the winner
    endChallenge(challenge, winnerId);
  };

  // End the current challenge and update game state
  const endChallenge = (challenge: Challenge, winnerId: string | null) => {
    const updatedChallenge = {
      ...challenge,
      endTime: Date.now(),
      winner: winnerId,
      evaluated: true
    };
    
    // Update game state
    setGameState(prevState => {
      // Add the challenge to history
      const updatedChallengeHistory = [...prevState.challengeHistory, updatedChallenge];
      
      // Check if there's only one agent left alive
      const aliveAgents = Object.values(prevState.agents).filter(a => a.alive);
      if (aliveAgents.length === 1) {
        // Declare the last agent as the winner
        declareWinner(aliveAgents[0].id);
      } else if (aliveAgents.length === 0) {
        // No winners
        endGameWithNoWinner();
      }
      
      return {
        ...prevState,
        currentChallenge: updatedChallenge,
        challengeInProgress: false,
        challengeHistory: updatedChallengeHistory,
      };
    });
    
    if (winnerId) {
      showToast(`${gameState.agents[winnerId].name} had the best response and won this challenge!`, 'success');
    } else {
      showToast('Challenge ended with no winner', 'warning');
    }
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
      gamePhase: 'completed',
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
      gamePhase: 'completed',
    }));
    
    showToast('Game over! All agents were eliminated or time has expired.', 'info');
    
    // Finalize game on blockchain with no winner
    blockchainService.finalizeGameOnBlockchain(null)
      .catch(error => {
        console.error('Failed to finalize game on blockchain:', error);
        showToast('Failed to finalize game on the blockchain', 'error');
      });
  };

  // Check game phase
  const checkGamePhase = () => {
    const currentTime = Date.now();
    
    if (gameState.gamePhase === 'waiting') {
      // Check if waiting period has ended
      if (currentTime >= gameState.waitingPeriodEndTime) {
        // If no agents were added during waiting period, enter lockout phase
        if (Object.keys(gameState.agents).length === 0) {
          enterLockoutPhase();
        } else {
          // Otherwise, enter preparation phase
          enterPreparationPhase();
        }
      }
    } else if (gameState.gamePhase === 'preparation') {
      // Check if preparation period has ended
      if (currentTime >= gameState.preparationEndTime) {
        startGame();
      }
    } else if (gameState.gamePhase === 'locked') {
      // Check if lockout period has ended
      if (currentTime >= gameState.lockoutEndTime) {
        // Start a new waiting period
        initializeWaitingPeriod();
      }
    } else if (gameState.gamePhase === 'competition') {
      // Check if competition has ended
      if (currentTime >= gameState.competitionEndTime) {
        endGameWithNoWinner();
      }
    }
  };

  // Enter lockout phase
  const enterLockoutPhase = () => {
    const currentTime = Date.now();
    
    setGameState(prevState => ({
      ...prevState,
      gamePhase: 'locked',
      lockoutEndTime: currentTime + CONFIG.lockoutPeriodDuration,
    }));
    
    showToast('No agents were added. Game is locked for a short period before starting a new waiting period.', 'warning');
    
    // Log the lockout event
    console.log('Game entered lockout phase until', new Date(currentTime + CONFIG.lockoutPeriodDuration).toLocaleString());
  };

  // Enter preparation phase
  const enterPreparationPhase = () => {
    const currentTime = Date.now();
    
    setGameState(prevState => ({
      ...prevState,
      gamePhase: 'preparation',
      preparationEndTime: currentTime + CONFIG.preparationPeriodDuration,
    }));
    
    showToast('Waiting period has ended. Preparation phase has begun. No new agents can be added.', 'info');
    
    // Record preparation phase on blockchain
    blockchainService.recordPreparationPhaseOnBlockchain()
      .catch(error => {
        console.error('Failed to record preparation phase on blockchain:', error);
        showToast('Failed to record preparation phase on the blockchain', 'error');
      });
  };

  // Initialize the waiting period
  const initializeWaitingPeriod = async () => {
    try {
      // Get the epoch times from the blockchain
      const epochTimes = await blockchainService.getEpochTimesFromBlockchain();
      
      setGameState(prevState => ({
        ...prevState,
        gamePhase: 'waiting',
        waitingPeriodEndTime: epochTimes.waitingPeriodEnd,
        preparationEndTime: 0, // Reset preparation end time
        competitionEndTime: epochTimes.competitionEnd,
        lockoutEndTime: 0, // Reset lockout end time
        gameActive: false,
      }));
      
      showToast('Waiting period has started. Add your agents before the competition begins!', 'info');
    } catch (error) {
      console.error('Failed to initialize waiting period:', error);
      showToast('Failed to get epoch times from the blockchain', 'error');
      
      // Fallback to local times if blockchain fails
      const currentTime = Date.now();
      setGameState(prevState => ({
        ...prevState,
        gamePhase: 'waiting',
        waitingPeriodEndTime: currentTime + CONFIG.waitingPeriodDuration,
        preparationEndTime: 0, // Reset preparation end time
        competitionEndTime: currentTime + CONFIG.waitingPeriodDuration + CONFIG.preparationPeriodDuration + CONFIG.competitionDuration,
        lockoutEndTime: 0, // Reset lockout end time
        gameActive: false,
      }));
    }
  };

  // Start the game (transition from waiting to competition)
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
      gamePhase: 'competition',
    }));
    
    setGameLoopActive(true);
    
    showToast('Competition phase has started! Agents will now face challenges.', 'info');
    
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
        model: 'gpt-3.5-turbo', // Default model
        apiKey: '', // Empty API key for initial agents
      };
    }
    
    setGameState(prevState => ({
      ...prevState,
      agents: initialAgents,
    }));
    
    showToast(`Created ${CONFIG.initialAgentCount} initial agents`, 'info');
  };

  // Add a new agent
  const addAgent = (name?: string, model?: string, apiKey?: string, initialBet: number = 0) => {
    // Only allow adding agents during the waiting period
    if (gameState.gamePhase !== 'waiting') {
      showToast('Agents can only be added during the waiting period', 'warning');
      return;
    }
    
    const currentAgentCount = Object.keys(gameState.agents).length;
    
    if (currentAgentCount >= CONFIG.maxAgentCount) {
      showToast('Maximum agent count reached', 'warning');
      return;
    }
    
    // Check if wallet is connected for placing initial bet
    if (initialBet > 0 && !userState.address) {
      showToast('Wallet must be connected to place initial bet', 'warning');
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
      totalBets: initialBet, // Set initial bet
      challengesCompleted: 0,
      lastChallengeTime: 0,
      model: model || 'gpt-3.5-turbo', // Default model if not provided
      apiKey: apiKey || '', // Empty string if not provided
    };
    
    setGameState(prevState => ({
      ...prevState,
      agents: {
        ...prevState.agents,
        [id]: newAgent,
      },
    }));
    
    // If there's an initial bet, update the user's bets
    if (initialBet > 0 && userState.address) {
      // Update user's bets
      setUserState(prevState => {
        const bets = { ...prevState.bets };
        bets[id] = initialBet;
        
        return {
          ...prevState,
          bets,
        };
      });
      
      // Place bet on blockchain
      blockchainService.placeBetOnBlockchain(id, initialBet)
        .then(success => {
          if (!success) {
            showToast('Initial bet blockchain transaction failed, but agent was created', 'warning');
          } else {
            // Record bet in our backend tracking
            const address = userState.address;
            if (address) {
              blockchainService.recordBetOnBlockchain(id, address, initialBet)
                .catch(error => {
                  console.error('Failed to record initial bet in backend:', error);
                });
            }
          }
        })
        .catch(error => {
          console.error('Failed to place initial bet:', error);
          showToast('Failed to place initial bet, but agent was created', 'warning');
        });
    }
    
    showToast(`Agent ${agentName} has been created${initialBet > 0 ? ` with an initial bet of ${initialBet}` : ''}`, 'success');
    
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
    
    try {
      // Place bet on blockchain first
      const success = await blockchainService.placeBetOnBlockchain(agentId, amount);
      
      if (!success) {
        showToast('Blockchain transaction failed', 'error');
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
      
      // Record bet in our backend tracking (separate from the blockchain transaction)
      blockchainService.recordBetOnBlockchain(agentId, userState.address, amount)
        .catch(error => {
          console.error('Failed to record bet in backend:', error);
          // Don't show toast here since the blockchain transaction was successful
        });
    } catch (error) {
      console.error('Failed to place bet:', error);
      showToast('Failed to place bet. Please check your wallet and try again.', 'error');
    }
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
    checkGamePhase,
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