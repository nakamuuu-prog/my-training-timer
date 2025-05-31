import { TimerPattern } from '../types';

const SETTINGS_PARAM_KEY = 'settings';

export const saveSettingsToURL = (patterns: TimerPattern[]): void => {
  if (patterns.length === 0) {
    const url = new URL(window.location.href);
    url.searchParams.delete(SETTINGS_PARAM_KEY);
    window.history.replaceState({}, '', url.toString());
    return;
  }
  try {
    const serializedSettings = encodeURIComponent(JSON.stringify(patterns));
    const newUrl = `${window.location.pathname}?${SETTINGS_PARAM_KEY}=${serializedSettings}`;
    window.history.replaceState({}, '', newUrl);
  } catch (error) {
    console.error('Error saving settings to URL:', error);
  }
};

export const loadSettingsFromURL = (): TimerPattern[] => {
  const params = new URLSearchParams(window.location.search);
  const serializedSettings = params.get(SETTINGS_PARAM_KEY);

  if (serializedSettings) {
    try {
      const decodedSettings = decodeURIComponent(serializedSettings);
      const parsedSettings = JSON.parse(decodedSettings) as TimerPattern[];
      if (
        Array.isArray(parsedSettings) &&
        parsedSettings.every(
          (p) =>
            typeof p.id === 'string' &&
            typeof p.workTime === 'number' &&
            p.workTime > 0 &&
            typeof p.restTime === 'number' &&
            p.restTime > 0 &&
            typeof p.cycles === 'number' &&
            p.cycles > 0
        )
      ) {
        return parsedSettings;
      }
    } catch (error) {
      console.error('Error loading settings from URL:', error);
    }
  }
  return [];
};
