import { useState, useEffect, useCallback } from 'react';
import { AudioFiles } from '../types';

const defaultAudioFiles: AudioFiles = {
  workWhistle: '/audio/work_whistle_placeholder.mp3',
  restWhistle: '/audio/rest_whistle_placeholder.mp3',
  halfBeep: '/audio/half_beep_placeholder.mp3',
  beep: '/audio/beep_placeholder.mp3',
};

export const useAudio = (volume: number = 1.5) => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [audioBuffers, setAudioBuffers] = useState<
    Record<keyof AudioFiles, AudioBuffer | null>
  >({
    workWhistle: null,
    restWhistle: null,
    halfBeep: null,
    beep: null,
  });

  const initAudio = useCallback(() => {
    if (!audioContext) {
      const context = new window.AudioContext();
      const gain = context.createGain();
      gain.gain.value = volume;
      setAudioContext(context);
      setGainNode(gain);
    }
  }, [audioContext, volume]);

  useEffect(() => {
    if (!audioContext) return;

    const loadAudioData = async () => {
      const newBuffers = { ...audioBuffers };
      let needsUpdate = false;
      for (const key in defaultAudioFiles) {
        const typedKey = key as keyof AudioFiles;
        if (!newBuffers[typedKey]) {
          try {
            const response = await fetch(defaultAudioFiles[typedKey]);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            newBuffers[typedKey] = audioBuffer;
            needsUpdate = true;
          } catch (error) {
            console.error(
              `Error loading audio file: ${defaultAudioFiles[typedKey]}`,
              error
            );
          }
        }
      }
      if (needsUpdate) {
        setAudioBuffers(newBuffers);
      }
    };

    loadAudioData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioContext]);

  const playSound = useCallback(
    (sound: keyof AudioFiles) => {
      const buffer = audioBuffers[sound];
      if (!audioContext || !gainNode || !buffer) return;

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      source.start(0);
    },
    [audioContext, gainNode, audioBuffers]
  );

  return { initAudio, playSound };
};
