export interface Alarm {
  id: string;
  time: string; // Format: HH:MM
  originalTime: string; // Format: HH:MM (the time set by user before adjustment)
  days: number[]; // 0-6 (Sunday-Saturday)
  enabled: boolean;
  label: string;
  snoozeEnabled: boolean;
  snoozeInterval: number; // in minutes
  snoozeLimit: number;
}

export interface AlarmHistory {
  alarmId: string;
  date: string; // ISO date string
  scheduledTime: string; // Format: HH:MM
  actualWakeupTime: string; // Format: HH:MM
  snoozeCount: number;
  reward: number;
}

export enum AlarmStatus {
  IDLE = 'idle',
  RINGING = 'ringing',
  SNOOZED = 'snoozed',
  DISMISSED = 'dismissed',
}

export interface AlarmState {
  currentAlarm: Alarm | null;
  status: AlarmStatus;
  snoozeCount: number;
  nextSnoozeTime: string | null;
}

export interface AlarmSound {
  id: string;
  name: string;
  url: string;
} 