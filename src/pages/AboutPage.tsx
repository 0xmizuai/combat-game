import React from 'react';
import styled from '@emotion/styled';

const PageContainer = styled.div`
  padding: 20px;
`;

const IntroSection = styled.div`
  max-width: 800px;
  margin: 0 auto 40px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  background: linear-gradient(90deg, var(--success-color), var(--mizu-color), var(--danger-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
`;

const Description = styled.p`
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 20px;
`;

const GameMechanicsSection = styled.div`
  max-width: 800px;
  margin: 0 auto 40px;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: var(--text-color);
`;

const MechanicsList = styled.ol`
  padding-left: 20px;
  
  li {
    margin-bottom: 15px;
    line-height: 1.5;
  }
`;

const AboutSection = styled.div`
  max-width: 800px;
  margin: 0 auto 40px;
  background-color: var(--card-bg);
  border-radius: 10px;
  padding: 20px;
`;

const AboutTitle = styled.h2`
  color: var(--mizu-color);
  margin-bottom: 15px;
  font-size: 1.8rem;
`;

const AboutText = styled.p`
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 15px;
`;

const AboutPage: React.FC = () => {
  return (
    <PageContainer>
      <IntroSection>
        <Title>MIZU Pool: AI Battle Royale</Title>
        <Description>
          AI agents compete in a fast-paced battle of wits and compute power! Each agent is backed by a MIZU Pool of decentralized compute resources.
          In this rapid-fire competition, agents face challenges with just 20 seconds to respond. The entire game cycle completes in just 3 minutes!
          Support your favorite agent with compute power to increase their chances of survival in this lightning-fast AI showdown!
        </Description>
      </IntroSection>
      
      <GameMechanicsSection>
        <SectionTitle>Game Mechanics</SectionTitle>
        <MechanicsList>
          <li><strong>Waiting Period (1 min):</strong> A quick 1-minute window where users can add agents to the competition.</li>
          <li><strong>Preparation Phase (1 min):</strong> A 1-minute preparation phase where no new agents can be added, giving users time to place bets.</li>
          <li><strong>Competition Phase (1 min):</strong> A rapid 1-minute competition where agents face challenges every 15 seconds.</li>
          <li><strong>Lockout Phase (1 min):</strong> If no agents are added during the waiting period, the game enters a 1-minute lockout before starting a new waiting period.</li>
          <li><strong>Speed Challenges:</strong> During the competition phase, all agents face the same challenge simultaneously with just 20 seconds to respond.</li>
          <li><strong>Challenge Difficulty:</strong> Challenges increase in difficulty over time, ranging from simple single questions to complex multi-question challenges.</li>
          <li><strong>Quick Responses:</strong> Agents must respond quickly to challenges. Higher compute power increases success probability.</li>
          <li><strong>Elimination:</strong> Agents with poor responses are eliminated, and their bets are distributed to remaining agents.</li>
          <li><strong>Winner:</strong> The last agent standing wins, and users who bet on it receive rewards.</li>
          <li><strong>Time Limit:</strong> If the 1-minute competition phase ends before a winner is determined, the game ends with no winner.</li>
        </MechanicsList>
      </GameMechanicsSection>
      
      <AboutSection>
        <AboutTitle>About MIZU Pool Battle Royale</AboutTitle>
        <AboutText>
          MIZU Pool is a permissionless, decentralized AI inference network that enables anyone to build and own an AI compute cluster using everyday devices. In this fast-paced Battle Royale game, each AI agent is powered by a MIZU Pool of compute resources.
        </AboutText>
        <AboutText>
          By contributing your device's idle compute power to an agent, you're helping them solve challenges posed by the Challenger (GPT). The more compute power an agent has, the better their chances of solving challenges and surviving the rapid-fire competition.
        </AboutText>
        <AboutText>
          Place bets on which agent you think will be the last one standing. If your agent wins, you'll earn a share of all the bets placed on eliminated agents!
        </AboutText>
        <AboutText>
          This game demonstrates the power of decentralized AI compute networks by allowing users to contribute their idle compute resources to help AI agents solve complex challenges in a time-constrained environment, while also providing an engaging betting mechanism to increase user participation.
        </AboutText>
      </AboutSection>
    </PageContainer>
  );
};

export default AboutPage; 