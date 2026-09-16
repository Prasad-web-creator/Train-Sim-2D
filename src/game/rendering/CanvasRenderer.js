/**
 * CanvasRenderer.js
 * Master 2D canvas orchestrator executing the 6-layer parallax rendering pipeline.
 */

import { EnvironmentRenderer } from './EnvironmentRenderer.js';
import { TrackRenderer } from './TrackRenderer.js';
import { TrainRenderer } from './TrainRenderer.js';
import { cons_GAME_CONFIG } from '../../constants/GameConstants.js';

export class CanvasRenderer {
  /**
   * Initializes sub-renderers and logical viewport resolution.
   */
  constructor() {
    this.environmentRenderer = new EnvironmentRenderer();
    this.trackRenderer = new TrackRenderer();
    this.trainRenderer = new TrainRenderer();

    this.logicalWidth = 1920;
    this.logicalHeight = 1080;
    this.dpr = 1;
  }

  /**
   * Adjusts canvas internal buffer dimensions to match device pixel ratio for crisp rendering.
   */
  resize(canvas, containerWidth, containerHeight) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for high mobile performance
    this.logicalWidth = containerWidth;
    this.logicalHeight = containerHeight;

    canvas.width = Math.round(containerWidth * this.dpr);
    canvas.height = Math.round(containerHeight * this.dpr);
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
  }

  /**
   * Executes the full 6-layer rendering pipeline in strict back-to-front depth order.
   * Integrates lightweight 2D weather system and dynamic 7-phase day/night system:
   * sky gradients, orbital sun/moon, twinkling stars, mountain distance tinting,
   * building illumination, station lights, amplified signal halos, and single-pass ambient darkness.
   */
  render(
    ctx,
    camera,
    biome,
    chunkManager,
    trackSystem,
    consist,
    particleSystem,
    isHeadlightOn = true,
    signalSystem = null,
    weatherSystem = null,
    dayNightSystem = null
  ) {
    ctx.save();
    // High-DPI scaling
    ctx.scale(this.dpr, this.dpr);

    const tmp_viewportW = this.logicalWidth;
    const tmp_viewportH = this.logicalHeight;

    // Clear frame
    ctx.clearRect(0, 0, tmp_viewportW, tmp_viewportH);

    // Retrieve optical halo multiplier for signals from active time phase
    const tmp_haloMult = dayNightSystem
      ? (dayNightSystem.getLightingState().signalHaloMultiplier || 1.0)
      : 1.0;

    // ==========================================
    // LAYER 1: Distant Sky, Celestial Bodies, and Drifting Clouds
    // ==========================================
    this.environmentRenderer.renderLayer1Sky(ctx, biome, tmp_viewportW, tmp_viewportH, weatherSystem, dayNightSystem);

    // ==========================================
    // LAYER 2: Mountains and Distant Landscape (Parallax speed ~0.08)
    // ==========================================
    this.environmentRenderer.renderLayer2Mountains(ctx, biome, camera.x, tmp_viewportW, tmp_viewportH, chunkManager, weatherSystem, dayNightSystem);

    // ==========================================
    // LAYER 2.5: Midground Atmospheric Fog Plane (Between distant mountains and railway corridor)
    // ==========================================
    if (weatherSystem) {
      weatherSystem.renderFogPlanes(ctx, tmp_viewportW, tmp_viewportH, 4);
    }

    // ==========================================
    // WORLD SPACE CAMERA TRANSFORMATION
    // ==========================================
    camera.applyTransform(ctx, tmp_viewportW, tmp_viewportH);

    // ==========================================
    // LAYER 3: Trees and Midground Vegetation (Parallax speed ~0.35)
    // ==========================================
    this.environmentRenderer.renderLayer3Vegetation(ctx, chunkManager, trackSystem, camera.x, tmp_viewportW, tmp_viewportH, weatherSystem, dayNightSystem);

    // ==========================================
    // LAYER 4: Buildings and Railway Infrastructure
    // ==========================================
    this.environmentRenderer.renderLayer4Infrastructure(ctx, chunkManager, trackSystem, camera.x, tmp_viewportW, dayNightSystem);
    if (signalSystem) {
      signalSystem.render(ctx, camera.x, tmp_viewportW, trackSystem, tmp_haloMult);
    }

    // ==========================================
    // LAYER 5: Railway Track, Platforms, and Train Consist
    // ==========================================
    this.trackRenderer.render(ctx, trackSystem, camera.x, tmp_viewportW, tmp_viewportH, weatherSystem);
    this.environmentRenderer.renderLayer5TrackFeatures(ctx, chunkManager, trackSystem);
    this.trainRenderer.render(ctx, consist, isHeadlightOn, weatherSystem, dayNightSystem);
    particleSystem.render(ctx);

    // ==========================================
    // LAYER 6: Foreground Environmental Elements (Cutaway soil, weeds, tunnel arch)
    // ==========================================
    this.environmentRenderer.renderLayer6Foreground(ctx, chunkManager, trackSystem, camera.x, tmp_viewportW);

    // RESTORE CAMERA TRANSFORM
    camera.restoreTransform(ctx);

    // ==========================================
    // SCREEN SPACE ATMOSPHERE, PRECIPITATION & DAY/NIGHT AMBIENT LIGHTING
    // Single-pass Canvas layers (Zero expensive full-screen DOM filters)
    // ==========================================
    if (weatherSystem) {
      // Layered foreground fog ribbons over track and train
      weatherSystem.renderFogPlanes(ctx, tmp_viewportW, tmp_viewportH, 6);

      // Slanted rain streaks, snow flutter particles, and ground splashes
      weatherSystem.renderPrecipitation(ctx);

      // Weather ambient wash overlay and sheet lightning
      weatherSystem.renderAtmosphere(ctx, tmp_viewportW, tmp_viewportH);
    }

    // Single-pass environmental day/night darkness wash
    if (dayNightSystem) {
      dayNightSystem.renderAmbientDarkness(ctx, tmp_viewportW, tmp_viewportH);
    }

    ctx.restore();
  }
}
