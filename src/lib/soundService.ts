// lib/soundService.ts
class SoundService {
  private onlineSound: HTMLAudioElement | null = null;
  private offlineSound: HTMLAudioElement | null = null;
  private awaySound: HTMLAudioElement | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      // Load sounds only on client side
      this.onlineSound = new Audio('/sounds/online.mp3');
      this.offlineSound = new Audio('/sounds/offline.mp3');
      this.awaySound = new Audio('/sounds/online.mp3');
      
      // Preload sounds
      this.onlineSound.load();
      this.offlineSound.load();
      this.awaySound.load();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('sound_notifications_enabled', enabled ? 'true' : 'false');
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  loadSettings() {
    const saved = localStorage.getItem('sound_notifications_enabled');
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
    return this.enabled;
  }

  playOnline() {
    if (this.enabled && this.onlineSound) {
      this.onlineSound.currentTime = 0;
      this.onlineSound.play().catch(err => console.log('Sound play failed:', err));
    }
  }

  playOffline() {
    if (this.enabled && this.offlineSound) {
      this.offlineSound.currentTime = 0;
      this.offlineSound.play().catch(err => console.log('Sound play failed:', err));
    }
  }

  playAway() {
    if (this.enabled && this.awaySound) {
      this.awaySound.currentTime = 0;
      this.awaySound.play().catch(err => console.log('Sound play failed:', err));
    }
  }
}

export const soundService = new SoundService();