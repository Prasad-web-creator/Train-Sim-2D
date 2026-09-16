/**
 * SoundManager.js
 * Backwards-compatible adapter and facade wrapping the modular AudioManager system.
 * Routes legacy calls to TrainAudio, EnvironmentAudio, WeatherAudio, and UIAudio.
 */

import { obj_AUDIO_MANAGER, AudioManager } from './AudioManager.js';

export class SoundManager {
  /**
   * Initializes facade referencing the underlying AudioManager singleton.
   */
  constructor(manager = obj_AUDIO_MANAGER) {
    this.manager = manager;
  }

  get audioCtx() {
    return this.manager.audioCtx;
  }

  get isInitialized() {
    return this.manager.isInitialized;
  }

  get isMuted() {
    return this.manager.isMuted;
  }

  get masterGain() {
    return this.manager.masterGain;
  }

  /**
   * Initializes AudioContext upon user gesture.
   */
  init() {
    this.manager.init();
  }

  /**
   * Adjusts engine pitch, harmonics, and volume dynamically.
   */
  updateEngine(rpm, throttleNotch, speedKmh) {
    this.manager.updateEngine(rpm, throttleNotch, speedKmh);
  }

  /**
   * Activates or releases train horn.
   */
  setHorn(isActive) {
    this.manager.setHorn(isActive);
  }

  /**
   * Plays pneumatic brake release air hiss.
   */
  playBrakeHiss() {
    this.manager.playBrakeHiss();
  }

  /**
   * Plays rail expansion joint double click-clack percussive sound.
   */
  playRailClickClack(speedKmh) {
    this.manager.playRailClickClack(speedKmh);
  }

  /**
   * Plays knuckle coupler engagement clank.
   */
  playCouplingClank() {
    this.manager.playCouplingClank();
  }

  /**
   * Mutes or un-mutes audio output.
   */
  setMute(isMuted) {
    this.manager.setMute(isMuted);
  }

  /**
   * Plays AWS clear bell chime.
   */
  playSignalClear() {
    this.manager.playSignalClear();
  }

  /**
   * Plays AWS caution warning buzzer.
   */
  playSignalWarning() {
    this.manager.playSignalWarning();
  }

  /**
   * Plays emergency SPAD klaxon siren.
   */
  playSpadAlarm() {
    this.manager.playSpadAlarm();
  }

  /**
   * Plays station arrival 2-tone melodic chime.
   */
  playStationChime() {
    this.manager.playStationChime();
  }

  /**
   * Plays station guard pea-whistle.
   */
  playGuardWhistle() {
    this.manager.playGuardWhistle();
  }

  /**
   * Plays passenger coach door closing warning chime.
   */
  playDoorChime() {
    this.manager.playDoorChime();
  }

  /**
   * Plays cab warning alarm buzzer.
   */
  playWarningAlarm() {
    this.manager.playWarningAlarm();
  }
}

// Global audio sound manager facade instance
export const obj_SOUND_MANAGER = new SoundManager();
