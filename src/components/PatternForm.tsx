import React, { useState, useEffect } from 'react';
import { TimerPattern } from '../types';

interface PatternFormProps {
  pattern: TimerPattern;
  onUpdatePattern: (pattern: TimerPattern) => void;
  onRemovePattern: (pattern: number) => void;
  index: number;
}

const PatternForm: React.FC<PatternFormProps> = ({
  pattern,
  onUpdatePattern,
  onRemovePattern,
  index,
}) => {
  const [workTime, setWorkTime] = useState<number>(pattern.workTime);
  const [restTime, setRestTime] = useState<number>(pattern.restTime);
  const [sets, setSets] = useState<number>(pattern.sets);

  useEffect(() => {
    setWorkTime(pattern.workTime);
    setRestTime(pattern.restTime);
    setSets(pattern.sets);
  }, [pattern]);

  const handleUpdate = () => {
    onUpdatePattern({ ...pattern, workTime, restTime, sets });
  };

  return (
    <div className='pattern-form'>
      <h4>パターン {index + 1}</h4>
      <div>
        <label>開始(秒): </label>
        <input
          type='number'
          value={workTime}
          min='1'
          onChange={(e) =>
            setWorkTime(Math.max(1, parseInt(e.target.value, 10)) || 1)
          }
          onBlur={handleUpdate}
        />
      </div>
      <div>
        <label>休憩(秒): </label>
        <input
          type='number'
          value={restTime}
          min='1'
          onChange={(e) =>
            setRestTime(Math.max(1, parseInt(e.target.value, 10)) || 1)
          }
          onBlur={handleUpdate}
        />
      </div>
      <div>
        <label>セット数: </label>
        <input
          type='number'
          value={sets}
          min='1'
          onChange={(e) =>
            setSets(Math.max(1, parseInt(e.target.value, 10)) || 1)
          }
          onBlur={handleUpdate}
        />
      </div>
      <button onClick={() => onRemovePattern(pattern.pattern)}>
        このパターンを削除
      </button>
    </div>
  );
};

export default PatternForm;
