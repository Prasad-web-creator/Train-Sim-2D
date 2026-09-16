/**
 * StationBuilding.js
 * 2D illustrated architectural depot buildings for the 5 station themes:
 * - Colonial Red Brick & Lime Arched Depot (Indian)
 * - Alpine Cedar Timber & Granite Chalet with Steep Slate Roof (Mountain)
 * - Contemporary Curtain-Wall Steel & Glass Metro Hub (Urban)
 * - Horizontal Weatherboard Clapboard Whistle-Stop Depot (Rural)
 * - Industrial Multi-Bay Brick & Corrugated Freight Depot (Industrial)
 */

import { drawRoundedRect, drawRivet } from '../../../utils/CanvasUtils.js';
import { getStationThemeProfile, cons_STATION_THEMES } from './StationTheme.js';

export class StationBuilding {
  /**
   * Initializes station building dimensions and thematic styling.
   */
  constructor(themeKey = cons_STATION_THEMES.INDIAN, stationName = 'CENTRAL DEPOT', widthMeters = null, heightPixels = null) {
    this.themeKey = themeKey;
    this.theme = getStationThemeProfile(themeKey);
    this.stationName = stationName;

    this.width = (widthMeters || this.theme.building.widthMeters) * 16; // Pixels at 16 ppm
    this.height = heightPixels || this.theme.building.heightPixels;
  }

  /**
   * Renders the station building facade aligned with ground elevation.
   */
  render(ctx, x, groundY, scale = 1.0) {
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(scale, scale);

    const tmp_style = this.theme.building.style;

    if (tmp_style === 'colonial_brick') {
      this.renderColonialDepot(ctx);
    } else if (tmp_style === 'alpine_chalet') {
      this.renderAlpineChalet(ctx);
    } else if (tmp_style === 'modern_glass') {
      this.renderModernMetro(ctx);
    } else if (tmp_style === 'clapboard_depot') {
      this.renderRuralDepot(ctx);
    } else {
      this.renderIndustrialDepot(ctx);
    }

    ctx.restore();
  }

  /**
   * 1. Indian colonial red brick depot with white lime-plaster quoins, arched veranda, and tile roof.
   */
  renderColonialDepot(ctx) {
    const tmp_w = this.width;
    const tmp_h = this.height;
    const tmp_halfW = tmp_w * 0.5;

    // Main red brick building body
    ctx.fillStyle = this.theme.building.wallColor;
    drawRoundedRect(ctx, -tmp_halfW, -tmp_h, tmp_w, tmp_h, 3);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // White lime plaster corner quoins (alternating blocks)
    ctx.fillStyle = '#f8fafc';
    for (let tmp_qy = -tmp_h + 10; tmp_qy < -8; tmp_qy += 18) {
      ctx.fillRect(-tmp_halfW, tmp_qy, 10, 8);
      ctx.fillRect(tmp_halfW - 10, tmp_qy, 10, 8);
    }

    // Brick mortar lines (subtle horizontal stripes)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    for (let tmp_by = -tmp_h + 20; tmp_by < -12; tmp_by += 14) {
      ctx.beginPath();
      ctx.moveTo(-tmp_halfW + 12, tmp_by);
      ctx.lineTo(tmp_halfW - 12, tmp_by);
      ctx.stroke();
    }

    // Pitched terracotta Mangalore clay tile roof
    ctx.fillStyle = this.theme.building.roofColor;
    ctx.beginPath();
    ctx.moveTo(-tmp_halfW - 18, -tmp_h);
    ctx.lineTo(0, -tmp_h - 38);
    ctx.lineTo(tmp_halfW + 18, -tmp_h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Terracotta roof ridge tiles & finials
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(-tmp_halfW - 20, -tmp_h - 2, tmp_w + 40, 5);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-4, -tmp_h - 44, 8, 8); // Central roof ornament

    // Upper floor arched windows with white plaster moldings
    const tmp_numWins = 4;
    const tmp_step = (tmp_w - 60) / (tmp_numWins - 1);
    for (let tmp_i = 0; tmp_i < tmp_numWins; tmp_i++) {
      const tmp_wx = -tmp_halfW + 30 + tmp_i * tmp_step;
      const tmp_wy = -tmp_h + 22;

      // White plaster arch surround
      ctx.fillStyle = '#f8fafc';
      drawRoundedRect(ctx, tmp_wx - 10, tmp_wy - 4, 20, 26, 8);
      ctx.fill();

      // Arched glass window
      ctx.fillStyle = '#38bdf8';
      drawRoundedRect(ctx, tmp_wx - 7, tmp_wy, 14, 20, 6);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Window cross-mullions
      ctx.beginPath();
      ctx.moveTo(tmp_wx, tmp_wy);
      ctx.lineTo(tmp_wx, tmp_wy + 20);
      ctx.moveTo(tmp_wx - 7, tmp_wy + 10);
      ctx.lineTo(tmp_wx + 7, tmp_wy + 10);
      ctx.stroke();
    }

    // Ground floor arched veranda colonnade
    const tmp_numArches = 3;
    const tmp_archStep = (tmp_w - 70) / tmp_numArches;
    for (let tmp_j = 0; tmp_j < tmp_numArches; tmp_j++) {
      const tmp_ax = -tmp_halfW + 35 + tmp_j * tmp_archStep + tmp_archStep * 0.5;
      const tmp_archW = 28;

      // Veranda shadow arch
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.rect(tmp_ax - tmp_archW * 0.5, -45, tmp_archW, 45);
      ctx.arc(tmp_ax, -45, tmp_archW * 0.5, Math.PI, 0, false);
      ctx.closePath();
      ctx.fill();

      // White plaster arch rim & keystone
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(tmp_ax, -45, tmp_archW * 0.5 + 2, Math.PI, 0, false);
      ctx.stroke();

      // Central entrance door in middle arch
      if (tmp_j === 1) {
        ctx.fillStyle = this.theme.building.doorColor;
        ctx.fillRect(tmp_ax - 10, -42, 20, 42);
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(tmp_ax - 10, -42, 20, 42);
        // Brass door handles
        ctx.fillStyle = '#facc15';
        ctx.fillRect(tmp_ax - 2, -22, 4, 3);
      }
    }

    // Facade Station Nameplate Banner (dynamically sized to fit station name cleanly)
    ctx.font = 'bold 10.5px "Rajdhani", "Segoe UI", Arial, sans-serif';
    const tmp_facadeW = Math.max(120, Math.round(ctx.measureText(this.stationName.toUpperCase()).width + 28));
    ctx.fillStyle = '#facc15';
    drawRoundedRect(ctx, -tmp_facadeW * 0.5, -tmp_h + 51, tmp_facadeW, 18, 3);
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.stationName.toUpperCase(), 0, -tmp_h + 60);
  }

  /**
   * 2. Alpine timber chalet lodge with steep pitched slate roof, snow eaves, and fieldstone base.
   */
  renderAlpineChalet(ctx) {
    const tmp_w = this.width;
    const tmp_h = this.height;
    const tmp_halfW = tmp_w * 0.5;

    // Rugged granite fieldstone base foundation (bottom 35px)
    ctx.fillStyle = '#57534e';
    ctx.fillRect(-tmp_halfW, -35, tmp_w, 35);
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 2;
    ctx.strokeRect(-tmp_halfW, -35, tmp_w, 35);

    // Stone mortar outlines
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 1.2;
    for (let tmp_sx = -tmp_halfW + 15; tmp_sx < tmp_halfW; tmp_sx += 24) {
      ctx.beginPath();
      ctx.moveTo(tmp_sx, -35);
      ctx.lineTo(tmp_sx + 4, 0);
      ctx.stroke();
    }

    // Upper cedar log walls
    ctx.fillStyle = this.theme.building.wallColor;
    ctx.fillRect(-tmp_halfW + 6, -tmp_h, tmp_w - 12, tmp_h - 35);

    // Horizontal cedar log siding grooves
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    for (let tmp_ly = -tmp_h + 8; tmp_ly < -35; tmp_ly += 10) {
      ctx.beginPath();
      ctx.moveTo(-tmp_halfW + 6, tmp_ly);
      ctx.lineTo(tmp_halfW - 6, tmp_ly);
      ctx.stroke();
    }

    // Steep 45° alpine slate shingle roof
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-tmp_halfW - 20, -tmp_h);
    ctx.lineTo(0, -tmp_h - 48);
    ctx.lineTo(tmp_halfW + 20, -tmp_h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Snow-dusted roof eaves
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-tmp_halfW - 22, -tmp_h);
    ctx.lineTo(0, -tmp_h - 52);
    ctx.lineTo(tmp_halfW + 22, -tmp_h);
    ctx.lineTo(tmp_halfW + 20, -tmp_h + 4);
    ctx.lineTo(0, -tmp_h - 46);
    ctx.lineTo(-tmp_halfW - 20, -tmp_h + 4);
    ctx.closePath();
    ctx.fill();

    // Stone chimney with snow cap on right roof pitch
    const tmp_chimX = tmp_halfW * 0.45;
    ctx.fillStyle = '#57534e';
    ctx.fillRect(tmp_chimX, -tmp_h - 54, 16, 32);
    ctx.fillStyle = '#f8fafc'; // Snow on chimney rim
    ctx.fillRect(tmp_chimX - 2, -tmp_h - 57, 20, 5);

    // Wooden dormer window in roof
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-15, -tmp_h - 22, 30, 20);
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(-10, -tmp_h - 18, 20, 14);

    // Entrance oak door with forged iron strap hinges
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-14, -38, 28, 38);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(-14, -38, 28, 38);
    // Iron strap hinges
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-14, -32, 12, 3);
    ctx.fillRect(-14, -14, 12, 3);
  }

  /**
   * 3. Modern metropolitan terminal with curtain wall glass and cyan LED accents.
   */
  renderModernMetro(ctx) {
    const tmp_w = this.width;
    const tmp_h = this.height;
    const tmp_halfW = tmp_w * 0.5;

    // Dark anthracite structural space frame
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-tmp_halfW, -tmp_h, tmp_w, tmp_h);

    // Floor-to-ceiling curtain-wall glass facade
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.fillRect(-tmp_halfW + 8, -tmp_h + 10, tmp_w - 16, tmp_h - 14);

    // Structural steel mullion grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    const tmp_colStep = (tmp_w - 16) / 6;
    for (let tmp_ci = 1; tmp_ci < 6; tmp_ci++) {
      const tmp_cx = -tmp_halfW + 8 + tmp_ci * tmp_colStep;
      ctx.beginPath();
      ctx.moveTo(tmp_cx, -tmp_h + 10);
      ctx.lineTo(tmp_cx, -4);
      ctx.stroke();
    }
    // Horizontal mullions
    for (let tmp_my = -tmp_h + 35; tmp_my < -10; tmp_my += 28) {
      ctx.beginPath();
      ctx.moveTo(-tmp_halfW + 8, tmp_my);
      ctx.lineTo(tmp_halfW - 8, tmp_my);
      ctx.stroke();
    }

    // Overhanging cantilever composite roof slab
    ctx.fillStyle = '#334155';
    ctx.fillRect(-tmp_halfW - 14, -tmp_h - 10, tmp_w + 28, 12);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(-tmp_halfW - 14, -tmp_h - 10, tmp_w + 28, 12);

    // Glowing cyan architectural LED strip under roof edge
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-tmp_halfW - 12, -tmp_h + 2, tmp_w + 24, 2.5);

    // Automatic sliding glass entrance doors in center
    ctx.fillStyle = 'rgba(14, 165, 233, 0.7)';
    ctx.fillRect(-22, -44, 44, 44);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-22, -44, 44, 44);

    // Digital departure board visible inside glass
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-45, -tmp_h + 24, 90, 18);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DEPARTURES • ON TIME', 0, -tmp_h + 33);
  }

  /**
   * 4. Rural country whistle-stop depot with horizontal clapboard siding and tin roof.
   */
  renderRuralDepot(ctx) {
    const tmp_w = this.width;
    const tmp_h = this.height;
    const tmp_halfW = tmp_w * 0.5;

    // Stone rubble foundation blocks
    ctx.fillStyle = '#78716c';
    ctx.fillRect(-tmp_halfW, -14, tmp_w, 14);

    // Cream / white horizontal clapboard siding
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-tmp_halfW, -tmp_h, tmp_w, tmp_h - 14);
    ctx.strokeStyle = '#78716c';
    ctx.lineWidth = 2;
    ctx.strokeRect(-tmp_halfW, -tmp_h, tmp_w, tmp_h);

    // Horizontal clapboard shadow lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    for (let tmp_cy = -tmp_h + 8; tmp_cy < -14; tmp_cy += 8) {
      ctx.beginPath();
      ctx.moveTo(-tmp_halfW, tmp_cy);
      ctx.lineTo(tmp_halfW, tmp_cy);
      ctx.stroke();
    }

    // Red-oxide rusted corrugated tin roof with eave overhang
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.moveTo(-tmp_halfW - 14, -tmp_h);
    ctx.lineTo(0, -tmp_h - 26);
    ctx.lineTo(tmp_halfW + 14, -tmp_h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Brick chimney on roof
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(tmp_halfW * 0.35, -tmp_h - 36, 12, 22);

    // Dark green window frames and door
    ctx.fillStyle = '#14532d';
    // Left window
    ctx.fillRect(-tmp_halfW + 20, -tmp_h + 24, 18, 22);
    // Right window
    ctx.fillRect(tmp_halfW - 38, -tmp_h + 24, 18, 22);

    // Window panes
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(-tmp_halfW + 22, -tmp_h + 26, 14, 18);
    ctx.fillRect(tmp_halfW - 36, -tmp_h + 26, 14, 18);

    // Central panelled entrance door
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-12, -42, 24, 42);
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 2;
    ctx.strokeRect(-12, -42, 24, 42);
  }

  /**
   * 5. Industrial multi-bay freight depot with roll-up cargo doors and I-beam supports.
   */
  renderIndustrialDepot(ctx) {
    const tmp_w = this.width;
    const tmp_h = this.height;
    const tmp_halfW = tmp_w * 0.5;

    // Soot-stained dark industrial brick
    ctx.fillStyle = '#44403c';
    ctx.fillRect(-tmp_halfW, -tmp_h, tmp_w, tmp_h);
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-tmp_halfW, -tmp_h, tmp_w, tmp_h);

    // Corrugated iron shed roof
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(-tmp_halfW - 10, -tmp_h);
    ctx.lineTo(tmp_halfW + 10, -tmp_h - 16);
    ctx.lineTo(tmp_halfW + 10, -tmp_h - 8);
    ctx.lineTo(-tmp_halfW - 10, -tmp_h + 4);
    ctx.closePath();
    ctx.fill();

    // Heavy steel I-beam columns along facade
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-tmp_halfW, -tmp_h, 8, tmp_h);
    ctx.fillRect(tmp_halfW - 8, -tmp_h, 8, tmp_h);
    ctx.fillRect(-4, -tmp_h, 8, tmp_h);

    // Multiple corrugated roll-up cargo bay doors
    const tmp_doorW = 38;
    const tmp_doorH = 46;
    const arr_doorXs = [-tmp_halfW + 22, tmp_halfW - 60];

    for (let tmp_di = 0; tmp_di < arr_doorXs.length; tmp_di++) {
      const tmp_dx = arr_doorXs[tmp_di];

      // Corrugated door face
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(tmp_dx, -tmp_doorH, tmp_doorW, tmp_doorH);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(tmp_dx, -tmp_doorH, tmp_doorW, tmp_doorH);

      // Horizontal slats
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      for (let tmp_sy = -tmp_doorH + 6; tmp_sy < 0; tmp_sy += 7) {
        ctx.beginPath();
        ctx.moveTo(tmp_dx + 2, tmp_sy);
        ctx.lineTo(tmp_dx + tmp_doorW - 2, tmp_sy);
        ctx.stroke();
      }

      // Yellow/black warning hazard strip at bottom of door
      ctx.fillStyle = '#eab308';
      ctx.fillRect(tmp_dx, -5, tmp_doorW, 5);
    }
  }
}
