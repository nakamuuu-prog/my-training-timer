import React from 'react';
import './App.css';
import PatternList from './components/PatternList';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import { usePatterns } from './hooks/usePatterns';
import { useAudio } from './hooks/useAudio';
import { useTimer } from './hooks/useTimer';

const App: React.FC = () => {
  const { patterns, addPattern, removePattern, updatePattern } = usePatterns();
  const { initAudio, playSound, volume, setVolume } = useAudio(1.0);
  const {
    currentTime,
    timerMode,
    isRunning,
    currentCycle,
    currentPatternIndex,
    activePattern,
    handleStartPause,
    handleReset,
  } = useTimer({ patterns, playSound, initAudio });

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
        volume={volume}
        onVolumeChange={setVolume}
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