import { useCallback, useEffect, useRef, useState } from "react";
import { Howl, Howler } from "howler";

/**
 * Sound Effect Types - Add new sounds here as needed
 */
export type SoundEffect = 
  | "click"
  | "hover"
  | "success"
  | "error"
  | "correct"
  | "incorrect"
  | "countdown"
  | "gameStart"
  | "gameEnd"
  | "transition";

/**
 * Sound sprite definitions
 * Maps sound effect names to their audio file paths
 * Using placeholder paths - update with actual sound files when available
 */
const SOUND_PATHS: Record<SoundEffect, string> = {
  click: "/sounds/click.mp3",
  hover: "/sounds/hover.mp3",
  success: "/sounds/success.mp3",
  error: "/sounds/error.mp3",
  correct: "/sounds/correct.mp3",
  incorrect: "/sounds/incorrect.mp3",
  countdown: "/sounds/countdown.mp3",
  gameStart: "/sounds/game-start.mp3",
  gameEnd: "/sounds/game-end.mp3",
  transition: "/sounds/transition.mp3",
};

interface UseSoundOptions {
  volume?: number;
  playbackRate?: number;
  interrupt?: boolean;
  onPlay?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

interface UseSoundReturn {
  play: () => void;
  stop: () => void;
  pause: () => void;
  isPlaying: boolean;
  duration: number | null;
}

/**
 * Hook for playing individual sound effects
 * 
 * @example
 * const { play } = useSound("click");
 * // In a button: onClick={play}
 */
export function useSound(
  sound: SoundEffect,
  options: UseSoundOptions = {}
): UseSoundReturn {
  const {
    volume = 0.5,
    playbackRate = 1,
    interrupt = true,
    onPlay,
    onEnd,
    onError,
  } = options;

  const soundRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);

  // Initialize sound on mount
  useEffect(() => {
    const soundPath = SOUND_PATHS[sound];
    
    soundRef.current = new Howl({
      src: [soundPath],
      volume,
      rate: playbackRate,
      preload: true,
      onload: () => {
        if (soundRef.current) {
          setDuration(soundRef.current.duration());
        }
      },
      onplay: () => {
        setIsPlaying(true);
        onPlay?.();
      },
      onend: () => {
        setIsPlaying(false);
        onEnd?.();
      },
      onstop: () => {
        setIsPlaying(false);
      },
      onloaderror: (_id: number, err: unknown) => {
        console.warn(`[useSound] Failed to load sound: ${sound}`, err);
        onError?.(err);
      },
      onplayerror: (_id: number, err: unknown) => {
        console.warn(`[useSound] Failed to play sound: ${sound}`, err);
        onError?.(err);
      },
    });

    return () => {
      soundRef.current?.unload();
    };
  }, [sound, volume, playbackRate, onPlay, onEnd, onError]);

  const play = useCallback(() => {
    if (!soundRef.current) return;

    if (interrupt) {
      soundRef.current.stop();
    }
    soundRef.current.play();
  }, [interrupt]);

  const stop = useCallback(() => {
    soundRef.current?.stop();
  }, []);

  const pause = useCallback(() => {
    soundRef.current?.pause();
    setIsPlaying(false);
  }, []);

  return { play, stop, pause, isPlaying, duration };
}

/**
 * Global sound settings manager
 */
interface SoundManagerState {
  isMuted: boolean;
  volume: number;
}

const soundManagerState: SoundManagerState = {
  isMuted: false,
  volume: 0.5,
};

/**
 * Hook for managing global sound settings
 * 
 * @example
 * const { isMuted, toggleMute, setGlobalVolume } = useSoundManager();
 */
export function useSoundManager() {
  const [isMuted, setIsMuted] = useState(soundManagerState.isMuted);
  const [volume, setVolume] = useState(soundManagerState.volume);

  const toggleMute = useCallback(() => {
    const newMuted = !soundManagerState.isMuted;
    soundManagerState.isMuted = newMuted;
    Howler.mute(newMuted);
    setIsMuted(newMuted);
  }, []);

  const setGlobalVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    soundManagerState.volume = clampedVolume;
    Howler.volume(clampedVolume);
    setVolume(clampedVolume);
  }, []);

  // Initialize Howler global settings
  useEffect(() => {
    Howler.mute(soundManagerState.isMuted);
    Howler.volume(soundManagerState.volume);
  }, []);

  return {
    isMuted,
    volume,
    toggleMute,
    setGlobalVolume,
  };
}

/**
 * Hook for playing sounds without component lifecycle management
 * Useful for one-off sounds that don't need state tracking
 * 
 * @example
 * const playSound = useSoundEffect();
 * playSound("click");
 */
export function useSoundEffect() {
  const soundsCache = useRef<Map<SoundEffect, Howl>>(new Map());

  const playSound = useCallback((sound: SoundEffect, volume = 0.5) => {
    let howl = soundsCache.current.get(sound);

    if (!howl) {
      howl = new Howl({
        src: [SOUND_PATHS[sound]],
        volume,
        preload: true,
        onloaderror: (_id: number, err: unknown) => {
          console.warn(`[useSoundEffect] Failed to load: ${sound}`, err);
        },
      });
      soundsCache.current.set(sound, howl);
    }

    howl.play();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      soundsCache.current.forEach((howl) => howl.unload());
      soundsCache.current.clear();
    };
  }, []);

  return playSound;
}

export default useSound;
