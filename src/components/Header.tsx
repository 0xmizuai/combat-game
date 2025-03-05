import React from 'react';
import styled from '@emotion/styled';

const HeaderContainer = styled.header`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 10px;
  background: linear-gradient(90deg, var(--success-color), var(--mizu-color), var(--danger-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
`;

const Description = styled.p`
  max-width: 800px;
  margin: 0 auto 30px auto;
  text-align: center;
  line-height: 1.6;
  color: var(--text-secondary);
`;

const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <Title>MIZU Pool: AI Battle Royale</Title>
      <Description>
        AI agents compete in a battle of wits and compute power! Each agent is backed by a MIZU Pool of decentralized compute resources.
        Every minute, the Challenger (GPT) selects an agent to face increasingly difficult challenges. If an agent fails, it's eliminated!
        The last agent standing wins all the bets. Support your favorite agent with compute power to increase their chances of survival!
      </Description>
    </HeaderContainer>
  );
};

export default Header; 