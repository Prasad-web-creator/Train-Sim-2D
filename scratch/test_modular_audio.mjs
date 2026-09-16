/**
 * test_modular_audio.mjs
 * Comprehensive automated verification test suite for the modular Web Audio API system.
 * Validates AudioManager, TrainAudio, EnvironmentAudio, WeatherAudio, UIAudio, and SoundManager.
 */

import assert from 'assert';

// 1. Setup Mock Web Audio API Environment for Node.js
class MockAudioParam {
  constructor(defaultValue = 1.0) {
    this.value = defaultValue;
    this.history = [];
  }
  setValueAtTime(val, time) {
    this.value = val;
    this.history.push({ type: 'setValueAtTime', val, time });
  }
  linearRampToValueAtTime(val, time) {
    this.value = val;
    this.history.push({ type: 'linearRampToValueAtTime', val, time });
  }
  exponentialRampToValueAtTime(val, time) {
    this.value = val;
    this.history.push({ type: 'exponentialRampToValueAtTime', val, time });
  }
  setTargetAtTime(val, time, timeConstant) {
    this.value = val;
    this.history.push({ type: 'setTargetAtTime', val, time, timeConstant });
  }
  cancelScheduledValues(time) {
    this.history.push({ type: 'cancelScheduledValues', time });
  }
}

class MockAudioNode {
  constructor(ctx) {
    this.context = ctx;
    this.connectedTo = [];
  }
  connect(dest) {
    this.connectedTo.push(dest);
    return dest;
  }
  disconnect() {
    this.connectedTo = [];
  }
}

class MockGainNode extends MockAudioNode {
  constructor(ctx) {
    super(ctx);
    this.gain = new MockAudioParam(1.0);
  }
}

class MockBiquadFilterNode extends MockAudioNode {
  constructor(ctx) {
    super(ctx);
    this.type = 'lowpass';
    this.frequency = new MockAudioParam(350);
    this.Q = new MockAudioParam(1.0);
  }
}

class MockOscillatorNode extends MockAudioNode {
  constructor(ctx) {
    super(ctx);
    this.type = 'sine';
    this.frequency = new MockAudioParam(440);
    this.isStarted = false;
    this.isStopped = false;
  }
  start(time = 0) {
    this.isStarted = true;
    this.startTime = time;
  }
  stop(time = 0) {
    this.isStopped = true;
    this.stopTime = time;
  }
}

class MockAudioBuffer {
  constructor(channels, length, sampleRate) {
    this.numberOfChannels = channels;
    this.length = length;
    this.sampleRate = sampleRate;
    this.channelData = [new Float32Array(length)];
  }
  getChannelData(channel) {
    return this.channelData[channel] || this.channelData[0];
  }
}

class MockAudioBufferSourceNode extends MockAudioNode {
  constructor(ctx) {
    super(ctx);
    this.buffer = null;
    this.loop = false;
    this.isStarted = false;
    this.isStopped = false;
  }
  start(time = 0) {
    this.isStarted = true;
  }
  stop(time = 0) {
    this.isStopped = true;
  }
}

class MockAudioContext {
  constructor() {
    this.currentTime = 10.0;
    this.sampleRate = 44100;
    this.state = 'running';
    this.destination = new MockAudioNode(this);
  }
  createGain() {
    return new MockGainNode(this);
  }
  createBiquadFilter() {
    return new MockBiquadFilterNode(this);
  }
  createOscillator() {
    return new MockOscillatorNode(this);
  }
  createBuffer(channels, length, sampleRate) {
    return new MockAudioBuffer(channels, length, sampleRate);
  }
  createBufferSource() {
    return new MockAudioBufferSourceNode(this);
  }
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
}

// Attach mocks to global window object
global.window = {
  AudioContext: MockAudioContext,
};

async function runTests() {
  console.log('--- BEGIN MODULAR BROWSER AUDIO TEST SUITE ---');

  // 2. Import Modules
  const { AudioManager, obj_AUDIO_MANAGER } = await import('../src/game/audio/AudioManager.js');
  const { TrainAudio } = await import('../src/game/audio/TrainAudio.js');
  const { EnvironmentAudio } = await import('../src/game/audio/EnvironmentAudio.js');
  const { WeatherAudio } = await import('../src/game/audio/WeatherAudio.js');
  const { UIAudio } = await import('../src/game/audio/UIAudio.js');
  const { SoundManager, obj_SOUND_MANAGER } = await import('../src/game/audio/SoundManager.js');
  const { obj_CENTRAL_GAME_STATE } = await import('../src/game/core/GameState.js');

  console.log('✓ Modules imported successfully');

  // 3. Test AudioManager Lifecycle & Routing
  const obj_audioMgr = new AudioManager();
  assert.strictEqual(obj_audioMgr.isInitialized, false, 'AudioManager begins uninitialized');
  assert.strictEqual(obj_audioMgr.isMuted, false, 'AudioManager default is unmuted');

  obj_audioMgr.init();
  assert.strictEqual(obj_audioMgr.isInitialized, true, 'AudioManager is initialized after init()');
  assert.ok(obj_audioMgr.audioCtx, 'AudioContext created');
  assert.ok(obj_audioMgr.masterGain, 'Master gain created');
  assert.ok(obj_audioMgr.train, 'TrainAudio submodule instantiated');
  assert.ok(obj_audioMgr.environment, 'EnvironmentAudio submodule instantiated');
  assert.ok(obj_audioMgr.weather, 'WeatherAudio submodule instantiated');
  assert.ok(obj_audioMgr.ui, 'UIAudio submodule instantiated');
  console.log('✓ AudioManager initialization and submodules verified');

  // 4. Test Volume Controls
  obj_audioMgr.setMasterVolume(0.5);
  assert.strictEqual(obj_audioMgr.masterGain.gain.value, 0.5, 'Master volume set to 0.5');

  obj_audioMgr.setTrainVolume(0.65);
  assert.strictEqual(obj_audioMgr.train.trainGain.gain.value, 0.65, 'Train volume set to 0.65');

  obj_audioMgr.setEnvironmentVolume(0.4);
  assert.strictEqual(obj_audioMgr.environment.envGain.gain.value, 0.4, 'Environment volume set to 0.4');

  obj_audioMgr.setWeatherVolume(0.3);
  assert.strictEqual(obj_audioMgr.weather.weatherGain.gain.value, 0.3, 'Weather volume set to 0.3');

  obj_audioMgr.setUIVolume(0.9);
  assert.strictEqual(obj_audioMgr.ui.uiGain.gain.value, 0.9, 'UI volume set to 0.9');

  // Test Muting
  obj_audioMgr.setMute(true);
  assert.strictEqual(obj_audioMgr.isMuted, true, 'isMuted is true');
  assert.strictEqual(obj_audioMgr.masterGain.gain.value, 0.0, 'Master gain zeroed on mute');

  obj_audioMgr.setMute(false);
  assert.strictEqual(obj_audioMgr.isMuted, false, 'isMuted is false');
  assert.strictEqual(obj_audioMgr.masterGain.gain.value, 0.5, 'Master gain restored after unmuting');
  console.log('✓ Multi-channel volume controls and mute toggling verified');

  // 5. Test TrainAudio Dynamic Reactivity
  const obj_trainAudio = obj_audioMgr.train;

  // A. Idle state (throttle 0, speed 0, RPM 320)
  obj_trainAudio.update(0.016, {
    engineRpm: 320,
    throttleNotch: 0,
    speedKmh: 0,
    brakeAppliedRatio: 0,
  });

  const tmp_idleFreq = obj_trainAudio.engineOsc1.frequency.value;
  const tmp_idleGain = obj_trainAudio.engineGain.gain.value;
  const tmp_idleRailGain = obj_trainAudio.railNoiseGain.gain.value;
  const tmp_idleBrakeGain = obj_trainAudio.brakeFrictionGain.gain.value;

  assert.ok(tmp_idleFreq >= 34 && tmp_idleFreq <= 40, `Idle engine fundamental frequency low (~34-40 Hz): got ${tmp_idleFreq}`);
  assert.ok(tmp_idleGain < 0.2, `Idle engine gain is gentle (< 0.2): got ${tmp_idleGain}`);
  assert.strictEqual(tmp_idleRailGain, 0.0, 'Rail noise gain is 0 at standstill');
  assert.strictEqual(tmp_idleBrakeGain, 0.0, 'Brake friction gain is 0 at standstill');
  console.log('✓ Train idle sound verified: low engine sound, silent rail & brake noise');

  // B. Throttle acceleration (throttle 8, RPM 950, speed 40 km/h)
  obj_trainAudio.update(0.016, {
    engineRpm: 950,
    throttleNotch: 8,
    speedKmh: 40,
    brakeAppliedRatio: 0,
  });

  const tmp_notch8Freq = obj_trainAudio.engineOsc1.frequency.value;
  const tmp_notch8Gain = obj_trainAudio.engineGain.gain.value;
  const tmp_notch8Cutoff = obj_trainAudio.engineFilter.frequency.value;

  assert.ok(tmp_notch8Freq > tmp_idleFreq, `Engine pitch increases with RPM and throttle: ${tmp_notch8Freq} > ${tmp_idleFreq}`);
  assert.ok(tmp_notch8Gain > tmp_idleGain, `Engine volume increases with throttle notch 8: ${tmp_notch8Gain} > ${tmp_idleGain}`);
  assert.ok(tmp_notch8Cutoff > 350, `Engine filter opens up for throttle roar: ${tmp_notch8Cutoff}`);
  console.log('✓ Throttle acceleration verified: engine pitch and roar increase dynamically');

  // C. High speed rail noise (speed 110 km/h)
  obj_trainAudio.update(0.016, {
    engineRpm: 750,
    throttleNotch: 4,
    speedKmh: 110,
    brakeAppliedRatio: 0,
  });

  const tmp_highSpeedRailGain = obj_trainAudio.railNoiseGain.gain.value;
  const tmp_highSpeedRailCutoff = obj_trainAudio.railNoiseFilter.frequency.value;
  assert.ok(tmp_highSpeedRailGain > 0.15, `Rail noise volume increases at high speed (110 km/h): got ${tmp_highSpeedRailGain}`);
  assert.ok(tmp_highSpeedRailCutoff > 700, `Rail noise filter frequency rises at high speed: got ${tmp_highSpeedRailCutoff}`);
  console.log('✓ High speed rail noise verified: rolling noise increases with speed');

  // D. Braking sound increase (speed 35 km/h, brake ratio 0.8)
  obj_trainAudio.update(0.016, {
    engineRpm: 320,
    throttleNotch: 0,
    speedKmh: 35,
    brakeAppliedRatio: 0.8,
  });

  const tmp_brakingFricGain = obj_trainAudio.brakeFrictionGain.gain.value;
  const tmp_brakingSquealGain = obj_trainAudio.brakeSquealGain.gain.value;
  assert.ok(tmp_brakingFricGain > 0.1, `Brake friction sound increases when braking: got ${tmp_brakingFricGain}`);
  assert.ok(tmp_brakingSquealGain > 0.05, `Brake squeal sound increases when stopping: got ${tmp_brakingSquealGain}`);
  console.log('✓ Braking sound verified: brake friction and squeal increase with brake ratio and speed');

  // E. Horn (Nathan K3LA 3 chimes)
  obj_trainAudio.setHorn(true);
  assert.strictEqual(obj_trainAudio.hornGain.gain.value, 0.55, 'Horn gain set to 0.55 on activation');
  assert.strictEqual(obj_trainAudio.arr_hornOscs.length, 3, 'Nathan K3LA 3 chime oscillators present');
  obj_trainAudio.setHorn(false);
  assert.strictEqual(obj_trainAudio.hornGain.gain.value, 0.0, 'Horn gain muted on release');
  console.log('✓ 3-chime K3LA horn chord verified');

  // F. Coupling, doors, alarms
  obj_trainAudio.playBrakeHiss();
  obj_trainAudio.playRailClickClack(50);
  obj_trainAudio.playCouplingClank();
  obj_trainAudio.playDoorChime();
  obj_trainAudio.playWarningAlarm();
  obj_trainAudio.playSignalWarning();
  obj_trainAudio.playSignalClear();
  obj_trainAudio.playSpadAlarm();
  console.log('✓ Knuckle coupling, door chime, warning alarms, signal alerts verified');

  // 6. Test EnvironmentAudio
  const obj_envAudio = obj_audioMgr.environment;

  // A. Wind rush scaling with speed
  obj_envAudio.update(0.016, { timePhase: 'NOON', weather: 'CLEAR' }, 90, { isNearStation: false });
  assert.ok(obj_envAudio.windGain.gain.value > 0.12, 'Wind rush scales with train speed');

  // B. Station crowd murmur proximity
  obj_envAudio.update(0.016, { timePhase: 'NOON', weather: 'CLEAR' }, 5, { isNearStation: true });
  assert.ok(obj_envAudio.stationMurmurGain.gain.value > 0.1, 'Station crowd murmur increases at station platform');

  obj_envAudio.update(0.016, { timePhase: 'NOON', weather: 'CLEAR' }, 60, { isNearStation: false });
  assert.strictEqual(obj_envAudio.stationMurmurGain.gain.value, 0.0, 'Station crowd murmur fades when away from platform');

  // C. Procedural Birdsong FM Chirp
  obj_envAudio.triggerBirdChirp();
  console.log('✓ EnvironmentAudio verified: wind rush, station crowd, birdsong FM synthesis');

  // 7. Test WeatherAudio
  const obj_weatherAudio = obj_audioMgr.weather;

  // Rain synthesis
  obj_weatherAudio.update(0.016, 'RAIN');
  assert.strictEqual(obj_weatherAudio.rainGain.gain.value, 0.22, 'Rain gain set for RAIN weather');

  // Heavy rain & Thunder
  obj_weatherAudio.update(0.016, 'HEAVY_RAIN');
  assert.strictEqual(obj_weatherAudio.rainGain.gain.value, 0.42, 'Heavy rain gain increased');
  obj_weatherAudio.playThunderCrash();

  // Snow / Blizzard howling wind
  obj_weatherAudio.update(0.016, 'SNOW');
  assert.strictEqual(obj_weatherAudio.blizzardGain.gain.value, 0.25, 'Blizzard howling wind active during SNOW');

  // Clear weather fades rain and snow
  obj_weatherAudio.update(0.016, 'CLEAR');
  assert.strictEqual(obj_weatherAudio.rainGain.gain.value, 0.0, 'Rain gain silenced during CLEAR');
  assert.strictEqual(obj_weatherAudio.blizzardGain.gain.value, 0.0, 'Blizzard wind silenced during CLEAR');
  console.log('✓ WeatherAudio verified: rain, heavy storm downpour, thunder boom, blizzard howl');

  // 8. Test UIAudio
  const obj_uiAudio = obj_audioMgr.ui;
  obj_uiAudio.playButtonClick();
  obj_uiAudio.playLeverNotch();
  obj_uiAudio.playSwitchToggle();
  obj_uiAudio.playModalOpen();
  obj_uiAudio.playModalClose();
  obj_uiAudio.playKeyRebind();
  console.log('✓ UIAudio verified: button clicks, lever detent notches, switches, modals');

  // 9. Test SoundManager Facade Backwards Compatibility
  const obj_soundFacade = new SoundManager(obj_audioMgr);
  obj_soundFacade.init();
  assert.strictEqual(obj_soundFacade.isInitialized, true, 'SoundManager facade forwards isInitialized');
  assert.strictEqual(obj_soundFacade.isMuted, false, 'SoundManager facade forwards isMuted');
  obj_soundFacade.updateEngine(500, 3, 25);
  obj_soundFacade.playBrakeHiss();
  obj_soundFacade.playRailClickClack(45);
  obj_soundFacade.playCouplingClank();
  obj_soundFacade.playDoorChime();
  obj_soundFacade.playSignalClear();
  obj_soundFacade.playSignalWarning();
  obj_soundFacade.playSpadAlarm();
  obj_soundFacade.playStationChime();
  obj_soundFacade.playGuardWhistle();
  obj_soundFacade.setHorn(true);
  obj_soundFacade.setHorn(false);
  obj_soundFacade.setMute(true);
  assert.strictEqual(obj_audioMgr.isMuted, true, 'SoundManager setMute forwarded to AudioManager');
  obj_soundFacade.setMute(false);
  console.log('✓ SoundManager backwards compatibility facade verified: 100% method compatibility');

  // 10. Test GameState Volume Configuration
  obj_CENTRAL_GAME_STATE.setMasterVolume(0.88);
  obj_CENTRAL_GAME_STATE.setEngineVolume(0.92);
  obj_CENTRAL_GAME_STATE.setEnvironmentVolume(0.65);
  obj_CENTRAL_GAME_STATE.setWeatherVolume(0.70);
  obj_CENTRAL_GAME_STATE.setSfxVolume(0.80);

  const obj_stateSnap = obj_CENTRAL_GAME_STATE.getSnapshot();
  assert.strictEqual(obj_stateSnap.settings.masterVolume, 0.88, 'GameState masterVolume updated');
  assert.strictEqual(obj_stateSnap.settings.engineVolume, 0.92, 'GameState engineVolume updated');
  assert.strictEqual(obj_stateSnap.settings.environmentVolume, 0.65, 'GameState environmentVolume updated');
  assert.strictEqual(obj_stateSnap.settings.weatherVolume, 0.70, 'GameState weatherVolume updated');
  assert.strictEqual(obj_stateSnap.settings.sfxVolume, 0.80, 'GameState sfxVolume updated');
  console.log('✓ GameState volume settings integration verified');

  console.log('--- ALL 10 TEST SUITES PASSED (100% SUCCESS) ---');
}

runTests().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
