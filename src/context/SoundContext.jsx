import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const SoundContext = createContext(null);

const DEFAULT_VOLUME = 0.045;
const FALLBACK_SAMPLE_RATE = 44100;
const PREFER_HTML_AUDIO = true;

const SOUND_PROFILES = {
  modern: {
    click: { frequency: 1080, duration: 0.03, type: 'triangle' },
    success: {
      sequence: [
        { frequency: 960, duration: 0.05, type: 'triangle' },
        { frequency: 1440, duration: 0.06, type: 'sine' },
      ],
    },
    error: {
      sequence: [
        { frequency: 440, duration: 0.06, type: 'triangle' },
        { frequency: 330, duration: 0.08, type: 'triangle' },
      ],
    },
    warning: {
      sequence: [
        { frequency: 780, duration: 0.05, type: 'sine' },
        { frequency: 660, duration: 0.06, type: 'sine' },
      ],
    },
    login: {
      sequence: [
        { frequency: 880, duration: 0.05, type: 'triangle' },
        { frequency: 1180, duration: 0.06, type: 'sine' },
        { frequency: 1560, duration: 0.07, type: 'sine' },
      ],
    },
    entry: {
      sequence: [
        { frequency: 820, duration: 0.05, type: 'triangle' },
        { frequency: 1200, duration: 0.07, type: 'sine' },
      ],
    },
  },
  soft: {
    click: { frequency: 820, duration: 0.04, type: 'sine' },
    success: {
      sequence: [
        { frequency: 740, duration: 0.06, type: 'sine' },
        { frequency: 980, duration: 0.08, type: 'sine' },
      ],
    },
    error: {
      sequence: [
        { frequency: 360, duration: 0.07, type: 'sine' },
        { frequency: 280, duration: 0.09, type: 'sine' },
      ],
    },
    warning: {
      sequence: [
        { frequency: 620, duration: 0.06, type: 'sine' },
        { frequency: 520, duration: 0.07, type: 'sine' },
      ],
    },
    login: {
      sequence: [
        { frequency: 740, duration: 0.06, type: 'sine' },
        { frequency: 980, duration: 0.08, type: 'sine' },
        { frequency: 1240, duration: 0.09, type: 'sine' },
      ],
    },
    entry: {
      sequence: [
        { frequency: 680, duration: 0.06, type: 'sine' },
        { frequency: 980, duration: 0.08, type: 'sine' },
      ],
    },
  },
  tech: {
    click: { frequency: 1480, duration: 0.025, type: 'triangle' },
    success: {
      sequence: [
        { frequency: 1200, duration: 0.04, type: 'triangle' },
        { frequency: 1680, duration: 0.05, type: 'sine' },
      ],
    },
    error: {
      sequence: [
        { frequency: 560, duration: 0.05, type: 'triangle' },
        { frequency: 420, duration: 0.07, type: 'triangle' },
      ],
    },
    warning: {
      sequence: [
        { frequency: 980, duration: 0.045, type: 'sine' },
        { frequency: 820, duration: 0.055, type: 'sine' },
      ],
    },
    login: {
      sequence: [
        { frequency: 1120, duration: 0.045, type: 'triangle' },
        { frequency: 1480, duration: 0.055, type: 'sine' },
        { frequency: 1860, duration: 0.06, type: 'sine' },
      ],
    },
    entry: {
      sequence: [
        { frequency: 1040, duration: 0.045, type: 'triangle' },
        { frequency: 1520, duration: 0.06, type: 'sine' },
      ],
    },
  },
};

const getSoundConfig = (profile, kind) => {
  const selected = SOUND_PROFILES[profile] || SOUND_PROFILES.modern;
  return selected[kind] || selected.click;
};

const createEnvelope = (context, destination, { duration = 0.12, volume = DEFAULT_VOLUME }) => {
  const gainNode = context.createGain();
  gainNode.gain.setValueAtTime(0, context.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  gainNode.connect(destination);
  return gainNode;
};

const playTone = (context, destination, { frequency, type = 'sine', duration, volume }) => {
  const osc = context.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, context.currentTime);
  const envelope = createEnvelope(context, destination, { duration, volume });
  osc.connect(envelope);
  osc.start();
  osc.stop(context.currentTime + duration + 0.02);
};

const playSequence = (context, destination, sequence, volume) => {
  let offset = 0;
  sequence.forEach((tone) => {
    const duration = tone.duration || 0.1;
    const when = context.currentTime + offset;
    const osc = context.createOscillator();
    osc.type = tone.type || 'sine';
    osc.frequency.setValueAtTime(tone.frequency, when);
    const gainNode = context.createGain();
    gainNode.gain.setValueAtTime(0, when);
    gainNode.gain.linearRampToValueAtTime(volume, when + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    osc.connect(gainNode);
    gainNode.connect(destination);
    osc.start(when);
    osc.stop(when + duration + 0.02);
    offset += duration + (tone.gap || 0.02);
  });
};

export const SoundProvider = ({ children }) => {
  const contextRef = useRef(null);
  const masterGainRef = useRef(null);
  const [unlocked, setUnlocked] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const stored = localStorage.getItem('soundEnabled');
    return stored ? stored === 'true' : true;
  });
  const [soundProfile, setSoundProfile] = useState(() => {
    const stored = localStorage.getItem('soundProfile');
    return stored || 'modern';
  });
  const [soundVolume, setSoundVolume] = useState(() => {
    const stored = localStorage.getItem('soundVolume');
    const parsed = Number(stored);
    return Number.isFinite(parsed) ? parsed : 1;
  });
  const pendingEntryRef = useRef(false);
  const fallbackCacheRef = useRef(new Map());

  const ensureContext = useCallback(() => {
    if (!contextRef.current) {
      contextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      masterGainRef.current = contextRef.current.createGain();
      const scaled = Math.pow(Math.max(soundVolume, 0), 1.6);
      masterGainRef.current.gain.setValueAtTime(DEFAULT_VOLUME * scaled, contextRef.current.currentTime);
      masterGainRef.current.connect(contextRef.current.destination);
    }
    return contextRef.current;
  }, [soundVolume]);

  const encodeWavData = (samples) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset, value) => {
      for (let i = 0; i < value.length; i += 1) {
        view.setUint8(offset + i, value.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, FALLBACK_SAMPLE_RATE, true);
    view.setUint32(28, FALLBACK_SAMPLE_RATE * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    samples.forEach((sample) => {
      view.setInt16(offset, sample, true);
      offset += 2;
    });

    return buffer;
  };

  const buildFallbackDataUri = (frequency, duration, volume = 0.3) => {
    if (typeof window === 'undefined') return null;
    const key = `${frequency}-${duration}-${volume}`;
    if (fallbackCacheRef.current.has(key)) {
      return fallbackCacheRef.current.get(key);
    }

    const totalSamples = Math.floor((FALLBACK_SAMPLE_RATE * duration) / 1000);
    const samples = new Int16Array(totalSamples);
    const gain = Math.min(Math.max(volume, 0), 1);

    for (let i = 0; i < totalSamples; i += 1) {
      const t = i / FALLBACK_SAMPLE_RATE;
      const value = Math.sin(2 * Math.PI * frequency * t);
      samples[i] = Math.floor(value * gain * 32767);
    }

    const wavBuffer = encodeWavData(samples);
    const bytes = new Uint8Array(wavBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = window.btoa(binary);
    const dataUri = `data:audio/wav;base64,${base64}`;
    fallbackCacheRef.current.set(key, dataUri);
    return dataUri;
  };

  const playFallbackTone = (frequency, duration, volume = 0.3) => {
    const dataUri = buildFallbackDataUri(frequency, duration, volume);
    if (!dataUri) return;
    const audio = new Audio(dataUri);
    audio.volume = Math.min(Math.max(volume, 0), 1);
    audio.play().catch(() => { });
  };

  const playFallbackSequence = (sequence, volume = 0.3) => {
    let offset = 0;
    sequence.forEach((tone) => {
      const duration = tone.duration || 0.1;
      const gap = tone.gap || 0.02;
      window.setTimeout(() => {
        playFallbackTone(tone.frequency, duration * 1000, volume);
      }, offset * 1000);
      offset += duration + gap;
    });
  };

  const play = useCallback((kind = 'click') => {
    if (!soundEnabled) return;
    const scaled = Math.pow(Math.max(soundVolume, 0), 1.6);
    const fallbackVolume = 0.14 * scaled;
    const fallbackSequenceVolume = 0.18 * scaled;
    const soundConfig = getSoundConfig(soundProfile, kind);

    if (PREFER_HTML_AUDIO) {
      if (soundConfig.sequence) {
        playFallbackSequence(soundConfig.sequence, fallbackSequenceVolume);
        return;
      }
      playFallbackTone(soundConfig.frequency, soundConfig.duration * 1000, fallbackVolume);
      return;
    }

    const ctx = ensureContext();
    if (!masterGainRef.current) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const shouldFallback = ctx.state !== 'running';

    const destination = masterGainRef.current;

    if (shouldFallback) {
      if (soundConfig.sequence) {
        playFallbackSequence(soundConfig.sequence, fallbackSequenceVolume);
        return;
      }
      playFallbackTone(soundConfig.frequency, soundConfig.duration * 1000, fallbackVolume);
      return;
    }

    if (soundConfig.sequence) {
      playSequence(ctx, destination, soundConfig.sequence, DEFAULT_VOLUME * 0.85 * scaled);
      return;
    }

    playTone(ctx, destination, {
      frequency: soundConfig.frequency,
      type: soundConfig.type || 'sine',
      duration: soundConfig.duration,
      volume: DEFAULT_VOLUME * 0.65 * scaled,
    });
  }, [ensureContext, soundEnabled, soundProfile, soundVolume]);

  const unlockAudio = useCallback(async () => {
    try {
      const ctx = ensureContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      setUnlocked(true);
      if (pendingEntryRef.current && soundEnabled) {
        pendingEntryRef.current = false;
        play('entry');
      }
    } catch {
      // Ignore unlock failures.
    }
  }, [ensureContext, play, soundEnabled]);

  const requestEntrySound = useCallback(() => {
    if (!soundEnabled) return;
    if (unlocked) {
      play('entry');
    } else {
      pendingEntryRef.current = true;
    }
  }, [play, soundEnabled, unlocked]);

  useEffect(() => {
    localStorage.setItem('soundEnabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('soundProfile', soundProfile);
  }, [soundProfile]);

  useEffect(() => {
    const normalized = Math.min(Math.max(soundVolume, 0), 1.5);
    if (normalized !== soundVolume) {
      setSoundVolume(normalized);
      return;
    }

    localStorage.setItem('soundVolume', String(soundVolume));
    if (contextRef.current && masterGainRef.current) {
      masterGainRef.current.gain.setValueAtTime(
        DEFAULT_VOLUME * Math.pow(Math.max(soundVolume, 0), 1.6),
        contextRef.current.currentTime
      );
    }
  }, [soundVolume]);

  useEffect(() => {
    const handlePointer = () => {
      unlockAudio();
    };

    window.addEventListener('pointerdown', handlePointer, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handlePointer);
    };
  }, [unlockAudio]);

  useEffect(() => {
    const handleClick = (event) => {
      if (!soundEnabled) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const clickable = target.closest('button, a, [role="button"], [data-sound]');
      if (!clickable) return;
      const sound = clickable.getAttribute('data-sound');
      if (sound === 'off') return;
      const kind = sound || 'click';
      play(kind);
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [play, soundEnabled]);

  return (
    <SoundContext.Provider value={{
      play,
      requestEntrySound,
      unlocked,
      soundEnabled,
      setSoundEnabled,
      soundProfile,
      setSoundProfile,
      soundVolume,
      setSoundVolume
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
