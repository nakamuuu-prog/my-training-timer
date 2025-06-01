import React from 'react';
import { TimerPattern } from '../types';
import PatternForm from './PatternForm';

interface PatternListProps {
  patterns: TimerPattern[];
  onAddPattern: () => void;
  onRemovePattern: (id: string) => void;
  onUpdatePattern: (pattern: TimerPattern) => void;
  maxPatterns: number;
}

const PatternList: React.FC<PatternListProps> = ({
  patterns,
  onAddPattern,
  onRemovePattern,
  onUpdatePattern,
  maxPatterns,
}) => {
  return (
    <div>
      <h3>タイマーパターン設定</h3>
      <div className='pattern-form-container'>
        {patterns.map((p, index) => (
          <PatternForm
            key={p.id}
            pattern={p}
            onUpdatePattern={onUpdatePattern}
            onRemovePattern={onRemovePattern}
            index={index}
          />
        ))}
      </div>
      {patterns.length < maxPatterns && (
        <div className='pattern-list-settings'>
          <button onClick={onAddPattern}>パターンを追加 (+)</button>
        </div>
      )}
      {patterns.length === 0 && <p>タイマーパターンを追加してください。</p>}
    </div>
  );
};

export default PatternList;
