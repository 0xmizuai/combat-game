import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useGame } from '../contexts/GameContext';
import { formatTime } from '../utils/helpers';
import { useTimer } from '../hooks/useTimer';
import { useToast } from '../contexts/ToastContext';
import { CONFIG } from '../utils/config';
import { performInference } from '../services/mizuai';
import { AgentResponse } from '../types';

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
  
  span {
    font-size: 1rem;
    color: var(--text-secondary);
    margin-left: 10px;
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

const QuestionsContainer = styled.div`
  text-align: left;
  margin: 20px auto;
  max-width: 800px;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 8px;
`;

const Question = styled.div`
  margin-bottom: 10px;
  line-height: 1.5;
`;

const QuestionNumber = styled.span`
  font-weight: bold;
  color: var(--warning-color);
`;

const AgentsResponsesContainer = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const AgentResponseCard = styled.div<{ isWinner?: boolean }>`
  background-color: ${props => props.isWinner ? 'rgba(52, 168, 83, 0.1)' : 'rgba(0, 0, 0, 0.2)'};
  border: ${props => props.isWinner ? '2px solid var(--success-color)' : '1px solid rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  padding: 15px;
  text-align: left;
`;

const AgentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const AgentName = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
`;

const AgentScores = styled.div`
  display: flex;
  gap: 15px;
`;

const ScoreItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ScoreLabel = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const ScoreValue = styled.div<{ score: number }>`
  font-weight: bold;
  color: ${props => {
    if (props.score >= 0.8) return 'var(--success-color)';
    if (props.score >= 0.5) return 'var(--warning-color)';
    return 'var(--danger-color)';
  }};
`;

const ResponseText = styled.div`
  white-space: pre-wrap;
  line-height: 1.5;
  margin-top: 10px;
  font-size: 0.9rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
`;

const WinnerBadge = styled.div`
  background-color: var(--success-color);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-left: 10px;
`;

const NoResponsesMessage = styled.div`
  margin: 20px 0;
  font-style: italic;
  color: var(--text-secondary);
`;

const Challenge: React.FC = () => {
  const { gameState } = useGame();
  const { showToast } = useToast();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  // Use the timer hook for the challenge countdown with default values
  const { percentRemaining } = useTimer({
    initialTime: gameState.currentChallenge?.timeLimit || CONFIG.challengeTimeLimit,
    autoStart: gameState.currentChallenge?.evaluated === false && gameState.gamePhase === 'competition',
    onComplete: () => {
      if (gameState.currentChallenge) {
        showToast(`Time's up! Evaluating agent responses...`, 'warning');
      }
    }
  });
  
  useEffect(() => {
    // Only process challenges during the competition phase
    if (gameState.gamePhase !== 'competition') return;
    
    if (gameState.challengeInProgress && gameState.currentChallenge) {
      // Set initial time left
      const challenge = gameState.currentChallenge;
      const elapsed = Date.now() - challenge.startTime;
      const remaining = Math.max(0, challenge.timeLimit - elapsed);
      setTimeLeft(remaining);
      
      // Set up timer
      const timer = setInterval(() => {
        const elapsed = Date.now() - challenge.startTime;
        const remaining = Math.max(0, challenge.timeLimit - elapsed);
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          clearInterval(timer);
        }
      }, 100);
      
      // Clean up timer
      return () => clearInterval(timer);
    }
  }, [gameState.challengeInProgress, gameState.currentChallenge, gameState.gamePhase, showToast]);
  
  // If there's no current challenge or not in competition phase, don't render anything
  if (!gameState.currentChallenge || gameState.gamePhase !== 'competition') return null;
  
  const currentChallenge = gameState.currentChallenge;
  
  // Get all responses
  const responses = Object.values(currentChallenge.responses);
  
  // Sort responses by total score (if evaluated)
  const sortedResponses = [...responses].sort((a, b) => {
    if (a.score && b.score) {
      return b.score.total - a.score.total;
    }
    return 0;
  });
  
  return (
    <ChallengeSection visible={!!currentChallenge && gameState.gamePhase === 'competition'}>
      <ChallengeTitle>
        Challenge {gameState.currentRound} <span>(20-second speed round)</span>
      </ChallengeTitle>
      
      {!currentChallenge.evaluated && (
        <>
          <ChallengeTimer>
            {formatTime(timeLeft)}
          </ChallengeTimer>
          
          <TimerProgress>
            <TimerBar percent={percentRemaining} />
          </TimerProgress>
        </>
      )}
      
      <QuestionsContainer>
        {currentChallenge.questions.map((question, index) => (
          <Question key={index}>
            <QuestionNumber>Q{index + 1}:</QuestionNumber> {question}
          </Question>
        ))}
      </QuestionsContainer>
      
      <AgentsResponsesContainer>
        {currentChallenge.evaluated ? (
          sortedResponses.length > 0 ? (
            sortedResponses.map((response) => {
              const agent = gameState.agents[response.agentId];
              const isWinner = currentChallenge.winner === response.agentId;
              
              return (
                <AgentResponseCard key={response.agentId} isWinner={isWinner}>
                  <AgentHeader>
                    <AgentName>
                      {agent.name}
                      {isWinner && <WinnerBadge>WINNER</WinnerBadge>}
                    </AgentName>
                    
                    {response.score && (
                      <AgentScores>
                        <ScoreItem>
                          <ScoreLabel>Correctness</ScoreLabel>
                          <ScoreValue score={response.score.correctness}>
                            {response.score.correctness.toFixed(2)}
                          </ScoreValue>
                        </ScoreItem>
                        
                        <ScoreItem>
                          <ScoreLabel>Completeness</ScoreLabel>
                          <ScoreValue score={response.score.completeness}>
                            {response.score.completeness.toFixed(2)}
                          </ScoreValue>
                        </ScoreItem>
                        
                        <ScoreItem>
                          <ScoreLabel>Total</ScoreLabel>
                          <ScoreValue score={response.score.total}>
                            {response.score.total.toFixed(2)}
                          </ScoreValue>
                        </ScoreItem>
                      </AgentScores>
                    )}
                  </AgentHeader>
                  
                  <ResponseText>
                    {response.response}
                  </ResponseText>
                </AgentResponseCard>
              );
            })
          ) : (
            <NoResponsesMessage>
              No agents submitted responses to this challenge.
            </NoResponsesMessage>
          )
        ) : (
          responses.length > 0 ? (
            responses.map((response) => {
              const agent = gameState.agents[response.agentId];
              
              return (
                <AgentResponseCard key={response.agentId}>
                  <AgentHeader>
                    <AgentName>{agent.name}</AgentName>
                  </AgentHeader>
                  
                  <ResponseText>
                    {response.response}
                  </ResponseText>
                </AgentResponseCard>
              );
            })
          ) : (
            <NoResponsesMessage>
              Waiting for agent responses...
            </NoResponsesMessage>
          )
        )}
      </AgentsResponsesContainer>
    </ChallengeSection>
  );
};

export default Challenge; 