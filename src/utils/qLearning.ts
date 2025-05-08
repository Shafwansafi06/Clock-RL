// Q-Learning utility for alarm time adjustment
export interface QState {
  currentTime: string; // Format: HH:MM
  targetTime: string; // Format: HH:MM
  day: number; // 0-6 (Sunday-Saturday)
}

export interface QAction {
  adjustMinutes: number; // Minutes to adjust (can be negative or positive)
}

export interface QTableEntry {
  state: QState;
  actions: Record<string, number>; // Map of action keys to Q-values
}

export class QLearningAgent {
  private qTable: QTableEntry[] = [];
  private learningRate: number;
  private discountFactor: number;
  private explorationRate: number;

  constructor(
    learningRate = 0.1,
    discountFactor = 0.9,
    explorationRate = 0.2
  ) {
    this.learningRate = learningRate;
    this.discountFactor = discountFactor;
    this.explorationRate = explorationRate;
    this.loadQTable();
  }

  // Save Q-Table to localStorage
  private saveQTable(): void {
    localStorage.setItem('alarmQTable', JSON.stringify(this.qTable));
  }

  // Load Q-Table from localStorage
  private loadQTable(): void {
    const savedTable = localStorage.getItem('alarmQTable');
    if (savedTable) {
      try {
        this.qTable = JSON.parse(savedTable);
      } catch (e) {
        console.error('Failed to parse Q-Table from localStorage:', e);
        this.qTable = [];
      }
    }
  }

  // Find or create a state in the Q-Table
  private getStateEntry(state: QState): QTableEntry {
    // Find matching state in the Q-Table
    const stateKey = this.getStateKey(state);
    const existingEntry = this.qTable.find(
      entry => this.getStateKey(entry.state) === stateKey
    );

    if (existingEntry) {
      return existingEntry;
    }

    // Create new state entry with possible actions
    const possibleActions = {
      // Adjust alarm earlier or later by various intervals
      '-30': 0, // 30 mins earlier
      '-20': 0, // 20 mins earlier
      '-15': 0, // 15 mins earlier
      '-10': 0, // 10 mins earlier
      '-5': 0,  // 5 mins earlier
      '0': 0,   // no change
      '5': 0,   // 5 mins later
      '10': 0,  // 10 mins later
      '15': 0,  // 15 mins later
      '20': 0,  // 20 mins later
      '30': 0   // 30 mins later
    };

    const newEntry: QTableEntry = {
      state: { ...state },
      actions: possibleActions
    };

    this.qTable.push(newEntry);
    return newEntry;
  }

  // Generate a unique key for a state
  private getStateKey(state: QState): string {
    return `${state.day}-${state.currentTime}-${state.targetTime}`;
  }

  // Choose an action based on current state using epsilon-greedy policy
  public chooseAction(state: QState): QAction {
    const stateEntry = this.getStateEntry(state);
    
    // Exploration: randomly choose an action
    if (Math.random() < this.explorationRate) {
      const actionKeys = Object.keys(stateEntry.actions);
      const randomActionKey = actionKeys[Math.floor(Math.random() * actionKeys.length)];
      return { adjustMinutes: parseInt(randomActionKey, 10) };
    }
    
    // Exploitation: choose the best known action
    let bestActionKey = '0'; // Default: no adjustment
    let bestValue = -Infinity;
    
    for (const [actionKey, value] of Object.entries(stateEntry.actions)) {
      if (value > bestValue) {
        bestValue = value;
        bestActionKey = actionKey;
      }
    }
    
    return { adjustMinutes: parseInt(bestActionKey, 10) };
  }

  // Update Q-Table based on reward
  public updateQValues(
    state: QState,
    action: QAction,
    reward: number,
    nextState: QState
  ): void {
    const stateEntry = this.getStateEntry(state);
    const actionKey = String(action.adjustMinutes);
    
    // Get maximum Q-value of next state
    const nextStateEntry = this.getStateEntry(nextState);
    const maxNextQValue = Math.max(...Object.values(nextStateEntry.actions));
    
    // Calculate new Q-value using Q-learning formula
    const oldQValue = stateEntry.actions[actionKey] || 0;
    const newQValue = oldQValue + this.learningRate * (
      reward + this.discountFactor * maxNextQValue - oldQValue
    );
    
    // Update Q-value for the state-action pair
    stateEntry.actions[actionKey] = newQValue;
    
    // Save updated Q-Table
    this.saveQTable();
  }

  // Convert time string (HH:MM) to minutes since midnight
  public static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Convert minutes since midnight to time string (HH:MM)
  public static minutesToTime(minutes: number): string {
    minutes = Math.max(0, Math.min(1439, minutes)); // Clamp between 0 and 1439 (23:59)
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Calculate reward based on user behavior
  public static calculateReward(
    alarmTime: string,
    wakeupTime: string,
    snoozeCount: number
  ): number {
    const alarmMinutes = QLearningAgent.timeToMinutes(alarmTime);
    const wakeupMinutes = QLearningAgent.timeToMinutes(wakeupTime);
    
    // Time difference in minutes (can be negative if woke up before alarm)
    const timeDiff = wakeupMinutes - alarmMinutes;
    
    // Base reward is higher if user woke up close to alarm time
    const baseReward = Math.max(0, 10 - Math.abs(timeDiff) / 6);
    
    // Penalty for snoozing
    const snoozePenalty = snoozeCount * 2;
    
    // Total reward (can be negative)
    return baseReward - snoozePenalty;
  }
} 