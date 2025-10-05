import { useState, useEffect, useCallback } from 'react';
import { TimerPattern, TimerMode, AudioFiles } from '../types';

interface UseTimerProps {
  patterns: TimerPattern[];
  playSound: (sound: keyof AudioFiles) => void;
  initAudio: () => void;
}

export const useTimer = ({ patterns, playSound, initAudio }: UseTimerProps) => {
  const [currentPatternIndex, setCurrentPatternIndex] = useState<number>(0);
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [timerMode, setTimerMode] = useState<TimerMode>('idle');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const activePattern = patterns[currentPatternIndex];

  const initializeTimer = useCallback(() => {
    if (patterns.length === 0) {
      setTimerMode('idle');
      setCurrentTime(0);
      setCurrentCycle(1);
      setCurrentPatternIndex(0);
      setIsRunning(false);
      return;
    }
    setCurrentPatternIndex(0);
    setCurrentCycle(1);
    setTimerMode('idle');
    setCurrentTime(0);
    setIsRunning(false);
  }, [patterns]);

  useEffect(() => {
    initializeTimer();
  }, [patterns, initializeTimer]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isRunning && currentTime > 0) {
      intervalId = setInterval(() => {
        setCurrentTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isRunning && currentTime === 0) {
      if (timerMode === 'countdown') {
        playSound('workWhistle');
        const firstPattern = patterns[0];
        setCurrentPatternIndex(0);
        setCurrentCycle(1);
        setTimerMode('work');
        setCurrentTime(firstPattern.workTime);
      } else if (timerMode === 'work') {
        playSound('workWhistle');
        if (
          currentPatternIndex === patterns.length - 1 &&
          currentCycle === activePattern.sets
        ) {
          setTimerMode('finished');
          setIsRunning(false);
        } else {
          setTimerMode('rest');
          setCurrentTime(activePattern.restTime);
        }
      } else if (timerMode === 'rest') {
        playSound('restWhistle');
        if (currentCycle < activePattern.sets) {
          setCurrentCycle((prev) => prev + 1);
          setTimerMode('work');
          setCurrentTime(activePattern.workTime);
        } else if (currentPatternIndex < patterns.length - 1) {
          const nextPatternIndex = currentPatternIndex + 1;
          setCurrentPatternIndex(nextPatternIndex);
          setCurrentCycle(1);
          setTimerMode('work');
          setCurrentTime(patterns[nextPatternIndex].workTime);
        } else {
          setTimerMode('finished');
          setIsRunning(false);
        }
      }
    }

    if (isRunning) {
      if (
        timerMode === 'work' &&
        activePattern &&
        currentTime === Math.ceil(activePattern.workTime / 2)
      ) {
        playSound('halfBeep');
      }

      if (timerMode === 'rest' && currentTime >= 1 && currentTime <= 5) {
        playSound('beep');
      } else if (currentTime >= 1 && currentTime <= 3) {
        playSound('beep');
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    isRunning,
    currentTime,
    timerMode,
    patterns,
    currentPatternIndex,
    currentCycle,
    activePattern,
    playSound,
  ]);

  const handleStartPause = () => {
    if (timerMode === 'finished' || patterns.length === 0) return;

    initAudio(); // Initialize audio on first start click

    if (timerMode === 'idle' && patterns.length > 0) {
      setTimerMode('countdown');
      setCurrentTime(5);
      setIsRunning(true);
      return;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    initializeTimer();
  };

  return {
    currentTime,
    timerMode,
    isRunning,
    currentCycle,
    currentPatternIndex,
    activePattern,
    handleStartPause,
    handleReset,
  };
};
