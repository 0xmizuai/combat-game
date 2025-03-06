export interface Agent {
  id: string;
  name: string;
  computePower: number;
  alive: boolean;
  mizuPoolId: string;
  supporters: Record<string, number>;
  totalBets: number;
  challengesCompleted: number;
  lastChallengeTime: number;
  model: string;
  apiKey: string;
}

export interface Challenge {
  id: string;
  questions: string[];
  difficulty: number;
  startTime: number;
  endTime: number | null;
  timeLimit: number;
  responses: Record<string, AgentResponse>;
  winner: string | null;
  evaluated: boolean;
}

export interface AgentResponse {
  agentId: string;
  response: string;
  submittedAt: number;
  score: {
    correctness: number;
    completeness: number;
    total: number;
  } | null;
}

export interface GameState {
  agents: Record<string, Agent>;
  gameStartTime: number;
  lastChallengeTime: number;
  gameActive: boolean;
  currentRound: number;
  currentChallenge: Challenge | null;
  challengeInProgress: boolean;
  difficulty: number;
  winner: string | null;
  challengeHistory: Challenge[];
  gamePhase: 'waiting' | 'preparation' | 'competition' | 'completed' | 'locked';
  waitingPeriodEndTime: number;
  preparationEndTime: number;
  competitionEndTime: number;
  lockoutEndTime: number;
}

export interface MizuPoolStats {
  totalCompute: number;
  activeContributors: number;
  tasksInQueue: number;
}

export interface UserState {
  address: string | null;
  connected: boolean;
  bets: Record<string, number>;
  computeContributions: Record<string, number>;
  rewards: number;
} 