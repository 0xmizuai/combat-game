/**
 * Utility functions for the MIZU Pool Battle Royale game
 */

// List of adjectives for random name generation
const adjectives = [
  'Quantum', 'Neural', 'Cosmic', 'Digital', 'Synthetic', 
  'Atomic', 'Cyber', 'Hyper', 'Nano', 'Mega', 
  'Turbo', 'Stellar', 'Astral', 'Parallel', 'Quantum',
  'Sentient', 'Adaptive', 'Dynamic', 'Recursive', 'Autonomous'
];

// List of nouns for random name generation
const nouns = [
  'Nexus', 'Matrix', 'Cortex', 'Synapse', 'Oracle', 
  'Sentinel', 'Guardian', 'Titan', 'Phoenix', 'Voyager',
  'Explorer', 'Pioneer', 'Navigator', 'Architect', 'Catalyst',
  'Innovator', 'Processor', 'Analyzer', 'Synthesizer', 'Optimizer'
];

/**
 * Generates a random name for an agent by combining an adjective and a noun
 * @returns A randomly generated name
 */
export const generateRandomName = (): string => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
};

/**
 * Formats a timestamp into a readable time string (MM:SS)
 * @param ms Time in milliseconds
 * @returns Formatted time string
 */
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Truncates an Ethereum address for display
 * @param address The full Ethereum address
 * @returns Truncated address (e.g., 0x1234...5678)
 */
export const truncateAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Formats a number with commas as thousands separators
 * @param num The number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Calculates the percentage of a value relative to a total
 * @param value The current value
 * @param total The total value
 * @returns Percentage as a number between 0 and 100
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Generates a random color in hex format
 * @returns Random color as a hex string
 */
export const generateRandomColor = (): string => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
};

/**
 * Delays execution for a specified time
 * @param ms Time to delay in milliseconds
 * @returns Promise that resolves after the specified time
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}; 