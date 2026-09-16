/**
 * EnvironmentAudio.js
 * Procedural Web Audio API synthesizer for natural and industrial railway environments:
 * procedural birdsong, atmospheric wind rush, station crowd murmur, and trackside corridor hum.
 */

export class EnvironmentAudio {
  /**
   * Initializes audio nodes and parameters for environment sound synthesis.
   */
  constructor(audioCtx, outputGainNode) {
    this.audioCtx = audioCtx;
    this.outputGain = outputGainNode;
    this.isInitialized = false;

    // Sub-bus for environmental audio
    this.envGain = null;

    // Wind rush nodes
    this.windSource = null;
    this.windFilter = null;
    this.windGain = null;

    // Railway corridor / industrial hum nodes
    this.railAmbOsc1 = null;
    this.railAmbOsc2 = null;
    this.railAmbGain = null;

    // Station crowd murmur nodes
    this.stationMurmurSource = null;
    this.stationMurmurFilter = null;
    this.stationMurmurGain = null;

    // Birdsong procedural scheduler
    this.birdTimer = 0;
    this.nextBirdInterval = 3.5;
  }

  /**
   * Builds audio graph for environmental layers upon user interaction.
   */
  init() {
    if (this.isInitialized || !this.audioCtx) return;

    try {
      const tmp_now = this.audioCtx.currentTime;

      // Master environment gain bus
      this.envGain = this.audioCtx.createGain();
      this.envGain.gain.setValueAtTime(0.75, tmp_now);
      this.envGain.connect(this.outputGain);

      this.setupWindSynth();
      this.setupRailwayAmbience();
      this.setupStationAmbience();

      this.isInitialized = true;
    } catch (err) {
      console.warn('EnvironmentAudio init error:', err);
    }
  }

  /**
   * Synthesizes continuous atmospheric wind rush and headwind turbulence.
   */
  setupWindSynth() {
    const tmp_now = this.audioCtx.currentTime;
    const tmp_sampleRate = this.audioCtx.sampleRate;
    const tmp_frameCount = Math.floor(tmp_sampleRate * 2.5);
    const tmp_noiseBuffer = this.audioCtx.createBuffer(1, tmp_frameCount, tmp_sampleRate);
    const tmp_channel = tmp_noiseBuffer.getChannelData(0);

    // Generate brown/pinkish soft noise
    let tmp_lastOut = 0.0;
    for (let tmp_i = 0; tmp_i < tmp_frameCount; tmp_i++) {
      const tmp_white = Math.random() * 2 - 1;
      tmp_channel[tmp_i] = (tmp_lastOut + 0.02 * tmp_white) / 1.02;
      tmp_lastOut = tmp_channel[tmp_i];
      tmp_channel[tmp_i] *= 2.5; // Gain compensation
    }

    this.windSource = this.audioCtx.createBufferSource();
    this.windSource.buffer = tmp_noiseBuffer;
    this.windSource.loop = true;

    this.windFilter = this.audioCtx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(320, tmp_now);
    this.windFilter.Q.setValueAtTime(1.2, tmp_now);

    this.windGain = this.audioCtx.createGain();
    this.windGain.gain.setValueAtTime(0.08, tmp_now);

    this.windSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.envGain);
    this.windSource.start();
  }

  /**
   * Synthesizes subtle trackside industrial corridor hum (60 Hz transformer resonance).
   */
  setupRailwayAmbience() {
    const tmp_now = this.audioCtx.currentTime;

    this.railAmbGain = this.audioCtx.createGain();
    this.railAmbGain.gain.setValueAtTime(0.04, tmp_now);
    this.railAmbGain.connect(this.envGain);

    this.railAmbOsc1 = this.audioCtx.createOscillator();
    this.railAmbOsc1.type = 'sine';
    this.railAmbOsc1.frequency.setValueAtTime(60, tmp_now);

    this.railAmbOsc2 = this.audioCtx.createOscillator();
    this.railAmbOsc2.type = 'sine';
    this.railAmbOsc2.frequency.setValueAtTime(120, tmp_now);

    const tmp_subGain = this.audioCtx.createGain();
    tmp_subGain.gain.setValueAtTime(0.35, tmp_now);

    this.railAmbOsc1.connect(this.railAmbGain);
    this.railAmbOsc2.connect(tmp_subGain);
    tmp_subGain.connect(this.railAmbGain);

    this.railAmbOsc1.start();
    this.railAmbOsc2.start();
  }

  /**
   * Synthesizes low-frequency station platform crowd chatter and depot resonance.
   */
  setupStationAmbience() {
    const tmp_now = this.audioCtx.currentTime;
    const tmp_sampleRate = this.audioCtx.sampleRate;
    const tmp_frameCount = Math.floor(tmp_sampleRate * 3.0);
    const tmp_noiseBuffer = this.audioCtx.createBuffer(1, tmp_frameCount, tmp_sampleRate);
    const tmp_channel = tmp_noiseBuffer.getChannelData(0);

    for (let tmp_i = 0; tmp_i < tmp_frameCount; tmp_i++) {
      tmp_channel[tmp_i] = Math.random() * 2 - 1;
    }

    this.stationMurmurSource = this.audioCtx.createBufferSource();
    this.stationMurmurSource.buffer = tmp_noiseBuffer;
    this.stationMurmurSource.loop = true;

    this.stationMurmurFilter = this.audioCtx.createBiquadFilter();
    this.stationMurmurFilter.type = 'bandpass';
    this.stationMurmurFilter.frequency.setValueAtTime(650, tmp_now);
    this.stationMurmurFilter.Q.setValueAtTime(3.0, tmp_now);

    this.stationMurmurGain = this.audioCtx.createGain();
    this.stationMurmurGain.gain.setValueAtTime(0.0, tmp_now);

    this.stationMurmurSource.connect(this.stationMurmurFilter);
    this.stationMurmurFilter.connect(this.stationMurmurGain);
    this.stationMurmurGain.connect(this.envGain);
    this.stationMurmurSource.start();
  }

  /**
   * Generates a procedural FM-synthesized natural birdsong chirp or trill.
   */
  triggerBirdChirp() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    // Carrier base frequency (2800 Hz to 4200 Hz)
    const tmp_carrierFreq = 2800 + Math.random() * 1400;
    // Modulator frequency for realistic vibrato trill
    const tmp_modFreq = 18 + Math.random() * 25;
    const tmp_chirpDuration = 0.12 + Math.random() * 0.16;

    // Modulator oscillator
    const tmp_modOsc = this.audioCtx.createOscillator();
    tmp_modOsc.type = 'sine';
    tmp_modOsc.frequency.setValueAtTime(tmp_modFreq, tmp_now);

    const tmp_modGain = this.audioCtx.createGain();
    tmp_modGain.gain.setValueAtTime(250, tmp_now);
    tmp_modOsc.connect(tmp_modGain);

    // Carrier oscillator
    const tmp_carrierOsc = this.audioCtx.createOscillator();
    tmp_carrierOsc.type = 'sine';
    tmp_carrierOsc.frequency.setValueAtTime(tmp_carrierFreq, tmp_now);
    tmp_carrierOsc.frequency.linearRampToValueAtTime(tmp_carrierFreq * 1.15, tmp_now + tmp_chirpDuration * 0.5);
    tmp_carrierOsc.frequency.linearRampToValueAtTime(tmp_carrierFreq * 0.9, tmp_now + tmp_chirpDuration);

    tmp_modGain.connect(tmp_carrierOsc.frequency);

    // Amplitude envelope
    const tmp_envGain = this.audioCtx.createGain();
    tmp_envGain.gain.setValueAtTime(0.001, tmp_now);
    tmp_envGain.gain.linearRampToValueAtTime(0.14, tmp_now + 0.03);
    tmp_envGain.gain.exponentialRampToValueAtTime(0.001, tmp_now + tmp_chirpDuration);

    tmp_carrierOsc.connect(tmp_envGain);
    tmp_envGain.connect(this.envGain);

    tmp_modOsc.start(tmp_now);
    tmp_carrierOsc.start(tmp_now);
    tmp_modOsc.stop(tmp_now + tmp_chirpDuration + 0.02);
    tmp_carrierOsc.stop(tmp_now + tmp_chirpDuration + 0.02);
  }

  /**
   * Synthesizes a 2-tone melodic station arrival chime (Ding-Dong: D5 -> A4).
   */
  playStationChime() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    // Ding (587.33 Hz)
    const tmp_osc1 = this.audioCtx.createOscillator();
    tmp_osc1.type = 'sine';
    tmp_osc1.frequency.setValueAtTime(587.33, tmp_now);

    const tmp_gain1 = this.audioCtx.createGain();
    tmp_gain1.gain.setValueAtTime(0.28, tmp_now);
    tmp_gain1.gain.exponentialRampToValueAtTime(0.001, tmp_now + 0.65);

    tmp_osc1.connect(tmp_gain1);
    tmp_gain1.connect(this.envGain);
    tmp_osc1.start(tmp_now);
    tmp_osc1.stop(tmp_now + 0.7);

    // Dong (440 Hz)
    const tmp_osc2 = this.audioCtx.createOscillator();
    tmp_osc2.type = 'sine';
    tmp_osc2.frequency.setValueAtTime(440.0, tmp_now + 0.38);

    const tmp_gain2 = this.audioCtx.createGain();
    tmp_gain2.gain.setValueAtTime(0.0001, tmp_now);
    tmp_gain2.gain.setValueAtTime(0.3, tmp_now + 0.38);
    tmp_gain2.gain.exponentialRampToValueAtTime(0.001, tmp_now + 1.2);

    tmp_osc2.connect(tmp_gain2);
    tmp_gain2.connect(this.envGain);
    tmp_osc2.start(tmp_now + 0.38);
    tmp_osc2.stop(tmp_now + 1.25);
  }

  /**
   * Synthesizes authentic stationmaster brass pea-whistle ("peep-peep" departure signal).
   */
  playGuardWhistle() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    const arr_bursts = [
      { start: 0.0, dur: 0.16 },
      { start: 0.22, dur: 0.3 },
    ];

    for (let tmp_i = 0; tmp_i < arr_bursts.length; tmp_i++) {
      const obj_b = arr_bursts[tmp_i];
      const tmp_start = tmp_now + obj_b.start;
      const tmp_dur = obj_b.dur;

      const tmp_osc = this.audioCtx.createOscillator();
      tmp_osc.type = 'triangle';
      tmp_osc.frequency.setValueAtTime(2450, tmp_start);
      tmp_osc.frequency.linearRampToValueAtTime(2380, tmp_start + tmp_dur * 0.5);
      tmp_osc.frequency.linearRampToValueAtTime(2430, tmp_start + tmp_dur);

      const tmp_gain = this.audioCtx.createGain();
      tmp_gain.gain.setValueAtTime(0.001, tmp_now);
      tmp_gain.gain.setValueAtTime(0.24, tmp_start);
      tmp_gain.gain.exponentialRampToValueAtTime(0.001, tmp_start + tmp_dur);

      tmp_osc.connect(tmp_gain);
      tmp_gain.connect(this.envGain);

      tmp_osc.start(tmp_start);
      tmp_osc.stop(tmp_start + tmp_dur + 0.02);
    }
  }

  /**
   * Advances environmental soundscapes: wind rush, station proximity, and birdsong.
   */
  update(deltaTime, environment, speedKmh, stationContext) {
    if (!this.isInitialized || !this.audioCtx) return;

    const tmp_now = this.audioCtx.currentTime;
    const tmp_absSpeed = Math.abs(speedKmh || 0);

    // 1. Wind rush scales with train headwind and ambient weather
    const tmp_speedRatio = Math.min(tmp_absSpeed / 120, 1.0);
    const tmp_windFreq = 300 + tmp_speedRatio * 520;
    const tmp_windVol = 0.06 + Math.pow(tmp_speedRatio, 1.2) * 0.22;

    this.windFilter.frequency.setTargetAtTime(tmp_windFreq, tmp_now, 0.1);
    this.windGain.gain.setTargetAtTime(tmp_windVol, tmp_now, 0.1);

    // 2. Station crowd murmur: active when stopped or slowing near a platform
    const tmp_isNearStation = stationContext?.isNearStation || false;
    if (tmp_isNearStation) {
      // Louder when stationary or moving slowly at platform
      const tmp_stationVol = Math.max(0.04, 0.22 - (tmp_absSpeed / 40) * 0.18);
      this.stationMurmurGain.gain.setTargetAtTime(tmp_stationVol, tmp_now, 0.2);
    } else {
      this.stationMurmurGain.gain.setTargetAtTime(0.0, tmp_now, 0.3);
    }

    // 3. Birdsong scheduler: active during daylight and non-storm weather
    const tmp_timePhase = environment?.timePhase || 'NOON';
    const tmp_weather = environment?.weather || 'CLEAR';
    const tmp_isDaytime = ['DAWN', 'MORNING', 'NOON', 'AFTERNOON', 'SUNSET'].includes(tmp_timePhase);
    const tmp_isCalmWeather = tmp_weather !== 'HEAVY_RAIN';

    if (tmp_isDaytime && tmp_isCalmWeather && tmp_absSpeed < 70) {
      this.birdTimer += deltaTime;
      if (this.birdTimer >= this.nextBirdInterval) {
        this.birdTimer = 0;
        this.nextBirdInterval = 2.5 + Math.random() * 4.5;
        this.triggerBirdChirp();
      }
    }
  }
}
