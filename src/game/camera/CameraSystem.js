/**
 * CameraSystem.js
 * Master camera coordinator managing WorldCamera, ParallaxCamera, zoom presets,
 * subtle multi-trigger camera shake, tunnel transitions, station arrival framing,
 * and optional cinematic camera.
 */

import { WorldCamera } from './WorldCamera.js';
import { ParallaxCamera } from './ParallaxCamera.js';
import { lerp, clamp } from '../../utils/MathUtils.js';

// Camera operational modes
export const cons_CAMERA_MODES = Object.freeze({
  GAMEPLAY: 'gameplay',
  CINEMATIC: 'cinematic',
  OVERVIEW: 'overview',
  STATION_FRAMING: 'station_framing',
});

// Tuned zoom presets per specification
export const cons_ZOOM_PRESETS = Object.freeze({
  [cons_CAMERA_MODES.GAMEPLAY]: 1.0,
  [cons_CAMERA_MODES.CINEMATIC]: 1.15,
  [cons_CAMERA_MODES.OVERVIEW]: 0.85,
});

export class CameraSystem {
  /**
   * Initializes cameras, zoom presets, shake channels, and transition states.
   */
  constructor() {
    this.worldCamera = new WorldCamera();
    this.parallaxCamera = new ParallaxCamera();

    // Active mode and zoom preset
    this.currentMode = cons_CAMERA_MODES.GAMEPLAY;
    this.targetPresetZoom = cons_ZOOM_PRESETS[cons_CAMERA_MODES.GAMEPLAY];

    // Subtle camera shake parameters
    this.shakeIntensity = 0;
    this.shakeDecay = 6.5; // Smooth exponential decay rate
    this.shakeTime = 0;
    this.maxShakePixels = 3.5; // Strictly capped to prevent motion sickness

    // Tunnel transition state (0.0 = outdoor daylight, 1.0 = deep tunnel cavern)
    this.tunnelProgress = 0;
    this.targetTunnelProgress = 0;

    // Station arrival framing state (0.0 = open track, 1.0 = depot platform framing)
    this.stationFramingFactor = 0;

    // Cinematic camera motion timers
    this.cinematicTime = 0;

    // State tracking for dynamic triggers
    this.lastSpeedMps = 0;
    this.wasEmergencyBraking = false;
    this.roughTrackTimer = 0;
  }

  /**
   * Gets world camera X position for rendering layers.
   */
  get x() {
    return this.worldCamera.x;
  }

  /**
   * Gets world camera Y position for rendering layers.
   */
  get y() {
    return this.worldCamera.y;
  }

  /**
   * Gets active world camera zoom.
   */
  get zoom() {
    return this.worldCamera.zoom;
  }

  /**
   * Forwards targetZoom setter to world camera.
   */
  set targetZoom(val) {
    this.worldCamera.setTargetZoom(val);
  }

  /**
   * Resizes viewport dimensions across sub-cameras.
   */
  resize(width, height) {
    this.worldCamera.resize(width, height);
  }

  /**
   * Resets camera coordinates immediately to a specific world position.
   */
  resetTo(x, y) {
    this.worldCamera.resetTo(x, y);
    this.shakeIntensity = 0;
    this.tunnelProgress = 0;
    this.targetTunnelProgress = 0;
    this.stationFramingFactor = 0;
  }

  /**
   * Changes camera mode and applies corresponding zoom preset.
   * 
   * @param {string} mode - Mode key from cons_CAMERA_MODES
   */
  setMode(mode) {
    if (!cons_ZOOM_PRESETS[mode]) return;
    this.currentMode = mode;
    this.targetPresetZoom = cons_ZOOM_PRESETS[mode];
    this.worldCamera.setTargetZoom(this.targetPresetZoom);
  }

  /**
   * Cycles through the three primary zoom modes: Gameplay (1.0x) -> Cinematic (1.15x) -> Overview (0.85x).
   */
  cyclePreset() {
    if (this.currentMode === cons_CAMERA_MODES.GAMEPLAY) {
      this.setMode(cons_CAMERA_MODES.CINEMATIC);
    } else if (this.currentMode === cons_CAMERA_MODES.CINEMATIC) {
      this.setMode(cons_CAMERA_MODES.OVERVIEW);
    } else {
      this.setMode(cons_CAMERA_MODES.GAMEPLAY);
    }
  }

  /**
   * Toggles the optional Cinematic camera view.
   */
  toggleCinematic() {
    if (this.currentMode === cons_CAMERA_MODES.CINEMATIC) {
      this.setMode(cons_CAMERA_MODES.GAMEPLAY);
    } else {
      this.setMode(cons_CAMERA_MODES.CINEMATIC);
    }
  }

  /**
   * Adds an impulse to camera shake with strictly clamped magnitude.
   * 
   * @param {number} intensity - Shake magnitude in pixels (max 3.5px)
   */
  addShake(intensity) {
    this.shakeIntensity = clamp(this.shakeIntensity + intensity, 0, this.maxShakePixels);
  }

  /**
   * Trigger: Heavy service braking rhythmic shudder.
   */
  triggerHeavyBrakingShake(intensity = 1.1) {
    this.addShake(intensity);
  }

  /**
   * Trigger: High-frequency Nathan air horn acoustic resonance.
   */
  triggerHornShake(intensity = 0.75) {
    this.addShake(intensity);
  }

  /**
   * Trigger: Sharp mechanical coupling impact / slack run-in.
   */
  triggerCouplingShake(intensity = 2.0) {
    this.addShake(intensity);
  }

  /**
   * Trigger: Rough track, frogs, rail joints, and grade transitions.
   */
  triggerRoughTrackShake(intensity = 1.3) {
    this.addShake(intensity);
  }

  /**
   * Trigger: Emergency brake maximum stopping force shudder.
   */
  triggerEmergencyShake(intensity = 3.2) {
    this.addShake(intensity);
  }

  /**
   * Computes subtle multi-octave harmonic shake offsets to prevent motion sickness.
   */
  fn_computeSubtleShake(deltaTime) {
    if (this.shakeIntensity <= 0.01) {
      this.shakeIntensity = 0;
      this.worldCamera.setShakeOffset(0, 0);
      return;
    }

    this.shakeTime += deltaTime;

    // Harmonic superposition creates organic rumbling without random jagged spikes
    const tmp_t = this.shakeTime * 28.0;
    const tmp_harmonicX = Math.sin(tmp_t) * 0.7 + Math.sin(tmp_t * 2.3) * 0.3;
    const tmp_harmonicY = Math.cos(tmp_t * 1.4) * 0.6 + Math.sin(tmp_t * 3.1) * 0.4;

    const tmp_offsetX = tmp_harmonicX * this.shakeIntensity;
    const tmp_offsetY = tmp_harmonicY * (this.shakeIntensity * 0.7);

    this.worldCamera.setShakeOffset(tmp_offsetX, tmp_offsetY);

    // Smooth exponential decay
    this.shakeIntensity = Math.max(0, this.shakeIntensity - deltaTime * this.shakeDecay);
  }

  /**
   * Evaluates dynamic simulation triggers: heavy braking, horn, emergency stop, rough track.
   */
  fn_evaluateShakeTriggers(deltaTime, telemetry, physics) {
    if (!telemetry) return;

    const tmp_brakeRatio = telemetry.brakeAppliedRatio || 0;
    const tmp_speedKmh = Math.abs(telemetry.speedKmh || 0);
    const tmp_isHornActive = telemetry.isHornActive || false;
    const tmp_isWheelSlipping = telemetry.isWheelSlipping || false;

    // 1. Horn trigger (acoustic vibration during blast)
    if (tmp_isHornActive) {
      this.triggerHornShake(deltaTime * 1.5);
    }

    // 2. Heavy service braking (brake shoe chatter at speed)
    if (tmp_brakeRatio > 0.65 && tmp_speedKmh > 8.0) {
      this.triggerHeavyBrakingShake(deltaTime * 1.8);
    }

    // 3. Emergency brake engagement trigger
    const tmp_isEmergency = tmp_brakeRatio >= 0.98;
    if (tmp_isEmergency && !this.wasEmergencyBraking) {
      this.triggerEmergencyShake();
    }
    this.wasEmergencyBraking = tmp_isEmergency;

    // 4. Rough track / rail joint click (periodic subtle rumble based on train speed)
    if (tmp_speedKmh > 20.0) {
      this.roughTrackTimer += deltaTime * (tmp_speedKmh / 50.0);
      if (this.roughTrackTimer >= 2.2) {
        this.roughTrackTimer = 0;
        this.triggerRoughTrackShake(0.6);
      }
    }

    // 5. Wheel slip shudder
    if (tmp_isWheelSlipping) {
      this.addShake(deltaTime * 2.0);
    }
  }

  /**
   * Updates tunnel entry/exit progression and transitions darkness factors.
   */
  fn_updateTunnelTransition(deltaTime, locomotiveDistMeters, chunkManager) {
    if (!chunkManager) return;

    const tmp_isInside = chunkManager.isInsideTunnel(locomotiveDistMeters);
    this.targetTunnelProgress = tmp_isInside ? 1.0 : 0.0;

    // Smooth cosine blending over ~1.2 seconds
    const cons_TUNNEL_SPEED = 1.4;
    this.tunnelProgress = lerp(
      this.tunnelProgress,
      this.targetTunnelProgress,
      clamp(deltaTime * cons_TUNNEL_SPEED, 0, 1)
    );
  }

  /**
   * Detects station approach and applies cinematic station arrival framing.
   */
  fn_updateStationFraming(deltaTime, missionSystem, speedMps) {
    if (!missionSystem || !missionSystem.mission) {
      this.stationFramingFactor = 0;
      return;
    }

    const tmp_distToDest = missionSystem.distanceRemainingMeters || 1500;
    const tmp_isApproaching = tmp_distToDest <= 320 && Math.abs(speedMps) < 18.0;

    const tmp_targetFactor = tmp_isApproaching ? 1.0 : 0.0;
    this.stationFramingFactor = lerp(
      this.stationFramingFactor,
      tmp_targetFactor,
      clamp(deltaTime * 1.5, 0, 1)
    );
  }

  /**
   * Computes dynamic framing offsets based on active mode, station arrival, or cinematic camera.
   */
  fn_computeFramingOffsets(deltaTime) {
    let tmp_offsetX = 0;
    let tmp_offsetY = 0;

    // 1. Station arrival framing: gently shifts framing forward to show platform and depot
    if (this.stationFramingFactor > 0.02) {
      tmp_offsetX += this.stationFramingFactor * 85.0; // Show depot ahead of locomotive
      tmp_offsetY -= this.stationFramingFactor * 15.0; // Slightly higher perspective
    }

    // 2. Cinematic mode: subtle floating camera sway
    if (this.currentMode === cons_CAMERA_MODES.CINEMATIC) {
      this.cinematicTime += deltaTime;
      const tmp_swayX = Math.sin(this.cinematicTime * 0.45) * 14.0;
      const tmp_swayY = Math.cos(this.cinematicTime * 0.3) * 6.0;
      tmp_offsetX += tmp_swayX;
      tmp_offsetY += tmp_swayY - 12.0; // Lower heroic angle
    }

    this.worldCamera.setFramingOffset(tmp_offsetX, tmp_offsetY);
  }

  /**
   * Advances the camera system for one simulation frame.
   * 
   * @param {number} deltaTime - Frame delta time in seconds
   * @param {Object} context - Game state contextual references
   */
  update(deltaTime, { consist, physics, trackSystem, chunkManager, missionSystem, telemetry, settings }) {
    if (!consist || !consist.locomotive) return;

    const obj_loco = consist.locomotive;
    const tmp_speedMps = physics ? physics.speedMps : 0;
    const tmp_locoDist = physics ? physics.distanceMeters : 0;

    // 1. Update user zoom modifier if configured
    if (settings && typeof settings.cameraZoom === 'number') {
      // If user altered camera zoom directly via keys, sync target
      this.worldCamera.setUserZoom(settings.cameraZoom);
    }

    // 2. Overview mode: center on midpoint between locomotive and rearmost wagon
    let tmp_targetWorldX = obj_loco.worldX;
    let tmp_targetWorldY = obj_loco.worldY;

    if (this.currentMode === cons_CAMERA_MODES.OVERVIEW && consist.arr_wagons.length > 0) {
      const obj_rearWagon = consist.arr_wagons[consist.arr_wagons.length - 1];
      tmp_targetWorldX = (obj_loco.worldX + obj_rearWagon.worldX) * 0.5;
      tmp_targetWorldY = (obj_loco.worldY + obj_rearWagon.worldY) * 0.5;
    }

    // 3. Station arrival framing detection
    this.fn_updateStationFraming(deltaTime, missionSystem, tmp_speedMps);

    // 4. Dynamic framing offsets
    this.fn_computeFramingOffsets(deltaTime);

    // 5. Evaluate dynamic shake triggers
    this.fn_evaluateShakeTriggers(deltaTime, telemetry, physics);
    this.fn_computeSubtleShake(deltaTime);

    // 6. Tunnel entry/exit transition
    this.fn_updateTunnelTransition(deltaTime, tmp_locoDist, chunkManager);

    // 7. Advance primary world camera
    this.worldCamera.update(deltaTime, tmp_targetWorldX, tmp_targetWorldY, tmp_speedMps);
  }

  /**
   * Applies the world camera 2D matrix transformation to canvas context.
   */
  applyTransform(ctx, viewportWidth, viewportHeight) {
    this.worldCamera.applyTransform(ctx, viewportWidth, viewportHeight);
  }

  /**
   * Restores canvas transformation context.
   */
  restoreTransform(ctx) {
    this.worldCamera.restoreTransform(ctx);
  }

  /**
   * Renders atmospheric post-effects: tunnel cavern darkness, vignette, and cinematic letterbox.
   */
  renderPostEffects(ctx, viewportWidth, viewportHeight) {
    const tmp_w = viewportWidth || this.worldCamera.viewportWidth;
    const tmp_h = viewportHeight || this.worldCamera.viewportHeight;

    // 1. Tunnel Transition Cavern Darkness and Atmospheric Vignette
    if (this.tunnelProgress > 0.01) {
      ctx.save();
      ctx.globalAlpha = this.tunnelProgress * 0.82;

      // Radial vignette: darker towards the perimeter, soft illuminated center for headlights
      const tmp_centerX = tmp_w * 0.45;
      const tmp_centerY = tmp_h * 0.52;
      const tmp_radius = Math.max(tmp_w, tmp_h) * 0.75;

      const obj_vignette = ctx.createRadialGradient(
        tmp_centerX,
        tmp_centerY,
        tmp_radius * 0.15,
        tmp_centerX,
        tmp_centerY,
        tmp_radius
      );
      obj_vignette.addColorStop(0, 'rgba(12, 16, 22, 0.25)');
      obj_vignette.addColorStop(0.5, 'rgba(10, 13, 18, 0.75)');
      obj_vignette.addColorStop(1, 'rgba(4, 6, 9, 0.96)');

      ctx.fillStyle = obj_vignette;
      ctx.fillRect(0, 0, tmp_w, tmp_h);

      ctx.restore();
    }

    // 2. Cinematic Mode: Sleek widescreen letterboxing bars
    if (this.currentMode === cons_CAMERA_MODES.CINEMATIC) {
      ctx.save();
      const tmp_barH = Math.round(tmp_h * 0.05);
      ctx.fillStyle = '#0a0d12';
      ctx.fillRect(0, 0, tmp_w, tmp_barH);
      ctx.fillRect(0, tmp_h - tmp_barH, tmp_w, tmp_barH);
      ctx.restore();
    }
  }
}

export default CameraSystem;
