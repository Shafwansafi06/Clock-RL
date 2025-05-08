import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Alarm } from '../utils/alarmTypes';
import { FiX, FiCheck } from 'react-icons/fi';

interface AlarmFormProps {
  onClose: () => void;
  onSave: (alarm: Partial<Alarm>) => void;
  alarm?: Alarm;
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
`;

const FormContainer = styled(motion.div)`
  background-color: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const FormHeader = styled.div`
  padding: 1.25rem;
  background-color: #8e44ad;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FormTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const FormContent = styled.div`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #444;
`;

const TimeInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-size: 2rem;
  text-align: center;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  font-family: var(--font-main);
  color: #333;
  
  &:focus {
    border-color: #8e44ad;
    outline: none;
  }
`;

const TextInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  font-family: var(--font-main);
  
  &:focus {
    border-color: #8e44ad;
    outline: none;
  }
`;

const DaysContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const DayButton = styled.button<{ selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid ${props => props.selected ? '#8e44ad' : '#ddd'};
  background-color: ${props => props.selected ? '#8e44ad' : 'white'};
  color: ${props => props.selected ? 'white' : '#666'};
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    border-color: #8e44ad;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: #8e44ad;
  }
  
  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const NumberInput = styled.input`
  width: 60px;
  padding: 0.5rem;
  font-size: 1rem;
  text-align: center;
  border: 2px solid #ddd;
  border-radius: 0.5rem;
  
  &:focus {
    border-color: #8e44ad;
    outline: none;
  }
  
  &::-webkit-inner-spin-button, 
  &::-webkit-outer-spin-button { 
    opacity: 1;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const SaveButton = styled(motion.button)`
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: #703688;
  }
`;

const DAYS_OF_WEEK = [
  { id: 0, name: 'S' },
  { id: 1, name: 'M' },
  { id: 2, name: 'T' },
  { id: 3, name: 'W' },
  { id: 4, name: 'T' },
  { id: 5, name: 'F' },
  { id: 6, name: 'S' },
];

const DEFAULT_ALARM: Partial<Alarm> = {
  time: '07:00',
  days: [1, 2, 3, 4, 5], // Monday to Friday
  label: 'Wake up',
  enabled: true,
  snoozeEnabled: true,
  snoozeInterval: 5,
  snoozeLimit: 3,
};

const AlarmForm: React.FC<AlarmFormProps> = ({ onClose, onSave, alarm }) => {
  const [formData, setFormData] = useState<Partial<Alarm>>(DEFAULT_ALARM);
  
  useEffect(() => {
    if (alarm) {
      setFormData({ ...alarm });
    }
  }, [alarm]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, time: e.target.value });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, label: e.target.value });
  };

  const toggleDay = (dayId: number) => {
    const currentDays = formData.days || [];
    if (currentDays.includes(dayId)) {
      setFormData({
        ...formData,
        days: currentDays.filter(id => id !== dayId)
      });
    } else {
      setFormData({
        ...formData,
        days: [...currentDays, dayId].sort()
      });
    }
  };

  const toggleSnooze = () => {
    setFormData({
      ...formData,
      snoozeEnabled: !formData.snoozeEnabled
    });
  };

  const handleSnoozeIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setFormData({
      ...formData,
      snoozeInterval: isNaN(value) ? 5 : Math.max(1, Math.min(30, value))
    });
  };

  const handleSnoozeLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setFormData({
      ...formData,
      snoozeLimit: isNaN(value) ? 3 : Math.max(1, Math.min(10, value))
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        as="div"
      >
        <FormContainer
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          as="div"
        >
          <FormHeader>
            <FormTitle>{alarm ? 'Edit Alarm' : 'Add Alarm'}</FormTitle>
            <CloseButton onClick={onClose}>
              <FiX size={24} />
            </CloseButton>
          </FormHeader>
          
          <FormContent>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Time</Label>
                <TimeInput
                  type="time"
                  value={formData.time}
                  onChange={handleTimeChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Label</Label>
                <TextInput
                  type="text"
                  value={formData.label}
                  onChange={handleLabelChange}
                  placeholder="Alarm name"
                  maxLength={30}
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Repeat</Label>
                <DaysContainer>
                  {DAYS_OF_WEEK.map(day => (
                    <DayButton
                      key={day.id}
                      type="button"
                      selected={(formData.days || []).includes(day.id)}
                      onClick={() => toggleDay(day.id)}
                    >
                      {day.name}
                    </DayButton>
                  ))}
                </DaysContainer>
              </FormGroup>
              
              <FormGroup>
                <ToggleContainer>
                  <Label style={{ margin: 0 }}>Snooze</Label>
                  <ToggleSwitch>
                    <ToggleInput
                      type="checkbox"
                      checked={formData.snoozeEnabled}
                      onChange={toggleSnooze}
                    />
                    <ToggleSlider />
                  </ToggleSwitch>
                </ToggleContainer>
                
                {formData.snoozeEnabled && (
                  <>
                    <ToggleContainer>
                      <Label style={{ margin: 0 }}>Snooze interval</Label>
                      <NumberInput
                        type="number"
                        min="1"
                        max="30"
                        value={formData.snoozeInterval}
                        onChange={handleSnoozeIntervalChange}
                      />
                      <span style={{ marginLeft: '0.5rem' }}>minutes</span>
                    </ToggleContainer>
                    
                    <ToggleContainer>
                      <Label style={{ margin: 0 }}>Snooze limit</Label>
                      <NumberInput
                        type="number"
                        min="1"
                        max="10"
                        value={formData.snoozeLimit}
                        onChange={handleSnoozeLimitChange}
                      />
                      <span style={{ marginLeft: '0.5rem' }}>times</span>
                    </ToggleContainer>
                  </>
                )}
              </FormGroup>
              
              <ButtonContainer>
                <SaveButton
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  as="button"
                >
                  <FiCheck size={18} />
                  Save
                </SaveButton>
              </ButtonContainer>
            </form>
          </FormContent>
        </FormContainer>
      </Overlay>
    </AnimatePresence>
  );
};

export default AlarmForm; 