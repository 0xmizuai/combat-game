import React from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';
import { truncateAddress } from '../utils/helpers';
import { useToast } from '../contexts/ToastContext';

const WalletSection = styled.div`
  text-align: center;
  margin: 30px 0;
  padding: 15px;
  background-color: rgba(52, 168, 83, 0.1);
  border-radius: 10px;
`;

const ConnectButton = styled.button`
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

const WalletAddress = styled.p`
  margin-top: 10px;
  font-family: monospace;
  color: var(--text-secondary);
`;

const WalletConnect: React.FC = () => {
  const { connectWallet, userState } = useGame();
  const { showToast } = useToast();
  
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch {
      showToast('Failed to connect wallet. Please try again.', 'error');
    }
  };
  
  return (
    <WalletSection>
      {!userState.connected ? (
        <ConnectButton onClick={handleConnectWallet}>
          Connect Wallet
        </ConnectButton>
      ) : (
        <>
          <ConnectButton disabled>
            Wallet Connected
          </ConnectButton>
          <WalletAddress>
            {truncateAddress(userState.address || '')}
          </WalletAddress>
        </>
      )}
    </WalletSection>
  );
};

export default WalletConnect; 