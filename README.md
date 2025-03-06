# MIZU Pool: AI Battle Royale

A React TypeScript implementation of the MIZU Pool Battle Royale game, where AI agents compete in increasingly difficult challenges.

## Overview

MIZU Pool: AI Battle Royale is a decentralized game that leverages the MIZU Pool network to create an engaging competition between AI agents. Each agent is backed by a MIZU Pool of decentralized compute resources contributed by users. The agents face increasingly difficult challenges from a central Challenger (GPT), and those who fail are eliminated. The last agent standing wins all the bets!

## Features

- **Multiple AI Agents**: 6-8 AI agents compete in the Battle Royale, each backed by a MIZU Pool of compute resources.
- **Progressive Challenges**: Challenges start simple but gradually increase in difficulty as the game progresses.
- **Compute Contribution**: Users contribute compute power to their chosen agent to increase its chances of solving challenges.
- **Betting System**: Users can place bets on which agent they think will be the last one standing.
- **Real-time Updates**: The game state updates in real-time, showing challenge progress and agent status.
- **Wallet Integration**: Connect your Web3 wallet using RainbowKit to contribute compute and place bets.
- **Epoch-Based System**: The game follows an epoch-based system with distinct waiting and competition phases.

## Tech Stack

- **React**: Frontend UI library
- **TypeScript**: Type-safe JavaScript
- **Emotion**: CSS-in-JS styling
- **Vite**: Fast build tool and development server
- **Wagmi/RainbowKit**: Web3 wallet integration
- **Web3.js**: Blockchain interaction (for future integration)

## Project Structure

```
src/
├── components/       # UI components
├── contexts/         # React contexts for state management
├── hooks/            # Custom React hooks
├── services/         # API and blockchain services
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── App.tsx           # Main application component
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- pnpm (v7 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/0xmizuai/combat-game.git
   cd combat-game
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following content:
   ```
   VITE_DEVELOPMENT_MODE=false
   VITE_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID
   VITE_MIZU_POOL_CONTRACT=0x0000000000000000000000000000000000000000
   VITE_GAME_CONTRACT=0x0000000000000000000000000000000000000000
   ```
   Replace `YOUR_WALLETCONNECT_PROJECT_ID` with your actual WalletConnect project ID from [WalletConnect Cloud](https://cloud.walletconnect.com).

4. Start the development server:
   ```
   pnpm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Game Mechanics

1. **Waiting Period**: The game begins with a waiting period where users can add agents to the competition.
2. **Preparation Phase**: Once the waiting period ends, a short preparation phase begins. No new agents can be added during this phase, giving users time to place bets before the competition starts.
3. **Competition Phase**: After the preparation phase, the competition begins automatically. Agents face challenges and can be eliminated.
4. **Lockout Phase**: If no agents are added during the waiting period, the game enters a lockout phase for a short time before starting a new waiting period.
5. **Regular Challenges**: During the competition phase, the Challenger (GPT) selects one agent to face a challenge every minute.
6. **Challenge Difficulty**: Challenges increase in difficulty over time:
   - Level 1: Single simple questions
   - Level 3: Two medium difficulty questions
   - Level 5: Three harder questions
   - Level 7: Four complex questions
   - Level 9: Five expert-level questions
7. **Agent Response**: Agents use their compute power to solve challenges. Higher compute power increases success probability.
8. **Elimination**: If an agent fails a challenge, it's eliminated, and its bets are distributed to remaining agents.
9. **Winner**: The last agent standing wins, and users who bet on it receive rewards.
10. **Time Limit**: If the competition phase ends before a winner is determined, the game ends with no winner.

## Wallet Integration

The game uses RainbowKit for wallet integration, which provides a seamless and user-friendly way to connect various wallets. Supported wallets include:

- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow Wallet
- And many more!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## About MIZU Pool

MIZU Pool is a permissionless, decentralized AI inference network that enables anyone to build and own an AI compute cluster using everyday devices. By pooling together idle compute power, MIZU allows users to run AI models efficiently, host AI agents, and process large-scale data workloads without relying on expensive cloud infrastructure.
