import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Alarm } from '../utils/alarmTypes';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface AlarmListProps {
  alarms: Alarm[];
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #888;
`;

const EmptyTitle = styled.h3`
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const EmptyText = styled.p`
  font-size: 0.9rem;
`;

const AlarmItem = styled(motion.div)`
  background-color: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
`;

const AlarmInfo = styled.div`
  flex: 1;
`;

const TimeDisplay = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.25rem;
`;

const AlarmDescription = styled.div`
  font-size: 0.875rem;
  color: #777;
  display: flex;
  align-items: center;
`;

const AlarmLabel = styled.span`
  margin-right: 0.75rem;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AlarmDays = styled.span`
  font-size: 0.75rem;
  opacity: 0.8;
`;

const AlarmActions = styled.div`
  display: flex;
  align-items: center;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  border-radius: 50%;
  margin-left: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f5f5f5;
    color: #8e44ad;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  margin-left: 1rem;
  transition: none;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: background-color 0.3s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: transform 0.3s;
    border-radius: 50%;
  }
  
  input:checked + & {
    background-color: #8e44ad;
  }
  
  input:checked + &:before {
    transform: translateX(24px);
  }
`;

const AdjustmentTag = styled.div<{ isEarlier: boolean }>`
  display: inline-block;
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  background-color: ${props => props.isEarlier ? '#e74c3c' : '#2ecc71'};
  color: white;
`;

const getDayNames = (days: number[]): string => {
  const dayMap: Record<number, string> = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat'
  };
  
  if (days.length === 7) return 'Every day';
  if (days.length === 5 && days.includes(1) && days.includes(5)) return 'Weekdays';
  if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
  
  return days.map(day => dayMap[day]).join(', ');
};

const AlarmList: React.FC<AlarmListProps> = ({ alarms, onToggle, onEdit, onDelete }) => {
  if (alarms.length === 0) {
    return (
      <EmptyState>
        <EmptyTitle>No alarms yet</EmptyTitle>
        <EmptyText>Tap the + button to add your first alarm</EmptyText>
      </EmptyState>
    );
  }

  return (
    <div>
      <AnimatePresence mode="popLayout">
        {alarms.map((alarm) => {
          // Calculate if the alarm was adjusted from original time
          const hasAdjustment = alarm.time !== alarm.originalTime;
          let minutesDiff = 0;
          
          if (hasAdjustment) {
            const [origHours, origMinutes] = alarm.originalTime.split(':').map(Number);
            const [adjHours, adjMinutes] = alarm.time.split(':').map(Number);
            
            const origTotalMinutes = origHours * 60 + origMinutes;
            const adjTotalMinutes = adjHours * 60 + adjMinutes;
            
            minutesDiff = adjTotalMinutes - origTotalMinutes;
          }
          
          const isEarlier = minutesDiff < 0;
          const diffText = Math.abs(minutesDiff);
          
          return (
            <AlarmItem
              key={alarm.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              layout="position"
            >
              <AlarmInfo>
                <TimeDisplay>{alarm.time}</TimeDisplay>
                <AlarmDescription>
                  <AlarmLabel>{alarm.label}</AlarmLabel>
                  <AlarmDays>{getDayNames(alarm.days)}</AlarmDays>
                  
                  {hasAdjustment && (
                    <AdjustmentTag isEarlier={isEarlier}>
                      {isEarlier ? diffText + 'm earlier' : diffText + 'm later'}
                    </AdjustmentTag>
                  )}
                </AlarmDescription>
              </AlarmInfo>
              
              <AlarmActions>
                <IconButton onClick={() => onEdit(alarm.id)}>
                  <FiEdit2 size={18} />
                </IconButton>
                <IconButton onClick={() => onDelete(alarm.id)}>
                  <FiTrash2 size={18} />
                </IconButton>
                <ToggleSwitch>
                  <ToggleInput 
                    type="checkbox" 
                    checked={alarm.enabled}
                    onChange={() => onToggle(alarm.id)}
                    id={`toggle-${alarm.id}`}
                  />
                  <ToggleSlider />
                </ToggleSwitch>
              </AlarmActions>
            </AlarmItem>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AlarmList; 