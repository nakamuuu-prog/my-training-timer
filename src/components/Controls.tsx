import React from 'react';

interface ControlsProps {
  isRunning: boolean;
  onStartPause: () => void;
  onReset: () => void;
  canStart: boolean;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const Controls: React.FC<ControlsProps> = ({
  isRunning,
  onStartPause,
  onReset,
  canStart,
  volume,
  onVolumeChange,
}) => {
  return (
    <div className='controls'>
      <div className='main-controls'>
        <button onClick={onStartPause} disabled={!canStart}>
          {isRunning ? '一時停止 ⏸️' : '開始 ▶️'}
        </button>
        <button onClick={onReset} disabled={!canStart}>
          リセット 🔄
        </button>
      </div>
      <div className='volume-control'>
        <label>🔊 音量</label>
        <input
          type='range'
          min='0'
          max='2'
          step='0.1'
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        />
        <span>{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
};

export default Controls;
