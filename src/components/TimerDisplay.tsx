import React from "react";
import { TimerMode } from "../types";

interface TimerDisplayProps {
  mode: TimerMode;
  currentTime: number;
  currentCycle: number;
  totalCycles: number;
  currentPatternIndex: number;
  totalPatterns: number;
}

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  mode,
  currentTime,
  currentCycle,
  totalCycles,
  currentPatternIndex,
  totalPatterns,
}) => {
  let displayText = "準備完了";
  if (mode === "work") displayText = "集中 💪";
  if (mode === "rest") displayText = "休憩 😮‍💨";
  if (mode === "finished") displayText = "完了 🎉";

  return (
    <div className="timer-display">
      <h2>{displayText}</h2>
      <div className="time-remaining">{formatTime(currentTime)}</div>
      {mode !== "idle" && mode !== "finished" && totalPatterns > 0 && (
        <div className="cycle-info">
          パターン: {currentPatternIndex} / {totalPatterns}
          <br />
          サイクル: {currentCycle} / {totalCycles}
        </div>
      )}
    </div>
  );
};

export default TimerDisplay;
