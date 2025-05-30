export interface TimerPattern {
  id: string;
  workTime: number;
  restTime: number;
  cycles: number;
}

export type TimerMode = "work" | "rest" | "idle" | "finished";

export interface AudioFiles {
  workWhistle: string;
  restWhistle: string;
  halfBeep: string;
  beep: string;
}
