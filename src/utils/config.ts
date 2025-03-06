export const CONFIG = {
  // Game parameters
  challengeInterval: 15000, // 15 seconds between challenges (in ms)
  initialAgentCount: 6, // Number of agents at the start
  maxAgentCount: 8, // Maximum number of agents allowed
  
  // Epoch parameters
  waitingPeriodDuration: 60000, // 1 minute waiting period (in ms)
  preparationPeriodDuration: 60000, // 1 minute preparation period (in ms)
  competitionDuration: 60000, // 1 minute competition period (in ms)
  lockoutPeriodDuration: 60000, // 1 minute lockout period if no agents added (in ms)
  
  // Challenge parameters
  initialDifficulty: 1, // Starting difficulty level
  maxDifficulty: 10, // Maximum difficulty level
  questionsPerChallenge: {
    // Maps difficulty level to number of questions
    1: 1, // Level 1: 1 question
    3: 2, // Level 3: 2 questions
    5: 3, // Level 5: 3 questions
    7: 4, // Level 7: 4 questions
    9: 5, // Level 9: 5 questions
  },
  
  // MIZU Pool integration
  mizuPoolContractAddress: import.meta.env.VITE_MIZU_POOL_CONTRACT || "0x0000000000000000000000000000000000000000",
  gameContractAddress: import.meta.env.VITE_GAME_CONTRACT || "0x0000000000000000000000000000000000000000",
  developmentMode: import.meta.env.VITE_DEVELOPMENT_MODE === "true",
  
  // UI Settings
  updateInterval: 1000, // ms between UI updates
  
  // Challenge time limits (in ms)
  challengeTimeLimit: 20000, // 20 seconds
  
  // Colors
  colors: {
    mizuColor: "#34a853",
    dangerColor: "#ea4335",
    successColor: "#4285f4",
    warningColor: "#fbbc05",
    darkBg: "#121212",
    cardBg: "#1e1e1e",
    textColor: "#ffffff",
    textSecondary: "#b0b0b0",
  }
}; 