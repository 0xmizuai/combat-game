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
}

export interface Challenge {
  id: string;
  agentId: string;
  questions: string[];
  difficulty: number;
  startTime: number;
  endTime: number | null;
  success: boolean | null;
  timeLimit: number;
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