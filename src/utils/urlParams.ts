import { TimerPattern } from '../types';

export const saveSettingsToURL = (patterns: TimerPattern[]): void => {
  if (patterns.length === 0) {
    const url = new URL(window.location.href);
    // 旧パラメータを全て削除
    url.search = '';
    window.history.replaceState({}, '', url.toString());
    return;
  }
  try {
    const params = new URLSearchParams();
    patterns.forEach((patternObj) => {
      params.append('pattern', patternObj.pattern.toString());
      params.append('workTime', patternObj.workTime.toString());
      params.append('restTime', patternObj.restTime.toString());
      params.append('sets', patternObj.sets.toString());
    });
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  } catch (error) {
    console.error('Error saving settings to URL:', error);
  }
};

export const loadSettingsFromURL = (): TimerPattern[] => {
  const params = new URLSearchParams(window.location.search);
  const patternList = params.getAll('pattern');
  const workTimeList = params.getAll('workTime');
  const restTimeList = params.getAll('restTime');
  const setsList = params.getAll('sets');

  const length = Math.min(
    patternList.length,
    workTimeList.length,
    restTimeList.length,
    setsList.length
  );
  const patterns: TimerPattern[] = [];
  for (let i = 0; i < length; i++) {
    const pattern = Number(patternList[i]);
    const workTime = Number(workTimeList[i]);
    const restTime = Number(restTimeList[i]);
    const sets = Number(setsList[i]);
    if (
      !isNaN(pattern) &&
      !isNaN(workTime) &&
      workTime > 0 &&
      !isNaN(restTime) &&
      restTime > 0 &&
      !isNaN(sets) &&
      sets > 0
    ) {
      patterns.push({
        pattern,
        workTime,
        restTime,
        sets,
      });
    }
  }
  return patterns;
};
