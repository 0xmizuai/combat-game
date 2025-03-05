import React from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';
import { formatTime } from '../utils/helpers';
import { useTimer } from '../hooks/useTimer';
import { useToast } from '../contexts/ToastContext';
import { CONFIG } from '../utils/config';

const ChallengeSection = styled.div<{ visible: boolean }>`
  background-color: rgba(251, 188, 5, 0.1);
  border: 2px solid var(--warning-color);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
  display: ${props => props.visible ? 'block' : 'none'};
  animation: ${props => props.visible ? 'fadeIn 0.5s ease-in-out' : 'none'};
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ChallengeTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: var(--warning-color);
`;

const ChallengeAgent = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 20px;
`;

const ChallengeQuestions = styled.div`
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  
  ol {
    padding-left: 20px;
    margin: 0;
  }
  
  li {
    margin-bottom: 10px;
    line-height: 1.4;
  }
`;

const ChallengeTimer = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin: 20px 0;
  color: var(--warning-color);
`;

const TimerProgress = styled.div`
  width: 100%;
  max-width: 400px;
  height: 10px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  margin: 10px auto;
  overflow: hidden;
`;

const TimerBar = styled.div<{ percent: number }>`
  height: 100%;
  width: ${props => props.percent}%;
  background-color: ${props => 
    props.percent > 60 ? 'var(--success-color)' : 
    props.percent > 30 ? 'var(--warning-color)' : 
    'var(--danger-color)'
  };
  transition: width 1s linear, background-color 1s ease;
`;

const ChallengeResult = styled.div<{ success: boolean | null }>`
  font-size: 2rem;
  font-weight: bold;
  margin: 20px 0;
  color: ${props => 
    props.success === null 
      ? 'var(--warning-color)' 
      : props.success 
        ? 'var(--success-color)' 
        : 'var(--danger-color)'
  };
  display: ${props => props.success !== null ? 'block' : 'none'};
`;

const Challenge: React.FC = () => {
  const { gameState } = useGame();
  const { showToast } = useToast();
  const { currentChallenge, agents, challengeInProgress } = gameState;
  
  // Use the timer hook for the challenge countdown with default values
  const { time, percentRemaining } = useTimer({
    initialTime: currentChallenge?.timeLimit || CONFIG.challengeTimeLimit,
    autoStart: currentChallenge?.success === null,
    onComplete: () => {
      if (currentChallenge && agents[currentChallenge.agentId]) {
        showToast(`Time's up! Waiting for ${agents[currentChallenge.agentId].name}'s response...`, 'warning');
      }
    }
  });
  
  // If there's no current challenge, don't render anything
  if (!currentChallenge) return null;
  
  const agent = agents[currentChallenge.agentId];
  if (!agent) return null;
  
  return (
    <ChallengeSection visible={challengeInProgress}>
      <ChallengeTitle>Challenge in Progress!</ChallengeTitle>
      <ChallengeAgent>
        Agent <span style={{ color: 'var(--mizu-color)' }}>{agent.name}</span> is being challenged
      </ChallengeAgent>
      
      <ChallengeQuestions>
        <ol>
          {currentChallenge.questions.map((question, index) => (
            <li key={index}>{question}</li>
          ))}
        </ol>
      </ChallengeQuestions>
      
      {currentChallenge.success === null && (
        <>
          <ChallengeTimer>
            {formatTime(time)}
          </ChallengeTimer>
          <TimerProgress>
            <TimerBar percent={percentRemaining} />
          </TimerProgress>
        </>
      )}
      
      <ChallengeResult success={currentChallenge.success}>
        {currentChallenge.success === null 
          ? 'Processing...' 
          : currentChallenge.success 
            ? 'SUCCESS!' 
            : 'FAILED!'}
      </ChallengeResult>
    </ChallengeSection>
  );
};

export default Challenge; 