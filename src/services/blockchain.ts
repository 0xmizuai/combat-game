import { CONFIG } from '../utils/config';
import { GameState } from '../types';
import { getAccount, getPublicClient, getWalletClient } from 'wagmi/actions';
import { config } from '../contexts/WalletContext';
import { parseEther } from 'viem';

// Contract ABI for the bet function
const BET_FUNCTION_ABI = [
  {
    name: 'bet',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'amount',
        type: 'uint256'
      }
    ],
    outputs: [
      {
        name: 'success',
        type: 'bool'
      }
    ]
  }
];

// This is a placeholder service for future blockchain integration
// In a real implementation, this would connect to actual smart contracts

// Connect to wallet
export const connectWallet = async (): Promise<string> => {
  try {
    if (CONFIG.developmentMode) {
      console.log('Development mode: Using mock wallet address');
      return '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    }
    
    // Using wagmi to get the connected account
    const account = getAccount(config);
    
    if (account.isConnected && account.address) {
      return account.address;
    } else {
      throw new Error('No wallet connected');
    }
  } catch (error) {
    console.error('Failed to connect wallet', error);
    throw error;
  }
};

// Initialize game on blockchain
export const initializeGameOnBlockchain = async (): Promise<void> => {
  if (CONFIG.developmentMode) {
    console.log('Development mode: Initializing game (mock)');
    return;
  }
  
  console.log('Initializing game on blockchain');
  // In a real implementation, this would call a smart contract function
};

// Save game state to blockchain
export const saveStateToBlockchain = async (gameState: GameState): Promise<void> => {
  if (CONFIG.developmentMode) {
    console.log('Development mode: Saving state (mock)', gameState);
    return;
  }
  
  console.log('Saving state to blockchain', gameState);
  // In a real implementation, this would call a smart contract function
};

// Finalize game on blockchain
export const finalizeGameOnBlockchain = async (winnerId: string | null): Promise<void> => {
  if (CONFIG.developmentMode) {
    console.log('Development mode: Finalizing game (mock)', { winnerId });
    return;
  }
  
  console.log('Finalizing game on blockchain', { winnerId });
  // In a real implementation, this would call a smart contract function
};

// Create agent on blockchain
export const createAgentOnBlockchain = async (
  agentId: string,
  name: string,
  mizuPoolId: string,
  address: string
): Promise<void> => {
  if (CONFIG.developmentMode) {
    console.log('Development mode: Creating agent (mock)', { agentId, name, mizuPoolId, address });
    return;
  }
  
  console.log('Creating agent on blockchain', { agentId, name, mizuPoolId, address });
  // In a real implementation, this would call a smart contract function
};

// Update compute contribution on blockchain
export const updateComputeContributionOnBlockchain = async (
  agentId: string,
  address: string,
  amount: number
): Promise<void> => {
  if (CONFIG.developmentMode) {
    console.log('Development mode: Updating compute contribution (mock)', { agentId, address, amount });
    return;
  }
  
  console.log('Updating compute contribution on blockchain', { agentId, address, amount });
  // In a real implementation, this would call a smart contract function
};

// Record bet on blockchain
export const recordBetOnBlockchain = async (
  agentId: string,
  address: string,
  amount: number
): Promise<void> => {
  if (CONFIG.developmentMode) {
    console.log('Development mode: Recording bet (mock)', { agentId, address, amount });
    return;
  }
  
  console.log('Recording bet on blockchain', { agentId, address, amount });
  // In a real implementation, this would call a smart contract function
};

// Claim rewards from blockchain
export const claimRewardsOnBlockchain = async (address: string): Promise<number> => {
  if (CONFIG.developmentMode) {
    console.log('Development mode: Claiming rewards (mock)', { address });
    return 100; // Mock reward amount
  }
  
  console.log('Claiming rewards from blockchain', { address });
  // In a real implementation, this would call a smart contract function
  return 100; // Mock reward amount
};

// Place bet on blockchain using the bet function
export const placeBetOnBlockchain = async (
  agentId: string,
  amount: number
): Promise<boolean> => {
  try {
    if (CONFIG.developmentMode) {
      console.log('Development mode: Placing bet (mock)', { agentId, amount });
      // Simulate a successful bet in development mode
      return true;
    }
    
    console.log('Placing bet on blockchain', { agentId, amount });
    
    // Get the wallet client for the connected account
    const walletClient = await getWalletClient(config);
    if (!walletClient) {
      throw new Error('No wallet connected');
    }
    
    // Get the connected account
    const account = getAccount(config);
    if (!account.isConnected || !account.address) {
      throw new Error('No wallet connected');
    }
    
    // Get the contract address from environment variables
    const contractAddress = CONFIG.gameContractAddress;
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Game contract address not configured');
    }
    
    // Convert amount to wei (assuming the token uses 18 decimals)
    const amountInWei = parseEther(amount.toString());
    
    // Call the bet function on the contract
    const hash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: BET_FUNCTION_ABI,
      functionName: 'bet',
      args: [amountInWei],
      value: amountInWei, // If the function is payable and requires ETH
    });
    
    // Wait for the transaction to be mined
    const publicClient = getPublicClient(config);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    // Check if the transaction was successful
    const success = receipt.status === 'success';
    
    console.log('Bet placed on blockchain', { 
      agentId, 
      amount, 
      transactionHash: hash, 
      success 
    });
    
    return success;
  } catch (error) {
    console.error('Failed to place bet on blockchain', error);
    throw error;
  }
};

// Record preparation phase on blockchain
export const recordPreparationPhaseOnBlockchain = async (): Promise<void> => {
  if (CONFIG.developmentMode) {
    console.log('Development mode: Recording preparation phase (mock)');
    return;
  }
  
  console.log('Recording preparation phase on blockchain');
  // In a real implementation, this would call a smart contract function
};

/**
 * Gets the epoch times from the blockchain
 * @returns Object containing waitingPeriodEnd and competitionEnd timestamps
 */
export const getEpochTimesFromBlockchain = async (): Promise<{ waitingPeriodEnd: number; competitionEnd: number }> => {
  try {
    if (CONFIG.developmentMode) {
      console.log('Development mode: Getting epoch times (mock)');
      
      // In development mode, set the waiting period to end in 5 minutes and competition to end in 35 minutes
      const currentTime = Date.now();
      return {
        waitingPeriodEnd: currentTime + CONFIG.waitingPeriodDuration,
        competitionEnd: currentTime + CONFIG.waitingPeriodDuration + CONFIG.competitionDuration,
      };
    }
    
    console.log('Getting epoch times from blockchain');
    
    // Get the wallet client for the connected account
    const walletClient = await getWalletClient(config);
    if (!walletClient) {
      throw new Error('No wallet connected');
    }
    
    // Get the connected account
    const account = getAccount(config);
    if (!account.isConnected || !account.address) {
      throw new Error('No wallet connected');
    }
    
    // Get the contract address from environment variables
    const contractAddress = CONFIG.gameContractAddress;
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Game contract address not configured');
    }
    
    // In a real implementation, this would call the smart contract to get the epoch times
    // For now, we'll just return mock values
    const currentTime = Date.now();
    return {
      waitingPeriodEnd: currentTime + CONFIG.waitingPeriodDuration,
      competitionEnd: currentTime + CONFIG.waitingPeriodDuration + CONFIG.competitionDuration,
    };
  } catch (error) {
    console.error('Failed to get epoch times from blockchain:', error);
    throw error;
  }
}; 