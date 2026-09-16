/**
 * PlatformLamp.js
 * 2D illustrated platform lighting fixtures for the 5 station themes:
 * - Victorian ornate lantern with optional station clock (Indian)
 * - Heavy timber post with forged carriage lantern and snow cap (Mountain)
 * - Modern aerodynamic curved gooseneck LED luminaire (Urban)
 * - Vintage green gooseneck kerosene/enamel pole (Rural)
 * - Heavy dual sodium-vapor floodlight lattice mast (Industrial)
 */

import { getStationThemeProfile, cons_STATION_THEMES } from './StationTheme.js';

export class PlatformLamp {
  /**
   * Initializes platform lamp with theme, optional clock, and dynamic glow.
   */
  constructor(themeKey = cons_STATION_THEMES.INDIAN, hasClock = false) {
    this.themeKey = themeKey;
    this.theme = getStationThemeProfile(themeKey);
    this.hasClock = hasClock;

    this.baseHeight = 85;
    this.flickerTimer = Math.random() * 10;
    this.currentGlowIntensity = 1.0;
    this.targetGlowIntensity = 1.0;
  }

  /**
   * Updates lamp illumination intensity and subtle filament/flame flicker.
   */
  update(deltaTime, isTrainApproaching = false, stationLightsIntensity = 1.0) {
    this.flickerTimer += deltaTime;

    // Approaches cause lamps to warm up / reach peak intensity, modulated by day/night station lights factor
    const tmp_peak = isTrainApproaching ? 1.25 : 1.0;
    this.targetGlowIntensity = tmp_peak * stationLightsIntensity;

    // Smooth interpolation
    this.currentGlowIntensity += (this.targetGlowIntensity - this.currentGlowIntensity) * Math.min(1.0, deltaTime * 2.5);

    // Micro-flicker for flame/incandescent lamps when lit
    if (this.currentGlowIntensity > 0.15 && (this.theme.lamp.style === 'victorian_ornate' || this.theme.lamp.style === 'timber_lantern')) {
      const tmp_micro = Math.sin(this.flickerTimer * 8.0) * 0.04 + Math.cos(this.flickerTimer * 14.0) * 0.03;
      this.currentGlowIntensity = Math.max(0.0, Math.min(1.35, this.currentGlowIntensity + tmp_micro));
    }
  }

  /**
   * Renders the platform lamp fixture and ambient light pool.
   */
  render(ctx, x, groundY, scale = 1.0) {
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(scale, scale);

    const tmp_style = this.theme.lamp.style;

    if (tmp_style === 'victorian_ornate') {
      this.renderVictorianLamp(ctx);
    } else if (tmp_style === 'timber_lantern') {
      this.renderMountainLamp(ctx);
    } else if (tmp_style === 'modern_gooseneck') {
      this.renderModernGooseneck(ctx);
    } else if (tmp_style === 'kerosene_pole') {
      this.renderRuralGooseneck(ctx);
    } else {
      this.renderIndustrialFloodlight(ctx);
    }

    ctx.restore();
  }

  /**
   * 1. Victorian ornate cast-iron lamp with curved bracket and optional station clock.
   */
  renderVictorianLamp(ctx) {
    const tmp_h = this.baseHeight;
    const tmp_topY = -tmp_h;

    // Ornate cast-iron base molding
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5, -6, 10, 6);
    ctx.fillRect(-3.5, -14, 7, 8);

    // Fluted central column
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-2, tmp_topY + 18, 4, tmp_h - 32);

    // Capital & cross-arm bracket
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, tmp_topY + 16, 8, 4);

    // S-curve scrollwork arm to the left (towards platform track side)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, tmp_topY + 18);
    ctx.quadraticCurveTo(-8, tmp_topY + 14, -14, tmp_topY + 4);
    ctx.stroke();

    // Lantern housing
    const tmp_lampX = -14;
    const tmp_lampY = tmp_topY + 4;

    // Lantern trapezoid glass body
    ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.beginPath();
    ctx.moveTo(tmp_lampX - 6, tmp_lampY - 12);
    ctx.lineTo(tmp_lampX + 6, tmp_lampY - 12);
    ctx.lineTo(tmp_lampX + 4, tmp_lampY);
    ctx.lineTo(tmp_lampX - 4, tmp_lampY);
    ctx.closePath();
    ctx.fill();

    // Lantern iron frame & cap
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pyramid cap & finial
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(tmp_lampX - 7, tmp_lampY - 12);
    ctx.lineTo(tmp_lampX, tmp_lampY - 18);
    ctx.lineTo(tmp_lampX + 7, tmp_lampY - 12);
    ctx.closePath();
    ctx.fill();

    // Warm incandescent bulb
    ctx.beginPath();
    ctx.arc(tmp_lampX, tmp_lampY - 6, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();

    // Optional double-sided Victorian station clock
    if (this.hasClock) {
      this.renderVictorianClock(ctx, 16, tmp_topY + 20);
    }

    // Ambient radial light pool on platform ground
    this.renderLightCone(ctx, tmp_lampX, tmp_lampY - 6, this.theme.lamp.glowRadius, this.theme.lamp.lightColor);
  }

  /**
   * Double-sided analog Victorian railway station clock.
   */
  renderVictorianClock(ctx, cx, cy) {
    const tmp_r = 13;

    // Iron mounting bracket connecting to mast
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(cx - tmp_r, cy);
    ctx.stroke();

    // Outer brass/iron bezel
    ctx.beginPath();
    ctx.arc(cx, cy, tmp_r, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#b45309'; // Brass rim
    ctx.lineWidth = 2;
    ctx.stroke();

    // White dial face
    ctx.beginPath();
    ctx.arc(cx, cy, tmp_r - 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    // Clock hour markings
    ctx.fillStyle = '#0f172a';
    for (let tmp_h = 0; tmp_h < 12; tmp_h++) {
      const tmp_angle = (tmp_h / 12) * Math.PI * 2;
      const tmp_tx = cx + Math.sin(tmp_angle) * (tmp_r - 4.5);
      const tmp_ty = cy - Math.cos(tmp_angle) * (tmp_r - 4.5);
      ctx.beginPath();
      ctx.arc(tmp_tx, tmp_ty, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Clock hands (showing 10:10 railway departure time)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Hour hand
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 4, cy - 4.5);
    ctx.stroke();
    // Minute hand
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 5.5, cy - 5.5);
    ctx.stroke();

    // Center pivot
    ctx.beginPath();
    ctx.arc(cx, cy, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#b45309';
    ctx.fill();
  }

  /**
   * 2. Mountain timber post with forged carriage lantern and snow cap.
   */
  renderMountainLamp(ctx) {
    const tmp_h = this.baseHeight - 5;
    const tmp_topY = -tmp_h;

    // Heavy cedar timber post
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-3.5, tmp_topY + 12, 7, tmp_h - 12);

    // Iron reinforcing straps
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-4, -10, 8, 3);
    ctx.fillRect(-4, tmp_topY + 22, 8, 3);

    // Timber post snow cap
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-4.5, tmp_topY + 10, 9, 3);

    // Right-angle black forged iron lantern bracket
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, tmp_topY + 26);
    ctx.lineTo(-15, tmp_topY + 26);
    ctx.lineTo(-15, tmp_topY + 34);
    ctx.stroke();

    // Hexagonal carriage lantern
    const tmp_lampX = -15;
    const tmp_lampY = tmp_topY + 40;

    // Amber lantern glass
    ctx.fillStyle = 'rgba(251, 191, 36, 0.55)';
    ctx.beginPath();
    ctx.arc(tmp_lampX, tmp_lampY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Iron cage bars
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tmp_lampX - 5, tmp_lampY - 7, 10, 14);

    // Lantern rooflet
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(tmp_lampX - 7, tmp_lampY - 7);
    ctx.lineTo(tmp_lampX, tmp_lampY - 12);
    ctx.lineTo(tmp_lampX + 7, tmp_lampY - 7);
    ctx.closePath();
    ctx.fill();

    // Snow ridge on lantern
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(tmp_lampX - 5, tmp_lampY - 13, 10, 2);

    // Warm glowing oil flame
    ctx.beginPath();
    ctx.arc(tmp_lampX, tmp_lampY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fde68a';
    ctx.fill();

    // Light pool
    this.renderLightCone(ctx, tmp_lampX, tmp_lampY, this.theme.lamp.glowRadius, this.theme.lamp.lightColor);
  }

  /**
   * 3. Urban sleek curved gooseneck LED luminaire.
   */
  renderModernGooseneck(ctx) {
    const tmp_h = this.baseHeight + 10;
    const tmp_topY = -tmp_h;

    // Stainless steel base collar
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-4, -6, 8, 6);

    // Graceful curved tubular mast
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, tmp_topY + 30);
    ctx.quadraticCurveTo(0, tmp_topY, -24, tmp_topY + 4);
    ctx.stroke();

    // Teardrop aerodynamic LED fixture head
    const tmp_headX = -25;
    const tmp_headY = tmp_topY + 5;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(tmp_headX, tmp_headY, 9, 3.5, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Clean frosted LED diffuser lens
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.ellipse(tmp_headX, tmp_headY + 2.5, 7, 2, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Crisp white-blue ground pool
    this.renderLightCone(ctx, tmp_headX, tmp_headY + 3, this.theme.lamp.glowRadius, this.theme.lamp.lightColor);
  }

  /**
   * 4. Rural green gooseneck kerosene/enamel pole.
   */
  renderRuralGooseneck(ctx) {
    const tmp_h = this.baseHeight - 8;
    const tmp_topY = -tmp_h;

    // Slender dark green metal pipe
    ctx.fillStyle = '#166534';
    ctx.fillRect(-2, tmp_topY + 12, 4, tmp_h - 12);

    // Curved gooseneck pipe
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, tmp_topY + 14);
    ctx.quadraticCurveTo(0, tmp_topY, -16, tmp_topY + 8);
    ctx.stroke();

    // Conical green enamel reflector shade
    const tmp_lampX = -16;
    const tmp_lampY = tmp_topY + 10;

    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.moveTo(tmp_lampX - 10, tmp_lampY + 6);
    ctx.lineTo(tmp_lampX, tmp_lampY);
    ctx.lineTo(tmp_lampX + 10, tmp_lampY + 6);
    ctx.closePath();
    ctx.fill();

    // White reflector underside
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(tmp_lampX - 8, tmp_lampY + 5, 16, 1.5);

    // Clear incandescent bulb
    ctx.beginPath();
    ctx.arc(tmp_lampX, tmp_lampY + 8, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fde047';
    ctx.fill();

    this.renderLightCone(ctx, tmp_lampX, tmp_lampY + 8, this.theme.lamp.glowRadius, this.theme.lamp.lightColor);
  }

  /**
   * 5. Industrial heavy dual sodium-vapor floodlight mast.
   */
  renderIndustrialFloodlight(ctx) {
    const tmp_h = this.baseHeight + 25;
    const tmp_topY = -tmp_h;

    // Square steel lattice tower mast
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-3, tmp_topY + 14);
    ctx.moveTo(5, 0);
    ctx.lineTo(3, tmp_topY + 14);
    ctx.stroke();

    // Lattice X-braces
    ctx.lineWidth = 1.2;
    for (let tmp_ly = -14; tmp_ly > tmp_topY + 20; tmp_ly -= 18) {
      ctx.beginPath();
      ctx.moveTo(-4, tmp_ly);
      ctx.lineTo(4, tmp_ly - 18);
      ctx.moveTo(4, tmp_ly);
      ctx.lineTo(-4, tmp_ly - 18);
      ctx.stroke();
    }

    // Heavy crossbar mount
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-18, tmp_topY + 10, 36, 4);

    // Dual rectangular floodlight fixtures
    const arr_floodXs = [-12, 12];
    for (let tmp_i = 0; tmp_i < arr_floodXs.length; tmp_i++) {
      const tmp_fx = arr_floodXs[tmp_i];

      // Fixture housing
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(tmp_fx - 6, tmp_topY - 2, 12, 12);

      // Cooling heat-sink ribs
      ctx.fillStyle = '#334155';
      ctx.fillRect(tmp_fx - 5, tmp_topY - 5, 10, 3);

      // Golden sodium reflector face
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(tmp_fx - 4, tmp_topY + 1, 8, 7);

      // White-hot arc tube
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(tmp_fx - 1.5, tmp_topY + 3, 3, 3);
    }

    // Broad intense sodium light cone
    this.renderLightCone(ctx, 0, tmp_topY + 6, this.theme.lamp.glowRadius * 1.2, this.theme.lamp.lightColor);
  }

  /**
   * Renders ambient radial illumination pool on the platform ground.
   */
  renderLightCone(ctx, sourceX, sourceY, radius, lightColor) {
    if (this.currentGlowIntensity <= 0.05) return;
    const tmp_effRadius = radius * this.currentGlowIntensity;
    const tmp_grad = ctx.createRadialGradient(sourceX, sourceY, 2, sourceX, sourceY, tmp_effRadius);
    tmp_grad.addColorStop(0, lightColor);
    tmp_grad.addColorStop(0.35, lightColor.replace('0.85', '0.25').replace('0.9', '0.25').replace('0.8', '0.22'));
    tmp_grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.save();
    ctx.fillStyle = tmp_grad;
    ctx.beginPath();
    ctx.arc(sourceX, sourceY, tmp_effRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
