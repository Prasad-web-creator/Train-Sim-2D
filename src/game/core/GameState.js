/**
 * GameState.js
 * Centralized game state store managing train telemetry, mission objectives, and UI events.
 */

import { cons_GAME_STATE_MODES, cons_REVERSER_MODES } from '../../constants/GameConstants.js';

export const defaultTrackRun = Object.freeze({
  id: 'route_southern_coast',
  name: 'Southern Indian Coast Line',
  region: 'Tamil Nadu, India',
  startStation: 'Tirunelveli Junction',
  endStation: 'Thoothukudi Station',
  intermediateStations: ['Palayamkottai Halt', 'Vanchi Maniyachchi'],
  trackLengthMeters: 5000,
  maxSpeedLimitKmh: 80,
  biome: 'coastal',
  defaultWeather: 'CLEAR',
  locomotiveId: 'loco_wap7_red',
  wagonIds: ['passenger_coach', 'passenger_coach'],
  speedLimits: [
    { startDist: 0, endDist: 5000, limitKmh: 80 },
  ],
  elevationKeypoints: [
    { dist: 0, height: 0 },
    { dist: 1200, height: 4 },
    { dist: 2400, height: -3 },
    { dist: 3600, height: 8 },
    { dist: 5000, height: 0 },
  ],
  objectives: [],
});

class CentralGameState {
  /**
   * Initializes default centralized game state properties and listeners set.
   */
  constructor() {
    this.defaultTrackRun = defaultTrackRun;
    this.currentMode = cons_GAME_STATE_MODES.MENU;
    this.currentMission = defaultTrackRun;

    // Train dynamic telemetry
    this.trainTelemetry = {
      speedKmh: 0,
      speedMps: 0,
      targetSpeedKmh: 0,
      distanceMeters: 0,
      elevationMeters: 0,
      trackGradePercent: 0,
      throttleNotch: 0, // 0 through 8
      reverser: cons_REVERSER_MODES.FORWARD,
      trainBrakePressureBar: 5.0, // 5.0 bar is released, 3.5 bar is full service
      brakeAppliedRatio: 0, // 0 to 1
      engineRpm: 320,
      engineTempC: 82,
      fuelRemainingLitres: 12000,
      isWheelSlipping: false,
      isSanderActive: false,
      isHeadlightOn: true,
      isHornActive: false,
      isCoolantActive: false,
    };

    // Signal status & cab telemetry
    this.signalStatus = {
      approachingSignalId: null,
      signalName: 'SIG 01',
      aspect: 'GREEN',
      distanceMeters: 9999,
      advisorySpeedKmh: 999,
      isViolationActive: false,
      violationType: null,
      violationMessage: '',
    };

    // Mission status & objective telemetry
    this.missionStatus = {
      elapsedTimeSeconds: 0,
      score: 1000,
      penalties: 0,
      speedLimitKmh: 55,
      isSpeeding: false,
      totalTrackLengthMeters: 4800,
      currentDistanceMeters: 0,
      distanceToDestinationMeters: 4800,
      distanceFraction: 0,
      progressFraction: 0,
      statusMessage: 'Follow track signals',
      activeObjective: null,
      passengerCount: 0,
      cargoTonnage: 0,
      cargoName: 'Freight',
      missionResult: null,
    };

    // User settings
    this.settings = {
      masterVolume: 0.8,
      engineVolume: 0.75,
      environmentVolume: 0.7,
      weatherVolume: 0.7,
      sfxVolume: 0.85,
      cameraZoom: 1.0,
      cameraMode: 'follow', // 'follow', 'free'
    };

    // Environmental weather and day/night state
    this.environment = {
      weather: 'CLEAR',
      timePhase: 'NOON',
      timeHours: 12.0,
      timeString: '12:00',
      dashboardBacklight: 0.0,
    };

    // Subscribed listeners array
    this.arr_listeners = [];
  }

  /**
   * Registers a listener callback function that receives state change updates.
   */
  subscribe(fn_listener) {
    this.arr_listeners.push(fn_listener);
    return () => {
      this.arr_listeners = this.arr_listeners.filter((fn_sub) => fn_sub !== fn_listener);
    };
  }

  /**
   * Dispatches state update notification to all registered listeners.
   */
  notify() {
    const obj_snapshot = this.getSnapshot();
    for (let tmp_i = 0; tmp_i < this.arr_listeners.length; tmp_i++) {
      const fn_listener = this.arr_listeners[tmp_i];
      fn_listener(obj_snapshot);
    }
  }

  /**
   * Produces an immutable snapshot object of current state.
   */
  getSnapshot() {
    return {
      currentMode: this.currentMode,
      currentMission: this.currentMission,
      telemetry: { ...this.trainTelemetry },
      mission: {
        ...this.missionStatus,
        activeObjective: this.missionStatus.activeObjective ? { ...this.missionStatus.activeObjective } : null,
        missionResult: this.missionStatus.missionResult ? { ...this.missionStatus.missionResult } : null,
      },
      signal: { ...this.signalStatus },
      settings: { ...this.settings },
      environment: { ...this.environment },
    };
  }

  /**
   * Sets game mode (menu, playing, paused, success, failed, settings).
   */
  setGameMode(mode) {
    this.currentMode = mode;
    this.notify();
  }

  /**
   * Starts a new mission scenario and resets telemetry.
   */
  startMission(obj_mission) {
    this.currentMission = obj_mission;
    this.currentMode = cons_GAME_STATE_MODES.PLAYING;

    // Reset telemetry
    this.trainTelemetry = {
      speedKmh: 0,
      speedMps: 0,
      targetSpeedKmh: 0,
      distanceMeters: 0,
      elevationMeters: 0,
      trackGradePercent: 0,
      throttleNotch: 0,
      reverser: cons_REVERSER_MODES.FORWARD,
      trainBrakePressureBar: 5.0,
      brakeAppliedRatio: 0,
      engineRpm: 320,
      engineTempC: 82,
      fuelRemainingLitres: 12000,
      isWheelSlipping: false,
      isSanderActive: false,
      isHeadlightOn: true,
      isHornActive: false,
      isCoolantActive: false,
    };

    // Reset environmental weather to mission preset
    this.environment = {
      weather: obj_mission.defaultWeather || 'CLEAR',
    };

    // Reset route / run metrics
    const tmp_speedLimit = obj_mission.speedLimits?.[0]?.limitKmh || obj_mission.maxSpeedLimitKmh || 60;
    const tmp_totalLength = obj_mission.trackLengthMeters || 4800;
    this.missionStatus = {
      elapsedTimeSeconds: 0,
      score: 1000,
      penalties: 0,
      speedLimitKmh: tmp_speedLimit,
      isSpeeding: false,
      totalTrackLengthMeters: tmp_totalLength,
      currentDistanceMeters: 0,
      distanceToDestinationMeters: tmp_totalLength,
      distanceFraction: 0,
      progressFraction: 0,
      statusMessage: obj_mission.startStation ? `Depart ${obj_mission.startStation}` : 'Open Line Driving',
    };

    this.notify();
  }

  /**
   * Restarts the current active mission.
   */
  restartCurrentMission() {
    if (this.currentMission) {
      this.startMission(this.currentMission);
    }
  }

  /**
   * Updates throttle notch lever position (0 through 8).
   */
  setThrottleNotch(notch) {
    const tmp_clamped = Math.max(0, Math.min(8, Math.round(notch)));
    if (this.trainTelemetry.throttleNotch !== tmp_clamped) {
      this.trainTelemetry.throttleNotch = tmp_clamped;
      this.notify();
    }
  }

  /**
   * Changes reverser direction (Forward 1, Neutral 0, Reverse -1).
   */
  setReverser(direction) {
    // Reverser can only be shifted safely when speed is low or stopped
    if (Math.abs(this.trainTelemetry.speedKmh) < 3.0) {
      this.trainTelemetry.reverser = direction;
      this.notify();
    }
  }

  /**
   * Sets train pneumatic brake application ratio from 0.0 (released) to 1.0 (emergency).
   */
  setBrakeRatio(ratio) {
    const tmp_clamped = Math.max(0, Math.min(1, ratio));
    this.trainTelemetry.brakeAppliedRatio = tmp_clamped;
    this.trainTelemetry.trainBrakePressureBar = 5.0 - tmp_clamped * 1.8;
    this.notify();
  }

  /**
   * Toggles sander activation on or off to boost wheel adhesion.
   */
  setSander(isActive) {
    if (this.trainTelemetry.isSanderActive !== isActive) {
      this.trainTelemetry.isSanderActive = isActive;
      this.notify();
    }
  }

  /**
   * Toggles locomotive main front headlights.
   */
  toggleHeadlight() {
    this.trainTelemetry.isHeadlightOn = !this.trainTelemetry.isHeadlightOn;
    this.notify();
  }

  /**
   * Sets horn active state (pull/release).
   */
  setHorn(isActive) {
    if (this.trainTelemetry.isHornActive !== isActive) {
      this.trainTelemetry.isHornActive = isActive;
      this.notify();
    }
  }

  /**
   * Toggles radiator cooling fan / coolant pump state.
   */
  toggleCoolant() {
    this.trainTelemetry.isCoolantActive = !this.trainTelemetry.isCoolantActive;
    this.notify();
  }

  /**
   * Sets radiator cooling fan state explicitly.
   */
  setCoolant(isActive) {
    if (this.trainTelemetry.isCoolantActive !== isActive) {
      this.trainTelemetry.isCoolantActive = isActive;
      this.notify();
    }
  }

  /**
   * Updates multiple train telemetry attributes from physics loop synchronously.
   */
  updateTelemetryFromPhysics(obj_data) {
    Object.assign(this.trainTelemetry, obj_data);
  }

  /**
   * Updates mission progress, distance, and speeding status.
   */
  updateMissionProgress(obj_data) {
    Object.assign(this.missionStatus, obj_data);
  }

  /**
   * Updates signal aspect and cab signaling status telemetry.
   */
  updateSignalTelemetry(obj_signalInfo) {
    if (!obj_signalInfo) return;
    Object.assign(this.signalStatus, obj_signalInfo);
  }

  /**
   * Updates user settings configuration.
   */
  updateSettings(obj_newSettings) {
    Object.assign(this.settings, obj_newSettings);
    this.notify();
  }

  /**
   * Sets master audio volume (0.0 to 1.0).
   */
  setMasterVolume(vol) {
    this.settings.masterVolume = Math.max(0, Math.min(1, vol));
    this.notify();
  }

  /**
   * Sets locomotive engine audio volume (0.0 to 1.0).
   */
  setEngineVolume(vol) {
    this.settings.engineVolume = Math.max(0, Math.min(1, vol));
    this.notify();
  }

  /**
   * Sets environment ambience audio volume (0.0 to 1.0).
   */
  setEnvironmentVolume(vol) {
    this.settings.environmentVolume = Math.max(0, Math.min(1, vol));
    this.notify();
  }

  /**
   * Sets weather phenomenon audio volume (0.0 to 1.0).
   */
  setWeatherVolume(vol) {
    this.settings.weatherVolume = Math.max(0, Math.min(1, vol));
    this.notify();
  }

  /**
   * Sets UI sound effects audio volume (0.0 to 1.0).
   */
  setSfxVolume(vol) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, vol));
    this.notify();
  }

  /**
   * Updates current environmental weather type.
   */
  setWeather(weatherType) {
    if (this.environment.weather !== weatherType) {
      this.environment.weather = weatherType;
      this.notify();
    }
  }

  /**
   * Updates current environmental day/night time phase.
   */
  setTimePhase(timePhase) {
    if (this.environment.timePhase !== timePhase) {
      this.environment.timePhase = timePhase;
      this.notify();
    }
  }

  /**
   * Updates continuous time hours, phase, formatted time string, and dashboard backlight level.
   */
  setTimeTelemetry(hours, phase, timeString, dashboardBacklight = 0.0) {
    this.environment.timeHours = hours;
    if (phase) this.environment.timePhase = phase;
    if (timeString) this.environment.timeString = timeString;
    this.environment.dashboardBacklight = dashboardBacklight;
    this.notify();
  }
}

// Global singleton centralized game state instance
export const obj_CENTRAL_GAME_STATE = new CentralGameState();
