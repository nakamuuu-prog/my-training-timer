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
    <div className='pattern-list-settings'>
      <h3>タイマーパターン設定</h3>
      {patterns.map((p, index) => (
        <PatternForm
          key={p.id}
          pattern={p}
          onUpdatePattern={onUpdatePattern}
          onRemovePattern={onRemovePattern}
          index={index}
        />
      ))}
      {patterns.length < maxPatterns && (
        <button onClick={onAddPattern}>パターンを追加 (+)</button>
      )}
      {patterns.length === 0 && <p>タイマーパターンを追加してください。</p>}
    </div>
  );
};

export default PatternList;
