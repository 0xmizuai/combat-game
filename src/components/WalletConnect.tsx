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

const CustomConnectButton = styled.div`
  .rainbow-button {
    background-color: var(--mizu-color) !important;
    
    &:hover {
      background-color: #2d9147 !important;
    }
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
      <CustomConnectButton>
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
                      <button onClick={openConnectModal} type="button" className="rainbow-button">
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button onClick={openChainModal} type="button" className="rainbow-button">
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="rainbow-button"
                      >
                        {account.displayName}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </CustomConnectButton>
      
      {userState.connected && (
        <WalletAddress>
          {truncateAddress(userState.address || '')}
        </WalletAddress>
      )}
    </WalletSection>
  );
};

export default WalletConnect; 