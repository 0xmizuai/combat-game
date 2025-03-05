import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div<{ type: ToastType; isClosing: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
  max-width: 450px;
  z-index: 1000;
  animation: ${props => props.isClosing ? slideOut : slideIn} 0.3s ease-in-out;
  
  background-color: ${props => {
    switch (props.type) {
      case 'success':
        return 'rgba(66, 133, 244, 0.9)';
      case 'error':
        return 'rgba(234, 67, 53, 0.9)';
      case 'warning':
        return 'rgba(251, 188, 5, 0.9)';
      case 'info':
      default:
        return 'rgba(52, 168, 83, 0.9)';
    }
  }};
`;

const Message = styled.p`
  margin: 0;
  color: white;
  font-size: 1rem;
  flex-grow: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 15px;
  padding: 0;
  opacity: 0.8;
  
  &:hover {
    opacity: 1;
  }
`;

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  duration = 5000, 
  onClose 
}) => {
  const [isClosing, setIsClosing] = useState(false);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300); // Wait for animation to complete
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration]);
  
  return (
    <ToastContainer type={type} isClosing={isClosing}>
      <Message>{message}</Message>
      <CloseButton onClick={handleClose}>×</CloseButton>
    </ToastContainer>
  );
};

export default Toast; 