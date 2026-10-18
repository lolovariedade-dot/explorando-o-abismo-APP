// Web Audio API spatial synthesizer for cosmic ambience & LIGO gravitational wave sound effects

class CosmicSoundEngine {
  private audioCtx: AudioContext | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private isMuted: boolean = true;

  private initCtx() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public toggleMute(): boolean {
    this.initCtx();
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopDrone();
    } else {
      this.startDrone();
    }
    return !this.isMuted;
  }

  public isPlaying(): boolean {
    return !this.isMuted;
  }

  private startDrone() {
    if (!this.audioCtx || this.isMuted || this.droneOsc1) return;
    const now = this.audioCtx.currentTime;

    // Deep space gravitational hum (interferometry background drone)
    this.droneOsc1 = this.audioCtx.createOscillator();
    this.droneOsc2 = this.audioCtx.createOscillator();
    this.droneGain = this.audioCtx.createGain();

    this.droneOsc1.type = 'sine';
    this.droneOsc1.frequency.setValueAtTime(54, now); // Low A

    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(81, now); // Harmonic E

    this.droneGain.gain.setValueAtTime(0.01, now);
    this.droneGain.gain.linearRampToValueAtTime(0.08, now + 2);

    this.droneOsc1.connect(this.droneGain);
    this.droneOsc2.connect(this.droneGain);
    this.droneGain.connect(this.audioCtx.destination);

    this.droneOsc1.start();
    this.droneOsc2.start();
  }

  private stopDrone() {
    if (this.droneGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.droneGain.gain.linearRampToValueAtTime(0.001, now + 0.5);
      setTimeout(() => {
        try {
          this.droneOsc1?.stop();
          this.droneOsc2?.stop();
          this.droneOsc1?.disconnect();
          this.droneOsc2?.disconnect();
          this.droneOsc1 = null;
          this.droneOsc2 = null;
        } catch {
          // ignore already stopped
        }
      }, 600);
    }
  }

  // Play real LIGO Gravitational Wave Chirp sound (sweep from 35Hz to 250Hz)
  public playLigoChirp() {
    if (this.isMuted) this.initCtx();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    // LIGO chirp sweeps rapidly in frequency as black holes merge
    osc.frequency.setValueAtTime(35, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.85);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.6);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.85);
    gain.gain.linearRampToValueAtTime(0.001, now + 1.1);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 1.15);
  }

  // Play chime for answering enigma or leveling up
  public playSuccessChime() {
    if (!this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.45);
    });
  }

  // Play horizon approach warning
  public playHorizonAlert() {
    if (!this.audioCtx || this.isMuted) return;
    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.setValueAtTime(88, now + 0.15);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }
}

export const cosmicSound = new CosmicSoundEngine();
