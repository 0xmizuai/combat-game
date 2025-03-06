import React from 'react';
import GameStatus from '../components/GameStatus';
import GameControls from '../components/GameControls';
import Challenge from '../components/Challenge';
import GameHistory from '../components/GameHistory';
import GameResults from '../components/GameResults';
import AgentsList from '../components/AgentsList';

const HomePage: React.FC = () => {
  return (
    <>
      <GameStatus />
      <GameControls />
      <Challenge />
      <GameHistory />
      <GameResults />
      <AgentsList />
    </>
  );
};

export default HomePage; 