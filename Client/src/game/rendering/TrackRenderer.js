/**
 * TrackRenderer.js
 * Procedural rendering of ballast embankments, railway ties/sleepers, dual steel rails,
 * bridges, speed limit signs, and station platforms.
 */

import { cons_GAME_CONFIG } from '../../constants/GameConstants.js';
import { drawRoundedRect } from '../../utils/CanvasUtils.js';

export class TrackRenderer {
  /**
   * Initializes track styling palettes and cached sleeper dimensions.
   */
  constructor() {
    this.sleeperWidth = 12; // 12px wide wooden sleeper block matching Image 1
    this.sleeperHeight = 5;  // 5px high compact rectangular sleeper block
    this.sleeperSpacing = 20; // 20px between sleeper centers (~1.0m spacing)
    this.railHeight = 4;
    this.ballastDepth = 6;  // 6px clean stone ballast bed strip
  }

  /**
   * Renders track bed, ballast gravel, sleepers, steel rails, and bridges within the camera viewport.
   * Adapts appearance for wet/rainy conditions (glossy specular sheen, dark ballast) and snow (snow banks, frosted ties).
   */
  render(ctx, trackSystem, cameraX, viewportWidth, viewportHeight, weatherSystem = null) {
    const tmp_ppm = cons_GAME_CONFIG.PIXELS_PER_METER;
    const tmp_startDistMeters = Math.max(0, (cameraX - viewportWidth * 0.7) / tmp_ppm);
    const tmp_endDistMeters = Math.min(trackSystem.totalLengthMeters, (cameraX + viewportWidth * 0.7) / tmp_ppm);

    const obj_trackCfg = weatherSystem ? weatherSystem.getTrackSettings() : null;
    const tmp_isSunset = weatherSystem && weatherSystem.getWeather() === 'SUNSET';

    // 1. Render bridge trestles if in bridge section
    this.renderBridges(ctx, trackSystem, tmp_startDistMeters, tmp_endDistMeters);

    // 2. Render ballast bed strip (neutral grey stone bed matching Image 1)
    this.renderBallast(ctx, trackSystem, tmp_startDistMeters, tmp_endDistMeters, obj_trackCfg);

    // 3. Render wooden sleepers (warm wood tan / caramel ties matching Image 1)
    this.renderSleepers(ctx, trackSystem, tmp_startDistMeters, tmp_endDistMeters, obj_trackCfg);

    // 4. Render steel rail (metallic grey continuous bar directly under wheels)
    this.renderSteelRails(ctx, trackSystem, tmp_startDistMeters, tmp_endDistMeters, obj_trackCfg, tmp_isSunset);

    // 5. Render trackside speed limit signs and buffer stops
    this.renderTracksideSignage(ctx, trackSystem, tmp_startDistMeters, tmp_endDistMeters);
  }

  /**
   * Renders wooden rail ties (sleepers) matching Image 1:
   * Warm tan / wood brown rectangular blocks evenly spaced between the steel rail and the ballast bed.
   */
  renderSleepers(ctx, trackSystem, startDist, endDist, trackCfg = null) {
    const tmp_ppm = cons_GAME_CONFIG.PIXELS_PER_METER;
    const tmp_stepMeters = 1.0; // 1.0m = 20px spacing with 8px air gap between 12px sleepers
    const tmp_isWet = trackCfg?.isWet;
    const tmp_hasSnow = trackCfg?.hasSnow;

    ctx.save();
    for (let tmp_d = startDist; tmp_d <= endDist; tmp_d += tmp_stepMeters) {
      const tmp_x = tmp_d * tmp_ppm;
      const tmp_y = trackSystem.getElevationAt(tmp_d);
      const tmp_angle = trackSystem.getTangentAngleAt(tmp_d);

      ctx.save();
      ctx.translate(tmp_x, tmp_y);
      ctx.rotate(tmp_angle);

      // Wooden sleeper block (warm wood tan / caramel matching Image 1)
      ctx.fillStyle = tmp_isWet ? '#78350f' : '#b47952';
      ctx.fillRect(-this.sleeperWidth * 0.5, 6, this.sleeperWidth, this.sleeperHeight);

      // Bottom shadow bevel line
      ctx.fillStyle = tmp_isWet ? '#451a03' : '#8c532b';
      ctx.fillRect(-this.sleeperWidth * 0.5, 6 + this.sleeperHeight - 1, this.sleeperWidth, 1);

      // Steel tie plate / Pandrol fastener clip on top
      ctx.fillStyle = tmp_isWet ? '#0f172a' : '#27272a';
      ctx.fillRect(-this.sleeperWidth * 0.35, 5.0, this.sleeperWidth * 0.7, 1.2);

      // Snow accumulation on sleeper top
      if (tmp_hasSnow) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-this.sleeperWidth * 0.5, 6, this.sleeperWidth, 1.5);
      }

      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Renders continuous ballast stone gravel bed matching Image 1:
   * A clean, uniform horizontal neutral-grey ballast bed strip running continuously under the sleepers.
   */
  renderBallast(ctx, trackSystem, startDist, endDist, trackCfg = null) {
    const tmp_ppm = cons_GAME_CONFIG.PIXELS_PER_METER;
    const tmp_sampleStep = 2.0; // Sample every 2 meters
    const tmp_isWet = trackCfg?.isWet;
    const tmp_hasSnow = trackCfg?.hasSnow;

    ctx.save();
    ctx.beginPath();

    // Top surface of ballast bed (y + 11) directly under the sleepers (which end at y + 11)
    let tmp_isFirst = true;
    for (let tmp_d = startDist; tmp_d <= endDist; tmp_d += tmp_sampleStep) {
      const tmp_x = tmp_d * tmp_ppm;
      const tmp_y = trackSystem.getElevationAt(tmp_d) + 11;
      if (tmp_isFirst) {
        ctx.moveTo(tmp_x, tmp_y);
        tmp_isFirst = false;
      } else {
        ctx.lineTo(tmp_x, tmp_y);
      }
    }

    // Bottom edge of ballast bed (y + 17)
    for (let tmp_d = endDist; tmp_d >= startDist; tmp_d -= tmp_sampleStep) {
      const tmp_x = tmp_d * tmp_ppm;
      const tmp_y = trackSystem.getElevationAt(tmp_d) + 17;
      ctx.lineTo(tmp_x, tmp_y);
    }

    ctx.closePath();
    // Neutral stone grey ballast matching Image 1 (darker when wet)
    ctx.fillStyle = tmp_isWet ? '#334155' : '#6b7280';
    ctx.fill();

    // Subtle edge borders defining the ballast strip
    ctx.strokeStyle = tmp_isWet ? '#1e293b' : '#4b5563';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Snow mantle along ballast top
    if (tmp_hasSnow) {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      let tmp_snowFirst = true;
      for (let tmp_d = startDist; tmp_d <= endDist; tmp_d += tmp_sampleStep) {
        const tmp_x = tmp_d * tmp_ppm;
        const tmp_y = trackSystem.getElevationAt(tmp_d) + 11;
        if (tmp_snowFirst) {
          ctx.moveTo(tmp_x, tmp_y);
          tmp_snowFirst = false;
        } else {
          ctx.lineTo(tmp_x, tmp_y);
        }
      }
      for (let tmp_d = endDist; tmp_d >= startDist; tmp_d -= tmp_sampleStep) {
        const tmp_x = tmp_d * tmp_ppm;
        const tmp_y = trackSystem.getElevationAt(tmp_d) + 13;
        ctx.lineTo(tmp_x, tmp_y);
      }
      ctx.closePath();
      ctx.globalAlpha = 0.85;
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Renders continuous steel rail matching Image 1:
   * A clean, metallic steel grey rail bar directly supporting the locomotive wheels.
   */
  renderSteelRails(ctx, trackSystem, startDist, endDist, trackCfg = null, isSunset = false) {
    const tmp_ppm = cons_GAME_CONFIG.PIXELS_PER_METER;
    const tmp_sampleStep = 1.5;
    const tmp_isWet = trackCfg?.isWet;

    ctx.save();

    // 1. Base steel rail body (4px thick bar centered at y + 4)
    ctx.beginPath();
    let tmp_first = true;
    for (let tmp_d = startDist; tmp_d <= endDist; tmp_d += tmp_sampleStep) {
      const tmp_x = tmp_d * tmp_ppm;
      const tmp_y = trackSystem.getElevationAt(tmp_d) + 4;
      if (tmp_first) {
        ctx.moveTo(tmp_x, tmp_y);
        tmp_first = false;
      } else {
        ctx.lineTo(tmp_x, tmp_y);
      }
    }
    ctx.strokeStyle = tmp_isWet ? '#374151' : '#52525b';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 2. Rail foot base flange (darker bottom edge at y + 5.8)
    ctx.beginPath();
    tmp_first = true;
    for (let tmp_d = startDist; tmp_d <= endDist; tmp_d += tmp_sampleStep) {
      const tmp_x = tmp_d * tmp_ppm;
      const tmp_y = trackSystem.getElevationAt(tmp_d) + 5.8;
      if (tmp_first) {
        ctx.moveTo(tmp_x, tmp_y);
        tmp_first = false;
      } else {
        ctx.lineTo(tmp_x, tmp_y);
      }
    }
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 3. Top polished steel running surface (sits at y + 2.2, directly under wheel treads)
    ctx.beginPath();
    tmp_first = true;
    for (let tmp_d = startDist; tmp_d <= endDist; tmp_d += tmp_sampleStep) {
      const tmp_x = tmp_d * tmp_ppm;
      const tmp_y = trackSystem.getElevationAt(tmp_d) + 2.2;
      if (tmp_first) {
        ctx.moveTo(tmp_x, tmp_y);
        tmp_first = false;
      } else {
        ctx.lineTo(tmp_x, tmp_y);
      }
    }

    if (tmp_isWet) {
      // Wet reflective specular highlight
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.6;
    } else if (isSunset) {
      // Warm golden-orange specular reflection
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 1.6;
    } else {
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1.6;
    }
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Renders steel trestle bridge pylons when crossing deep ravines.
   */
  renderBridges(ctx, trackSystem, startDist, endDist) {
    const tmp_ppm = cons_GAME_CONFIG.PIXELS_PER_METER;

    ctx.save();
    for (let tmp_d = startDist; tmp_d <= endDist; tmp_d += 18.0) {
      if (trackSystem.isBridgeAt(tmp_d)) {
        const tmp_x = tmp_d * tmp_ppm;
        const tmp_y = trackSystem.getElevationAt(tmp_d);

        // Steel truss pier
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(tmp_x - 12, tmp_y + 17);
        ctx.lineTo(tmp_x - 18, tmp_y + 220);
        ctx.moveTo(tmp_x + 12, tmp_y + 17);
        ctx.lineTo(tmp_x + 18, tmp_y + 220);
        ctx.stroke();

        // Cross bracing X
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tmp_x - 12, tmp_y + 30);
        ctx.lineTo(tmp_x + 12, tmp_y + 90);
        ctx.moveTo(tmp_x + 12, tmp_y + 30);
        ctx.lineTo(tmp_x - 12, tmp_y + 90);
        ctx.moveTo(tmp_x - 14, tmp_y + 90);
        ctx.lineTo(tmp_x + 14, tmp_y + 160);
        ctx.moveTo(tmp_x + 14, tmp_y + 90);
        ctx.lineTo(tmp_x - 14, tmp_y + 160);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  /**
   * Renders trackside speed limit signs, mile markers, and terminus buffer stops.
   */
  renderTracksideSignage(ctx, trackSystem, startDist, endDist) {
    const tmp_ppm = cons_GAME_CONFIG.PIXELS_PER_METER;

    ctx.save();

    // Speed limit signs at zone boundaries
    for (let tmp_i = 0; tmp_i < trackSystem.arr_speedLimits.length; tmp_i++) {
      const obj_limit = trackSystem.arr_speedLimits[tmp_i];
      if (obj_limit.startDist >= startDist && obj_limit.startDist <= endDist) {
        const tmp_x = obj_limit.startDist * tmp_ppm;
        const tmp_y = trackSystem.getElevationAt(obj_limit.startDist);

        // Post
        ctx.fillStyle = '#64748b';
        ctx.fillRect(tmp_x - 2, tmp_y - 48, 4, 48);

        // Circular speed limit sign
        ctx.beginPath();
        ctx.arc(tmp_x, tmp_y - 58, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#dc2626';
        ctx.stroke();

        // Speed limit number
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj_limit.limitKmh.toString(), tmp_x, tmp_y - 58);
      }
    }

    // End of track buffer stop at track terminus
    const tmp_endDist = trackSystem.totalLengthMeters;
    if (tmp_endDist >= startDist && tmp_endDist <= endDist + 50) {
      const tmp_endX = tmp_endDist * tmp_ppm;
      const tmp_endY = trackSystem.getElevationAt(tmp_endDist);

      // Red and white striped bumper block
      ctx.fillStyle = '#dc2626';
      drawRoundedRect(ctx, tmp_endX, tmp_endY - 32, 24, 34, 4);
      ctx.fill();

      // Warning chevron stripes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(tmp_endX + 5, tmp_endY - 26, 4, 22);
      ctx.fillRect(tmp_endX + 13, tmp_endY - 26, 4, 22);

      // Red marker lamp
      ctx.beginPath();
      ctx.arc(tmp_endX + 12, tmp_endY - 36, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    }

    ctx.restore();
  }
}
