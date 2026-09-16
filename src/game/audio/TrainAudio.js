/**
 * TrainAudio.js
 * Procedural Web Audio API synthesizer for locomotive propulsion, dynamic braking,
 * wheel/rail rolling acoustics, multi-chime horn, knuckle couplers, doors, and cab alarms.
 */

export class TrainAudio {
  /**
   * Initializes audio nodes and parameters for train sound synthesis.
   */
  constructor(audioCtx, outputGainNode) {
    this.audioCtx = audioCtx;
    this.outputGain = outputGainNode;
    this.isInitialized = false;

    // Sub-bus for train audio
    this.trainGain = null;

    // Engine synth nodes
    this.engineOsc1 = null; // Low cylinder fundamental (sawtooth)
    this.engineOsc2 = null; // Sub-harmonic bass (triangle)
    this.engineOsc3 = null; // Traction motor / turbo whine (sine/triangle)
    this.engineFilter = null;
    this.engineGain = null;
    this.engineMotorGain = null;

    // Continuous rail rolling noise nodes
    this.railNoiseSource = null;
    this.railNoiseFilter = null;
    this.railNoiseGain = null;

    // Continuous brake friction and squeal nodes
    this.brakeSquealOsc = null;
    this.brakeSquealFilter = null;
    this.brakeSquealGain = null;
    this.brakeFrictionSource = null;
    this.brakeFrictionFilter = null;
    this.brakeFrictionGain = null;

    // 3-Chime Horn nodes
    this.arr_hornOscs = [];
    this.hornGain = null;

    // Warning alarm interval tracking
    this.warningTimer = null;
    this.isAlarmActive = false;
  }

  /**
   * Builds the audio graph for all train synthesizers upon user gesture.
   */
  init() {
    if (this.isInitialized || !this.audioCtx) return;

    try {
      const tmp_now = this.audioCtx.currentTime;

      // Master train bus
      this.trainGain = this.audioCtx.createGain();
      this.trainGain.gain.setValueAtTime(1.0, tmp_now);
      this.trainGain.connect(this.outputGain);

      this.setupEngineSynth();
      this.setupRailNoiseSynth();
      this.setupBrakeFrictionSynth();
      this.setupHornSynth();

      this.isInitialized = true;
    } catch (err) {
      console.warn('TrainAudio init error:', err);
    }
  }

  /**
   * Synthesizes diesel engine combustion strokes and traction motor whine.
   */
  setupEngineSynth() {
    const tmp_now = this.audioCtx.currentTime;

    this.engineGain = this.audioCtx.createGain();
    this.engineGain.gain.setValueAtTime(0.12, tmp_now);

    this.engineFilter = this.audioCtx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(140, tmp_now);
    this.engineFilter.Q.setValueAtTime(3.2, tmp_now);

    // Primary cylinder combustion oscillator
    this.engineOsc1 = this.audioCtx.createOscillator();
    this.engineOsc1.type = 'sawtooth';
    this.engineOsc1.frequency.setValueAtTime(34, tmp_now);

    // Sub-harmonic bass oscillator (1/2 frequency)
    this.engineOsc2 = this.audioCtx.createOscillator();
    this.engineOsc2.type = 'triangle';
    this.engineOsc2.frequency.setValueAtTime(17, tmp_now);

    // Traction motor whine oscillator
    this.engineOsc3 = this.audioCtx.createOscillator();
    this.engineOsc3.type = 'sine';
    this.engineOsc3.frequency.setValueAtTime(220, tmp_now);

    this.engineMotorGain = this.audioCtx.createGain();
    this.engineMotorGain.gain.setValueAtTime(0.0, tmp_now);

    this.engineOsc1.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.trainGain);

    this.engineOsc3.connect(this.engineMotorGain);
    this.engineMotorGain.connect(this.trainGain);

    this.engineOsc1.start();
    this.engineOsc2.start();
    this.engineOsc3.start();
  }

  /**
   * Configures continuous looping pink/bandpass noise for wheel-on-rail friction.
   */
  setupRailNoiseSynth() {
    const tmp_now = this.audioCtx.currentTime;
    const tmp_sampleRate = this.audioCtx.sampleRate;
    const tmp_bufferSecs = 2.0;
    const tmp_frameCount = Math.floor(tmp_sampleRate * tmp_bufferSecs);
    const tmp_noiseBuffer = this.audioCtx.createBuffer(1, tmp_frameCount, tmp_sampleRate);
    const tmp_channel = tmp_noiseBuffer.getChannelData(0);

    // Generate looping pink-ish noise
    let tmp_b0 = 0;
    let tmp_b1 = 0;
    let tmp_b2 = 0;
    for (let tmp_i = 0; tmp_i < tmp_frameCount; tmp_i++) {
      const tmp_white = Math.random() * 2 - 1;
      tmp_b0 = 0.99886 * tmp_b0 + tmp_white * 0.0555179;
      tmp_b1 = 0.99332 * tmp_b1 + tmp_white * 0.0750759;
      tmp_b2 = 0.96900 * tmp_b2 + tmp_white * 0.1538520;
      tmp_channel[tmp_i] = (tmp_b0 + tmp_b1 + tmp_b2 + tmp_white * 0.5362) * 0.25;
    }

    this.railNoiseSource = this.audioCtx.createBufferSource();
    this.railNoiseSource.buffer = tmp_noiseBuffer;
    this.railNoiseSource.loop = true;

    this.railNoiseFilter = this.audioCtx.createBiquadFilter();
    this.railNoiseFilter.type = 'lowpass';
    this.railNoiseFilter.frequency.setValueAtTime(280, tmp_now);
    this.railNoiseFilter.Q.setValueAtTime(1.5, tmp_now);

    this.railNoiseGain = this.audioCtx.createGain();
    this.railNoiseGain.gain.setValueAtTime(0.0, tmp_now);

    this.railNoiseSource.connect(this.railNoiseFilter);
    this.railNoiseFilter.connect(this.railNoiseGain);
    this.railNoiseGain.connect(this.trainGain);

    this.railNoiseSource.start();
  }

  /**
   * Configures continuous brake shoe friction noise and high-pitch metallic squeal.
   */
  setupBrakeFrictionSynth() {
    const tmp_now = this.audioCtx.currentTime;
    const tmp_sampleRate = this.audioCtx.sampleRate;
    const tmp_frameCount = Math.floor(tmp_sampleRate * 1.5);
    const tmp_noiseBuffer = this.audioCtx.createBuffer(1, tmp_frameCount, tmp_sampleRate);
    const tmp_channel = tmp_noiseBuffer.getChannelData(0);

    for (let tmp_i = 0; tmp_i < tmp_frameCount; tmp_i++) {
      tmp_channel[tmp_i] = (Math.random() * 2 - 1) * 0.3;
    }

    // Continuous brake friction noise
    this.brakeFrictionSource = this.audioCtx.createBufferSource();
    this.brakeFrictionSource.buffer = tmp_noiseBuffer;
    this.brakeFrictionSource.loop = true;

    this.brakeFrictionFilter = this.audioCtx.createBiquadFilter();
    this.brakeFrictionFilter.type = 'bandpass';
    this.brakeFrictionFilter.frequency.setValueAtTime(1400, tmp_now);
    this.brakeFrictionFilter.Q.setValueAtTime(2.5, tmp_now);

    this.brakeFrictionGain = this.audioCtx.createGain();
    this.brakeFrictionGain.gain.setValueAtTime(0.0, tmp_now);

    this.brakeFrictionSource.connect(this.brakeFrictionFilter);
    this.brakeFrictionFilter.connect(this.brakeFrictionGain);
    this.brakeFrictionGain.connect(this.trainGain);
    this.brakeFrictionSource.start();

    // High-frequency metallic brake squeal oscillator
    this.brakeSquealOsc = this.audioCtx.createOscillator();
    this.brakeSquealOsc.type = 'sawtooth';
    this.brakeSquealOsc.frequency.setValueAtTime(2850, tmp_now);

    this.brakeSquealFilter = this.audioCtx.createBiquadFilter();
    this.brakeSquealFilter.type = 'bandpass';
    this.brakeSquealFilter.frequency.setValueAtTime(2850, tmp_now);
    this.brakeSquealFilter.Q.setValueAtTime(8.0, tmp_now);

    this.brakeSquealGain = this.audioCtx.createGain();
    this.brakeSquealGain.gain.setValueAtTime(0.0, tmp_now);

    this.brakeSquealOsc.connect(this.brakeSquealFilter);
    this.brakeSquealFilter.connect(this.brakeSquealGain);
    this.brakeSquealGain.connect(this.trainGain);
    this.brakeSquealOsc.start();
  }

  /**
   * Configures 3-chime chord bus for Nathan K3LA train horn (D#4, F#4, A#4).
   */
  setupHornSynth() {
    const tmp_now = this.audioCtx.currentTime;
    this.hornGain = this.audioCtx.createGain();
    this.hornGain.gain.setValueAtTime(0, tmp_now);
    this.hornGain.connect(this.trainGain);

    const arr_frequencies = [311.13, 369.99, 466.16]; // D#4, F#4, A#4
    this.arr_hornOscs = arr_frequencies.map((freq) => {
      const tmp_osc = this.audioCtx.createOscillator();
      tmp_osc.type = 'sawtooth';
      tmp_osc.frequency.setValueAtTime(freq, tmp_now);

      const tmp_subGain = this.audioCtx.createGain();
      tmp_subGain.gain.setValueAtTime(0.28, tmp_now);

      tmp_osc.connect(tmp_subGain);
      tmp_subGain.connect(this.hornGain);
      tmp_osc.start();
      return tmp_osc;
    });
  }

  /**
   * Dynamically updates engine rumble, rail noise, and brake squeal from train dynamics.
   */
  update(deltaTime, telemetry) {
    if (!this.isInitialized || !this.audioCtx) return;

    const tmp_now = this.audioCtx.currentTime;
    const tmp_rpm = telemetry?.engineRpm ?? 320;
    const tmp_notch = telemetry?.throttleNotch ?? 0;
    const tmp_speedKmh = Math.abs(telemetry?.speedKmh ?? 0);
    const tmp_brakeRatio = telemetry?.brakeAppliedRatio ?? 0;

    // 1. Engine RPM & Throttle Reactivity
    // Map RPM 300..1050 to fundamental frequency 34 Hz .. 88 Hz
    const tmp_normRpm = Math.min(Math.max((tmp_rpm - 300) / 750, 0), 1);
    const tmp_freq = 34 + tmp_normRpm * 54;
    const tmp_cutoff = 130 + tmp_normRpm * 310 + tmp_notch * 25;
    // Volume scales from subtle idle (0.12) up to full throttle roar (0.42)
    const tmp_engineVol = 0.11 + (tmp_notch / 8) * 0.28 + tmp_normRpm * 0.08;

    this.engineOsc1.frequency.setTargetAtTime(tmp_freq, tmp_now, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(tmp_freq * 0.5, tmp_now, 0.08);
    this.engineFilter.frequency.setTargetAtTime(tmp_cutoff, tmp_now, 0.08);
    this.engineGain.gain.setTargetAtTime(tmp_engineVol, tmp_now, 0.08);

    // Traction motor whine at higher speeds
    const tmp_motorFreq = 200 + tmp_speedKmh * 8.5;
    const tmp_motorVol = Math.min(0.12, (tmp_speedKmh / 120) * 0.12);
    this.engineOsc3.frequency.setTargetAtTime(tmp_motorFreq, tmp_now, 0.1);
    this.engineMotorGain.gain.setTargetAtTime(tmp_motorVol, tmp_now, 0.1);

    // 2. High speed wheel/rail noise reactivity
    // As train accelerates, rail rolling noise increases in cutoff and volume
    const tmp_speedRatio = Math.min(tmp_speedKmh / 130, 1.0);
    const tmp_railCutoff = 220 + Math.pow(tmp_speedRatio, 0.8) * 980;
    const tmp_railVol = Math.pow(tmp_speedRatio, 0.75) * 0.32;

    this.railNoiseFilter.frequency.setTargetAtTime(tmp_railCutoff, tmp_now, 0.08);
    this.railNoiseGain.gain.setTargetAtTime(tmp_railVol, tmp_now, 0.08);

    // 3. Dynamic Brake Squeal & Friction Reactivity
    // Increases when brake is applied AND train is moving
    if (tmp_brakeRatio > 0.03 && tmp_speedKmh > 1.5) {
      const tmp_speedScale = Math.min(tmp_speedKmh / 25, 1.0);
      const tmp_fricVol = tmp_brakeRatio * tmp_speedScale * 0.28;
      this.brakeFrictionGain.gain.setTargetAtTime(tmp_fricVol, tmp_now, 0.06);

      // High-pitched squeal is most audible at moderate-to-low stopping speeds (3 km/h to 45 km/h)
      let tmp_squealFactor = 0;
      if (tmp_speedKmh >= 3 && tmp_speedKmh <= 50) {
        tmp_squealFactor = Math.sin(((tmp_speedKmh - 3) / 47) * Math.PI);
      }
      const tmp_squealVol = tmp_brakeRatio * tmp_squealFactor * 0.18;
      const tmp_squealFreq = 2700 + (tmp_speedKmh / 50) * 500;

      this.brakeSquealOsc.frequency.setTargetAtTime(tmp_squealFreq, tmp_now, 0.08);
      this.brakeSquealGain.gain.setTargetAtTime(tmp_squealVol, tmp_now, 0.08);
    } else {
      this.brakeFrictionGain.gain.setTargetAtTime(0.0, tmp_now, 0.1);
      this.brakeSquealGain.gain.setTargetAtTime(0.0, tmp_now, 0.1);
    }
  }

  /**
   * Controls train horn activation with smooth envelope.
   */
  setHorn(isActive) {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    this.hornGain.gain.cancelScheduledValues(tmp_now);
    if (isActive) {
      this.hornGain.gain.setTargetAtTime(0.55, tmp_now, 0.04);
    } else {
      this.hornGain.gain.setTargetAtTime(0.0, tmp_now, 0.08);
    }
  }

  /**
   * Synthesizes pneumatic air release hiss when brakes are engaged or released.
   */
  playBrakeHiss() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;
    const tmp_sampleRate = this.audioCtx.sampleRate;
    const tmp_bufferSize = Math.floor(tmp_sampleRate * 0.65);
    const tmp_noiseBuffer = this.audioCtx.createBuffer(1, tmp_bufferSize, tmp_sampleRate);
    const tmp_output = tmp_noiseBuffer.getChannelData(0);

    for (let tmp_i = 0; tmp_i < tmp_bufferSize; tmp_i++) {
      tmp_output[tmp_i] = Math.random() * 2 - 1;
    }

    const tmp_noiseNode = this.audioCtx.createBufferSource();
    tmp_noiseNode.buffer = tmp_noiseBuffer;

    const tmp_filter = this.audioCtx.createBiquadFilter();
    tmp_filter.type = 'bandpass';
    tmp_filter.frequency.setValueAtTime(1800, tmp_now);
    tmp_filter.Q.setValueAtTime(2.2, tmp_now);

    const tmp_gain = this.audioCtx.createGain();
    tmp_gain.gain.setValueAtTime(0.38, tmp_now);
    tmp_gain.gain.exponentialRampToValueAtTime(0.001, tmp_now + 0.62);

    tmp_noiseNode.connect(tmp_filter);
    tmp_filter.connect(tmp_gain);
    tmp_gain.connect(this.trainGain);

    tmp_noiseNode.start(tmp_now);
    tmp_noiseNode.stop(tmp_now + 0.65);
  }

  /**
   * Synthesizes rail joint double click-clack percussive sound as bogies pass expansion gaps.
   */
  playRailClickClack(speedKmh) {
    if (!this.isInitialized || !this.audioCtx || speedKmh < 3) return;
    const tmp_now = this.audioCtx.currentTime;
    const tmp_vol = Math.min(0.38, (speedKmh / 90) * 0.38);

    // Front bogie impact
    this.createWheelTap(tmp_now, tmp_vol);
    // Rear bogie impact (spaced by train speed delay)
    const tmp_delay = Math.max(0.05, Math.min(0.12, 2.5 / (speedKmh / 3.6)));
    this.createWheelTap(tmp_now + tmp_delay, tmp_vol * 0.85);
  }

  /**
   * Synthesizes single metallic wheel tap impulse on rail joint.
   */
  createWheelTap(time, volume) {
    const tmp_osc = this.audioCtx.createOscillator();
    tmp_osc.type = 'sine';
    tmp_osc.frequency.setValueAtTime(540, time);
    tmp_osc.frequency.exponentialRampToValueAtTime(75, time + 0.045);

    const tmp_gain = this.audioCtx.createGain();
    tmp_gain.gain.setValueAtTime(volume, time);
    tmp_gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);

    tmp_osc.connect(tmp_gain);
    tmp_gain.connect(this.trainGain);

    tmp_osc.start(time);
    tmp_osc.stop(time + 0.05);
  }

  /**
   * Synthesizes Janney/AAR knuckle coupler impact clang when coaches engage or slack changes.
   */
  playCouplingClank() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    // 1. Sharp high-frequency transient click
    const tmp_osc1 = this.audioCtx.createOscillator();
    tmp_osc1.type = 'triangle';
    tmp_osc1.frequency.setValueAtTime(1400, tmp_now);
    tmp_osc1.frequency.exponentialRampToValueAtTime(220, tmp_now + 0.06);

    const tmp_gain1 = this.audioCtx.createGain();
    tmp_gain1.gain.setValueAtTime(0.45, tmp_now);
    tmp_gain1.gain.exponentialRampToValueAtTime(0.001, tmp_now + 0.06);

    tmp_osc1.connect(tmp_gain1);
    tmp_gain1.connect(this.trainGain);
    tmp_osc1.start(tmp_now);
    tmp_osc1.stop(tmp_now + 0.07);

    // 2. Heavy resonant steel clang
    const tmp_osc2 = this.audioCtx.createOscillator();
    tmp_osc2.type = 'sine';
    tmp_osc2.frequency.setValueAtTime(280, tmp_now + 0.01);
    tmp_osc2.frequency.exponentialRampToValueAtTime(160, tmp_now + 0.35);

    const tmp_gain2 = this.audioCtx.createGain();
    tmp_gain2.gain.setValueAtTime(0.001, tmp_now);
    tmp_gain2.gain.setValueAtTime(0.5, tmp_now + 0.01);
    tmp_gain2.gain.exponentialRampToValueAtTime(0.001, tmp_now + 0.4);

    tmp_osc2.connect(tmp_gain2);
    tmp_gain2.connect(this.trainGain);
    tmp_osc2.start(tmp_now + 0.01);
    tmp_osc2.stop(tmp_now + 0.42);
  }

  /**
   * Synthesizes modern passenger coach electric door warning chime.
   */
  playDoorChime() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    // Triple 880 Hz beep sequence with gentle decay
    for (let tmp_i = 0; tmp_i < 3; tmp_i++) {
      const tmp_t = tmp_now + tmp_i * 0.16;
      const tmp_osc = this.audioCtx.createOscillator();
      tmp_osc.type = 'sine';
      tmp_osc.frequency.setValueAtTime(880, tmp_t);

      const tmp_gain = this.audioCtx.createGain();
      tmp_gain.gain.setValueAtTime(0.001, tmp_now);
      tmp_gain.gain.setValueAtTime(0.24, tmp_t);
      tmp_gain.gain.exponentialRampToValueAtTime(0.001, tmp_t + 0.11);

      tmp_osc.connect(tmp_gain);
      tmp_gain.connect(this.trainGain);

      tmp_osc.start(tmp_t);
      tmp_osc.stop(tmp_t + 0.13);
    }
  }

  /**
   * Synthesizes pulsating cab warning alarm buzzer.
   */
  playWarningAlarm() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    const tmp_osc = this.audioCtx.createOscillator();
    tmp_osc.type = 'square';
    tmp_osc.frequency.setValueAtTime(950, tmp_now);

    const tmp_gain = this.audioCtx.createGain();
    tmp_gain.gain.setValueAtTime(0.22, tmp_now);
    tmp_gain.gain.exponentialRampToValueAtTime(0.001, tmp_now + 0.22);

    tmp_osc.connect(tmp_gain);
    tmp_gain.connect(this.trainGain);

    tmp_osc.start(tmp_now);
    tmp_osc.stop(tmp_now + 0.24);
  }

  /**
   * Synthesizes an AWS caution warning buzzer (dual tone 440 Hz / 880 Hz buzz).
   */
  playSignalWarning() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    const tmp_osc1 = this.audioCtx.createOscillator();
    tmp_osc1.type = 'sawtooth';
    tmp_osc1.frequency.setValueAtTime(440, tmp_now);

    const tmp_osc2 = this.audioCtx.createOscillator();
    tmp_osc2.type = 'square';
    tmp_osc2.frequency.setValueAtTime(880, tmp_now);

    const tmp_gain = this.audioCtx.createGain();
    tmp_gain.gain.setValueAtTime(0.26, tmp_now);
    tmp_gain.gain.exponentialRampToValueAtTime(0.001, tmp_now + 0.48);

    tmp_osc1.connect(tmp_gain);
    tmp_osc2.connect(tmp_gain);
    tmp_gain.connect(this.trainGain);

    tmp_osc1.start(tmp_now);
    tmp_osc2.start(tmp_now);
    tmp_osc1.stop(tmp_now + 0.5);
    tmp_osc2.stop(tmp_now + 0.5);
  }

  /**
   * Synthesizes an AWS clear bell chime (1200 Hz pure harmonic ping).
   */
  playSignalClear() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    const tmp_osc = this.audioCtx.createOscillator();
    tmp_osc.type = 'sine';
    tmp_osc.frequency.setValueAtTime(1200, tmp_now);

    const tmp_gain = this.audioCtx.createGain();
    tmp_gain.gain.setValueAtTime(0.35, tmp_now);
    tmp_gain.gain.exponentialRampToValueAtTime(0.0001, tmp_now + 0.65);

    tmp_osc.connect(tmp_gain);
    tmp_gain.connect(this.trainGain);

    tmp_osc.start(tmp_now);
    tmp_osc.stop(tmp_now + 0.7);
  }

  /**
   * Synthesizes emergency SPAD klaxon siren (alternating warble).
   */
  playSpadAlarm() {
    if (!this.isInitialized || !this.audioCtx) return;
    const tmp_now = this.audioCtx.currentTime;

    const tmp_osc = this.audioCtx.createOscillator();
    tmp_osc.type = 'sawtooth';

    for (let tmp_i = 0; tmp_i < 3; tmp_i++) {
      const tmp_t = tmp_now + tmp_i * 0.28;
      tmp_osc.frequency.setValueAtTime(900, tmp_t);
      tmp_osc.frequency.linearRampToValueAtTime(600, tmp_t + 0.14);
      tmp_osc.frequency.setValueAtTime(900, tmp_t + 0.28);
    }

    const tmp_gain = this.audioCtx.createGain();
    tmp_gain.gain.setValueAtTime(0.42, tmp_now);
    tmp_gain.gain.exponentialRampToValueAtTime(0.001, tmp_now + 0.95);

    tmp_osc.connect(tmp_gain);
    tmp_gain.connect(this.trainGain);

    tmp_osc.start(tmp_now);
    tmp_osc.stop(tmp_now + 1.0);
  }
}
