/**
 * WeatherSystem.js
 * Master coordinator for the lightweight 2D weather system.
 * Manages active weather states, smooth cross-fading transitions, zero-GC precipitation particles,
 * atmospheric fog planes, track wetness/snow styling, and train lighting.
 */

import {
  cons_WEATHER_TYPES,
  arr_WEATHER_CYCLE_ORDER,
  getWeatherProfile,
} from './WeatherConstants.js';
import { WeatherParticles } from './WeatherParticles.js';
import { WeatherAtmosphere } from './WeatherAtmosphere.js';

export class WeatherSystem {
  /**
   * Initializes weather system with initial weather preset.
   */
  constructor(initialWeather = cons_WEATHER_TYPES.CLEAR) {
    this.currentWeather = initialWeather;
    this.targetWeather = initialWeather;
    this.profile = getWeatherProfile(initialWeather);

    this.particles = new WeatherParticles();
    this.atmosphere = new WeatherAtmosphere();

    this.transitionProgress = 1.0;
    this.transitionDuration = 1.2;

    this.viewportWidth = 1920;
    this.viewportHeight = 1080;

    // Initial configuration of particle pool
    this.particles.configure(this.profile.precipitation, this.viewportWidth, this.viewportHeight);
  }

  /**
   * Smoothly transitions to a new weather state over the specified duration.
   */
  setWeather(weatherType, durationSeconds = 1.2) {
    if (!cons_WEATHER_TYPES[weatherType] && !getWeatherProfile(weatherType)) return;
    if (this.currentWeather === weatherType && this.transitionProgress >= 1.0) return;

    this.targetWeather = weatherType;
    this.transitionProgress = 0.0;
    this.transitionDuration = Math.max(0.2, durationSeconds);
    this.profile = getWeatherProfile(weatherType);

    this.particles.configure(this.profile.precipitation, this.viewportWidth, this.viewportHeight);
  }

  /**
   * Cycles to the next weather type in sequential order.
   * Useful for HUD buttons, keyboard hotkeys, and player demonstrations.
   */
  cycleWeather() {
    const tmp_currentIdx = arr_WEATHER_CYCLE_ORDER.indexOf(this.currentWeather);
    const tmp_nextIdx = (tmp_currentIdx + 1) % arr_WEATHER_CYCLE_ORDER.length;
    const tmp_nextWeather = arr_WEATHER_CYCLE_ORDER[tmp_nextIdx];
    this.setWeather(tmp_nextWeather, 1.0);
    return tmp_nextWeather;
  }

  /**
   * Retrieves active weather state string identifier.
   */
  getWeather() {
    return this.currentWeather;
  }

  /**
   * Updates weather transitions, precipitation particles, and atmospheric lighting.
   */
  update(deltaTime, trainSpeedMps, viewportWidth, viewportHeight) {
    this.viewportWidth = viewportWidth || 1920;
    this.viewportHeight = viewportHeight || 1080;

    // Advance smooth cross-fade transition
    if (this.transitionProgress < 1.0) {
      this.transitionProgress = Math.min(1.0, this.transitionProgress + deltaTime / this.transitionDuration);
      if (this.transitionProgress >= 1.0) {
        this.currentWeather = this.targetWeather;
      }
    }

    // Update precipitation particles
    this.particles.update(
      deltaTime,
      trainSpeedMps,
      this.viewportWidth,
      this.viewportHeight,
      this.profile.precipitation.hasSplashes
    );

    // Update atmospheric timers & lightning
    this.atmosphere.update(
      deltaTime,
      this.profile.atmosphere.hasLightning,
      this.profile.atmosphere.hasLayeredFog
    );
  }

  /**
   * Constructs procedural Canvas linear gradient for Layer 1 sky.
   */
  createSkyGradient(ctx, height) {
    const tmp_grad = ctx.createLinearGradient(0, 0, 0, height * 0.75);
    const arr_stops = this.profile.sky.gradientStops;
    for (let tmp_i = 0; tmp_i < arr_stops.length; tmp_i++) {
      tmp_grad.addColorStop(arr_stops[tmp_i].stop, arr_stops[tmp_i].color);
    }
    return tmp_grad;
  }

  /**
   * Returns active cloud rendering attributes.
   */
  getCloudSettings() {
    return {
      color: this.profile.sky.cloudColor,
      alpha: this.profile.sky.cloudAlpha,
      count: this.profile.sky.cloudCount,
    };
  }

  /**
   * Returns active track wetness and snow accumulation styling.
   */
  getTrackSettings() {
    return {
      isWet: this.profile.track.isWet,
      wetGloss: this.profile.track.wetGloss,
      hasSnow: this.profile.track.hasSnow,
      snowCoverage: this.profile.track.snowCoverage,
    };
  }

  /**
   * Returns active train lighting requirements.
   */
  getTrainLightingSettings() {
    return {
      headlightIntensity: this.profile.train.headlightIntensity,
      illuminateInterior: this.profile.train.illuminateInterior,
      illuminateCoaches: this.profile.train.illuminateCoaches,
    };
  }

  /**
   * Returns mountain layer visibility and tinting.
   */
  getMountainSettings() {
    return {
      alpha: this.profile.visibility.layer2Alpha,
      tint: this.profile.visibility.mountainTint,
    };
  }

  /**
   * Renders celestial bodies in Layer 1: stars/moon (Night) or golden sun (Sunset/Clear).
   */
  renderCelestial(ctx, viewportWidth, viewportHeight) {
    if (this.profile.sky.hasStars) {
      this.atmosphere.renderNightStars(ctx, viewportWidth, viewportHeight);
    } else if (this.profile.sky.hasSun && this.currentWeather === cons_WEATHER_TYPES.SUNSET) {
      this.atmosphere.renderSunsetSun(ctx, viewportWidth, viewportHeight);
    }
  }

  /**
   * Renders layered translucent fog ribbons at the specified layer depth.
   */
  renderFogPlanes(ctx, viewportWidth, viewportHeight, layerDepth = 4) {
    if (this.profile.atmosphere.hasLayeredFog) {
      this.atmosphere.renderFogPlanes(ctx, viewportWidth, viewportHeight, layerDepth, 1.0);
    }
  }

  /**
   * Renders precipitation particles (rain streaks, snow) in screen space.
   */
  renderPrecipitation(ctx) {
    if (this.profile.precipitation.type !== 'none') {
      this.particles.render(ctx, this.profile.precipitation.color);
    }
  }

  /**
   * Renders ambient color wash and sheet lightning flash overlay.
   */
  renderAtmosphere(ctx, viewportWidth, viewportHeight) {
    this.atmosphere.renderAmbientWash(
      ctx,
      viewportWidth,
      viewportHeight,
      this.profile.lighting.ambientColor
    );
  }
}
