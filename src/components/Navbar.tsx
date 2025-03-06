import React from 'react';
import styled from '@emotion/styled';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { truncateAddress } from '../utils/helpers';

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-color);
  text-decoration: none;
  background: linear-gradient(90deg, var(--success-color), var(--mizu-color), var(--danger-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-right: 30px;
  
  &:hover {
    opacity: 0.9;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const NavLink = styled(Link)<{ active: boolean }>`
  color: var(--text-color);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ConnectButtonWrapper = styled.button`
  background-color: var(--mizu-color);
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  font-size: 14px;
  
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
  gap: 10px;
`;

const ChainBadge = styled.span`
  background-color: #4285f4;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  
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
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
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

const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <NavbarContainer>
      <LeftSection>
        <Logo to="/">MIZU Pool: AI Battle Royale</Logo>
        <NavLinks>
          <NavLink to="/" active={location.pathname === '/'}>
            Game
          </NavLink>
          <NavLink to="/leaderboard" active={location.pathname === '/leaderboard'}>
            Leaderboard
          </NavLink>
          <NavLink to="/about" active={location.pathname === '/about'}>
            About
          </NavLink>
        </NavLinks>
      </LeftSection>
      
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
    </NavbarContainer>
  );
};

export default Navbar; 