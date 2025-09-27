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
      : [{ pattern: 1, workTime: 30, restTime: 30, sets: 6 }];
  });
  const [currentPatternIndex, setCurrentPatternIndex] = useState<number>(0);
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [timerMode, setTimerMode] = useState<TimerMode>('idle');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [audioFiles] = useState<AudioFiles>(defaultAudioFiles);

  // Web Audio API states
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [audioBuffers, setAudioBuffers] = useState<
    Record<keyof AudioFiles, AudioBuffer | null>
  >({
    workWhistle: null,
    restWhistle: null,
    halfBeep: null,
    beep: null,
  });

  useEffect(() => {
    if (!audioContext) return;

    const loadAudioData = async () => {
      const newBuffers = { ...audioBuffers };
      let needsUpdate = false;
      for (const key in audioFiles) {
        const typedKey = key as keyof AudioFiles;
        if (!newBuffers[typedKey]) {
          try {
            const response = await fetch(audioFiles[typedKey]);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            newBuffers[typedKey] = audioBuffer;
            needsUpdate = true;
          } catch (error) {
            console.error(
              `Error loading audio file: ${audioFiles[typedKey]}`,
              error
            );
          }
        }
      }
      if (needsUpdate) {
        setAudioBuffers(newBuffers);
      }
    };

    loadAudioData();
  }, [audioContext, audioFiles]);

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

  const playSound = useCallback(
    (buffer: AudioBuffer | null) => {
      if (!audioContext || !gainNode || !buffer) return;

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      source.start(0);
    },
    [audioContext, gainNode]
  );

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isRunning && currentTime > 0) {
      intervalId = setInterval(() => {
        setCurrentTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isRunning && currentTime === 0) {
      // 時間切れ or カウントダウン終了
      if (timerMode === 'countdown') {
        playSound(audioBuffers.workWhistle); // 開始のホイッスル
        const firstPattern = patterns[0];
        setCurrentPatternIndex(0);
        setCurrentCycle(1);
        setTimerMode('work');
        setCurrentTime(firstPattern.workTime);
      } else if (timerMode === 'work') {
        playSound(audioBuffers.workWhistle);
        // 最後のパターンかつ最後のセットであれば、休憩に入らずに終了
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
        playSound(audioBuffers.restWhistle);
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

    // 音声通知ロジック
    if (isRunning) {
      if (
        timerMode === 'work' &&
        activePattern &&
        currentTime === Math.ceil(activePattern.workTime / 2)
      ) {
        playSound(audioBuffers.halfBeep);
      }

      // カウントダウン音(3,2,1)と終了前ビープ音(5,4,3,2,1)
      if (
        (timerMode === 'countdown' && currentTime >= 1 && currentTime <= 3) ||
        (timerMode !== 'countdown' &&
          timerMode !== 'idle' &&
          currentTime >= 1 &&
          currentTime <= 5)
      ) {
        playSound(audioBuffers.beep);
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
    audioBuffers,
    playSound,
  ]);

  const handleStartPause = () => {
    if (timerMode === 'finished' || patterns.length === 0) return;

    if (!audioContext) {
      const context = new window.AudioContext();
      const gain = context.createGain();
      gain.gain.value = 1.8;
      setAudioContext(context);
      setGainNode(gain);
    }

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

  const handlePatternsChange = (newPatterns: TimerPattern[]) => {
    setPatterns(newPatterns);
    saveSettingsToURL(newPatterns);
  };

  const addPattern = () => {
    if (patterns.length < 5) {
      const newPattern: TimerPattern = {
        pattern:
          patterns.length > 0
            ? Math.max(...patterns.map((p) => p.pattern)) + 1
            : 1,
        workTime: 30,
        restTime: 30,
        sets: 6,
      };
      handlePatternsChange([...patterns, newPattern]);
    }
  };

  const removePattern = (pattern: number) => {
    handlePatternsChange(patterns.filter((p) => p.pattern !== pattern));
  };

  const updatePattern = (updatedPattern: TimerPattern) => {
    handlePatternsChange(
      patterns.map((p) =>
        p.pattern === updatedPattern.pattern ? updatedPattern : p
      )
    );
  };

  return (
    <div className='my-training-timer'>
      <h1>My Training Timer</h1>
      <TimerDisplay
        mode={timerMode}
        currentTime={currentTime}
        currentSet={activePattern ? currentCycle : 0}
        totalSets={activePattern ? activePattern.sets : 0}
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
