/**
 * AudioManager.js
 * Master audio manager coordinating Web Audio API lifecycle, multi-channel volume buses,
 * and modular submodules (TrainAudio, EnvironmentAudio, WeatherAudio, UIAudio).
 */

import { TrainAudio } from './TrainAudio.js';
import { EnvironmentAudio } from './EnvironmentAudio.js';
import { WeatherAudio } from './WeatherAudio.js';
import { UIAudio } from './UIAudio.js';

export class AudioManager {
  /**
   * Initializes audio context reference, bus channels, and submodule instances.
   */
  constructor() {
    this.audioCtx = null;
    this.isInitialized = false;
    this.isMuted = false;

    // Master volume scalar
    this.masterVolumeLevel = 0.8;
    this.trainVolumeLevel = 0.85;
    this.environmentVolumeLevel = 0.75;
    this.weatherVolumeLevel = 0.75;
    this.uiVolumeLevel = 0.85;

    // Master bus
    this.masterGain = null;

    // Modular subsystems
    this.train = null;
    this.environment = null;
    this.weather = null;
    this.ui = null;
  }

  /**
   * Initializes AudioContext upon user gesture (click/touch/key) to comply with browser autoplay policies.
   */
  init() {
    if (this.isInitialized) {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return;
    }

    try {
      const cons_AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!cons_AudioContextClass) return;

      this.audioCtx = new cons_AudioContextClass();

      // Master output bus
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : this.masterVolumeLevel, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      // Instantiate submodules routed to master bus
      this.train = new TrainAudio(this.audioCtx, this.masterGain);
      this.environment = new EnvironmentAudio(this.audioCtx, this.masterGain);
      this.weather = new WeatherAudio(this.audioCtx, this.masterGain);
      this.ui = new UIAudio(this.audioCtx, this.masterGain);

      // Initialize all submodules
      this.train.init();
      this.environment.init();
      this.weather.init();
      this.ui.init();

      // Apply initial volume levels
      this.setTrainVolume(this.trainVolumeLevel);
      this.setEnvironmentVolume(this.environmentVolumeLevel);
      this.setWeatherVolume(this.weatherVolumeLevel);
      this.setUIVolume(this.uiVolumeLevel);

      this.isInitialized = true;
    } catch (err) {
      console.warn('AudioManager Web Audio API initialization blocked or unsupported:', err);
    }
  }

  /**
   * Updates master bus volume (0.0 to 1.0).
   */
  setMasterVolume(volume) {
    this.masterVolumeLevel = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.audioCtx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.masterVolumeLevel, this.audioCtx.currentTime, 0.05);
    }
  }

  /**
   * Updates train propulsion and dynamic sound volume (0.0 to 1.0).
   */
  setTrainVolume(volume) {
    this.trainVolumeLevel = Math.max(0, Math.min(1, volume));
    if (this.train && this.train.trainGain && this.audioCtx) {
      this.train.trainGain.gain.setTargetAtTime(this.trainVolumeLevel, this.audioCtx.currentTime, 0.05);
    }
  }

  /**
   * Updates environment ambience sound volume (0.0 to 1.0).
   */
  setEnvironmentVolume(volume) {
    this.environmentVolumeLevel = Math.max(0, Math.min(1, volume));
    if (this.environment && this.environment.envGain && this.audioCtx) {
      this.environment.envGain.gain.setTargetAtTime(this.environmentVolumeLevel, this.audioCtx.currentTime, 0.05);
    }
  }

  /**
   * Updates weather phenomenon sound volume (0.0 to 1.0).
   */
  setWeatherVolume(volume) {
    this.weatherVolumeLevel = Math.max(0, Math.min(1, volume));
    if (this.weather && this.weather.weatherGain && this.audioCtx) {
      this.weather.weatherGain.gain.setTargetAtTime(this.weatherVolumeLevel, this.audioCtx.currentTime, 0.05);
    }
  }

  /**
   * Updates UI tactile sound volume (0.0 to 1.0).
   */
  setUIVolume(volume) {
    this.uiVolumeLevel = Math.max(0, Math.min(1, volume));
    if (this.ui && this.ui.uiGain && this.audioCtx) {
      this.ui.uiGain.gain.setTargetAtTime(this.uiVolumeLevel, this.audioCtx.currentTime, 0.05);
    }
  }

  /**
   * Mutes or restores master sound output.
   */
  setMute(isMuted) {
    this.isMuted = isMuted;
    if (this.masterGain && this.audioCtx) {
      const tmp_targetVol = isMuted ? 0.0 : this.masterVolumeLevel;
      this.masterGain.gain.setTargetAtTime(tmp_targetVol, this.audioCtx.currentTime, 0.04);
    }
  }

  /**
   * Toggles mute state.
   */
  toggleMute() {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Main simulation frame tick advancing train, environmental, and weather audio layers.
   */
  update(deltaTime, telemetry, environment, stationContext) {
    if (!this.isInitialized || !this.audioCtx || this.isMuted) return;

    if (this.train) {
      this.train.update(deltaTime, telemetry);
    }

    if (this.environment) {
      this.environment.update(deltaTime, environment, telemetry?.speedKmh, stationContext);
    }

    if (this.weather) {
      this.weather.update(deltaTime, environment?.weather);
    }
  }

  // --- Convenience Forwarding Methods for Locomotive and Gameplay Actions ---

  /**
   * Legacy method updating engine parameters directly.
   */
  updateEngine(rpm, throttleNotch, speedKmh) {
    if (this.train) {
      this.train.update(0.016, { engineRpm: rpm, throttleNotch, speedKmh });
    }
  }

  setHorn(isActive) {
    if (this.train) this.train.setHorn(isActive);
  }

  playBrakeHiss() {
    if (this.train) this.train.playBrakeHiss();
  }

  playRailClickClack(speedKmh) {
    if (this.train) this.train.playRailClickClack(speedKmh);
  }

  playCouplingClank() {
    if (this.train) this.train.playCouplingClank();
  }

  playDoorChime() {
    if (this.train) this.train.playDoorChime();
  }

  playWarningAlarm() {
    if (this.train) this.train.playWarningAlarm();
  }

  playSignalWarning() {
    if (this.train) this.train.playSignalWarning();
  }

  playSignalClear() {
    if (this.train) this.train.playSignalClear();
  }

  playSpadAlarm() {
    if (this.train) this.train.playSpadAlarm();
  }

  playStationChime() {
    if (this.environment) this.environment.playStationChime();
  }

  playGuardWhistle() {
    if (this.environment) this.environment.playGuardWhistle();
  }

  playThunderCrash() {
    if (this.weather) this.weather.playThunderCrash();
  }

  playButtonClick() {
    if (this.ui) this.ui.playButtonClick();
  }

  playLeverNotch() {
    if (this.ui) this.ui.playLeverNotch();
  }

  playSwitchToggle() {
    if (this.ui) this.ui.playSwitchToggle();
  }
}

// Global audio manager singleton
export const obj_AUDIO_MANAGER = new AudioManager();
