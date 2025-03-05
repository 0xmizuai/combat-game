import React from 'react';
import styled from '@emotion/styled';

const AboutContainer = styled.div`
  margin-top: 40px;
  padding: 20px;
  background-color: var(--card-bg);
  border-radius: 10px;
`;

const AboutTitle = styled.h2`
  color: var(--mizu-color);
  margin-bottom: 15px;
`;

const AboutText = styled.p`
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 15px;
`;

const About: React.FC = () => {
  return (
    <AboutContainer>
      <AboutTitle>About MIZU Pool Battle Royale</AboutTitle>
      <AboutText>
        MIZU Pool is a permissionless, decentralized AI inference network that enables anyone to build and own an AI compute cluster using everyday devices. In this Battle Royale game, each AI agent is powered by a MIZU Pool of compute resources.
      </AboutText>
      <AboutText>
        By contributing your device's idle compute power to an agent, you're helping them solve increasingly difficult challenges posed by the Challenger (GPT). The more compute power an agent has, the better their chances of solving challenges and surviving.
      </AboutText>
      <AboutText>
        Place bets on which agent you think will be the last one standing. If your agent wins, you'll earn a share of all the bets placed on eliminated agents!
      </AboutText>
      <AboutText>
        This game demonstrates the power of decentralized AI compute networks by allowing users to contribute their idle compute resources to help AI agents solve complex challenges, while also providing an engaging betting mechanism to increase user participation.
      </AboutText>
    </AboutContainer>
  );
};

export default About; 