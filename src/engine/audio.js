// Web Audio API Retro Chiptune Sound Effects & Synth

class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = 0.35;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, duration, type = 'square', gain = 0.05, endFreq = 0, delay = 0) {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      gainNode.gain.value = 0;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), now + duration);
      }
      gainNode.gain.setValueAtTime(gain * this.volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gainNode).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (e) {
      // Audio error ignored safely
    }
  }

  // Sound effects library
  jump() {
    this.init();
    this.tone(330, 0.16, 'square', 0.045, 660);
  }

  coin() {
    this.init();
    this.tone(988, 0.07, 'square', 0.05);
    this.tone(1319, 0.22, 'square', 0.045, 0, 0.07);
  }

  brasil() {
    this.init();
    // Special chime for the Brasil map item
    this.tone(784, 0.06, 'square', 0.05);
    this.tone(988, 0.06, 'square', 0.05, 0, 0.06);
    this.tone(1319, 0.08, 'square', 0.05, 0, 0.12);
    this.tone(1568, 0.25, 'triangle', 0.06, 0, 0.18);
  }

  stomp() {
    this.init();
    this.tone(260, 0.12, 'square', 0.05, 90);
  }

  bump() {
    this.init();
    this.tone(140, 0.08, 'triangle', 0.08);
  }

  powerup() {
    this.init();
    [330, 392, 523, 659, 784, 1047].forEach((freq, idx) => {
      this.tone(freq, 0.09, 'square', 0.04, 0, idx * 0.07);
    });
  }

  shoot() {
    this.init();
    this.tone(880, 0.08, 'square', 0.035, 440);
  }

  hurt() {
    this.init();
    this.tone(200, 0.25, 'sawtooth', 0.04, 80);
  }

  die() {
    this.init();
    [494, 466, 440, 392, 349, 330].forEach((freq, idx) => {
      this.tone(freq, 0.14, 'square', 0.05, 0, idx * 0.12);
    });
  }

  clear() {
    this.init();
    // Victory fanfare
    [523, 659, 784, 1047, 784, 1047].forEach((freq, idx) => {
      this.tone(freq, 0.16, 'square', 0.05, 0, idx * 0.11);
    });
  }

  flagSlide() {
    this.init();
    this.tone(800, 0.6, 'sine', 0.04, 200);
  }

  sel() {
    this.init();
    this.tone(600, 0.06, 'square', 0.03);
  }

  anulado() {
    this.init();
    this.tone(180, 0.15, 'triangle', 0.07, 70);
    this.tone(150, 0.2, 'square', 0.05, 60, 0.08);
  }
}

export const audio = new AudioManager();

