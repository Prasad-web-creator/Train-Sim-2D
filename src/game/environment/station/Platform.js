/**
 * Platform.js
 * High-clarity 2D illustrated station platform infrastructure for all 5 themes:
 * - Colonial red brick masonry face wall with mortar courses and foundation stone footer
 * - Heavy cut granite coping stone blocks with alternating shades and beveled highlights
 * - Vibrant Indian Railways tactile yellow safety line with 3D blister warning dots
 * - Rear boundary brick wall with coping stones (matching real Indian railway station architecture)
 * - Ornate Victorian teak wood benches and detailed station amenities (Chai stall, Water cooler, Fire buckets)
 */

import { drawRoundedRect, drawRivet } from '../../../utils/CanvasUtils.js';
import { getStationThemeProfile, cons_STATION_THEMES } from './StationTheme.js';

export class Platform {
  /**
   * Initializes platform dimensions, canopies, benches, and thematic equipment.
   */
  constructor(themeKey = cons_STATION_THEMES.INDIAN, startDistMeters = 50, lengthMeters = 160, stationName = 'CENTRAL') {
    this.themeKey = themeKey;
    this.theme = getStationThemeProfile(themeKey);
    this.startDistMeters = startDistMeters;
    this.lengthMeters = lengthMeters;
    this.endDistMeters = startDistMeters + lengthMeters;
    this.stationName = stationName;

    this.heightPixels = this.theme.platform.heightPixels || 36; // Platform elevation (~36px)
    this.rampLengthMeters = this.theme.platform.rampLengthMeters || 8; // Access ramp length (~8m)

    this.arr_canopies = [];
    this.arr_benches = [];
    this.arr_equipment = [];

    this.populateLayout();
  }

  /**
   * Builds deterministic platform amenities layout.
   */
  populateLayout() {
    const tmp_midDist = this.startDistMeters + this.lengthMeters * 0.5;

    // Platform roof canopy shelters (placed centrally along platform)
    const tmp_canopyW = this.theme.canopy.widthMeters;
    this.arr_canopies.push({
      dist: tmp_midDist - 25,
      widthMeters: tmp_canopyW,
    });
    if (this.lengthMeters > 180) {
      this.arr_canopies.push({
        dist: tmp_midDist + 45,
        widthMeters: tmp_canopyW * 0.85,
      });
    }

    // Platform benches (spaced every 36 meters)
    for (let tmp_d = this.startDistMeters + 18; tmp_d < this.endDistMeters - 18; tmp_d += 36) {
      this.arr_benches.push({ dist: tmp_d });
    }

    // Theme-specific station equipment items
    if (this.themeKey === cons_STATION_THEMES.INDIAN) {
      this.arr_equipment.push({ type: 'chai_stall', dist: tmp_midDist - 42 });
      this.arr_equipment.push({ type: 'water_cooler', dist: tmp_midDist + 22 });
      this.arr_equipment.push({ type: 'station_master_bell', dist: tmp_midDist - 5 });
      this.arr_equipment.push({ type: 'fire_buckets', dist: this.startDistMeters + 24 });
    } else if (this.themeKey === cons_STATION_THEMES.MOUNTAIN) {
      this.arr_equipment.push({ type: 'fire_log_stack', dist: tmp_midDist - 35 });
      this.arr_equipment.push({ type: 'snow_shovel_rack', dist: tmp_midDist + 28 });
      this.arr_equipment.push({ type: 'ski_crate', dist: this.startDistMeters + 22 });
    } else if (this.themeKey === cons_STATION_THEMES.URBAN) {
      this.arr_equipment.push({ type: 'digital_turnstile', dist: tmp_midDist - 38 });
      this.arr_equipment.push({ type: 'modern_waste_bin', dist: tmp_midDist + 32 });
      this.arr_equipment.push({ type: 'arrival_screen', dist: tmp_midDist });
    } else if (this.themeKey === cons_STATION_THEMES.RURAL) {
      this.arr_equipment.push({ type: 'hand_pump_well', dist: tmp_midDist - 28 });
      this.arr_equipment.push({ type: 'milk_churns', dist: tmp_midDist + 26 });
      this.arr_equipment.push({ type: 'baggage_handcart', dist: this.startDistMeters + 20 });
    } else {
      // Industrial
      this.arr_equipment.push({ type: 'oil_drums', dist: tmp_midDist - 34 });
      this.arr_equipment.push({ type: 'wooden_pallets', dist: tmp_midDist + 28 });
      this.arr_equipment.push({ type: 'freight_scale', dist: this.startDistMeters + 25 });
    }
  }

  /**
   * Renders the platform physical base, brickwork, granite coping blocks, and 3D tactile line.
   */
  renderBase(ctx, ppm, trackElevationFn) {
    ctx.save();
    const tmp_sampleStep = 2.0;

    const tmp_rampStartDist = this.startDistMeters;
    const tmp_flatStartDist = this.startDistMeters + this.rampLengthMeters;
    const tmp_flatEndDist = this.endDistMeters - this.rampLengthMeters;
    const tmp_rampEndDist = this.endDistMeters;

    const tmp_startX = Math.round(tmp_rampStartDist * ppm);
    const tmp_endX = Math.round(tmp_rampEndDist * ppm);
    const tmp_totalW = tmp_endX - tmp_startX;

    // 1. Platform vertical face wall profile
    ctx.beginPath();
    let tmp_first = true;
    for (let tmp_d = tmp_rampStartDist; tmp_d <= tmp_rampEndDist; tmp_d += tmp_sampleStep) {
      const tmp_x = tmp_d * ppm;
      const tmp_trackY = trackElevationFn(tmp_d);

      let tmp_h = this.heightPixels;
      if (tmp_d < tmp_flatStartDist) {
        const tmp_ratio = (tmp_d - tmp_rampStartDist) / this.rampLengthMeters;
        tmp_h = this.heightPixels * Math.max(0.1, tmp_ratio);
      } else if (tmp_d > tmp_flatEndDist) {
        const tmp_ratio = (tmp_rampEndDist - tmp_d) / this.rampLengthMeters;
        tmp_h = this.heightPixels * Math.max(0.1, tmp_ratio);
      }

      const tmp_surfY = tmp_trackY - tmp_h;
      if (tmp_first) {
        ctx.moveTo(tmp_x, tmp_surfY);
        tmp_first = false;
      } else {
        ctx.lineTo(tmp_x, tmp_surfY);
      }
    }

    // Bottom edge on track ballast level
    for (let tmp_d = tmp_rampEndDist; tmp_d >= tmp_rampStartDist; tmp_d -= tmp_sampleStep) {
      const tmp_x = tmp_d * ppm;
      const tmp_y = trackElevationFn(tmp_d) + 5;
      ctx.lineTo(tmp_x, tmp_y);
    }
    ctx.closePath();

    // Fill face wall (Deep colonial red brick / stone base)
    ctx.fillStyle = this.theme.platform.baseWallColor || '#991b1b';
    ctx.fill();

    // Clip to wall area to render rich brick masonry courses
    ctx.save();
    ctx.clip();

    const tmp_baseY = trackElevationFn(tmp_flatStartDist);
    const tmp_wallTopY = tmp_baseY - this.heightPixels;

    // Horizontal white lime mortar lines every 5px
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1;
    for (let tmp_my = tmp_wallTopY + 8; tmp_my <= tmp_baseY + 4; tmp_my += 5) {
      ctx.beginPath();
      ctx.moveTo(tmp_startX, tmp_my);
      ctx.lineTo(tmp_endX, tmp_my);
      ctx.stroke();
    }

    // Staggered vertical brick joints every 11px
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    let tmp_rowIdx = 0;
    for (let tmp_my = tmp_wallTopY + 8; tmp_my <= tmp_baseY + 4; tmp_my += 5) {
      const tmp_stagger = (tmp_rowIdx % 2) * 5.5;
      for (let tmp_bx = tmp_startX + tmp_stagger; tmp_bx <= tmp_endX; tmp_bx += 11) {
        ctx.beginPath();
        ctx.moveTo(tmp_bx, tmp_my);
        ctx.lineTo(tmp_bx, tmp_my + 5);
        ctx.stroke();
      }
      tmp_rowIdx++;
    }

    // Foundation stone footer along ballast line
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(tmp_startX, tmp_baseY - 2, tmp_totalW, 8);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(tmp_startX, tmp_baseY - 2, tmp_totalW, 8);

    // Deep cast shadow directly underneath the granite coping ledge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(tmp_startX, tmp_wallTopY + 6, tmp_totalW, 4);

    ctx.restore(); // Exit wall clip

    // 2. Platform Paved Top Surface Slab
    const tmp_slabTopY = trackElevationFn(tmp_flatStartDist) - this.heightPixels;
    ctx.fillStyle = '#64748b'; // Paved stone slab base
    ctx.fillRect(tmp_startX, tmp_slabTopY, tmp_totalW, 6);

    // Subtle paving flagstone joint lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 0.8;
    for (let tmp_px = tmp_startX; tmp_px <= tmp_endX; tmp_px += 16) {
      ctx.beginPath();
      ctx.moveTo(tmp_px, tmp_slabTopY);
      ctx.lineTo(tmp_px, tmp_slabTopY + 6);
      ctx.stroke();
    }

    // 3. Heavy Cut Granite Coping Stones (Alternating stone blocks along edge)
    const tmp_copingH = 6;
    const tmp_blockLen = 22;
    for (let tmp_cx = tmp_startX; tmp_cx < tmp_endX; tmp_cx += tmp_blockLen) {
      const tmp_isAlt = (Math.floor(tmp_cx / tmp_blockLen) % 2 === 0);
      ctx.fillStyle = tmp_isAlt ? '#f1f5f9' : '#cbd5e1';
      ctx.fillRect(tmp_cx, tmp_slabTopY, tmp_blockLen, tmp_copingH);

      // Vertical joint between granite blocks
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tmp_cx, tmp_slabTopY);
      ctx.lineTo(tmp_cx, tmp_slabTopY + tmp_copingH);
      ctx.stroke();
    }

    // Top bevel highlight line on coping edge
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(tmp_startX, tmp_slabTopY, tmp_totalW, 1.2);

    // 4. Vibrant Indian Railways Yellow Tactile Warning Line with 3D Blister Dots
    const tmp_tactileY = tmp_slabTopY + 6;
    const tmp_flatStartX = Math.round(tmp_flatStartDist * ppm);
    const tmp_flatEndX = Math.round(tmp_flatEndDist * ppm);
    const tmp_tactileW = tmp_flatEndX - tmp_flatStartX;

    // Vibrant canary yellow safety strip
    ctx.fillStyle = '#facc15';
    ctx.fillRect(tmp_flatStartX, tmp_tactileY, tmp_tactileW, 4.5);
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(tmp_flatStartX, tmp_tactileY, tmp_tactileW, 4.5);

    // 3D tactile blister dots / grip bumps
    for (let tmp_tx = tmp_flatStartX + 3; tmp_tx < tmp_flatEndX - 3; tmp_tx += 6) {
      // Blister shadow
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(tmp_tx, tmp_tactileY + 2.5, 1.4, 0, Math.PI * 2);
      ctx.fill();
      // Blister highlight
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(tmp_tx - 0.4, tmp_tactileY + 1.8, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Diagonal High-Visibility Hazard Warning Stripes on Ramps
    this.renderRampStripes(ctx, tmp_startX, trackElevationFn(tmp_rampStartDist) - this.heightPixels * 0.5, this.rampLengthMeters * ppm);
    this.renderRampStripes(ctx, tmp_flatEndX, trackElevationFn(tmp_flatEndDist) - this.heightPixels * 0.5, this.rampLengthMeters * ppm);

    ctx.restore();
  }

  /**
   * Renders high-contrast diagonal hazard stripes on platform end ramps.
   */
  renderRampStripes(ctx, startX, y, widthPixels) {
    ctx.save();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(startX, y, widthPixels, 5);
    ctx.fillStyle = '#18181b';
    for (let tmp_rx = startX; tmp_rx < startX + widthPixels; tmp_rx += 10) {
      ctx.beginPath();
      ctx.moveTo(tmp_rx, y + 5);
      ctx.lineTo(tmp_rx + 5, y + 5);
      ctx.lineTo(tmp_rx + 8, y);
      ctx.lineTo(tmp_rx + 3, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * Renders platform roof shelters / canopies.
   */
  renderCanopies(ctx, ppm, trackElevationFn) {
    for (let tmp_i = 0; tmp_i < this.arr_canopies.length; tmp_i++) {
      const obj_c = this.arr_canopies[tmp_i];
      const tmp_x = obj_c.dist * ppm;
      const tmp_groundY = trackElevationFn(obj_c.dist) - this.heightPixels;
      const tmp_w = obj_c.widthMeters * ppm;
      const tmp_halfW = tmp_w * 0.5;

      ctx.save();
      const tmp_style = this.theme.canopy.style;

      if (tmp_style === 'corrugated_curved') {
        // Indian curved corrugated iron canopy
        const tmp_canopyY = tmp_groundY - 58;

        // Curved rail-blue corrugated sheet roof
        ctx.fillStyle = this.theme.canopy.sheetColor;
        ctx.beginPath();
        ctx.moveTo(tmp_x - tmp_halfW, tmp_canopyY);
        ctx.quadraticCurveTo(tmp_x, tmp_canopyY - 22, tmp_x + tmp_halfW, tmp_canopyY);
        ctx.lineTo(tmp_x + tmp_halfW, tmp_canopyY + 6);
        ctx.quadraticCurveTo(tmp_x, tmp_canopyY - 16, tmp_x - tmp_halfW, tmp_canopyY + 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Structural steel support columns with angle brackets
        ctx.fillStyle = this.theme.canopy.pillarColor;
        const tmp_colStep = tmp_w / 3;
        for (let tmp_ci = 0; tmp_ci < 3; tmp_ci++) {
          const tmp_cx = tmp_x - tmp_halfW + 18 + tmp_ci * tmp_colStep;
          ctx.fillRect(tmp_cx - 2.5, tmp_canopyY + 2, 5, 58);
          // Angle brackets
          ctx.strokeStyle = this.theme.canopy.trussColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tmp_cx - 10, tmp_canopyY + 12);
          ctx.lineTo(tmp_cx, tmp_canopyY + 22);
          ctx.lineTo(tmp_cx + 10, tmp_canopyY + 12);
          ctx.stroke();
        }
      } else if (tmp_style === 'timber_truss') {
        // Mountain alpine timber pitched roof canopy
        const tmp_canopyY = tmp_groundY - 54;

        ctx.fillStyle = this.theme.canopy.sheetColor;
        ctx.beginPath();
        ctx.moveTo(tmp_x - tmp_halfW, tmp_canopyY);
        ctx.lineTo(tmp_x, tmp_canopyY - 26);
        ctx.lineTo(tmp_x + tmp_halfW, tmp_canopyY);
        ctx.lineTo(tmp_x + tmp_halfW, tmp_canopyY + 6);
        ctx.lineTo(tmp_x, tmp_canopyY - 20);
        ctx.lineTo(tmp_x - tmp_halfW, tmp_canopyY + 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Snow trim
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(tmp_x - 12, tmp_canopyY - 28, 24, 4);

        // Timber posts
        ctx.fillStyle = this.theme.canopy.pillarColor;
        ctx.fillRect(tmp_x - tmp_halfW * 0.5 - 3, tmp_canopyY, 6, 54);
        ctx.fillRect(tmp_x + tmp_halfW * 0.5 - 3, tmp_canopyY, 6, 54);
      } else {
        // Urban / Default canopy
        const tmp_canopyY = tmp_groundY - 62;
        ctx.fillStyle = '#334155';
        ctx.fillRect(tmp_x - tmp_halfW, tmp_canopyY, tmp_w, 6);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(tmp_x - tmp_halfW * 0.5 - 3, tmp_canopyY, 6, 62);
        ctx.fillRect(tmp_x + tmp_halfW * 0.5 - 3, tmp_canopyY, 6, 62);
      }

      ctx.restore();
    }
  }

  /**
   * Renders high-clarity platform benches with Victorian cast-iron scrolled ends and varnished teak slats.
   */
  renderBenches(ctx, ppm, trackElevationFn) {
    for (let tmp_i = 0; tmp_i < this.arr_benches.length; tmp_i++) {
      const obj_b = this.arr_benches[tmp_i];
      const tmp_x = Math.round(obj_b.dist * ppm);
      const tmp_groundY = Math.round(trackElevationFn(obj_b.dist) - this.heightPixels);

      ctx.save();
      const tmp_benchW = 28;
      const tmp_benchH = 15;

      // Contact ground shadow under bench
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(tmp_x, tmp_groundY, tmp_benchW * 0.5 + 2, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Victorian cast-iron curved frame & legs
      ctx.fillStyle = '#14532d'; // Classic British railway dark green cast iron
      ctx.fillRect(tmp_x - tmp_benchW * 0.5, tmp_groundY - tmp_benchH, 3.5, tmp_benchH);
      ctx.fillRect(tmp_x + tmp_benchW * 0.5 - 3.5, tmp_groundY - tmp_benchH, 3.5, tmp_benchH);

      // Varnished teak wood backrest slats
      ctx.fillStyle = '#b45309';
      ctx.fillRect(tmp_x - tmp_benchW * 0.5 - 2, tmp_groundY - tmp_benchH, tmp_benchW + 4, 3.2);
      ctx.fillStyle = '#d97706'; // Slats highlight
      ctx.fillRect(tmp_x - tmp_benchW * 0.5 - 2, tmp_groundY - tmp_benchH + 4, tmp_benchW + 4, 3);

      // Varnished teak wood seat slats
      ctx.fillStyle = '#b45309';
      ctx.fillRect(tmp_x - tmp_benchW * 0.5 - 2, tmp_groundY - 9, tmp_benchW + 4, 3.5);

      // Golden brass ornamental plate in center
      ctx.fillStyle = '#facc15';
      ctx.fillRect(tmp_x - 3, tmp_groundY - tmp_benchH + 1, 6, 1.5);

      ctx.restore();
    }
  }

  /**
   * Renders authentic station equipment with rich clarity along the platform.
   */
  renderEquipment(ctx, ppm, trackElevationFn) {
    for (let tmp_i = 0; tmp_i < this.arr_equipment.length; tmp_i++) {
      const obj_eq = this.arr_equipment[tmp_i];
      const tmp_x = Math.round(obj_eq.dist * ppm);
      const tmp_groundY = Math.round(trackElevationFn(obj_eq.dist) - this.heightPixels);

      ctx.save();

      // Ground contact shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(tmp_x, tmp_groundY, 14, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      if (obj_eq.type === 'chai_stall') {
        // Indian Railway Chai Tea Stall
        // Teak wood booth
        ctx.fillStyle = '#78350f';
        ctx.fillRect(tmp_x - 16, tmp_groundY - 20, 32, 20);
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(tmp_x - 16, tmp_groundY - 20, 32, 20);

        // Blue & White striped awning
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(tmp_x - 18, tmp_groundY - 28, 36, 8);
        ctx.fillStyle = '#ffffff';
        for (let tmp_ax = tmp_x - 18; tmp_ax < tmp_x + 18; tmp_ax += 8) {
          ctx.fillRect(tmp_ax, tmp_groundY - 28, 4, 8);
        }

        // Brass Chai Samovar / Kettle
        ctx.fillStyle = '#d97706';
        ctx.fillRect(tmp_x - 8, tmp_groundY - 27, 16, 9);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(tmp_x - 4, tmp_groundY - 30, 8, 3); // Lid

        // Steam wisp
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(tmp_x, tmp_groundY - 30);
        ctx.quadraticCurveTo(tmp_x + 3, tmp_groundY - 36, tmp_x, tmp_groundY - 42);
        ctx.stroke();

        // "CHAI" sign
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CHAI', tmp_x, tmp_groundY - 10);
      } else if (obj_eq.type === 'water_cooler') {
        // Stainless Steel "PANI / WATER" Cooler
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(tmp_x - 9, tmp_groundY - 25, 18, 25);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(tmp_x - 9, tmp_groundY - 25, 18, 25);

        // Blue sign plaque
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(tmp_x - 8, tmp_groundY - 23, 16, 6);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 6px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('WATER', tmp_x, tmp_groundY - 18);

        // Chrome taps
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(tmp_x - 5, tmp_groundY - 13, 3, 3);
        ctx.fillRect(tmp_x + 2, tmp_groundY - 13, 3, 3);
      } else if (obj_eq.type === 'fire_buckets') {
        // Stand with 3 red fire buckets
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(tmp_x - 12, tmp_groundY - 18, 24, 3);
        ctx.fillRect(tmp_x - 11, tmp_groundY - 18, 2.5, 18);
        ctx.fillRect(tmp_x + 8.5, tmp_groundY - 18, 2.5, 18);

        // 3 Red Conical Buckets
        const arr_bx = [tmp_x - 8, tmp_x, tmp_x + 8];
        for (let i = 0; i < arr_bx.length; i++) {
          const bx = arr_bx[i];
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(bx - 3, tmp_groundY - 15);
          ctx.lineTo(bx + 3, tmp_groundY - 15);
          ctx.lineTo(bx + 2, tmp_groundY - 7);
          ctx.lineTo(bx - 2, tmp_groundY - 7);
          ctx.closePath();
          ctx.fill();

          // White "FIRE" text indicator
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx - 1.5, tmp_groundY - 12, 3, 1.5);
        }
      } else if (obj_eq.type === 'station_master_bell') {
        // Brass bell on stand
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(tmp_x - 2, tmp_groundY - 30, 4, 30);
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(tmp_x - 6, tmp_groundY - 22);
        ctx.lineTo(tmp_x + 6, tmp_groundY - 22);
        ctx.lineTo(tmp_x + 3, tmp_groundY - 29);
        ctx.lineTo(tmp_x - 3, tmp_groundY - 29);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * Renders realistic platform rear boundary wall with stone coping.
   * Sits neatly behind platform amenities and passengers without obstructing them.
   */
  renderFence(ctx, ppm, trackElevationFn) {
    ctx.save();
    const tmp_groundY = trackElevationFn(this.startDistMeters) - this.heightPixels;
    const tmp_startX = Math.round(this.startDistMeters * ppm);
    const tmp_lenX = Math.round(this.lengthMeters * ppm);
    const tmp_wallH = 24; // Height of rear boundary wall

    // Rear Brick Boundary Wall Body
    ctx.fillStyle = '#64748b'; // Weathered masonry wall
    ctx.fillRect(tmp_startX, tmp_groundY - tmp_wallH, tmp_lenX, tmp_wallH);

    // Horizontal brick mortar courses
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    for (let tmp_wy = tmp_groundY - tmp_wallH + 5; tmp_wy < tmp_groundY; tmp_wy += 5) {
      ctx.beginPath();
      ctx.moveTo(tmp_startX, tmp_wy);
      ctx.lineTo(tmp_startX + tmp_lenX, tmp_wy);
      ctx.stroke();
    }

    // Vertical brick joints
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.lineWidth = 1;
    let tmp_row = 0;
    for (let tmp_wy = tmp_groundY - tmp_wallH + 5; tmp_wy < tmp_groundY; tmp_wy += 5) {
      const tmp_stagger = (tmp_row % 2) * 6;
      for (let tmp_wx = tmp_startX + tmp_stagger; tmp_wx < tmp_startX + tmp_lenX; tmp_wx += 12) {
        ctx.beginPath();
        ctx.moveTo(tmp_wx, tmp_wy);
        ctx.lineTo(tmp_wx, tmp_wy + 5);
        ctx.stroke();
      }
      tmp_row++;
    }

    // Granite Stone Coping along the top edge of the boundary wall
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(tmp_startX, tmp_groundY - tmp_wallH - 3, tmp_lenX, 4);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(tmp_startX, tmp_groundY - tmp_wallH - 3, tmp_lenX, 4);

    // Coping block segments every 24px
    for (let tmp_cx = tmp_startX; tmp_cx < tmp_startX + tmp_lenX; tmp_cx += 24) {
      ctx.beginPath();
      ctx.moveTo(tmp_cx, tmp_groundY - tmp_wallH - 3);
      ctx.lineTo(tmp_cx, tmp_groundY - tmp_wallH + 1);
      ctx.stroke();
    }

    ctx.restore();
  }
}
