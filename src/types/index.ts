export interface TimerPattern {
  pattern: number;
  workTime: number;
  restTime: number;
  sets: number;
}

export type TimerMode = 'idle' | 'countdown' | 'work' | 'rest' | 'finished';

export interface AudioFiles {
  workWhistle: string;
  restWhistle: string;
  halfBeep: string;
  beep: string;
}
