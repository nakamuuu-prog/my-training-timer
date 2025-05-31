import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { TimerPattern, TimerMode, AudioFiles } from './types';
import PatternList from './components/PatternList';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import { loadSettingsFromURL, saveSettingsToURL } from './utils/urlParams'; // 後述

const defaultAudioFiles: AudioFiles = {
  workWhistle: '/audio/work_whistle_placeholder.mp3',
  restWhistle: '/audio/rest_whistle_placeholder.mp3',
  halfBeep: '/audio/half_beep_placeholder.mp3',
  beep: '/audio/beep_placeholder.mp3',
};

const App: React.FC = () => {
  const [patterns, setPatterns] = useState<TimerPattern[]>(() => {
    const savedPatterns = loadSettingsFromURL();
    return savedPatterns.length > 0
      ? savedPatterns
      : [{ id: crypto.randomUUID(), workTime: 30, restTime: 30, cycles: 4 }];
  });
  const [currentPatternIndex, setCurrentPatternIndex] = useState<number>(0);
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [timerMode, setTimerMode] = useState<TimerMode>('idle');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [audioFiles] = useState<AudioFiles>(defaultAudioFiles);

  const [sounds, setSounds] = useState<{
    workEnd?: HTMLAudioElement;
    restEnd?: HTMLAudioElement;
    halfBeep?: HTMLAudioElement;
  }>({});

  useEffect(() => {
    setSounds({
      workEnd: new Audio(audioFiles.workWhistle),
      restEnd: new Audio(audioFiles.restWhistle),
      halfBeep: new Audio(audioFiles.halfBeep),
    });
  }, [audioFiles]);

  const activePattern = patterns[currentPatternIndex];

  const initializeTimer = useCallback(() => {
    if (patterns.length === 0) return;
    const firstPattern = patterns[0];
    setCurrentPatternIndex(0);
    setCurrentCycle(1);
    setTimerMode('work');
    setCurrentTime(firstPattern.workTime);
    setIsRunning(false);
  }, [patterns]);

  useEffect(() => {
    initializeTimer();
  }, [patterns, initializeTimer]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isRunning && currentTime > 0 && activePattern) {
      intervalId = setInterval(() => {
        setCurrentTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isRunning && currentTime === 0 && activePattern) {
      // 時間切れの処理
      if (timerMode === 'work') {
        sounds.workEnd?.play();
        setTimerMode('rest');
        setCurrentTime(activePattern.restTime);
      } else if (timerMode === 'rest') {
        sounds.restEnd?.play();
        if (currentCycle < activePattern.cycles) {
          setCurrentCycle((prev) => prev + 1);
          setTimerMode('work');
          setCurrentTime(activePattern.workTime);
        } else if (currentPatternIndex < patterns.length - 1) {
          // 次のパターンへ
          const nextPatternIndex = currentPatternIndex + 1;
          setCurrentPatternIndex(nextPatternIndex);
          setCurrentCycle(1);
          setTimerMode('work');
          setCurrentTime(patterns[nextPatternIndex].workTime);
        } else {
          // 全パターン終了
          setTimerMode('finished');
          setIsRunning(false);
        }
      }
    }

    // 音声通知ロジック (残り半分、残り5秒)
    if (isRunning && activePattern) {
      if (
        timerMode === 'work' &&
        currentTime === Math.ceil(activePattern.workTime / 2)
      ) {
        sounds.halfBeep?.play();
      }
      if (currentTime <= 5 && currentTime > 0) {
        // 1秒間隔だと次のビープ音がなるまでにビープ音が鳴り止まず、次のビープ音が鳴らないので都度初期化してビープ音を鳴らす
        const shortBeep = new Audio(audioFiles.beep);
        shortBeep?.play();
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
    sounds,
  ]);

  const handleStartPause = () => {
    if (timerMode === 'finished' || patterns.length === 0) return;
    if (timerMode === 'idle' && patterns.length > 0) {
      const firstPattern = patterns[0];
      setCurrentPatternIndex(0);
      setCurrentCycle(1);
      setTimerMode('work');
      setCurrentTime(firstPattern.workTime);
      setIsRunning(true);
      return;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    initializeTimer();
  };

  const handlePatternsChange = (newPatterns: TimerPattern[]) => {
    setPatterns(newPatterns);
    saveSettingsToURL(newPatterns);
  };

  const addPattern = () => {
    if (patterns.length < 5) {
      const newPattern: TimerPattern = {
        id: crypto.randomUUID(),
        workTime: 20,
        restTime: 10,
        cycles: 3,
      };
      handlePatternsChange([...patterns, newPattern]);
    }
  };

  const removePattern = (id: string) => {
    handlePatternsChange(patterns.filter((p) => p.id !== id));
  };

  const updatePattern = (updatedPattern: TimerPattern) => {
    handlePatternsChange(
      patterns.map((p) => (p.id === updatedPattern.id ? updatedPattern : p))
    );
  };

  return (
    <div className='my-training-timer'>
      <h1>My Training Timer</h1>
      <TimerDisplay
        mode={timerMode}
        currentTime={currentTime}
        currentCycle={activePattern ? currentCycle : 0}
        totalCycles={activePattern ? activePattern.cycles : 0}
        currentPatternIndex={activePattern ? currentPatternIndex + 1 : 0}
        totalPatterns={patterns.length}
      />
      <Controls
        isRunning={isRunning}
        onStartPause={handleStartPause}
        onReset={handleReset}
        canStart={patterns.length > 0}
      />
      <PatternList
        patterns={patterns}
        onAddPattern={addPattern}
        onRemovePattern={removePattern}
        onUpdatePattern={updatePattern}
        maxPatterns={5}
      />
    </div>
  );
};

export default App;
