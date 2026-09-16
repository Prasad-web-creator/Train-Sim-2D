/**
 * EnvironmentRenderer.js
 * Multi-layer parallax environment orchestrator implementing the 6 discrete visual depth layers.
 */

import { StructureRenderer } from './StructureRenderer.js';
import { cons_GAME_CONFIG } from '../../constants/GameConstants.js';
import { drawRoundedRect } from '../../utils/CanvasUtils.js';

export class EnvironmentRenderer {
  /**
   * Initializes environment sub-renderers, cloud drift counters, and structure artist.
   */
  constructor() {
    this.structureRenderer = new StructureRenderer();
    this.cloudTimer = 0;
    this.ppm = cons_GAME_CONFIG.PIXELS_PER_METER;
  }

  /**
   * Layer 1: Distant sky gradient, celestial bodies (sun/moon/stars), and drifting clouds.
   */
  renderLayer1Sky(ctx, biome, viewportWidth, viewportHeight, weatherSystem = null, dayNightSystem = null) {
    ctx.save();

    // 1. Day/Night system or Weather-driven sky gradient (or biome fallback)
    let tmp_skyGrad;
    if (dayNightSystem) {
      tmp_skyGrad = dayNightSystem.createSkyGradient(ctx, viewportHeight);
    } else if (weatherSystem) {
      tmp_skyGrad = weatherSystem.createSkyGradient(ctx, viewportHeight);
    } else {
      tmp_skyGrad = ctx.createLinearGradient(0, 0, 0, viewportHeight * 0.72);
      if (biome === 'desert') {
        tmp_skyGrad.addColorStop(0, '#ea580c');
        tmp_skyGrad.addColorStop(0.45, '#fed7aa');
        tmp_skyGrad.addColorStop(1, '#ffedd5');
      } else if (biome === 'mountain') {
        tmp_skyGrad.addColorStop(0, '#0284c7');
        tmp_skyGrad.addColorStop(0.65, '#bae6fd');
        tmp_skyGrad.addColorStop(1, '#f0f9ff');
      } else {
        tmp_skyGrad.addColorStop(0, '#38bdf8');
        tmp_skyGrad.addColorStop(0.65, '#bae6fd');
        tmp_skyGrad.addColorStop(1, '#e0f2fe');
      }
    }

    ctx.fillStyle = tmp_skyGrad;
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    // 2. Celestial bodies (orbital sun with corona, moon with halo, twinkling stars)
    if (dayNightSystem) {
      dayNightSystem.renderCelestial(ctx, viewportWidth, viewportHeight);
    } else if (weatherSystem) {
      weatherSystem.renderCelestial(ctx, viewportWidth, viewportHeight);
    }

    // 3. Drifting atmospheric clouds
    this.cloudTimer += 0.003;
    const obj_cloudCfg = weatherSystem ? weatherSystem.getCloudSettings() : { color: 'rgba(255, 255, 255, 0.55)', count: 6 };
    ctx.fillStyle = obj_cloudCfg.color;

    for (let tmp_i = 0; tmp_i < obj_cloudCfg.count; tmp_i++) {
      const tmp_cx = ((tmp_i * 310 + this.cloudTimer * 45) % (viewportWidth + 400)) - 200;
      const tmp_cy = 35 + tmp_i * 28;
      ctx.beginPath();
      ctx.arc(tmp_cx, tmp_cy, 38, 0, Math.PI * 2);
      ctx.arc(tmp_cx + 28, tmp_cy - 14, 30, 0, Math.PI * 2);
      ctx.arc(tmp_cx + 56, tmp_cy, 32, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Layer 2: Mountains and distant landscape with slow parallax scroll (speed ~0.08).
   */
  renderLayer2Mountains(ctx, biome, cameraX, viewportWidth, viewportHeight, chunkManager, weatherSystem = null, dayNightSystem = null) {
    ctx.save();
    const tmp_parallaxX = cameraX * 0.08;
    const tmp_baseY = viewportHeight * 0.54;

    const obj_mtnCfg = weatherSystem ? weatherSystem.getMountainSettings() : null;
    const obj_dnAmbient = dayNightSystem ? dayNightSystem.getAmbientState() : null;
    const tmp_hasSnow = weatherSystem ? weatherSystem.getTrackSettings().hasSnow : false;

    // Distant mountain ridgeline silhouette
    ctx.beginPath();
    ctx.moveTo(0, viewportHeight);

    const tmp_step = 55;
    for (let tmp_x = 0; tmp_x <= viewportWidth + tmp_step; tmp_x += tmp_step) {
      const tmp_worldX = tmp_x + tmp_parallaxX;
      let tmp_h;
      if (biome === 'desert') {
        // Flat-topped mesas
        const tmp_s = Math.sin(tmp_worldX * 0.0035);
        tmp_h = Math.min(160, Math.max(30, Math.abs(tmp_s) * 220));
      } else {
        // Alpine jagged peaks
        tmp_h = Math.sin(tmp_worldX * 0.0025) * 85 + Math.cos(tmp_worldX * 0.006) * 45 + 120;
      }
      ctx.lineTo(tmp_x, tmp_baseY - tmp_h);
    }

    ctx.lineTo(viewportWidth, viewportHeight);
    ctx.closePath();

    let tmp_baseColor = obj_mtnCfg?.tint || (biome === 'desert' ? '#c2410c' : (biome === 'mountain' ? '#475569' : '#047857'));
    let tmp_alpha = obj_mtnCfg ? obj_mtnCfg.alpha : 0.38;

    if (obj_dnAmbient) {
      if (obj_dnAmbient.mountainTint) {
        tmp_baseColor = obj_dnAmbient.mountainTint;
      }
      if (obj_dnAmbient.mountainAlpha !== undefined) {
        tmp_alpha = obj_dnAmbient.mountainAlpha;
      }
    }

    ctx.fillStyle = tmp_baseColor;
    ctx.globalAlpha = tmp_alpha;
    ctx.fill();

    // Snow caps on alpine mountain ridges when snowing
    if (tmp_hasSnow && biome !== 'desert') {
      ctx.fillStyle = '#f8fafc';
      ctx.globalAlpha = 0.5;
      for (let tmp_x = 0; tmp_x <= viewportWidth + tmp_step; tmp_x += tmp_step * 2) {
        const tmp_worldX = tmp_x + tmp_parallaxX;
        const tmp_h = Math.sin(tmp_worldX * 0.0025) * 85 + Math.cos(tmp_worldX * 0.006) * 45 + 120;
        ctx.beginPath();
        ctx.moveTo(tmp_x - 18, tmp_baseY - tmp_h + 20);
        ctx.lineTo(tmp_x, tmp_baseY - tmp_h);
        ctx.lineTo(tmp_x + 18, tmp_baseY - tmp_h + 20);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Secondary mid-mountain ridge (closer tier, parallax speed ~0.14)
    ctx.beginPath();
    ctx.moveTo(0, viewportHeight);
    const tmp_parallaxX2 = cameraX * 0.14;
    for (let tmp_x = 0; tmp_x <= viewportWidth + tmp_step; tmp_x += tmp_step) {
      const tmp_worldX = tmp_x + tmp_parallaxX2;
      const tmp_h = Math.sin(tmp_worldX * 0.004) * 55 + Math.cos(tmp_worldX * 0.009) * 35 + 85;
      ctx.lineTo(tmp_x, tmp_baseY + 15 - tmp_h);
    }
    ctx.lineTo(viewportWidth, viewportHeight);
    ctx.closePath();
    ctx.globalAlpha = obj_dnAmbient ? Math.min(0.85, tmp_alpha * 1.5) : (obj_mtnCfg ? Math.min(0.85, obj_mtnCfg.alpha * 1.4) : 0.55);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Layer 3: Trees and vegetation in the middle ground (parallax speed ~0.35).
   */
  renderLayer3Vegetation(ctx, chunkManager, trackSystem, cameraX, viewportWidth, viewportHeight, weatherSystem = null, dayNightSystem = null) {
    ctx.save();
    const arr_elements = chunkManager.getElementsForLayer(3);
    const tmp_hasSnow = weatherSystem ? weatherSystem.getTrackSettings().hasSnow : false;

    for (let tmp_i = 0; tmp_i < arr_elements.length; tmp_i++) {
      const obj_el = arr_elements[tmp_i];
      const tmp_worldX = obj_el.dist * this.ppm;
      // Parallax offset relative to camera
      const tmp_screenDist = tmp_worldX - cameraX;
      const tmp_parallaxX = cameraX + tmp_screenDist * 0.65; // Moves slower than track
      const tmp_groundY = trackSystem.getElevationAt(obj_el.dist);

      if (obj_el.type === 'station_instance' && obj_el.station) {
        obj_el.station.renderLayer3(ctx, this.ppm, (d) => trackSystem.getElevationAt(d));
      } else if (obj_el.type === 'pine') {
        this.renderPineTree(ctx, tmp_parallaxX, tmp_groundY, obj_el.scale || 1.0, tmp_hasSnow);
      } else {
        this.renderBroadleafTree(ctx, tmp_parallaxX, tmp_groundY, obj_el.scale || 1.0, tmp_hasSnow);
      }
    }

    ctx.restore();
  }

  /**
   * Layer 4: Buildings and railway infrastructure in world coordinates (station depots,
   * warehouses, water towers, telegraph poles with catenary wires, signals, fences).
   */
  renderLayer4Infrastructure(ctx, chunkManager, trackSystem, cameraX, viewportWidth, dayNightSystem = null) {
    ctx.save();
    const arr_elements = chunkManager.getElementsForLayer(4);

    const obj_lighting = dayNightSystem ? dayNightSystem.getLightingState() : null;
    const tmp_buildingLightsActive = obj_lighting ? obj_lighting.buildingLightsActive : false;

    let tmp_prevPole = null;

    for (let tmp_i = 0; tmp_i < arr_elements.length; tmp_i++) {
      const obj_el = arr_elements[tmp_i];
      const tmp_x = (obj_el.dist || obj_el.startDist) * this.ppm;
      const tmp_groundY = trackSystem.getElevationAt(obj_el.dist || obj_el.startDist);

      if (obj_el.type === 'station_instance' && obj_el.station) {
        obj_el.station.renderLayer4(ctx, this.ppm, (d) => trackSystem.getElevationAt(d));
      } else if (obj_el.type === 'station_depot') {
        this.structureRenderer.renderStationDepot(ctx, tmp_x, tmp_groundY, obj_el.widthMeters, obj_el.heightMeters, obj_el.name, tmp_buildingLightsActive);
      } else if (obj_el.type === 'station_canopy') {
        this.structureRenderer.renderStationCanopy(ctx, tmp_x, tmp_groundY, obj_el.widthMeters, obj_el.heightMeters);
      } else if (obj_el.type === 'water_tower') {
        this.structureRenderer.renderWaterTower(ctx, tmp_x, tmp_groundY);
      } else if (obj_el.type === 'brick_warehouse') {
        this.structureRenderer.renderBrickWarehouse(ctx, tmp_x, tmp_groundY, obj_el.widthMeters, obj_el.heightMeters, tmp_buildingLightsActive);
      } else if (obj_el.type === 'freight_shed') {
        this.structureRenderer.renderBrickWarehouse(ctx, tmp_x, tmp_groundY, obj_el.widthMeters, obj_el.heightMeters, tmp_buildingLightsActive);
      } else if (obj_el.type === 'railway_signal') {
        this.structureRenderer.renderRailwaySignal(ctx, tmp_x, tmp_groundY, obj_el.aspect);
      } else if (obj_el.type === 'signal_gantry') {
        this.structureRenderer.renderSignalGantry(ctx, tmp_x, tmp_groundY, obj_el.aspect);
      } else if (obj_el.type === 'wooden_fence') {
        this.structureRenderer.renderWoodenFence(ctx, tmp_x, tmp_groundY, obj_el.lengthMeters * this.ppm);
      } else if (obj_el.type === 'chainlink_fence') {
        this.structureRenderer.renderWoodenFence(ctx, tmp_x, tmp_groundY, obj_el.lengthMeters * this.ppm);
      } else if (obj_el.type === 'telegraph_pole') {
        const tmp_poleTopY = tmp_groundY - obj_el.height;

        // Wooden pole
        ctx.fillStyle = '#78350f';
        ctx.fillRect(tmp_x - 3, tmp_poleTopY, 6, obj_el.height);
        // Crossarm
        ctx.fillRect(tmp_x - 16, tmp_poleTopY + 4, 32, 4);
        // Insulators
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(tmp_x - 14, tmp_poleTopY, 3, 4);
        ctx.fillRect(tmp_x + 11, tmp_poleTopY, 3, 4);

        // Connect sagging catenary wire to previous pole
        if (tmp_prevPole && Math.abs(tmp_x - tmp_prevPole.x) < 2600) {
          ctx.beginPath();
          ctx.moveTo(tmp_prevPole.x + 12, tmp_prevPole.y);
          const tmp_midX = (tmp_prevPole.x + tmp_x) * 0.5;
          const tmp_midY = (tmp_prevPole.y + tmp_poleTopY + 4) * 0.5 + 14;
          ctx.quadraticCurveTo(tmp_midX, tmp_midY, tmp_x - 12, tmp_poleTopY + 4);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }

        tmp_prevPole = { x: tmp_x, y: tmp_poleTopY + 4 };
      } else if (obj_el.type === 'log_stack') {
        this.renderLogStack(ctx, tmp_x, tmp_groundY, obj_el.logCount);
      }
    }

    ctx.restore();
  }

  /**
   * Layer 5: Track features (station platforms, coping, tactile edging, benches, passengers, luggage).
   */
  renderLayer5TrackFeatures(ctx, chunkManager, trackSystem) {
    ctx.save();
    const arr_elements = chunkManager.getElementsForLayer(5);
    for (let tmp_i = 0; tmp_i < arr_elements.length; tmp_i++) {
      const obj_el = arr_elements[tmp_i];
      if (obj_el.type === 'station_instance' && obj_el.station) {
        obj_el.station.renderLayer5(ctx, this.ppm, (d) => trackSystem.getElevationAt(d));
      }
    }
    ctx.restore();
  }

  /**
   * Layer 6: Foreground environmental elements (foreground weeds, bridge guardrails,
   * tunnel portal stone arches, and cutaway earth soil cross-section).
   */
  renderLayer6Foreground(ctx, chunkManager, trackSystem, cameraX, viewportWidth) {
    ctx.save();
    const tmp_startDist = Math.max(0, (cameraX - viewportWidth * 0.7) / this.ppm);
    const tmp_endDist = (cameraX + viewportWidth * 0.7) / this.ppm;

    // 1. Render earth cutaway soil strata below track ballast
    this.structureRenderer.renderCutawaySoil(ctx, tmp_startDist, tmp_endDist, trackSystem);

    // 2. Render foreground elements from active chunks
    const arr_elements = chunkManager.getElementsForLayer(6);

    for (let tmp_i = 0; tmp_i < arr_elements.length; tmp_i++) {
      const obj_el = arr_elements[tmp_i];
      const tmp_x = (obj_el.dist || obj_el.startDist) * this.ppm;
      const tmp_groundY = trackSystem.getElevationAt(obj_el.dist || obj_el.startDist);

      if (obj_el.type === 'station_instance' && obj_el.station) {
        obj_el.station.renderLayer6(ctx, this.ppm, (d) => trackSystem.getElevationAt(d));
      } else if (obj_el.type === 'tunnel_portal_arch') {
        this.structureRenderer.renderTunnelPortalArch(ctx, tmp_x, tmp_groundY, obj_el.isEntrance);
      } else if (obj_el.type === 'grass_tuft') {
        this.renderGrassTuft(ctx, tmp_x, tmp_groundY + 6, obj_el.height, obj_el.color);
      } else if (obj_el.type === 'boulder') {
        this.renderBoulder(ctx, tmp_x, tmp_groundY + 4, obj_el.radius);
      } else if (obj_el.type === 'bridge_foreground_guardrail') {
        this.renderBridgeGuardrail(ctx, tmp_x, tmp_groundY, obj_el.lengthMeters * this.ppm);
      }
    }

    ctx.restore();
  }

  /**
   * Renders stacked tree trunks at logging sites.
   */
  renderLogStack(ctx, x, groundY, count = 8) {
    ctx.save();
    const tmp_r = 8;
    for (let tmp_i = 0; tmp_i < count; tmp_i++) {
      const tmp_row = Math.floor(tmp_i / 3);
      const tmp_col = tmp_i % 3;
      const tmp_lx = x + (tmp_col * tmp_r * 2) + (tmp_row * tmp_r);
      const tmp_ly = groundY - tmp_r - (tmp_row * tmp_r * 1.8);

      ctx.beginPath();
      ctx.arc(tmp_lx, tmp_ly, tmp_r, 0, Math.PI * 2);
      ctx.fillStyle = '#b45309';
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Ring
      ctx.beginPath();
      ctx.arc(tmp_lx, tmp_ly, tmp_r * 0.45, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Renders multi-tiered pine tree foliage with optional snow caps.
   */
  renderPineTree(ctx, x, groundY, scale, hasSnow = false) {
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(scale, scale);

    // Trunk
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-4, -20, 8, 20);

    // Foliage tiers
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.moveTo(0, -60);
    ctx.lineTo(26, -20);
    ctx.lineTo(-26, -20);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.moveTo(0, -85);
    ctx.lineTo(22, -45);
    ctx.lineTo(-22, -45);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.moveTo(0, -110);
    ctx.lineTo(16, -70);
    ctx.lineTo(-16, -70);
    ctx.closePath();
    ctx.fill();

    // Snow caps on branches
    if (hasSnow) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-20, -24, 40, 5);
      ctx.fillRect(-16, -49, 32, 5);
      ctx.fillRect(-10, -74, 20, 4);
      // Top snow peak
      ctx.beginPath();
      ctx.moveTo(0, -114);
      ctx.lineTo(6, -98);
      ctx.lineTo(-6, -98);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Renders broadleaf leafy tree with optional winter snow dusting.
   */
  renderBroadleafTree(ctx, x, groundY, scale, hasSnow = false) {
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#5c2b14';
    ctx.fillRect(-6, -30, 12, 30);

    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(0, -65, 32, 0, Math.PI * 2);
    ctx.arc(-20, -50, 24, 0, Math.PI * 2);
    ctx.arc(20, -50, 24, 0, Math.PI * 2);
    ctx.fill();

    // Snow mantle on broadleaf canopy
    if (hasSnow) {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(0, -84, 18, Math.PI, 0);
      ctx.arc(-20, -66, 14, Math.PI, 0);
      ctx.arc(20, -66, 14, Math.PI, 0);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Renders foreground wild grass blades with realistic slant.
   */
  renderGrassTuft(ctx, x, y, height, color) {
    ctx.save();
    ctx.strokeStyle = color || '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - 5, y - height * 0.6, x - 8, y - height);
    ctx.moveTo(x + 2, y);
    ctx.quadraticCurveTo(x + 2, y - height * 0.7, x + 3, y - height);
    ctx.moveTo(x + 4, y);
    ctx.quadraticCurveTo(x + 8, y - height * 0.5, x + 10, y - height * 0.85);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Renders trackside rock boulder with highlights and shadow.
   */
  renderBoulder(ctx, x, y, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y - radius * 0.8, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#475569';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Highlight
    ctx.beginPath();
    ctx.arc(x - radius * 0.3, y - radius * 1.1, radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();
    ctx.restore();
  }

  /**
   * Renders bridge safety pedestrian walkway guardrails in foreground.
   */
  renderBridgeGuardrail(ctx, startX, groundY, lengthPixels) {
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;

    // Horizontal rails
    ctx.beginPath();
    ctx.moveTo(startX, groundY - 18);
    ctx.lineTo(startX + lengthPixels, groundY - 18);
    ctx.moveTo(startX, groundY - 32);
    ctx.lineTo(startX + lengthPixels, groundY - 32);
    ctx.stroke();

    // Vertical stanchions
    for (let tmp_px = startX; tmp_px <= startX + lengthPixels; tmp_px += 24) {
      ctx.beginPath();
      ctx.moveTo(tmp_px, groundY);
      ctx.lineTo(tmp_px, groundY - 34);
      ctx.stroke();
    }
    ctx.restore();
  }
}
