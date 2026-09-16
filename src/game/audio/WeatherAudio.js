/**
 * WeatherAudio.js
 * Procedural Web Audio API synthesizer for meteorological acoustics:
 * rainfall patter, heavy storm downpours, dynamic thunder booms, howling snow blizzards, and fog hush.
 */

export class WeatherAudio {
  /**
   * Initializes audio nodes and parameters for weather sound synthesis.
   */
  constructor(audioCtx, outputGainNode) {
    this.audioCtx = audioCtx;
    this.outputGain = outputGainNode;
    this.isInitialized = false;

    // Sub-bus for weather audio
    this.weatherGain = null;

    // Rain synthesizer nodes
    this.rainSource = null;
    this.rainFilter = null;
    this.rainGain = null;

    // Snow / Blizzard howling wind nodes
    this.blizzardSource = null;
    this.blizzardFilter = null;
    this.blizzardGain = null;

    // Thunder interval tracking
    this.thunderTimer = 0;
    this.nextThunderInterval = 10.0;
  }

  /**
   * Builds audio graph for weather phenomena upon user interaction.
   */
  init() {
    if (this.isInitialized || !this.audioCtx) return;

    try {
      const tmp_now = this.audioCtx.currentTime;

      // Master weather gain bus
      this.weatherGain = this.audioCtx.createGain();
      this.weatherGain.gain.setValueAtTime(0.75, tmp_now);
      this.weatherGain.connect(this.outputGain);

      this.setupRainSynth();
      this.setupBlizzardSynth();

      this.isInitialized = true;
    } catch (err) {
      console.warn('WeatherAudio init error:', err);
    }
  }

  /**
   * Configures continuous looping pink noise generator for rain patter.
   */
  setupRainSynth() {
    const tmp_now = this.audioCtx.currentTime;
    const tmp_sampleRate = this.audioCtx.sampleRate;
    const tmp_frameCount = Math.floor(tmp_sampleRate * 2.0);
    const tmp_noiseBuffer = this.audioCtx.createBuffer(1, tmp_frameCount, tmp_sampleRate);
    const tmp_channel = tmp_noiseBuffer.getChannelData(0);

    for (let tmp_i = 0; tmp_i < tmp_frameCount; tmp_i++) {
      tmp_channel[tmp_i] = (Math.random() * 2 - 1) * 0.4;
    }

    this.rainSource = this.audioCtx.createBufferSource();
    this.rainSource.buffer = tmp_noiseBuffer;
    this.rainSource.loop = true;

    this.rainFilter = this.audioCtx.createBiquadFilter();
    this.rainFilter.type = 'lowpass';
    this.rainFilter.frequency.setValueAtTime(1400, tmp_now);
    this.rainFilter.Q.setValueAtTime(1.0, tmp_now);

    this.rainGain = this.audioCtx.createGain();
    this.rainGain.gain.setValueAtTime(0.0, tmp_now);

    this.rainSource.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.weatherGain);
    this.rainSource.start();
  }

  /**
   * Configures howling resonant bandpass noise for snowstorms and blizzards.
   */
  setupBlizzardSynth() {
    const tmp_now = this.audioCtx.currentTime;
    const tmp_sampleRate = this.audioCtx.sampleRate;
    const tmp_frameCount = Math.floor(tmp_sampleRate * 2.5);
    const tmp_noiseBuffer = this.audioCtx.createBuffer(1, tmp_frameCount, tmp_sampleRate);
    const tmp_channel = tmp_noiseBuffer.getChannelData(0);

    for (let tmp_i = 0; tmp_i < tmp_frameCount; tmp_i++) {
      tmp_channel[tmp_i] = (Math.random() * 2 - 1) * 0.35;
    }

    this.blizzardSource = this.audioCtx.createBufferSource();
    this.blizzardSource.buffer = tmp_noiseBuffer;
    this.blizzardSource.loop = true;

    this.blizzardFilter = this.audioCtx.createBiquadFilter();
    this.blizzardFilter.type = 'bandpass';
    this.blizzardFilter.frequency.setValueAtTime(550, tmp_now);
    this.blizzardFilter.Q.setValueAtTime(4.5, tmp_now);

    this.blizzardGain = this.audioCtx.createGain();
    this.blizzardGain.gain.setValueAtTime(0.0, tmp_now);

    this.blizzardSource.connect(this.blizzardFilter);
    this.blizzardFilter.connect(this.blizzardGain);
    this.blizzardGain.connect(this.weatherGain);
    this.blizzardSource.start();
  }

  /**
   * Synthesizes an explosive procedural thunderclap with sub-bass rolling reverberation.
   */
  playThunderCrash() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;
    const tmp_sampleRate = this.audioCtx.sampleRate;

    // 1. Initial explosive noise crack
    const tmp_crackFrames = Math.floor(tmp_sampleRate * 0.8);
    const tmp_crackBuffer = this.audioCtx.createBuffer(1, tmp_crackFrames, tmp_sampleRate);
    const tmp_channel = tmp_crackBuffer.getChannelData(0);

    for (let tmp_i = 0; tmp_i < tmp_crackFrames; tmp_i++) {
      tmp_channel[tmp_i] = (Math.random() * 2 - 1) * Math.exp(-tmp_i / (tmp_sampleRate * 0.15));
    }

    const tmp_crackSource = this.audioCtx.createBufferSource();
    tmp_crackSource.buffer = tmp_crackBuffer;

    const tmp_crackFilter = this.audioCtx.createBiquadFilter();
    tmp_crackFilter.type = 'lowpass';
    tmp_crackFilter.frequency.setValueAtTime(1200, tmp_now);
    tmp_crackFilter.frequency.exponentialRampToValueAtTime(120, tmp_now + 0.6);

    const tmp_crackGain = this.audioCtx.createGain();
    tmp_crackGain.gain.setValueAtTime(0.5, tmp_now);
    tmp_crackGain.gain.exponentialRampToValueAtTime(0.001, tmp_now + 0.78);

    tmp_crackSource.connect(tmp_crackFilter);
    tmp_crackFilter.connect(tmp_crackGain);
    tmp_crackGain.connect(this.weatherGain);
    tmp_crackSource.start(tmp_now);
    tmp_crackSource.stop(tmp_now + 0.8);

    // 2. Rolling sub-bass rumble (45 Hz -> 28 Hz boom)
    const tmp_rumbleOsc = this.audioCtx.createOscillator();
    tmp_rumbleOsc.type = 'sine';
    tmp_rumbleOsc.frequency.setValueAtTime(52, tmp_now + 0.05);
    tmp_rumbleOsc.frequency.exponentialRampToValueAtTime(28, tmp_now + 1.8);

    const tmp_rumbleGain = this.audioCtx.createGain();
    tmp_rumbleGain.gain.setValueAtTime(0.001, tmp_now);
    tmp_rumbleGain.gain.setValueAtTime(0.6, tmp_now + 0.05);
    tmp_rumbleGain.gain.exponentialRampToValueAtTime(0.001, tmp_now + 2.2);

    tmp_rumbleOsc.connect(tmp_rumbleGain);
    tmp_rumbleGain.connect(this.weatherGain);
    tmp_rumbleOsc.start(tmp_now + 0.05);
    tmp_rumbleOsc.stop(tmp_now + 2.25);
  }

  /**
   * Updates weather audio layers based on weather state and delta time.
   */
  update(deltaTime, weatherType) {
    if (!this.isInitialized || !this.audioCtx) return;

    const tmp_now = this.audioCtx.currentTime;
    const tmp_weather = (weatherType || 'CLEAR').toUpperCase();

    // 1. Rain and Heavy Rain Synthesis
    if (tmp_weather === 'RAIN') {
      this.rainFilter.frequency.setTargetAtTime(1800, tmp_now, 0.2);
      this.rainGain.gain.setTargetAtTime(0.22, tmp_now, 0.2);
    } else if (tmp_weather === 'HEAVY_RAIN') {
      this.rainFilter.frequency.setTargetAtTime(3200, tmp_now, 0.2);
      this.rainGain.gain.setTargetAtTime(0.42, tmp_now, 0.2);

      // Periodically trigger thunder
      this.thunderTimer += deltaTime;
      if (this.thunderTimer >= this.nextThunderInterval) {
        this.thunderTimer = 0;
        this.nextThunderInterval = 8.0 + Math.random() * 14.0;
        this.playThunderCrash();
      }
    } else {
      this.rainGain.gain.setTargetAtTime(0.0, tmp_now, 0.4);
    }

    // 2. Snow / Blizzard Howling Wind
    if (tmp_weather === 'SNOW') {
      // Gentle howling filter modulation
      const tmp_howlFreq = 480 + Math.sin(tmp_now * 0.8) * 220;
      this.blizzardFilter.frequency.setTargetAtTime(tmp_howlFreq, tmp_now, 0.1);
      this.blizzardGain.gain.setTargetAtTime(0.25, tmp_now, 0.2);
    } else {
      this.blizzardGain.gain.setTargetAtTime(0.0, tmp_now, 0.4);
    }
  }
}
