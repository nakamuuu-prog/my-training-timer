import React from "react";

interface ControlsProps {
  isRunning: boolean;
  onStartPause: () => void;
  onReset: () => void;
  canStart: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  isRunning,
  onStartPause,
  onReset,
  canStart,
}) => {
  return (
    <div className="controls">
      <button onClick={onStartPause} disabled={!canStart}>
        {isRunning ? "一時停止 ⏸️" : "開始 ▶️"}
      </button>
      <button onClick={onReset} disabled={!canStart}>
        リセット 🔄
      </button>
    </div>
  );
};

export default Controls;
