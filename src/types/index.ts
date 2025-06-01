export interface TimerPattern {
  pattern: number;
  workTime: number;
  restTime: number;
  sets: number;
}

export type TimerMode = 'work' | 'rest' | 'idle' | 'finished';

export interface AudioFiles {
  workWhistle: string;
  restWhistle: string;
  halfBeep: string;
  beep: string;
}
