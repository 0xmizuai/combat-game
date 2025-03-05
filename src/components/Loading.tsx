import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
`;

const Spinner = styled.div<{ size: string }>`
  border: 4px solid rgba(52, 168, 83, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--mizu-color);
  width: ${props => 
    props.size === 'small' ? '20px' : 
    props.size === 'large' ? '60px' : '40px'
  };
  height: ${props => 
    props.size === 'small' ? '20px' : 
    props.size === 'large' ? '60px' : '40px'
  };
  animation: ${spin} 1s linear infinite;
  margin-bottom: 15px;
`;

const Message = styled.p`
  color: var(--text-secondary);
  animation: ${pulse} 1.5s infinite ease-in-out;
  font-size: 1rem;
`;

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Loading...', 
  size = 'medium' 
}) => {
  return (
    <LoadingContainer>
      <Spinner size={size} />
      <Message>{message}</Message>
    </LoadingContainer>
  );
};

export default Loading; 