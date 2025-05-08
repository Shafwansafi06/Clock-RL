import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Alarm, AlarmHistory, AlarmStatus, AlarmState } from '../utils/alarmTypes';
import { QLearningAgent, QState, QAction } from '../utils/qLearning';

const DEFAULT_ALARM: Alarm = {
  id: '',
  time: '07:00',
  originalTime: '07:00',
  days: [1, 2, 3, 4, 5], // Monday to Friday
  enabled: true,
  label: 'Wake up',
  snoozeEnabled: true,
  snoozeInterval: 5,
  snoozeLimit: 3,
};

export const useAlarms = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [history, setHistory] = useState<AlarmHistory[]>([]);
  const [alarmState, setAlarmState] = useState<AlarmState>({
    currentAlarm: null,
    status: AlarmStatus.IDLE,
    snoozeCount: 0,
    nextSnoozeTime: null,
  });
  const [qAgent] = useState<QLearningAgent>(() => new QLearningAgent());

  // Load alarms from localStorage
  useEffect(() => {
    const savedAlarms = localStorage.getItem('alarms');
    const savedHistory = localStorage.getItem('alarmHistory');

    if (savedAlarms) {
      try {
        setAlarms(JSON.parse(savedAlarms));
      } catch (e) {
        console.error('Failed to parse alarms:', e);
      }
    }

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse alarm history:', e);
      }
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('alarmHistory', JSON.stringify(history));
    }
  }, [history]);

  // Add a new alarm
  const addAlarm = useCallback((alarmData: Partial<Alarm> = {}) => {
    const newAlarm: Alarm = {
      ...DEFAULT_ALARM,
      ...alarmData,
      id: uuidv4(),
    };
    
    // Initialize time properties if not provided
    if (!alarmData.time) {
      newAlarm.time = DEFAULT_ALARM.time;
    }
    if (!alarmData.originalTime) {
      newAlarm.originalTime = newAlarm.time;
    }

    setAlarms(prevAlarms => {
      const updatedAlarms = [...prevAlarms, newAlarm];
      localStorage.setItem('alarms', JSON.stringify(updatedAlarms));
      return updatedAlarms;
    });
    
    return newAlarm;
  }, []);

  // Update an existing alarm
  const updateAlarm = useCallback((id: string, alarmData: Partial<Alarm>) => {
    setAlarms(prevAlarms => {
      const updatedAlarms = prevAlarms.map(alarm => 
        alarm.id === id 
          ? { 
              ...alarm, 
              ...alarmData,
              // If user updated the time, reset originalTime to match
              originalTime: alarmData.time ? alarmData.time : alarm.originalTime,
            } 
          : alarm
      );
      localStorage.setItem('alarms', JSON.stringify(updatedAlarms));
      return updatedAlarms;
    });
  }, []);

  // Delete an alarm
  const deleteAlarm = useCallback((id: string) => {
    setAlarms(prevAlarms => {
      const updatedAlarms = prevAlarms.filter(alarm => alarm.id !== id);
      localStorage.setItem('alarms', JSON.stringify(updatedAlarms.length > 0 ? updatedAlarms : []));
      return updatedAlarms;
    });
  }, []);

  // Toggle alarm enabled/disabled
  const toggleAlarm = useCallback((id: string) => {
    setAlarms(prevAlarms => {
      const updatedAlarms = prevAlarms.map(alarm => 
        alarm.id === id 
          ? { ...alarm, enabled: !alarm.enabled } 
          : alarm
      );
      localStorage.setItem('alarms', JSON.stringify(updatedAlarms));
      return updatedAlarms;
    });
  }, []);

  // Apply Q-learning to adjust alarm times
  const adjustAlarmTimes = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0-6 (Sunday-Saturday)
    const currentTime = `${today.getHours().toString().padStart(2, '0')}:${
      today.getMinutes().toString().padStart(2, '0')}`;

    setAlarms(prevAlarms => 
      prevAlarms.map(alarm => {
        // Only adjust enabled alarms on active days
        if (alarm.enabled && alarm.days.includes(dayOfWeek)) {
          // Create state for Q-learning
          const state: QState = {
            currentTime,
            targetTime: alarm.originalTime,
            day: dayOfWeek,
          };

          // Get best action from Q-learning agent
          const action: QAction = qAgent.chooseAction(state);

          // Calculate new alarm time
          const originalMinutes = QLearningAgent.timeToMinutes(alarm.originalTime);
          const adjustedMinutes = originalMinutes + action.adjustMinutes;
          const adjustedTime = QLearningAgent.minutesToTime(adjustedMinutes);

          return {
            ...alarm,
            time: adjustedTime,
          };
        }
        return alarm;
      })
    );
  }, [qAgent]);

  // Check which alarm should trigger now
  const checkAlarms = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    const dayOfWeek = now.getDay(); // 0-6 (Sunday-Saturday)

    // If already in RINGING or SNOOZED state, don't check for new alarms
    if (alarmState.status === AlarmStatus.RINGING || alarmState.status === AlarmStatus.SNOOZED) {
      // If snoozed, check if it's time to ring again
      if (alarmState.status === AlarmStatus.SNOOZED && alarmState.nextSnoozeTime === currentTime) {
        setAlarmState(prev => ({
          ...prev,
          status: AlarmStatus.RINGING,
          nextSnoozeTime: null,
        }));
      }
      return;
    }

    // Find alarm that should ring now
    const alarmToRing = alarms.find(alarm => 
      alarm.enabled && 
      alarm.days.includes(dayOfWeek) && 
      alarm.time === currentTime
    );

    if (alarmToRing) {
      setAlarmState({
        currentAlarm: alarmToRing,
        status: AlarmStatus.RINGING,
        snoozeCount: 0,
        nextSnoozeTime: null,
      });
    }
  }, [alarms, alarmState]);

  // Snooze current alarm
  const snoozeAlarm = useCallback(() => {
    if (alarmState.currentAlarm && 
        (alarmState.status === AlarmStatus.RINGING || alarmState.status === AlarmStatus.SNOOZED)) {
      const { snoozeLimit, snoozeInterval } = alarmState.currentAlarm;
      
      // Check if snooze limit reached
      if (alarmState.snoozeCount >= snoozeLimit) {
        return;
      }

      // Calculate next snooze time
      const now = new Date();
      now.setMinutes(now.getMinutes() + snoozeInterval);
      const nextSnoozeTime = `${now.getHours().toString().padStart(2, '0')}:${
        now.getMinutes().toString().padStart(2, '0')}`;

      setAlarmState(prev => ({
        ...prev,
        status: AlarmStatus.SNOOZED,
        snoozeCount: prev.snoozeCount + 1,
        nextSnoozeTime,
      }));
    }
  }, [alarmState]);

  // Dismiss current alarm and record history
  const dismissAlarm = useCallback(() => {
    if (alarmState.currentAlarm && 
        (alarmState.status === AlarmStatus.RINGING || alarmState.status === AlarmStatus.SNOOZED)) {
      
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${
        now.getMinutes().toString().padStart(2, '0')}`;
      
      // Record alarm history
      const newHistoryEntry: AlarmHistory = {
        alarmId: alarmState.currentAlarm.id,
        date: now.toISOString(),
        scheduledTime: alarmState.currentAlarm.time,
        actualWakeupTime: currentTime,
        snoozeCount: alarmState.snoozeCount,
        reward: QLearningAgent.calculateReward(
          alarmState.currentAlarm.time,
          currentTime,
          alarmState.snoozeCount
        ),
      };

      // Update history with new entry
      setHistory(prev => {
        const updatedHistory = [newHistoryEntry, ...prev];
        localStorage.setItem('alarmHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

      // Update Q-learning values
      const state: QState = {
        currentTime: alarmState.currentAlarm.time,
        targetTime: alarmState.currentAlarm.originalTime,
        day: now.getDay(),
      };

      const nextState: QState = {
        currentTime,
        targetTime: alarmState.currentAlarm.originalTime,
        day: now.getDay(),
      };

      // Calculate minutes of adjustment that was made
      const originalMinutes = QLearningAgent.timeToMinutes(alarmState.currentAlarm.originalTime);
      const actualMinutes = QLearningAgent.timeToMinutes(alarmState.currentAlarm.time);
      const adjustment = actualMinutes - originalMinutes;

      // Find closest discrete action
      const discreteAdjustment = [-30, -20, -15, -10, -5, 0, 5, 10, 15, 20, 30]
        .reduce((prev, curr) => 
          Math.abs(curr - adjustment) < Math.abs(prev - adjustment) ? curr : prev
        );

      const action: QAction = {
        adjustMinutes: discreteAdjustment,
      };

      qAgent.updateQValues(
        state,
        action,
        newHistoryEntry.reward,
        nextState
      );

      // Reset alarm state
      setAlarmState({
        currentAlarm: null,
        status: AlarmStatus.DISMISSED,
        snoozeCount: 0,
        nextSnoozeTime: null,
      });
    }
  }, [alarmState, qAgent]);

  // Set up interval to check alarms every minute
  useEffect(() => {
    // Run once at initialization
    adjustAlarmTimes();
    
    // Check alarms every minute
    const intervalId = setInterval(() => {
      checkAlarms();
    }, 60000); // 60 seconds
    
    // Also check immediately on load
    checkAlarms();
    
    return () => clearInterval(intervalId);
  }, [checkAlarms, adjustAlarmTimes]);

  // Adjust alarm times daily
  useEffect(() => {
    // Set up a timer to run every day at midnight
    const setMidnightTimer = () => {
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // tomorrow
        0, 0, 0 // midnight
      );
      
      const timeUntilMidnight = midnight.getTime() - now.getTime();
      
      return setTimeout(() => {
        adjustAlarmTimes();
        setMidnightTimer(); // Set up next day's timer
      }, timeUntilMidnight);
    };
    
    const timerId = setMidnightTimer();
    
    return () => clearTimeout(timerId);
  }, [adjustAlarmTimes]);

  // Generate test history data
  const addTestHistory = useCallback(() => {
    const now = new Date();
    const testHistory: AlarmHistory[] = [];
    
    // Create 10 days of history data
    for (let i = 0; i < 10; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Randomly select an alarm ID if we have alarms
      let alarmId = "test-alarm-id";
      if (alarms.length > 0) {
        const randomIndex = Math.floor(Math.random() * alarms.length);
        alarmId = alarms[randomIndex].id;
      }
      
      // Create base time (around 7:00-8:00 AM)
      const baseHour = 7;
      const scheduledMinute = Math.floor(Math.random() * 30);
      const scheduledTime = `${baseHour.toString().padStart(2, '0')}:${scheduledMinute.toString().padStart(2, '0')}`;
      
      // Actual wake-up time (0-30 minutes after scheduled with some randomness)
      let wakeupHour = baseHour;
      let wakeupMinute = scheduledMinute + Math.floor(Math.random() * 30);
      if (wakeupMinute >= 60) {
        wakeupHour += 1;
        wakeupMinute -= 60;
      }
      const actualWakeupTime = `${wakeupHour.toString().padStart(2, '0')}:${wakeupMinute.toString().padStart(2, '0')}`;
      
      // Random snooze count (0-3)
      const snoozeCount = Math.floor(Math.random() * 4);
      
      // Calculate reward
      const reward = QLearningAgent.calculateReward(
        scheduledTime,
        actualWakeupTime,
        snoozeCount
      );
      
      testHistory.push({
        alarmId,
        date: date.toISOString(),
        scheduledTime,
        actualWakeupTime,
        snoozeCount,
        reward,
      });
    }
    
    // Add test history
    setHistory(prev => {
      const updatedHistory = [...testHistory, ...prev];
      localStorage.setItem('alarmHistory', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  }, [alarms]);

  return {
    alarms,
    history,
    alarmState,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    snoozeAlarm,
    dismissAlarm,
    addTestHistory,
  };
}; 