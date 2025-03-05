import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from '@emotion/styled';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const ErrorContainer = styled.div`
  padding: 20px;
  margin: 20px 0;
  background-color: rgba(234, 67, 53, 0.1);
  border: 2px solid var(--danger-color);
  border-radius: 10px;
  text-align: center;
`;

const ErrorTitle = styled.h2`
  color: var(--danger-color);
  margin-bottom: 15px;
`;

const ErrorMessage = styled.p`
  margin-bottom: 15px;
  color: var(--text-color);
`;

const ErrorStack = styled.pre`
  background-color: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 5px;
  text-align: left;
  overflow: auto;
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const ResetButton = styled.button`
  background-color: var(--danger-color);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  margin-top: 15px;
  cursor: pointer;
  
  &:hover {
    background-color: #d03b2d;
  }
`;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <ErrorContainer>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>
            {this.state.error?.message || 'An unexpected error occurred'}
          </ErrorMessage>
          {this.state.error && (
            <ErrorStack>
              {this.state.error.stack}
            </ErrorStack>
          )}
          <ResetButton onClick={this.resetErrorBoundary}>
            Try Again
          </ResetButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 