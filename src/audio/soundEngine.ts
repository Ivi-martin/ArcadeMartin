/**
 * Procedural Web Audio Synth for Arcade Martín Gold Edition
 * Zero external audio assets needed; zero latency, 100% reliable across browsers.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;
  private currentWorld: number = 1;
  private isBossMusic: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.isMusicMuted ? 0 : 0.12, this.ctx.currentTime);
        this.musicGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.35, this.ctx.currentTime);
    }
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(muted ? 0 : 0.12, this.ctx.currentTime);
    }
    if (muted) {
      this.stopMusic();
    } else {
      this.startMusic(this.currentWorld, this.isBossMusic);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public getMusicMuted() {
    return this.isMusicMuted;
  }

  public playSound(type: string, param = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    try {
      switch (type) {
        case 'jump': {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(420, t + 0.12);
          g.gain.setValueAtTime(0.3, t);
          g.gain.linearRampToValueAtTime(0.01, t + 0.12);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.13);
          break;
        }

        case 'star': {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, t);
          osc.frequency.exponentialRampToValueAtTime(220, t + 0.08);
          g.gain.setValueAtTime(0.2, t);
          g.gain.linearRampToValueAtTime(0.01, t + 0.08);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.09);
          break;
        }

        case 'hit': {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(300, t);
          osc.frequency.exponentialRampToValueAtTime(80, t + 0.1);
          g.gain.setValueAtTime(0.4, t);
          g.gain.linearRampToValueAtTime(0.01, t + 0.1);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.11);
          break;
        }

        case 'stomp': {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(450, t);
          osc.frequency.exponentialRampToValueAtTime(120, t + 0.15);
          g.gain.setValueAtTime(0.5, t);
          g.gain.linearRampToValueAtTime(0.01, t + 0.15);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.16);
          break;
        }

        case 'shield': {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1200, t);
          osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
          g.gain.setValueAtTime(0.3, t);
          g.gain.linearRampToValueAtTime(0.01, t + 0.1);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.11);
          break;
        }

        case 'coin': {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc1.type = 'triangle';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(987.77, t); // B5
          osc2.frequency.setValueAtTime(1318.51, t + 0.06); // E6
          g.gain.setValueAtTime(0.25, t);
          g.gain.linearRampToValueAtTime(0.01, t + 0.22);
          osc1.connect(g);
          osc2.connect(g);
          g.connect(this.masterGain);
          osc1.start(t);
          osc1.stop(t + 0.08);
          osc2.start(t + 0.06);
          osc2.stop(t + 0.22);
          break;
        }

        case 'combo': {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          const baseFreq = 440 * Math.pow(1.15, Math.min(param, 10));
          osc.frequency.setValueAtTime(baseFreq, t);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.12);
          g.gain.setValueAtTime(0.35, t);
          g.gain.linearRampToValueAtTime(0.01, t + 0.15);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.16);
          break;
        }

        case 'hurt': {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, t);
          osc.frequency.linearRampToValueAtTime(60, t + 0.25);
          g.gain.setValueAtTime(0.45, t);
          g.gain.linearRampToValueAtTime(0.01, t + 0.25);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.26);
          break;
        }

        case 'bossLaser': {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, t);
          osc.frequency.linearRampToValueAtTime(800, t + 0.2);
          osc.frequency.linearRampToValueAtTime(200, t + 0.4);
          g.gain.setValueAtTime(0.4, t);
          g.gain.linearRampToValueAtTime(0.01, t + 0.4);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.42);
          break;
        }

        case 'levelUp': {
          const notes = [440, 554, 659, 880];
          notes.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + idx * 0.08);
            g.gain.setValueAtTime(0.25, t + idx * 0.08);
            g.gain.linearRampToValueAtTime(0.01, t + idx * 0.08 + 0.15);
            osc.connect(g);
            g.connect(this.masterGain);
            osc.start(t + idx * 0.08);
            osc.stop(t + idx * 0.08 + 0.16);
          });
          break;
        }

        case 'achievement': {
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + idx * 0.09);
            g.gain.setValueAtTime(0.3, t + idx * 0.09);
            g.gain.linearRampToValueAtTime(0.01, t + idx * 0.09 + 0.3);
            osc.connect(g);
            g.connect(this.masterGain);
            osc.start(t + idx * 0.09);
            osc.stop(t + idx * 0.09 + 0.32);
          });
          break;
        }

        case 'upgrade': {
          const notes = [659.25, 830.61, 987.77, 1318.51];
          notes.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + idx * 0.06);
            g.gain.setValueAtTime(0.28, t + idx * 0.06);
            g.gain.linearRampToValueAtTime(0.01, t + idx * 0.06 + 0.18);
            osc.connect(g);
            g.connect(this.masterGain);
            osc.start(t + idx * 0.06);
            osc.stop(t + idx * 0.06 + 0.2);
          });
          break;
        }

        case 'gameOver': {
          const notes = [330, 311, 293, 261];
          notes.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t + idx * 0.16);
            g.gain.setValueAtTime(0.35, t + idx * 0.16);
            g.gain.linearRampToValueAtTime(0.01, t + idx * 0.16 + 0.22);
            osc.connect(g);
            g.connect(this.masterGain);
            osc.start(t + idx * 0.16);
            osc.stop(t + idx * 0.16 + 0.24);
          });
          break;
        }

        case 'victory': {
          const notes = [440, 554, 659, 880, 784, 880, 1108];
          notes.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + idx * 0.14);
            g.gain.setValueAtTime(0.3, t + idx * 0.14);
            g.gain.linearRampToValueAtTime(0.01, t + idx * 0.14 + 0.25);
            osc.connect(g);
            g.connect(this.masterGain);
            osc.start(t + idx * 0.14);
            osc.stop(t + idx * 0.14 + 0.26);
          });
          break;
        }
      }
    } catch {
      // AudioContext might be in a restrictive state
    }
  }

  public startMusic(world: number, isBoss: boolean = false) {
    this.currentWorld = world;
    this.isBossMusic = isBoss;
    this.stopMusic();
    if (this.isMusicMuted) return;
    this.initCtx();
    if (!this.ctx || !this.musicGain) return;

    // Chiptune scales for worlds
    // World 1: Castle minor (A minor / mysterious)
    // World 2: Forest upbeat (D major / lively)
    // World 3: Sea aquatic (E minor pentatonic / deep)
    // Boss: Fast agitated chromatic/minor
    const bpm = isBoss ? 160 : world === 1 ? 120 : world === 2 ? 130 : 110;
    const intervalMs = (60 / bpm / 2) * 1000;

    const w1Notes = [220, 261, 329, 261, 196, 247, 293, 247, 220, 261, 329, 392, 329, 293, 261, 247];
    const w2Notes = [293, 370, 440, 370, 329, 415, 493, 415, 293, 370, 440, 587, 440, 370, 329, 293];
    const w3Notes = [164, 196, 246, 293, 329, 293, 246, 196, 164, 220, 246, 329, 392, 329, 246, 196];
    const bossNotes = [110, 164, 220, 233, 220, 164, 116, 174, 233, 246, 233, 174, 110, 220, 330, 440];

    const currentScale = isBoss ? bossNotes : world === 1 ? w1Notes : world === 2 ? w2Notes : w3Notes;

    this.bgmStep = 0;
    this.bgmInterval = window.setInterval(() => {
      if (this.isMusicMuted || !this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime;
      const freq = currentScale[this.bgmStep % currentScale.length];
      this.bgmStep++;

      try {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = isBoss ? 'sawtooth' : world === 3 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(isBoss ? 0.08 : 0.05, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + (intervalMs / 1000) * 0.9);
        osc.connect(g);
        g.connect(this.musicGain);
        osc.start(t);
        osc.stop(t + (intervalMs / 1000) * 0.95);
      } catch {
        // Safe skip
      }
    }, intervalMs);
  }

  public stopMusic() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
