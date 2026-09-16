/**
 * DayNightSystem.js
 * Master coordinator for the dynamic 2D day/night system.
 * Manages continuous 24-hour clock progression, smooth phase interpolation across the 7 time phases
 * (DAWN, MORNING, NOON, AFTERNOON, SUNSET, EVENING, NIGHT), solar and lunar celestial paths,
 * atmospheric ambient darkness wash, station lighting triggers, building window illumination,
 * signal Fresnel glow multipliers, train headlight importance, and dashboard backlighting.
 */

import {
  cons_TIME_PHASES,
  arr_TIME_PHASE_ORDER,
  obj_TIME_PHASE_PROFILES,
  fn_interpolateDayNight,
} from './DayNightConstants.js';

export class DayNightSystem {
  /**
   * Initializes day/night system with default initial phase (NOON = 12:00 PM).
   */
  constructor(initialPhase = cons_TIME_PHASES.NOON) {
    const obj_initialProfile = obj_TIME_PHASE_PROFILES[initialPhase] || obj_TIME_PHASE_PROFILES[cons_TIME_PHASES.NOON];
    this.currentHour = obj_initialProfile.hour;
    this.targetHour = this.currentHour;
    this.currentPhase = initialPhase;

    // Time progression: 1 real second = 45 game seconds (~0.0125 game hours/sec -> 32 min full 24h cycle)
    this.timeScaleHoursPerSec = 0.0125;
    this.isPaused = false;

    // Smooth transition between requested phases
    this.transitionProgress = 1.0;
    this.transitionDuration = 1.2;
    this.transitionStartHour = this.currentHour;

    // Pre-allocated twinkling star field (60 fixed coordinates for zero-GC performance)
    this.arr_stars = [];
    for (let tmp_i = 0; tmp_i < 60; tmp_i++) {
      this.arr_stars.push({
        xRatio: (tmp_i * 37.1 + 19.3) % 1.0,
        yRatio: (tmp_i * 23.7 + 11.1) % 0.42, // Upper 42% of sky
        radius: 0.8 + ((tmp_i % 3) * 0.45),
        twinkleSpeed: 2.2 + ((tmp_i % 5) * 1.1),
        phase: (tmp_i * 1.4) % (Math.PI * 2),
      });
    }

    this.animTimer = 0;
    this.cachedState = fn_interpolateDayNight(this.currentHour);
  }

  /**
   * Advances game clock, handles phase transitions, and calculates interpolated parameters.
   */
  update(deltaTime) {
    this.animTimer += deltaTime;

    // Phase transition smoothing
    if (this.transitionProgress < 1.0) {
      this.transitionProgress = Math.min(1.0, this.transitionProgress + deltaTime / this.transitionDuration);
      // Smooth sinusoidal ease-in-out interpolation
      const tmp_t = (1 - Math.cos(this.transitionProgress * Math.PI)) * 0.5;

      // Handle 24-hour wrap-around during transitions
      let tmp_diff = this.targetHour - this.transitionStartHour;
      if (tmp_diff > 12) tmp_diff -= 24;
      if (tmp_diff < -12) tmp_diff += 24;

      this.currentHour = ((this.transitionStartHour + tmp_diff * tmp_t) % 24 + 24) % 24;
    } else if (!this.isPaused) {
      // Natural continuous time progression
      this.currentHour = (this.currentHour + deltaTime * this.timeScaleHoursPerSec) % 24;
    }

    // Refresh interpolated state
    this.cachedState = fn_interpolateDayNight(this.currentHour);
    this.currentPhase = this.cachedState.phase;
  }

  /**
   * Sets game clock to specific hour (0.00 to 24.00) with optional transition smoothing.
   */
  setTime(hours, transitionDuration = 1.0) {
    const tmp_h = ((hours % 24) + 24) % 24;
    if (transitionDuration <= 0) {
      this.currentHour = tmp_h;
      this.targetHour = tmp_h;
      this.transitionProgress = 1.0;
      this.cachedState = fn_interpolateDayNight(this.currentHour);
      this.currentPhase = this.cachedState.phase;
    } else {
      this.transitionStartHour = this.currentHour;
      this.targetHour = tmp_h;
      this.transitionDuration = Math.max(0.2, transitionDuration);
      this.transitionProgress = 0.0;
    }
  }

  /**
   * Sets game clock to specific time phase (DAWN, MORNING, NOON, etc.).
   */
  setTimePhase(phase, transitionDuration = 1.2) {
    const obj_p = obj_TIME_PHASE_PROFILES[phase];
    if (!obj_p) return;
    this.setTime(obj_p.hour, transitionDuration);
  }

  /**
   * Cycles sequentially to the next time phase in order.
   * Useful for HUD buttons, keyboard hotkeys (Key T), and instant player previewing.
   */
  cycleTimePhase() {
    const tmp_curIdx = arr_TIME_PHASE_ORDER.indexOf(this.currentPhase);
    const tmp_nextIdx = (tmp_curIdx + 1) % arr_TIME_PHASE_ORDER.length;
    const tmp_nextPhase = arr_TIME_PHASE_ORDER[tmp_nextIdx];
    this.setTimePhase(tmp_nextPhase, 1.2);
    return tmp_nextPhase;
  }

  /**
   * Formats current game time as 24-hour string (e.g. "12:30", "18:45").
   */
  getTimeString() {
    const tmp_h = Math.floor(this.currentHour);
    const tmp_m = Math.floor((this.currentHour - tmp_h) * 60);
    const tmp_hh = tmp_h < 10 ? `0${tmp_h}` : `${tmp_h}`;
    const tmp_mm = tmp_m < 10 ? `0${tmp_m}` : `${tmp_m}`;
    return `${tmp_hh}:${tmp_mm}`;
  }

  /**
   * Returns current active phase identifier.
   */
  getTimePhase() {
    return this.currentPhase;
  }

  /**
   * Returns active interpolated lighting parameters.
   */
  getLightingState() {
    const l = this.cachedState.lighting;
    return {
      ...l,
      stationLightsFactor: l.stationLampIntensity,
      buildingLightsActive: l.buildingLightsActive > 0.3,
      headlightImportance: l.headlightNeed,
    };
  }

  /**
   * Returns active ambient color and mountain visibility parameters.
   */
  getAmbientState() {
    const a = this.cachedState.ambient;
    return {
      ...a,
      color: a.darknessOverlayRgba,
      alpha: Math.max(0, 1.0 - a.brightnessMultiplier),
    };
  }

  /**
   * Constructs procedural Canvas linear gradient for Layer 1 sky.
   */
  createSkyGradient(ctx, height) {
    const tmp_grad = ctx.createLinearGradient(0, 0, 0, height * 0.75);
    const arr_stops = this.cachedState.skyStops;
    for (let tmp_i = 0; tmp_i < arr_stops.length; tmp_i++) {
      tmp_grad.addColorStop(arr_stops[tmp_i].stop, arr_stops[tmp_i].color);
    }
    return tmp_grad;
  }

  /**
   * Renders celestial bodies: sun with radiant corona, moon with soft halo, and stars.
   */
  renderCelestial(ctx, viewportWidth, viewportHeight) {
    ctx.save();
    const state = this.cachedState;

    // 1. Twinkling star field when darkness / twilight allows
    if (state.starsAlpha > 0.02) {
      for (let tmp_i = 0; tmp_i < this.arr_stars.length; tmp_i++) {
        const obj_s = this.arr_stars[tmp_i];
        const tmp_x = obj_s.xRatio * viewportWidth;
        const tmp_y = obj_s.yRatio * viewportHeight;

        const tmp_twinkle = 0.45 + Math.sin(this.animTimer * obj_s.twinkleSpeed + obj_s.phase) * 0.35;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = state.starsAlpha * tmp_twinkle;
        ctx.beginPath();
        ctx.arc(tmp_x, tmp_y, obj_s.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Sun with radiant volumetric corona
    if (state.sun.visible && state.sun.alpha > 0.02) {
      const tmp_sunX = state.sun.azimuthRatio * viewportWidth;
      const tmp_sunY = state.sun.altitudeRatio * viewportHeight * 0.72;
      const tmp_sunR = state.sun.size;

      // Soft sun corona glow
      const tmp_coronaR = tmp_sunR * 2.8;
      const tmp_coronaGrad = ctx.createRadialGradient(
        tmp_sunX, tmp_sunY, tmp_sunR * 0.5,
        tmp_sunX, tmp_sunY, tmp_coronaR
      );
      tmp_coronaGrad.addColorStop(0, state.sun.color);
      tmp_coronaGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.32)');
      tmp_coronaGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

      ctx.fillStyle = tmp_coronaGrad;
      ctx.globalAlpha = state.sun.alpha * 0.75;
      ctx.beginPath();
      ctx.arc(tmp_sunX, tmp_sunY, tmp_coronaR, 0, Math.PI * 2);
      ctx.fill();

      // Sharp solar disc
      ctx.fillStyle = state.sun.color;
      ctx.globalAlpha = state.sun.alpha;
      ctx.beginPath();
      ctx.arc(tmp_sunX, tmp_sunY, tmp_sunR, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Moon with soft halo and lunar shading
    if (state.moon.visible && state.moon.alpha > 0.02) {
      const tmp_moonX = state.moon.azimuthRatio * viewportWidth;
      const tmp_moonY = state.moon.altitudeRatio * viewportHeight * 0.65;
      const tmp_moonR = state.moon.size;

      // Outer soft moonlight halo
      const tmp_haloR = tmp_moonR * 3.2;
      const tmp_moonGrad = ctx.createRadialGradient(
        tmp_moonX, tmp_moonY, tmp_moonR * 0.8,
        tmp_moonX, tmp_moonY, tmp_haloR
      );
      tmp_moonGrad.addColorStop(0, 'rgba(224, 242, 254, 0.45)');
      tmp_moonGrad.addColorStop(0.4, 'rgba(224, 242, 254, 0.14)');
      tmp_moonGrad.addColorStop(1, 'rgba(224, 242, 254, 0)');

      ctx.fillStyle = tmp_moonGrad;
      ctx.globalAlpha = state.moon.alpha * 0.8;
      ctx.beginPath();
      ctx.arc(tmp_moonX, tmp_moonY, tmp_haloR, 0, Math.PI * 2);
      ctx.fill();

      // Moon body
      ctx.fillStyle = '#f8fafc';
      ctx.globalAlpha = state.moon.alpha;
      ctx.beginPath();
      ctx.arc(tmp_moonX, tmp_moonY, tmp_moonR, 0, Math.PI * 2);
      ctx.fill();

      // Crescent shadow cutout
      ctx.fillStyle = '#090d16';
      ctx.globalAlpha = state.moon.alpha * 0.88;
      ctx.beginPath();
      ctx.arc(tmp_moonX + tmp_moonR * 0.45, tmp_moonY - tmp_moonR * 0.2, tmp_moonR * 0.85, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Renders single-pass screen-space ambient darkness / warmth overlay in Canvas 2D.
   * Modulates environmental scene brightness without expensive DOM post-processing filters.
   */
  renderAmbientDarkness(ctx, viewportWidth, viewportHeight) {
    const tmp_color = this.cachedState.ambient.darknessOverlayRgba;
    if (!tmp_color || tmp_color === 'rgba(0, 0, 0, 0)') return;

    ctx.save();
    ctx.fillStyle = tmp_color;
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);
    ctx.restore();
  }
}
