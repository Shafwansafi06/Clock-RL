import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAlarms } from 'hooks/useAlarms';
import AlarmList from 'components/AlarmList';
import AlarmForm from 'components/AlarmForm';
import AlarmRinging from 'components/AlarmRinging';
import Header from 'components/Header';
import Dashboard from 'components/Dashboard';
import { AlarmStatus } from 'utils/alarmTypes';

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 2rem 0;
  background: linear-gradient(135deg, #8e44ad 0%, #3498db 100%);
`;

const MainContent = styled.main`
  max-width: 500px;
  margin: 0 auto;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const ContentWrapper = styled.div`
  padding: 1.5rem;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  background-color: white;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 1rem 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.active ? '#8e44ad' : '#555'};
  border-bottom: 3px solid ${props => props.active ? '#8e44ad' : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    color: #8e44ad;
  }
`;

const AddButton = styled(motion.button)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #8e44ad;
  color: white;
  font-size: 1.5rem;
  border: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  
  &:hover {
    background-color: #703688;
  }
`;

const TestDataButton = styled.button`
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background-color: #2980b9;
  }
`;

enum TabType {
  ALARMS = 'alarms',
  STATS = 'stats',
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.ALARMS);
  const [showForm, setShowForm] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<string | null>(null);
  
  const { 
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
  } = useAlarms();

  const handleAddClick = () => {
    setEditingAlarm(null);
    setShowForm(true);
  };

  const handleEditAlarm = (id: string) => {
    setEditingAlarm(id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAlarm(null);
  };

  const handleSaveAlarm = (formData: any) => {
    if (editingAlarm) {
      updateAlarm(editingAlarm, formData);
    } else {
      addAlarm(formData);
    }
    handleCloseForm();
  };
  
  // Function to generate test alarms
  const addTestData = useCallback(() => {
    // Add several test alarms with various configurations
    
    // Morning alarm - standard
    addAlarm({
      time: `07:30`,
      originalTime: `07:30`,
      days: [1, 2, 3, 4, 5],
      label: "Wake up for work",
      enabled: true,
      snoozeEnabled: true,
      snoozeInterval: 5,
      snoozeLimit: 3,
    });
    
    // Afternoon alarm - adjusted later by Q-learning
    addAlarm({
      time: `12:15`, // adjusted 15 minutes later
      originalTime: `12:00`,
      days: [1, 2, 3, 4, 5],
      label: "Lunch break",
      enabled: true,
      snoozeEnabled: false,
      snoozeInterval: 5,
      snoozeLimit: 1,
    });
    
    // Evening alarm - disabled
    addAlarm({
      time: `18:00`,
      originalTime: `18:00`,
      days: [1, 2, 3, 4, 5],
      label: "Time to exercise",
      enabled: false,
      snoozeEnabled: true,
      snoozeInterval: 10,
      snoozeLimit: 2,
    });
    
    // Weekend alarm - adjusted earlier by Q-learning
    addAlarm({
      time: `08:45`, // adjusted 15 minutes earlier
      originalTime: `09:00`,
      days: [0, 6],
      label: "Weekend wake-up",
      enabled: true,
      snoozeEnabled: true,
      snoozeInterval: 15,
      snoozeLimit: 5,
    });
    
    // Custom day alarm - adjusted slightly
    addAlarm({
      time: `21:50`, // adjusted 10 minutes earlier
      originalTime: `22:00`,
      days: [2, 4], // Tuesday and Thursday
      label: "Evening class",
      enabled: true,
      snoozeEnabled: false,
      snoozeInterval: 5,
      snoozeLimit: 0,
    });
  }, [addAlarm]);

  return (
    <AppContainer>
      {alarmState.status === AlarmStatus.RINGING && (
        <AlarmRinging
          alarm={alarmState.currentAlarm!}
          onSnooze={snoozeAlarm}
          onDismiss={dismissAlarm}
          snoozeCount={alarmState.snoozeCount}
        />
      )}
      
      <MainContent>
        <Header />
        
        <TabsContainer>
          <Tab 
            active={activeTab === TabType.ALARMS} 
            onClick={() => setActiveTab(TabType.ALARMS)}
          >
            Alarms
          </Tab>
          <Tab 
            active={activeTab === TabType.STATS} 
            onClick={() => setActiveTab(TabType.STATS)}
          >
            Learning
          </Tab>
        </TabsContainer>
        
        <ContentWrapper>
          {activeTab === TabType.ALARMS ? (
            <AlarmList 
              alarms={alarms}
              onToggle={toggleAlarm}
              onEdit={handleEditAlarm}
              onDelete={deleteAlarm}
            />
          ) : (
            <Dashboard history={history} />
          )}
        </ContentWrapper>
      </MainContent>
      
      {showForm && (
        <AlarmForm
          onClose={handleCloseForm}
          onSave={handleSaveAlarm}
          alarm={editingAlarm ? alarms.find(a => a.id === editingAlarm) : undefined}
        />
      )}
      
      {!showForm && activeTab === TabType.ALARMS && (
        <AddButton
          as="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleAddClick}
        >
          +
        </AddButton>
      )}
      
      {!showForm && activeTab === TabType.ALARMS && alarms.length < 3 && (
        <TestDataButton onClick={addTestData}>
          Add Test Alarms
        </TestDataButton>
      )}
      
      {!showForm && activeTab === TabType.STATS && history.length < 5 && (
        <TestDataButton onClick={addTestHistory}>
          Add Test History
        </TestDataButton>
      )}
    </AppContainer>
  );
};

export default App; 