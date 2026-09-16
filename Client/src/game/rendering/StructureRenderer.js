/**
 * StructureRenderer.js
 * Procedural vector illustrations for railway architecture: station depots, canopies, water towers,
 * freight warehouses, signals, trestle bridges, stone tunnel portals, and cutaway soil.
 */

import { drawRoundedRect, drawRivet } from '../../utils/CanvasUtils.js';
import { cons_GAME_CONFIG } from '../../constants/GameConstants.js';

export class StructureRenderer {
  /**
   * Initializes structure renderer caches.
   */
  constructor() {
    this.ppm = cons_GAME_CONFIG.PIXELS_PER_METER;
  }

  /**
   * Renders a 2-story brick station passenger depot building with arched windows and slate roof.
   */
  renderStationDepot(ctx, x, groundY, widthMeters, heightMeters, name, buildingLightsActive = false) {
    ctx.save();
    const tmp_w = widthMeters * this.ppm;
    const tmp_h = heightMeters * this.ppm * 0.45;
    const tmp_halfW = tmp_w * 0.5;

    // Main brick building wall
    ctx.fillStyle = '#991b1b'; // Red brick
    drawRoundedRect(ctx, x - tmp_halfW, groundY - tmp_h, tmp_w, tmp_h, 4);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Brick mortar lines (subtle)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    for (let tmp_by = groundY - tmp_h + 14; tmp_by < groundY - 6; tmp_by += 12) {
      ctx.beginPath();
      ctx.moveTo(x - tmp_halfW + 4, tmp_by);
      ctx.lineTo(x + tmp_halfW - 4, tmp_by);
      ctx.stroke();
    }

    // Pitched slate roof
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(x - tmp_halfW - 16, groundY - tmp_h);
    ctx.lineTo(x, groundY - tmp_h - 38);
    ctx.lineTo(x + tmp_halfW + 16, groundY - tmp_h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Roof chimney
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(x + tmp_halfW * 0.4, groundY - tmp_h - 48, 14, 26);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + tmp_halfW * 0.4 - 2, groundY - tmp_h - 52, 18, 6);

    // Arched glass windows (upper floor) - daytime cyan blue vs nighttime incandescent warm amber
    const tmp_winColor = buildingLightsActive ? '#fef08a' : '#38bdf8';
    ctx.fillStyle = tmp_winColor;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    const tmp_winStep = tmp_w / 4;
    for (let tmp_wi = 1; tmp_wi <= 3; tmp_wi++) {
      const tmp_wx = x - tmp_halfW + tmp_wi * tmp_winStep;
      drawRoundedRect(ctx, tmp_wx - 10, groundY - tmp_h + 20, 20, 26, 6);
      ctx.fill();
      ctx.stroke();

      // At night / evening, project warm window glow halo into environment
      if (buildingLightsActive) {
        ctx.save();
        const tmp_glowGrad = ctx.createRadialGradient(tmp_wx, groundY - tmp_h + 33, 4, tmp_wx, groundY - tmp_h + 33, 24);
        tmp_glowGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        tmp_glowGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.15)');
        tmp_glowGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = tmp_glowGrad;
        ctx.beginPath();
        ctx.arc(tmp_wx, groundY - tmp_h + 33, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Ground floor arched entrance door
    ctx.fillStyle = '#78350f';
    drawRoundedRect(ctx, x - 15, groundY - 48, 30, 48, 6);
    ctx.fill();
    ctx.stroke();

    // Station Nameboard on facade (dynamically sized to fit text)
    const tmp_displayName = name || 'STATION';
    ctx.font = 'bold 11px "Rajdhani", sans-serif';
    const tmp_nameW = Math.max(96, Math.round(ctx.measureText(tmp_displayName).width + 24));
    ctx.fillStyle = '#0284c7';
    drawRoundedRect(ctx, x - tmp_nameW * 0.5, groundY - tmp_h + 60, tmp_nameW, 18, 3);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tmp_displayName, x, groundY - tmp_h + 69);

    ctx.restore();
  }

  /**
   * Renders steel and glass curved passenger platform canopy.
   */
  renderStationCanopy(ctx, x, groundY, widthMeters, heightMeters) {
    ctx.save();
    const tmp_w = widthMeters * this.ppm;
    const tmp_halfW = tmp_w * 0.5;
    const tmp_canopyY = groundY - 78;

    // Curved glass canopy roof
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.beginPath();
    ctx.moveTo(x - tmp_halfW, tmp_canopyY);
    ctx.quadraticCurveTo(x, tmp_canopyY - 24, x + tmp_halfW, tmp_canopyY);
    ctx.lineTo(x + tmp_halfW, tmp_canopyY + 6);
    ctx.quadraticCurveTo(x, tmp_canopyY - 18, x - tmp_halfW, tmp_canopyY + 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Steel support columns with brackets
    ctx.fillStyle = '#334155';
    const tmp_colStep = tmp_w / 3;
    for (let tmp_ci = 0; tmp_ci < 3; tmp_ci++) {
      const tmp_cx = x - tmp_halfW + 24 + tmp_ci * tmp_colStep;
      ctx.fillRect(tmp_cx - 3, tmp_canopyY + 2, 6, 76);
      // Angle bracket
      ctx.beginPath();
      ctx.moveTo(tmp_cx - 12, tmp_canopyY + 12);
      ctx.lineTo(tmp_cx, tmp_canopyY + 24);
      ctx.lineTo(tmp_cx + 12, tmp_canopyY + 12);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#334155';
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Renders a classic wooden railway water tank tower on heavy timber trestle legs.
   */
  renderWaterTower(ctx, x, groundY) {
    ctx.save();
    const tmp_tankW = 56;
    const tmp_tankH = 52;
    const tmp_legsH = 88;
    const tmp_tankY = groundY - tmp_legsH - tmp_tankH;

    // 4 Heavy timber trestle legs with cross-braces
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(x - 22, groundY);
    ctx.lineTo(x - 16, tmp_tankY + tmp_tankH);
    ctx.moveTo(x + 22, groundY);
    ctx.lineTo(x + 16, tmp_tankY + tmp_tankH);
    ctx.stroke();

    // Leg X-cross bracing
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 21, groundY - 20);
    ctx.lineTo(x + 19, groundY - 65);
    ctx.moveTo(x + 21, groundY - 20);
    ctx.lineTo(x - 19, groundY - 65);
    ctx.stroke();

    // Round wooden barrel water tank
    ctx.fillStyle = '#b45309';
    drawRoundedRect(ctx, x - tmp_tankW * 0.5, tmp_tankY, tmp_tankW, tmp_tankH, 3);
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Black steel compression hoops around tank
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - tmp_tankW * 0.5 - 1, tmp_tankY + 10, tmp_tankW + 2, 3);
    ctx.fillRect(x - tmp_tankW * 0.5 - 1, tmp_tankY + 26, tmp_tankW + 2, 3);
    ctx.fillRect(x - tmp_tankW * 0.5 - 1, tmp_tankY + 42, tmp_tankW + 2, 3);

    // Conical roof
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(x - tmp_tankW * 0.5 - 6, tmp_tankY);
    ctx.lineTo(x, tmp_tankY - 22);
    ctx.lineTo(x + tmp_tankW * 0.5 + 6, tmp_tankY);
    ctx.closePath();
    ctx.fill();

    // Water level indicator board on side
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + tmp_tankW * 0.5 + 3, tmp_tankY + 8, 5, 36);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + tmp_tankW * 0.5 + 2, tmp_tankY + 18, 7, 4);

    // Flexible rubber water refill spout hanging downward
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 18, tmp_tankY + tmp_tankH - 8);
    ctx.quadraticCurveTo(x - 38, tmp_tankY + tmp_tankH + 18, x - 28, groundY - 35);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Renders multi-story brick freight warehouse with rolling cargo bay doors.
   */
  renderBrickWarehouse(ctx, x, groundY, widthMeters, heightMeters, buildingLightsActive = false) {
    ctx.save();
    const tmp_w = widthMeters * this.ppm * 0.7;
    const tmp_h = heightMeters * this.ppm * 0.5;
    const tmp_halfW = tmp_w * 0.5;

    // Brick building
    ctx.fillStyle = '#7c2d12';
    drawRoundedRect(ctx, x - tmp_halfW, groundY - tmp_h, tmp_w, tmp_h, 3);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Corrugated iron shed roof
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(x - tmp_halfW - 8, groundY - tmp_h);
    ctx.lineTo(x + tmp_halfW + 8, groundY - tmp_h - 14);
    ctx.lineTo(x + tmp_halfW + 8, groundY - tmp_h - 8);
    ctx.lineTo(x - tmp_halfW - 8, groundY - tmp_h + 4);
    ctx.closePath();
    ctx.fill();

    // Upper clerestory windows (glow warm amber at night)
    const tmp_winY = groundY - tmp_h + 12;
    const tmp_winColor = buildingLightsActive ? '#fef08a' : '#38bdf8';
    const tmp_numWins = Math.max(2, Math.floor(tmp_w / 38));
    const tmp_winSpacing = tmp_w / (tmp_numWins + 1);

    for (let tmp_wi = 1; tmp_wi <= tmp_numWins; tmp_wi++) {
      const tmp_wx = x - tmp_halfW + tmp_wi * tmp_winSpacing;
      ctx.fillStyle = tmp_winColor;
      drawRoundedRect(ctx, tmp_wx - 7, tmp_winY, 14, 10, 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      if (buildingLightsActive) {
        ctx.save();
        ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
        ctx.beginPath();
        ctx.arc(tmp_wx, tmp_winY + 5, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Roll-up industrial cargo bay doors
    const tmp_doorW = 42;
    const tmp_doorH = 50;
    const tmp_numDoors = Math.floor((tmp_w - 30) / (tmp_doorW + 20));
    const tmp_startDoorX = x - tmp_halfW + 20;

    for (let tmp_di = 0; tmp_di < tmp_numDoors; tmp_di++) {
      const tmp_dx = tmp_startDoorX + tmp_di * (tmp_doorW + 18);
      ctx.fillStyle = '#1e293b';
      drawRoundedRect(ctx, tmp_dx, groundY - tmp_doorH, tmp_doorW, tmp_doorH, 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Yellow/black warning hazard stripes at bottom of door
      ctx.fillStyle = '#facc15';
      ctx.fillRect(tmp_dx, groundY - 6, tmp_doorW, 6);
    }

    ctx.restore();
  }

  /**
   * Renders color-light railway block signal with illuminated aspects (green, amber, or red).
   */
  renderRailwaySignal(ctx, x, groundY, aspect = 'green') {
    ctx.save();
    const tmp_mastH = 75;
    const tmp_headY = groundY - tmp_mastH;

    // Steel mast
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 2.5, groundY - tmp_mastH, 5, tmp_mastH);

    // Circular background target plate
    ctx.beginPath();
    ctx.arc(x, tmp_headY + 12, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pulse animation factor based on time
    const tmp_pulse = 0.85 + Math.sin(Date.now() * 0.006) * 0.15;

    // Signal aspect lamps
    const arr_colors = [
      { id: 'red', color: '#ef4444', glow: 'rgba(239, 68, 68,', y: tmp_headY + 5 },
      { id: 'amber', color: '#f59e0b', glow: 'rgba(245, 158, 11,', y: tmp_headY + 12 },
      { id: 'green', color: '#22c55e', glow: 'rgba(34, 197, 94,', y: tmp_headY + 19 },
    ];

    for (let tmp_i = 0; tmp_i < arr_colors.length; tmp_i++) {
      const obj_c = arr_colors[tmp_i];
      const tmp_isActive = obj_c.id === aspect;

      // Outer hood visor
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(x, obj_c.y, 4.5, Math.PI, 0);
      ctx.fill();

      // Lamp bulb casing
      ctx.beginPath();
      ctx.arc(x, obj_c.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = tmp_isActive ? obj_c.color : '#1e293b';
      ctx.fill();

      // Pulsing glow halo & Fresnel lens flare when active
      if (tmp_isActive) {
        // Hot-white core highlight
        ctx.beginPath();
        ctx.arc(x, obj_c.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Pulsing halo radial gradient
        const tmp_haloRadius = 14 * tmp_pulse;
        const tmp_haloGrad = ctx.createRadialGradient(x, obj_c.y, 1.5, x, obj_c.y, tmp_haloRadius);
        tmp_haloGrad.addColorStop(0, `${obj_c.glow} ${0.75 * tmp_pulse})`);
        tmp_haloGrad.addColorStop(0.35, `${obj_c.glow} ${0.35 * tmp_pulse})`);
        tmp_haloGrad.addColorStop(1, `${obj_c.glow} 0)`);
        ctx.fillStyle = tmp_haloGrad;
        ctx.beginPath();
        ctx.arc(x, obj_c.y, tmp_haloRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Renders steel cantilever signal gantry bridge crossing overhead.
   */
  renderSignalGantry(ctx, x, groundY, aspect = 'green') {
    ctx.save();
    const tmp_gantryH = 120;
    const tmp_armLen = 80;

    // Vertical lattice tower
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 6, groundY);
    ctx.lineTo(x - 6, groundY - tmp_gantryH);
    ctx.moveTo(x + 6, groundY);
    ctx.lineTo(x + 6, groundY - tmp_gantryH);
    ctx.stroke();

    // Cantilever arm spanning over tracks
    ctx.beginPath();
    ctx.moveTo(x - 6, groundY - tmp_gantryH);
    ctx.lineTo(x + tmp_armLen, groundY - tmp_gantryH);
    ctx.moveTo(x - 6, groundY - tmp_gantryH + 14);
    ctx.lineTo(x + tmp_armLen, groundY - tmp_gantryH + 14);
    ctx.stroke();

    // Suspended signal head over track
    this.renderRailwaySignal(ctx, x + tmp_armLen - 15, groundY - tmp_gantryH + 35, aspect);

    ctx.restore();
  }

  /**
   * Renders wooden split-rail post-and-rail boundary fence along tracks.
   */
  renderWoodenFence(ctx, startX, groundY, lengthPixels) {
    ctx.save();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;

    // Horizontal rails
    ctx.beginPath();
    ctx.moveTo(startX, groundY - 14);
    ctx.lineTo(startX + lengthPixels, groundY - 14);
    ctx.moveTo(startX, groundY - 26);
    ctx.lineTo(startX + lengthPixels, groundY - 26);
    ctx.stroke();

    // Vertical posts every 32px
    ctx.fillStyle = '#451a03';
    for (let tmp_px = startX; tmp_px <= startX + lengthPixels; tmp_px += 32) {
      ctx.fillRect(tmp_px - 2.5, groundY - 32, 5, 32);
    }
    ctx.restore();
  }

  /**
   * Renders steel trestle bridge lattice tower piers descending into canyon ravine.
   */
  renderTrestlePiers(ctx, startDist, lengthMeters, ravineDepth, trackSystem) {
    ctx.save();
    const tmp_endDist = startDist + lengthMeters;

    for (let tmp_d = startDist + 15; tmp_d < tmp_endDist; tmp_d += 36) {
      const tmp_x = tmp_d * this.ppm;
      const tmp_trackY = trackSystem.getElevationAt(tmp_d);
      const tmp_canyonBottomY = tmp_trackY + ravineDepth;

      // Heavy vertical tower piers
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(tmp_x - 14, tmp_trackY + 14);
      ctx.lineTo(tmp_x - 22, tmp_canyonBottomY);
      ctx.moveTo(tmp_x + 14, tmp_trackY + 14);
      ctx.lineTo(tmp_x + 22, tmp_canyonBottomY);
      ctx.stroke();

      // Diagonal X lattice bracing
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#334155';
      const tmp_panelH = 45;
      for (let tmp_py = tmp_trackY + 14; tmp_py < tmp_canyonBottomY - 10; tmp_py += tmp_panelH) {
        ctx.beginPath();
        ctx.moveTo(tmp_x - 16, tmp_py);
        ctx.lineTo(tmp_x + 16, tmp_py + tmp_panelH);
        ctx.moveTo(tmp_x + 16, tmp_py);
        ctx.lineTo(tmp_x - 16, tmp_py + tmp_panelH);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /**
   * Renders classical horseshoe stone-masonry tunnel portal arch in foreground (Layer 6).
   */
  renderTunnelPortalArch(ctx, x, trackY, isEntrance = true) {
    ctx.save();
    const tmp_portalW = 140;
    const tmp_portalH = 160;
    const tmp_archR = 48;

    // Heavy stone masonry facade block above and flanking tracks
    ctx.fillStyle = '#334155';
    drawRoundedRect(ctx, x - tmp_portalW * 0.5, trackY - tmp_portalH, tmp_portalW, tmp_portalH, 4);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Classical horseshoe tunnel portal opening cut
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - tmp_archR, trackY - 95, tmp_archR * 2, 95);
    ctx.arc(x, trackY - 95, tmp_archR, Math.PI, 0, false);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'; // Pitch black inside portal
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();
    ctx.restore();

    // Keystone and radial stone arch voussoirs around portal rim
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    for (let tmp_a = Math.PI; tmp_a <= Math.PI * 2; tmp_a += Math.PI / 8) {
      const tmp_rx1 = x + Math.cos(tmp_a) * tmp_archR;
      const tmp_ry1 = (trackY - 95) + Math.sin(tmp_a) * tmp_archR;
      const tmp_rx2 = x + Math.cos(tmp_a) * (tmp_archR + 14);
      const tmp_ry2 = (trackY - 95) + Math.sin(tmp_a) * (tmp_archR + 14);
      ctx.beginPath();
      ctx.moveTo(tmp_rx1, tmp_ry1);
      ctx.lineTo(tmp_rx2, tmp_ry2);
      ctx.stroke();
    }

    // Portal cornice decorative parapet on top
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - tmp_portalW * 0.5 - 6, trackY - tmp_portalH - 8, tmp_portalW + 12, 10);

    ctx.restore();
  }

  /**
   * Renders foreground cutaway earth/soil cross-section with strata, pebbles, and tree roots (Layer 6).
   */
  renderCutawaySoil(ctx, startDist, endDist, trackSystem) {
    ctx.save();
    const tmp_sampleStep = 3.0;

    // Top edge along ballast bottom
    ctx.beginPath();
    let tmp_isFirst = true;
    for (let tmp_d = startDist; tmp_d <= endDist; tmp_d += tmp_sampleStep) {
      const tmp_x = tmp_d * this.ppm;
      const tmp_y = trackSystem.getElevationAt(tmp_d) + 17; // Directly below ballast bed
      if (tmp_isFirst) {
        ctx.moveTo(tmp_x, tmp_y);
        tmp_isFirst = false;
      } else {
        ctx.lineTo(tmp_x, tmp_y);
      }
    }

    // Bottom edge of screen cutaway
    for (let tmp_d = endDist; tmp_d >= startDist; tmp_d -= tmp_sampleStep) {
      const tmp_x = tmp_d * this.ppm;
      const tmp_y = trackSystem.getElevationAt(tmp_d) + 180;
      ctx.lineTo(tmp_x, tmp_y);
    }

    ctx.closePath();
    ctx.fillStyle = '#292524'; // Rich deep subsoil earth
    ctx.fill();

    // Dark soil horizon boundary line
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Occasional embedded soil pebbles and root tendrils
    ctx.fillStyle = '#57534e';
    for (let tmp_d = startDist + 15; tmp_d < endDist; tmp_d += 24) {
      const tmp_x = tmp_d * this.ppm;
      const tmp_y = trackSystem.getElevationAt(tmp_d) + 85;
      ctx.beginPath();
      ctx.arc(tmp_x, tmp_y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
