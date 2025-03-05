import styled from '@emotion/styled';
import { Link } from 'react-router-dom';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
  text-align: center;
  padding: 0 20px;
`;

const Title = styled.h1`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: var(--mizu-color);
`;

const Subtitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--text-color);
`;

const Description = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  max-width: 600px;
`;

const HomeButton = styled(Link)`
  background-color: var(--mizu-color);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #2a8644;
  }
`;

const NotFound = () => {
  return (
    <NotFoundContainer>
      <Title>404</Title>
      <Subtitle>Page Not Found</Subtitle>
      <Description>
        The AI agent you're looking for might have been eliminated from the Battle Royale or never existed in the first place.
      </Description>
      <HomeButton to="/">Return to Battle Arena</HomeButton>
    </NotFoundContainer>
  );
};

export default NotFound; 