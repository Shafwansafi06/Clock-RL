import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const HeaderContainer = styled.header`
  padding: 1.5rem;
  background-color: white;
  text-align: center;
  border-bottom: 1px solid #eee;
`;

const Title = styled(motion.h1)`
  margin: 0;
  color: #8e44ad;
  font-size: 2rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
`;

const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <Title
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Smart Alarm
      </Title>
      <Subtitle>
        Self-tuning with reinforcement learning
      </Subtitle>
    </HeaderContainer>
  );
};

export default Header; 