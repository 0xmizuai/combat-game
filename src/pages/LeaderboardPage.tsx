import React from 'react';
import styled from '@emotion/styled';
import Leaderboard from '../components/Leaderboard';
import MizuPoolStats from '../components/MizuPoolStats';

const PageContainer = styled.div`
  padding: 20px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 20px;
  background: linear-gradient(90deg, var(--success-color), var(--mizu-color), var(--danger-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
  width: 100%;
`;

const LeaderboardPage: React.FC = () => {
  return (
    <PageContainer>
      <PageTitle>Leaderboard & Stats</PageTitle>
      <MizuPoolStats />
      <Leaderboard />
    </PageContainer>
  );
};

export default LeaderboardPage; 