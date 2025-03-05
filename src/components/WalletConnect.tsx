import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';
import { truncateAddress } from '../utils/helpers';
import { useToast } from '../contexts/ToastContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const WalletSection = styled.div`
  text-align: center;
  margin: 30px 0;
  padding: 15px;
  background-color: rgba(52, 168, 83, 0.1);
  border-radius: 10px;
`;

const ConnectButtonWrapper = styled.button`
  background-color: var(--mizu-color);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  
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

const WalletInfoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const ChainBadge = styled.span`
  background-color: #4285f4;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  height: 100%;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: #3b77db;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const AddressDisplay = styled.span`
  background-color: var(--mizu-color);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 16px;
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
`;

const WalletConnect: React.FC = () => {
  const { connectWallet, userState } = useGame();
  const { showToast } = useToast();
  const { address, isConnected } = useAccount();
  
  // Sync the wallet state with the game context
  useEffect(() => {
    if (isConnected && address && !userState.connected) {
      handleConnectWallet();
    }
  }, [isConnected, address]);
  
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch {
      showToast('Failed to connect wallet. Please try again.', 'error');
    }
  };
  
  return (
    <WalletSection>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          mounted,
        }) => {
          return (
            <div
              {...(!mounted && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!mounted || !account || !chain) {
                  return (
                    <ConnectButtonWrapper onClick={openConnectModal} type="button">
                      Connect Wallet
                    </ConnectButtonWrapper>
                  );
                }

                if (chain.unsupported) {
                  return (
                    <ConnectButtonWrapper onClick={openChainModal} type="button">
                      Wrong network
                    </ConnectButtonWrapper>
                  );
                }

                return (
                  <WalletInfoContainer>
                    <ChainBadge onClick={openChainModal}>
                      {chain.name}
                    </ChainBadge>
                    <AddressDisplay onClick={openAccountModal}>
                      {truncateAddress(account.address)}
                    </AddressDisplay>
                  </WalletInfoContainer>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </WalletSection>
  );
};

export default WalletConnect; 