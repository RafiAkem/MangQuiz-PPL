import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  volume: number;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  playBackgroundMusic: () => void;
  pauseBackgroundMusic: () => void;
  playHit: () => void;
  playSuccess: () => void;
}

export const useAudio = create<AudioState>()(
  persist(
    (set, get) => ({
      backgroundMusic: null,
      hitSound: null,
      successSound: null,
      isMuted: false, // Start unmuted by default
      volume: 0.5, // Default volume 50%
      
      setBackgroundMusic: (music) => {
        const { volume, isMuted } = get();
        music.volume = isMuted ? 0 : volume * 0.3; // Background music is quieter
        set({ backgroundMusic: music });
      },
      
      setHitSound: (sound) => {
        const { volume, isMuted } = get();
        sound.volume = isMuted ? 0 : volume * 0.5;
        set({ hitSound: sound });
      },
      
      setSuccessSound: (sound) => {
        const { volume, isMuted } = get();
        sound.volume = isMuted ? 0 : volume * 0.6;
        set({ successSound: sound });
      },
      
      toggleMute: () => {
        const { isMuted, backgroundMusic, volume } = get();
        const newMutedState = !isMuted;
        
        set({ isMuted: newMutedState });
        
        // Update background music volume
        if (backgroundMusic) {
          backgroundMusic.volume = newMutedState ? 0 : volume * 0.3;
        }
        
        console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
      },
      
      setVolume: (newVolume) => {
        const { backgroundMusic, isMuted } = get();
        set({ volume: newVolume });
        
        // Update background music volume if not muted
        if (backgroundMusic && !isMuted) {
          backgroundMusic.volume = newVolume * 0.3;
        }
      },
      
      playBackgroundMusic: () => {
        const { backgroundMusic, isMuted } = get();
        if (backgroundMusic && !isMuted) {
          backgroundMusic.play().catch(error => {
            console.log("Background music play prevented:", error);
          });
        }
      },
      
      pauseBackgroundMusic: () => {
        const { backgroundMusic } = get();
        if (backgroundMusic) {
          backgroundMusic.pause();
        }
      },
      
      playHit: () => {
        const { hitSound, isMuted, volume } = get();
        if (hitSound && !isMuted) {
          // Clone the sound to allow overlapping playback
          const soundClone = hitSound.cloneNode() as HTMLAudioElement;
          soundClone.volume = volume * 0.5;
          soundClone.play().catch(error => {
            console.log("Hit sound play prevented:", error);
          });
        }
      },
      
      playSuccess: () => {
        const { successSound, isMuted, volume } = get();
        if (successSound && !isMuted) {
          successSound.currentTime = 0;
          successSound.volume = volume * 0.6;
          successSound.play().catch(error => {
            console.log("Success sound play prevented:", error);
          });
        }
      }
    }),
    {
      name: "quizrush-audio-settings",
      partialize: (state) => ({ 
        isMuted: state.isMuted, 
        volume: state.volume 
      })
    }
  )
);
