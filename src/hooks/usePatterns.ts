import { useState, useCallback } from 'react';
import { TimerPattern } from '../types';
import { loadSettingsFromURL, saveSettingsToURL } from '../utils/urlParams';

export const usePatterns = () => {
  const [patterns, setPatterns] = useState<TimerPattern[]>(() => {
    const savedPatterns = loadSettingsFromURL();
    return savedPatterns.length > 0
      ? savedPatterns
      : [{ pattern: 1, workTime: 30, restTime: 30, sets: 6 }];
  });

  const handlePatternsChange = useCallback((newPatterns: TimerPattern[]) => {
    setPatterns(newPatterns);
    saveSettingsToURL(newPatterns);
  }, []);

  const addPattern = useCallback(() => {
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
  }, [patterns, handlePatternsChange]);

  const removePattern = useCallback(
    (pattern: number) => {
      handlePatternsChange(patterns.filter((p) => p.pattern !== pattern));
    },
    [patterns, handlePatternsChange]
  );

  const updatePattern = useCallback(
    (updatedPattern: TimerPattern) => {
      handlePatternsChange(
        patterns.map((p) =>
          p.pattern === updatedPattern.pattern ? updatedPattern : p
        )
      );
    },
    [patterns, handlePatternsChange]
  );

  return {
    patterns,
    setPatterns,
    addPattern,
    removePattern,
    updatePattern,
  };
};
