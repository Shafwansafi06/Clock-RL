import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { AlarmHistory } from '../utils/alarmTypes';
import { FiTrendingUp, FiTrendingDown, FiClock, FiZap, FiCalendar } from 'react-icons/fi';

interface DashboardProps {
  history: AlarmHistory[];
}

const StatsContainer = styled.div`
  margin-bottom: 2rem;
`;

const StatsTitle = styled.h3`
  margin-bottom: 1rem;
  color: #555;
  font-size: 1.2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const StatCard = styled(motion.div)`
  background-color: white;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  color: #8e44ad;
`;

const StatIcon = styled.div`
  margin-right: 0.5rem;
  display: flex;
`;

const StatLabel = styled.h4`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
`;

const StatSubtext = styled.div`
  font-size: 0.8rem;
  color: #777;
  margin-top: 0.25rem;
`;

const HistoryContainer = styled.div`
  margin-top: 2rem;
`;

const HistoryTitle = styled.h3`
  margin-bottom: 1rem;
  color: #555;
  font-size: 1.2rem;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const HistoryItem = styled.div`
  background-color: white;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const HistoryDate = styled.div`
  font-size: 0.8rem;
  color: #888;
`;

const RewardBadge = styled.div<{ value: number }>`
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => props.value > 0 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)'};
  color: ${props => props.value > 0 ? '#27ae60' : '#e74c3c'};
`;

const HistoryTimes = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
`;

const TimeLabel = styled.span`
  color: #777;
  font-size: 0.8rem;
`;

const TimeValue = styled.span`
  font-weight: 600;
  margin-left: 0.25rem;
`;

const EmptyHistory = styled.div`
  text-align: center;
  padding: 2rem 1rem;
  color: #999;
  font-style: italic;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 0.75rem;
`;

const ProgressContainer = styled.div`
  margin-top: 2rem;
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const ProgressTitle = styled.h3`
  margin-bottom: 1rem;
  color: #555;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: #eee;
  border-radius: 4px;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)<{ percentage: number }>`
  height: 100%;
  width: ${props => Math.max(Math.min(props.percentage, 100), 0)}%;
  background-color: #8e44ad;
  border-radius: 4px;
  position: absolute;
  top: 0;
  left: 0;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  color: #777;
  font-size: 0.8rem;
`;

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const Dashboard: React.FC<DashboardProps> = ({ history }) => {
  // Calculate stats from history
  const totalEntries = history.length;
  
  // Average wakeup time calculation
  const getAverageTime = (times: string[]): string => {
    if (times.length === 0) return '--:--';
    
    let totalMinutes = 0;
    times.forEach(time => {
      const [hours, minutes] = time.split(':').map(Number);
      totalMinutes += hours * 60 + minutes;
    });
    
    const avgMinutes = Math.round(totalMinutes / times.length);
    const avgHours = Math.floor(avgMinutes / 60);
    const avgMins = avgMinutes % 60;
    
    return `${avgHours.toString().padStart(2, '0')}:${avgMins.toString().padStart(2, '0')}`;
  };
  
  const averageWakeupTime = getAverageTime(history.map(h => h.actualWakeupTime));
  
  // Calculate average snooze count
  const averageSnoozes = history.length > 0
    ? (history.reduce((sum, item) => sum + item.snoozeCount, 0) / history.length).toFixed(1)
    : '0';
  
  // Calculate learning efficiency (0-100%)
  const calculateEfficiency = (): number => {
    if (history.length === 0) return 0;
    
    // Maximum possible reward is 10 (from qLearning.ts)
    const maxPossibleReward = 10;
    const avgReward = history.reduce((sum, item) => sum + item.reward, 0) / history.length;
    
    // Convert to percentage (0-100)
    return Math.max(0, Math.min(100, (avgReward / maxPossibleReward) * 100));
  };
  
  // Calculate learning progression (reward trend)
  const calculateLearningProgress = (): number => {
    if (history.length < 4) return 0;
    
    const recentHistory = history.slice(0, 3);
    const earlierHistory = history.slice(3, 6);
    
    if (earlierHistory.length === 0) return 0;
    
    const recentAvgReward = recentHistory.reduce((sum, item) => sum + item.reward, 0) / recentHistory.length;
    const earlierAvgReward = earlierHistory.reduce((sum, item) => sum + item.reward, 0) / earlierHistory.length;
    
    return recentAvgReward - earlierAvgReward;
  };
  
  const efficiency = calculateEfficiency();
  const learningProgress = calculateLearningProgress();
  
  return (
    <div>
      <StatsContainer>
        <StatsTitle>Learning Stats</StatsTitle>
        <StatsGrid>
          <StatCard 
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <StatHeader>
              <StatIcon><FiClock size={18} /></StatIcon>
              <StatLabel>Average Wake-up</StatLabel>
            </StatHeader>
            <StatValue>{averageWakeupTime}</StatValue>
            <StatSubtext>Based on {totalEntries} days</StatSubtext>
          </StatCard>
          
          <StatCard 
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <StatHeader>
              <StatIcon><FiZap size={18} /></StatIcon>
              <StatLabel>Avg. Snoozes</StatLabel>
            </StatHeader>
            <StatValue>{averageSnoozes}</StatValue>
            <StatSubtext>{totalEntries > 0 ? 'Per morning' : 'No data yet'}</StatSubtext>
          </StatCard>
          
          <StatCard 
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <StatHeader>
              <StatIcon>
                {learningProgress >= 0 ? <FiTrendingUp size={18} /> : <FiTrendingDown size={18} />}
              </StatIcon>
              <StatLabel>Learning Progress</StatLabel>
            </StatHeader>
            <StatValue>
              {Math.abs(learningProgress).toFixed(1)}
              <span style={{ fontSize: '1rem', opacity: 0.7 }}> points</span>
            </StatValue>
            <StatSubtext>
              {history.length < 4 
                ? 'Need more data' 
                : (learningProgress >= 0 ? 'Improving' : 'Needs improvement')}
            </StatSubtext>
          </StatCard>
          
          <StatCard 
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <StatHeader>
              <StatIcon><FiClock size={18} /></StatIcon>
              <StatLabel>Total Sessions</StatLabel>
            </StatHeader>
            <StatValue>{totalEntries}</StatValue>
            <StatSubtext>Recorded wake-ups</StatSubtext>
          </StatCard>
        </StatsGrid>
      </StatsContainer>
      
      <ProgressContainer>
        <ProgressTitle>
          <FiTrendingUp size={18} />
          Learning Efficiency
        </ProgressTitle>
        <ProgressBar>
          <ProgressFill 
            percentage={efficiency}
            initial={{ width: 0 }}
            animate={{ width: `${efficiency}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </ProgressBar>
        <ProgressLabel>
          <span>0%</span>
          <span>{efficiency.toFixed(1)}%</span>
          <span>100%</span>
        </ProgressLabel>
      </ProgressContainer>
      
      <HistoryContainer>
        <HistoryTitle>Recent History</HistoryTitle>
        
        {history.length === 0 ? (
          <EmptyHistory>
            No alarm history yet. Use the alarm to start collecting data.
          </EmptyHistory>
        ) : (
          <HistoryList>
            <AnimatePresence>
              {history.slice(0, 7).map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <HistoryItem>
                    <HistoryHeader>
                      <HistoryDate>
                        <FiCalendar style={{ marginRight: '4px' }} size={14} />
                        {formatDate(item.date)}
                      </HistoryDate>
                      <RewardBadge value={item.reward}>
                        {item.reward > 0 ? '+' : ''}{item.reward.toFixed(1)} points
                      </RewardBadge>
                    </HistoryHeader>
                    
                    <HistoryTimes>
                      <div>
                        <TimeLabel>Scheduled:</TimeLabel>
                        <TimeValue>{item.scheduledTime}</TimeValue>
                      </div>
                      <div>
                        <TimeLabel>Actual:</TimeLabel>
                        <TimeValue>{item.actualWakeupTime}</TimeValue>
                      </div>
                      <div>
                        <TimeLabel>Snoozes:</TimeLabel>
                        <TimeValue>{item.snoozeCount}</TimeValue>
                      </div>
                    </HistoryTimes>
                  </HistoryItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </HistoryList>
        )}
      </HistoryContainer>
    </div>
  );
};

export default Dashboard; 