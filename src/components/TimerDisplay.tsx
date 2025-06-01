import React from 'react';
import { TimerMode } from '../types';

interface TimerDisplayProps {
  mode: TimerMode;
  currentTime: number;
  currentSet: number;
  totalSets: number;
  currentPatternIndex: number;
  totalPatterns: number;
}

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  mode,
  currentTime,
  currentSet,
  totalSets,
  currentPatternIndex,
  totalPatterns,
}) => {
  let displayText = '準備完了';
  let modeClass = 'idle';
  if (mode === 'work') {
    displayText = '集中 💪';
    modeClass = 'work';
  }
  if (mode === 'rest') {
    displayText = '休憩 😮‍💨';
    modeClass = 'rest';
  }
  if (mode === 'finished') {
    displayText = '完了 🎉';
    modeClass = 'finished';
  }

  return (
    <div className={`timer-display rich-timer-display ${modeClass}`}>
      <h2 className='timer-mode-label'>{displayText}</h2>
      <div className='time-remaining digital-font'>
        {formatTime(totalPatterns === 0 ? 0 : currentTime)}
      </div>
      {mode !== 'idle' && mode !== 'finished' && totalPatterns > 0 && (
        <div className='cycle-info-card'>
          <div className='pattern-info'>
            パターン: <span>{currentPatternIndex}</span> / {totalPatterns}
          </div>
          <div className='cycle-info'>
            セット: <span>{currentSet}</span> / {totalSets}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerDisplay;
