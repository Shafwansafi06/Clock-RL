import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Alarm } from '../utils/alarmTypes';
import { FiClock, FiVolume2, FiCheckCircle } from 'react-icons/fi';

interface AlarmRingingProps {
  alarm: Alarm;
  onSnooze: () => void;
  onDismiss: () => void;
  snoozeCount: number;
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(142, 68, 173, 0.95) 0%, rgba(41, 128, 185, 0.95) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const RingingContainer = styled(motion.div)`
  background-color: white;
  border-radius: 2rem;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  padding: 2rem;
  text-align: center;
`;

const IconContainer = styled(motion.div)`
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
`;

const AlarmIcon = styled(FiClock)`
  color: #8e44ad;
`;

const TimeDisplay = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: #333;
`;

const AlarmLabel = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 2rem;
  color: #555;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const ActionButton = styled(motion.button)<{ variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 1rem;
  border-radius: 1rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: ${props => props.variant === 'primary' ? '#8e44ad' : 'rgba(142, 68, 173, 0.1)'};
  color: ${props => props.variant === 'primary' ? 'white' : '#8e44ad'};
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonIcon = styled.div`
  font-size: 1.5rem;
`;

const SnoozeCounter = styled.div`
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
`;

// Blinking animation for icon
const pulseAnimation = {
  scale: [1, 1.1, 1],
  opacity: [0.8, 1, 0.8],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatType: "reverse" as const
  }
};

const AlarmRinging: React.FC<AlarmRingingProps> = ({ alarm, onSnooze, onDismiss, snoozeCount }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [audio] = useState(new Audio('/alarm-sound.mp3')); // You should add an alarm sound file
  
  // Play alarm sound
  useEffect(() => {
    if (isPlaying) {
      audio.loop = true;
      audio.volume = 0.7;
      audio.play().catch(error => {
        console.error('Failed to play alarm sound:', error);
      });
    }
    
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio, isPlaying]);
  
  const handleSnooze = () => {
    setIsPlaying(false);
    onSnooze();
  };
  
  const handleDismiss = () => {
    setIsPlaying(false);
    onDismiss();
  };
  
  const snoozeDisabled = alarm.snoozeEnabled === false || snoozeCount >= alarm.snoozeLimit;
  
  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <RingingContainer
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          <IconContainer animate={pulseAnimation}>
            <AlarmIcon size={80} />
          </IconContainer>
          
          <TimeDisplay>{alarm.time}</TimeDisplay>
          <AlarmLabel>{alarm.label}</AlarmLabel>
          
          <ButtonGroup>
            {alarm.snoozeEnabled && !snoozeDisabled && (
              <ActionButton
                variant="secondary"
                onClick={handleSnooze}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                as="button"
              >
                <ButtonIcon>
                  <FiVolume2 size={24} />
                </ButtonIcon>
                Snooze
              </ActionButton>
            )}
            
            <ActionButton
              variant="primary"
              onClick={handleDismiss}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              as="button"
            >
              <ButtonIcon>
                <FiCheckCircle size={24} />
              </ButtonIcon>
              Dismiss
            </ActionButton>
          </ButtonGroup>
          
          {snoozeCount > 0 && alarm.snoozeEnabled && (
            <SnoozeCounter>
              Snoozed {snoozeCount} time{snoozeCount > 1 ? 's' : ''} 
              {alarm.snoozeLimit && ` (limit: ${alarm.snoozeLimit})`}
            </SnoozeCounter>
          )}
        </RingingContainer>
      </Overlay>
    </AnimatePresence>
  );
};

export default AlarmRinging; 