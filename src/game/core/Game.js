/**
 * Game.js
 * Master game engine orchestrating game loop, physics integration, audio synchronization,
 * camera tracking, particle simulation, and multi-layer parallax rendering.
 */

import { Camera } from './Camera.js';
import { TrackSystem } from '../systems/TrackSystem.js';
import { EnvironmentSystem } from '../systems/EnvironmentSystem.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { Train } from '../entities/train/Train.js';
import { TrainPhysics } from '../physics/TrainPhysics.js';
import { CanvasRenderer } from '../rendering/CanvasRenderer.js';
import { ChunkManager } from '../environment/ChunkManager.js';
import { CameraSystem } from '../camera/CameraSystem.js';
import { SignalSystem } from '../signals/SignalSystem.js';
import { WeatherSystem, cons_WEATHER_TYPES } from '../environment/weather/index.js';
import { DayNightSystem, cons_TIME_PHASES } from '../environment/time/index.js';
import { obj_CENTRAL_GAME_STATE } from './GameState.js';
import { obj_AUDIO_MANAGER, obj_SOUND_MANAGER } from '../audio/index.js';
import { cons_GAME_CONFIG, cons_GAME_STATE_MODES } from '../../constants/GameConstants.js';

export class Game {
  /**
   * Initializes game systems, camera system, physics, particle pools, and loop handles.
   */
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');

    this.renderer = new CanvasRenderer();
    this.cameraSystem = new CameraSystem();
    this.camera = this.cameraSystem; // Backward compatibility alias
    this.particleSystem = new ParticleSystem();
    this.signalSystem = new SignalSystem();
    this.weatherSystem = new WeatherSystem(cons_WEATHER_TYPES.CLEAR);
    this.dayNightSystem = new DayNightSystem(cons_TIME_PHASES.NOON);

    this.trackSystem = null;
    this.environmentSystem = null;
    this.chunkManager = null;
    this.consist = null;
    this.physics = null;

    this.animationFrameId = null;
    this.lastTimestamp = 0;
    this.isRunning = false;

    // Rail joint click-clack tracking
    this.lastJointMeters = 0;
    this.smokeEmitTimer = 0;
    this.dustEmitTimer = 0;
    this.catenarySparkTimer = 0;

    this.fn_gameLoop = this.loop.bind(this);
  }

  /**
   * Loads a mission scenario, initializes track geometry, scenery chunks, consist, and resets physics.
   */
  loadMission(obj_mission) {
    this.trackSystem = new TrackSystem(obj_mission);
    this.environmentSystem = new EnvironmentSystem(obj_mission);
    this.chunkManager = new ChunkManager(obj_mission, 42);
    this.signalSystem.loadSignals(obj_mission, this.trackSystem);

    this.consist = new Train(obj_mission.locomotiveId, obj_mission.wagonIds);
    this.physics = new TrainPhysics(this.consist.locomotive.model);

    this.particleSystem.clear();
    this.lastJointMeters = 0;
    this.smokeEmitTimer = 0;

    // Position locomotive at start line
    this.physics.distanceMeters = 20;
    this.consist.update(this.physics.distanceMeters, 0, 0.016, this.trackSystem, 0);

    // Center camera on locomotive
    this.camera.resetTo(this.consist.locomotive.worldX, this.consist.locomotive.worldY);

    // Initial streaming update for chunks
    this.chunkManager.update(this.camera.x, this.canvas.width || 1920, this.trackSystem);

    // Initialize environmental weather preset for mission
    const tmp_initialWeather = obj_mission.defaultWeather || cons_WEATHER_TYPES.CLEAR;
    this.weatherSystem.setWeather(tmp_initialWeather, 0.1);
    obj_CENTRAL_GAME_STATE.setWeather(tmp_initialWeather);

    // Initialize environmental time of day preset for mission (default NOON)
    const tmp_initialTimePhase = obj_mission.defaultTimePhase || cons_TIME_PHASES.NOON;
    this.dayNightSystem.setTimePhase(tmp_initialTimePhase, 0.1);
    obj_CENTRAL_GAME_STATE.setTimeTelemetry(
      this.dayNightSystem.currentHour,
      this.dayNightSystem.getTimePhase(),
      this.dayNightSystem.getTimeString(),
      this.dayNightSystem.getLightingState().dashboardBacklight
    );
  }

  /**
   * Starts or resumes the requestAnimationFrame loop.
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame(this.fn_gameLoop);
  }

  /**
   * Stops the requestAnimationFrame loop.
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Core requestAnimationFrame callback executing delta-time updates and render passes.
   */
  loop(timestamp) {
    if (!this.isRunning) return;

    // Calculate delta time in seconds, clamped to avoid tunneling during lag spikes
    let tmp_delta = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    if (Number.isNaN(tmp_delta) || tmp_delta <= 0) {
      tmp_delta = 1 / cons_GAME_CONFIG.TARGET_FPS;
    }
    tmp_delta = Math.min(tmp_delta, cons_GAME_CONFIG.MAX_DELTA_TIME);

    // Update and render if game is active
    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();
    if (obj_state.currentMode === cons_GAME_STATE_MODES.PLAYING) {
      this.update(tmp_delta);
    }

    this.render();

    this.animationFrameId = requestAnimationFrame(this.fn_gameLoop);
  }

  /**
   * Updates physics, particles, missions, audio, chunks, and camera for one simulation step.
   */
  update(deltaTime) {
    if (!this.physics || !this.trackSystem || !this.consist || !this.chunkManager) return;

    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();
    const tmp_throttleNotch = obj_state.telemetry.throttleNotch;
    const tmp_reverser = obj_state.telemetry.reverser;
    const tmp_brakeRatio = obj_state.telemetry.brakeAppliedRatio;
    const tmp_isSanderActive = obj_state.telemetry.isSanderActive;
    const tmp_isCoolantActive = obj_state.telemetry.isCoolantActive;

    // 1. Get track slope angle at locomotive position
    const tmp_locoDist = this.physics.distanceMeters;
    const tmp_trackSlopeRad = this.trackSystem.getTangentAngleAt(tmp_locoDist);
    const tmp_trackGradePercent = this.trackSystem.getGradePercentAt(tmp_locoDist);
    const tmp_consistMassKg = this.consist.totalMassKg;

    // Environmental track conditions (rain/heavy rain reduces wheel adhesion)
    const obj_trackSettings = this.weatherSystem.getTrackSettings();
    const tmp_isWetTrack = obj_trackSettings.isWet;

    // 2. Advance train physics (with wet rail adhesion limits)
    const obj_telemetry = this.physics.update(
      deltaTime,
      tmp_throttleNotch,
      tmp_reverser,
      tmp_brakeRatio,
      tmp_isSanderActive,
      tmp_trackSlopeRad,
      tmp_consistMassKg,
      this.trackSystem,
      tmp_isWetTrack,
      tmp_isCoolantActive
    );

    // 3. Update consist bogies and wagon positions
    this.consist.update(this.physics.distanceMeters, this.physics.speedMps, deltaTime, this.trackSystem, tmp_throttleNotch);

    // 4. Update camera system with dead zone, lookahead, shake, and framing
    this.cameraSystem.update(deltaTime, {
      consist: this.consist,
      physics: this.physics,
      trackSystem: this.trackSystem,
      chunkManager: this.chunkManager,
      missionSystem: null,
      telemetry: obj_telemetry,
      settings: obj_state.settings,
    });

    // 5. Update active streaming window of chunks
    this.chunkManager.update(this.camera.x, this.canvas.width || 1920, this.trackSystem);

    // 6. Trigger particle emissions
    this.handleParticles(deltaTime, tmp_throttleNotch, obj_telemetry.isWheelSlipping, tmp_isSanderActive);

    // 7. Synchronize audio sound effects
    this.handleAudio(deltaTime, obj_telemetry, tmp_throttleNotch, tmp_brakeRatio);

    // 8. Update railway signals and evaluate cab detector
    this.signalSystem.update(
      deltaTime,
      this.physics.distanceMeters,
      obj_telemetry.speedKmh,
      this.physics
    );

    // 9. Update Day/Night system progression and lighting state
    this.dayNightSystem.update(deltaTime);
    const obj_dnLighting = this.dayNightSystem.getLightingState();
    const tmp_stationLightsFactor = obj_dnLighting.stationLightsFactor;

    // Push Day/Night telemetry to CentralGameState
    obj_CENTRAL_GAME_STATE.setTimeTelemetry(
      this.dayNightSystem.currentHour,
      this.dayNightSystem.getTimePhase(),
      this.dayNightSystem.getTimeString(),
      obj_dnLighting.dashboardBacklight
    );

    // 10. Update station environment animations, crowd boarding, arrival/departure audio, and platform lighting
    this.chunkManager.updateStations(
      deltaTime,
      this.physics.distanceMeters,
      obj_telemetry.speedKmh,
      0.0,
      obj_SOUND_MANAGER,
      tmp_stationLightsFactor
    );

    // 12. Update lightweight weather system (particles, drifting fog ribbons, lightning timers)
    this.weatherSystem.update(
      deltaTime,
      this.physics.speedMps,
      this.renderer.logicalWidth || this.canvas.width || 1920,
      this.renderer.logicalHeight || this.canvas.height || 1080
    );
    if (obj_CENTRAL_GAME_STATE.environment.weather !== this.weatherSystem.getWeather()) {
      obj_CENTRAL_GAME_STATE.setWeather(this.weatherSystem.getWeather());
    }

    // 12. Push telemetry to centralized state
    obj_CENTRAL_GAME_STATE.updateTelemetryFromPhysics({
      speedKmh: obj_telemetry.speedKmh,
      speedMps: obj_telemetry.speedMps,
      distanceMeters: this.physics.distanceMeters,
      elevationMeters: -this.trackSystem.getElevationAt(this.physics.distanceMeters) / cons_GAME_CONFIG.PIXELS_PER_METER,
      trackGradePercent: tmp_trackGradePercent,
      engineRpm: obj_telemetry.engineRpm,
      engineTempC: obj_telemetry.engineTempC,
      brakePipePressureBar: obj_telemetry.brakePipePressureBar,
      isWheelSlipping: obj_telemetry.isWheelSlipping,
    });
  }

  /**
   * Spawns exhaust smoke, wheel sparks, brake sparks, dust, and sand spray based on train dynamic state.
   */
  handleParticles(deltaTime, throttleNotch, isWheelSlipping, isSanderActive) {
    const obj_loco = this.consist.locomotive;
    const tmp_speedMps = this.physics.speedMps;
    const tmp_absSpeed = Math.abs(tmp_speedMps);
    const tmp_speedKmh = tmp_absSpeed * 3.6;

    // Electric locomotive: periodic catenary wire contact spark
    if (obj_loco.definition?.hasPantograph) {
      this.catenarySparkTimer += deltaTime;
      if (tmp_absSpeed > 5 && this.catenarySparkTimer >= 2.5) {
        this.catenarySparkTimer = 0;
        const obj_pantoPos = { x: obj_loco.position.x, y: obj_loco.position.y - 74 };
        this.particleSystem.emitCatenarySpark(obj_pantoPos.x, obj_pantoPos.y, tmp_speedMps);
      }
    }

    // Wheel sparks on wheel slip
    if (isWheelSlipping) {
      this.particleSystem.emitSparks(obj_loco.frontBogie.x, obj_loco.frontBogie.y, tmp_speedMps, 3);
      this.particleSystem.emitSparks(obj_loco.rearBogie.x, obj_loco.rearBogie.y, tmp_speedMps, 3);
      this.camera.addShake(1.2);
    }

    // Brake sparks during heavy brake application at speed
    const tmp_brakingForceN = this.physics.obj_telemetry.brakingForceN || 0;
    if (tmp_brakingForceN > 40000 && tmp_absSpeed > 3) {
      this.particleSystem.emitBrakeSparks(obj_loco.frontBogie.x, obj_loco.frontBogie.y + 10, tmp_speedMps, 2);
      this.particleSystem.emitBrakeSparks(obj_loco.rearBogie.x, obj_loco.rearBogie.y + 10, tmp_speedMps, 2);
      if (tmp_brakingForceN > 120000) {
        this.camera.addShake(0.8);
      }
    }

    // Ballast dust plumes behind bogies at speeds > 20 km/h (~5.5 m/s)
    if (tmp_speedKmh > 20) {
      this.dustEmitTimer += deltaTime;
      const tmp_dustInterval = Math.max(0.06, 0.25 - (tmp_speedKmh / 140) * 0.18);
      if (this.dustEmitTimer >= tmp_dustInterval) {
        this.dustEmitTimer = 0;
        // Dust from locomotive rear bogie
        this.particleSystem.emitDust(obj_loco.rearBogie.x, obj_loco.rearBogie.y + 14, tmp_speedMps, 2);
        // Dust from the trailing wagon if consist has wagons
        if (this.consist.wagons && this.consist.wagons.length > 0) {
          const obj_lastWagon = this.consist.wagons[this.consist.wagons.length - 1];
          this.particleSystem.emitDust(obj_lastWagon.rearBogie.x, obj_lastWagon.rearBogie.y + 14, tmp_speedMps, 2);
        }
      }
    }

    // Sand spray when sander is active
    if (isSanderActive) {
      this.particleSystem.emitSand(obj_loco.frontBogie.x + 18, obj_loco.frontBogie.y - 4, 2);
    }

    // Advance all particles
    this.particleSystem.update(deltaTime);
  }

  /**
   * Synchronizes Web Audio procedural synth with train dynamics, weather, and stations.
   */
  handleAudio(deltaTime, telemetry, throttleNotch, brakeRatio) {
    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();

    // Update modular audio manager with train telemetry, environment, and station context
    obj_AUDIO_MANAGER.update(
      deltaTime,
      {
        speedKmh: telemetry.speedKmh,
        speedMps: telemetry.speedMps,
        engineRpm: telemetry.engineRpm,
        throttleNotch: throttleNotch,
        brakeAppliedRatio: brakeRatio,
        isWheelSlipping: telemetry.isWheelSlipping,
      },
      obj_state.environment,
      false
    );

    // Sync volume levels from settings
    if (obj_state.settings) {
      obj_AUDIO_MANAGER.setMasterVolume(obj_state.settings.masterVolume ?? 0.8);
      obj_AUDIO_MANAGER.setTrainVolume(obj_state.settings.engineVolume ?? 0.75);
      obj_AUDIO_MANAGER.setEnvironmentVolume(obj_state.settings.environmentVolume ?? 0.7);
      obj_AUDIO_MANAGER.setWeatherVolume(obj_state.settings.weatherVolume ?? 0.7);
      obj_AUDIO_MANAGER.setUIVolume(obj_state.settings.sfxVolume ?? 0.85);
    }

    // Rail expansion joints click-clack every 25 meters
    const tmp_curDist = this.physics.distanceMeters;
    if (Math.abs(tmp_curDist - this.lastJointMeters) >= 25.0) {
      this.lastJointMeters = tmp_curDist;
      obj_AUDIO_MANAGER.playRailClickClack(Math.abs(telemetry.speedKmh));
      // Trigger dynamic suspension deflection bump across the consist
      const tmp_bumpIntensity = Math.min(2.5, Math.abs(telemetry.speedKmh) / 28);
      if (this.consist && this.consist.triggerSuspensionBump) {
        this.consist.triggerSuspensionBump(tmp_bumpIntensity);
      }
    }
  }

  /**
   * Renders the current frame via 6-layer parallax CanvasRenderer.
   */
  render() {
    if (!this.trackSystem || !this.chunkManager || !this.consist) return;

    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();
    const tmp_isHeadlightOn = obj_state.telemetry.isHeadlightOn;
    const tmp_biome = this.trackSystem.mission.biome || 'forest';

    this.renderer.render(
      this.ctx,
      this.cameraSystem,
      tmp_biome,
      this.chunkManager,
      this.trackSystem,
      this.consist,
      this.particleSystem,
      tmp_isHeadlightOn,
      this.signalSystem,
      this.weatherSystem,
      this.dayNightSystem
    );

    // Render atmospheric camera post-effects (tunnel cavern darkness, vignette, cinematic bars)
    this.cameraSystem.renderPostEffects(this.ctx, this.renderer.logicalWidth, this.renderer.logicalHeight);
  }

  /**
   * Cycles to next weather condition in the simulation.
   */
  cycleWeather() {
    if (this.weatherSystem) {
      const tmp_next = this.weatherSystem.cycleWeather();
      obj_CENTRAL_GAME_STATE.setWeather(tmp_next);
      return tmp_next;
    }
    return null;
  }

  /**
   * Sets specific weather condition with optional transition duration.
   */
  setWeather(weatherType, duration = 1.2) {
    if (this.weatherSystem) {
      this.weatherSystem.setWeather(weatherType, duration);
      obj_CENTRAL_GAME_STATE.setWeather(weatherType);
    }
  }

  /**
   * Cycles to next time phase (DAWN -> MORNING -> NOON -> AFTERNOON -> SUNSET -> EVENING -> NIGHT).
   */
  cycleTimePhase() {
    if (this.dayNightSystem) {
      const tmp_next = this.dayNightSystem.cycleTimePhase();
      obj_CENTRAL_GAME_STATE.setTimeTelemetry(
        this.dayNightSystem.currentHour,
        this.dayNightSystem.getTimePhase(),
        this.dayNightSystem.getTimeString(),
        this.dayNightSystem.getLightingState().dashboardBacklight
      );
      return tmp_next;
    }
    return null;
  }

  /**
   * Sets specific time phase with optional transition duration.
   */
  setTimePhase(phase, duration = 1.2) {
    if (this.dayNightSystem) {
      this.dayNightSystem.setTimePhase(phase, duration);
      obj_CENTRAL_GAME_STATE.setTimeTelemetry(
        this.dayNightSystem.currentHour,
        this.dayNightSystem.getTimePhase(),
        this.dayNightSystem.getTimeString(),
        this.dayNightSystem.getLightingState().dashboardBacklight
      );
    }
  }

  /**
   * Resizes canvas and camera system to match container dimensions.
   */
  resize(width, height) {
    this.renderer.resize(this.canvas, width, height);
    this.cameraSystem.resize(width, height);
  }

  /**
   * Cleans up animation loop and resources when component unmounts.
   */
  destroy() {
    this.stop();
    this.particleSystem.clear();
  }
}
