/**
 * Web Audio API Ambient Sound Generator for PURE
 * Synthesizes serene mountain wind, running water ripples, and crystal droplets
 */

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;
  private streamGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private dropletTimer: number | null = null;

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Stream noise buffer generator
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // White noise node for water stream
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Resonant bandpass filter for water trickling sound
    const waterFilter = this.ctx.createBiquadFilter();
    waterFilter.type = 'bandpass';
    waterFilter.frequency.setValueAtTime(650, this.ctx.currentTime);
    waterFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    this.streamGain = this.ctx.createGain();
    this.streamGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    whiteNoise.connect(waterFilter);
    waterFilter.connect(this.streamGain);
    this.streamGain.connect(this.masterGain);
    whiteNoise.start();

    // Wind filtered noise
    const windNoise = this.ctx.createBufferSource();
    windNoise.buffer = noiseBuffer;
    windNoise.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(220, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    windNoise.connect(windFilter);
    windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    windNoise.start();

    // Random crystal droplet chime trigger
    this.scheduleDroplet();
  }

  private playDroplet() {
    if (!this.ctx || !this.isRunning || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      // Pentatonic pitch selection for high-end zen mood
      const frequencies = [880, 1046.5, 1174.6, 1318.5, 1567.98, 1760];
      const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Pitch drop simulates water droplet surface tension impact
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, now + 0.25);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio context might be suspended
    }
  }

  private lastResonanceTime: number = 0;

  public playGlassResonance(intensity: number = 1) {
    if (!this.ctx || !this.isRunning || !this.masterGain) return;
    const now = this.ctx.currentTime;
    // Throttle to avoid audio clutter
    if (now - this.lastResonanceTime < 0.25) return;
    this.lastResonanceTime = now;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // High crystal singing tone (around 1480-1760 Hz)
      const baseFreq = 1568; // G6 note - crystalline harmonic
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.01, now + 0.3);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq, now);
      filter.Q.setValueAtTime(8, now);

      const peakVol = Math.min(0.04, 0.02 * intensity);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peakVol, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {
      // Audio context might be suspended
    }
  }

  private scheduleDroplet() {
    if (this.dropletTimer) window.clearTimeout(this.dropletTimer);
    const delay = 2500 + Math.random() * 4000;
    this.dropletTimer = window.setTimeout(() => {
      this.playDroplet();
      if (this.isRunning) this.scheduleDroplet();
    }, delay);
  }

  public toggle(): boolean {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isRunning = !this.isRunning;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isRunning ? 0.35 : 0, this.ctx.currentTime, 0.2);
    }
    if (this.isRunning) {
      this.scheduleDroplet();
    }
    return this.isRunning;
  }

  public updateIntensity(scrollProgress: number) {
    if (!this.ctx || !this.isRunning) return;
    const now = this.ctx.currentTime;
    // Water sound swells as the river expands in scenes 5, 6, 7
    if (this.streamGain) {
      const waterVol = 0.08 + Math.min(scrollProgress * 0.25, 0.25);
      this.streamGain.gain.setTargetAtTime(waterVol, now, 0.1);
    }
    if (this.windGain) {
      const windVol = 0.06 + Math.min(scrollProgress * 0.15, 0.18);
      this.windGain.gain.setTargetAtTime(windVol, now, 0.1);
    }
  }

  public getStatus(): boolean {
    return this.isRunning;
  }
}

export const audioEngine = new AmbientAudioEngine();
