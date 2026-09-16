/**
 * WeatherAtmosphere.js
 * High-performance 2D atmospheric rendering:
 * - Layered translucent atmospheric fog planes with gentle parallax drift
 * - Night celestial bodies: twinkling stars and crescent moon with soft halo
 * - Heavy rain sheet lightning flashes (brief distant thundercloud illumination)
 * - Single-pass ambient lighting color wash overlays (golden sunset, midnight navy, cool rain)
 * - Zero expensive full-screen filters or frame buffer readbacks.
 */

export class WeatherAtmosphere {
  /**
   * Initializes pre-calculated star fields, fog wave counters, and lightning timers.
   */
  constructor() {
    this.animTimer = 0;
    this.fogOffset = 0;

    // Twinkling star field (pre-computed 60 fixed coordinates)
    this.arr_stars = [];
    for (let tmp_i = 0; tmp_i < 60; tmp_i++) {
      this.arr_stars.push({
        xRatio: (tmp_i * 31.7 + 13.5) % 1.0,
        yRatio: (tmp_i * 17.3 + 7.1) % 0.42, // Upper 42% of sky
        radius: 0.8 + ((tmp_i % 3) * 0.45),
        twinkleSpeed: 2.0 + ((tmp_i % 5) * 1.2),
        phase: (tmp_i * 1.3) % (Math.PI * 2),
      });
    }

    // Sheet lightning state
    this.lightningCooldown = 6.0 + Math.random() * 8.0;
    this.lightningTimer = 0;
    this.isLightningActive = false;
    this.lightningIntensity = 0;
  }

  /**
   * Updates atmospheric timers, drifting fog ribbons, and sheet lightning triggers.
   */
  update(deltaTime, hasLightning = false, hasFog = false) {
    this.animTimer += deltaTime;
    this.fogOffset += deltaTime * 24.0; // Fog drifts horizontally at 24 px/s

    // Sheet lightning periodic trigger during heavy rain
    if (hasLightning) {
      this.lightningTimer += deltaTime;
      if (!this.isLightningActive && this.lightningTimer >= this.lightningCooldown) {
        this.isLightningActive = true;
        this.lightningTimer = 0;
        this.lightningCooldown = 9.0 + Math.random() * 8.0;
      }

      if (this.isLightningActive) {
        // Double-flash pulse profile over 0.16s
        const tmp_t = this.lightningTimer;
        if (tmp_t < 0.06) {
          this.lightningIntensity = (tmp_t / 0.06) * 0.75;
        } else if (tmp_t < 0.1) {
          this.lightningIntensity = 0.25;
        } else if (tmp_t < 0.16) {
          this.lightningIntensity = ((0.16 - tmp_t) / 0.06) * 0.85;
        } else {
          this.isLightningActive = false;
          this.lightningIntensity = 0;
        }
      }
    } else {
      this.isLightningActive = false;
      this.lightningIntensity = 0;
    }
  }

  /**
   * Renders layered translucent drifting fog ribbons at the specified depth layer.
   * Uses fast bezier bands with gentle sinusoidal undulations.
   */
  renderFogPlanes(ctx, viewportWidth, viewportHeight, layerDepth = 4, alphaMultiplier = 1.0) {
    ctx.save();

    const tmp_speed = layerDepth === 6 ? 1.4 : 0.7;
    const tmp_drift = (this.fogOffset * tmp_speed) % viewportWidth;
    const tmp_baseY = layerDepth === 6 ? (viewportHeight * 0.68) : (viewportHeight * 0.48);
    const tmp_fogH = layerDepth === 6 ? 110 : 85;
    const tmp_alpha = (layerDepth === 6 ? 0.18 : 0.24) * alphaMultiplier;

    ctx.fillStyle = `rgba(226, 232, 240, ${tmp_alpha})`;

    // First undulating ribbon
    ctx.beginPath();
    ctx.moveTo(-100, viewportHeight);
    ctx.lineTo(-100, tmp_baseY);

    const tmp_step = 120;
    for (let tmp_x = -100; tmp_x <= viewportWidth + 200; tmp_x += tmp_step) {
      const tmp_wave = Math.sin((tmp_x + tmp_drift) * 0.012) * 16 + Math.cos((tmp_x + tmp_drift) * 0.024) * 8;
      ctx.lineTo(tmp_x, tmp_baseY + tmp_wave);
    }

    ctx.lineTo(viewportWidth + 200, viewportHeight);
    ctx.closePath();
    ctx.fill();

    // Second offset translucent wisps
    ctx.fillStyle = `rgba(241, 245, 249, ${tmp_alpha * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(-100, viewportHeight);
    ctx.lineTo(-100, tmp_baseY + 30);

    for (let tmp_x = -100; tmp_x <= viewportWidth + 200; tmp_x += tmp_step) {
      const tmp_wave = Math.sin((tmp_x - tmp_drift * 1.2) * 0.015) * 14;
      ctx.lineTo(tmp_x, tmp_baseY + 30 + tmp_wave);
    }

    ctx.lineTo(viewportWidth + 200, viewportHeight);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Renders night celestial elements: twinkling stars and crescent moon with soft halo.
   */
  renderNightStars(ctx, viewportWidth, viewportHeight) {
    ctx.save();

    // 1. Twinkling stars in upper sky
    for (let tmp_i = 0; tmp_i < this.arr_stars.length; tmp_i++) {
      const obj_s = this.arr_stars[tmp_i];
      const tmp_x = obj_s.xRatio * viewportWidth;
      const tmp_y = obj_s.yRatio * viewportHeight;

      const tmp_twinkle = 0.45 + (Math.sin(this.animTimer * obj_s.twinkleSpeed + obj_s.phase) * 0.35);

      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = tmp_twinkle;
      ctx.beginPath();
      ctx.arc(tmp_x, tmp_y, obj_s.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Crescent moon with soft atmospheric lunar halo
    const tmp_moonX = viewportWidth * 0.82;
    const tmp_moonY = viewportHeight * 0.16;
    const tmp_moonR = 24;

    // Soft radial lunar glow halo
    const tmp_halo = ctx.createRadialGradient(tmp_moonX, tmp_moonY, tmp_moonR * 0.8, tmp_moonX, tmp_moonY, tmp_moonR * 2.8);
    tmp_halo.addColorStop(0, 'rgba(241, 245, 249, 0.18)');
    tmp_halo.addColorStop(1, 'rgba(241, 245, 249, 0)');
    ctx.fillStyle = tmp_halo;
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(tmp_moonX, tmp_moonY, tmp_moonR * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Crescent moon body
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(tmp_moonX, tmp_moonY, tmp_moonR, 0, Math.PI * 2);
    ctx.fill();

    // Shadow cutout creating realistic crescent shape
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(tmp_moonX + 9, tmp_moonY - 3, tmp_moonR * 0.92, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Renders the golden-hour sun sphere during Sunset.
   */
  renderSunsetSun(ctx, viewportWidth, viewportHeight) {
    ctx.save();
    const tmp_sunX = viewportWidth * 0.75;
    const tmp_sunY = viewportHeight * 0.45;
    const tmp_sunR = 34;

    // Soft warm radial flare
    const tmp_flare = ctx.createRadialGradient(tmp_sunX, tmp_sunY, tmp_sunR * 0.5, tmp_sunX, tmp_sunY, tmp_sunR * 3.5);
    tmp_flare.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    tmp_flare.addColorStop(0.4, 'rgba(249, 115, 22, 0.22)');
    tmp_flare.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = tmp_flare;
    ctx.beginPath();
    ctx.arc(tmp_sunX, tmp_sunY, tmp_sunR * 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Golden sun core
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(tmp_sunX, tmp_sunY, tmp_sunR, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Single-pass ambient lighting color wash and sheet lightning flash overlay.
   */
  renderAmbientWash(ctx, viewportWidth, viewportHeight, ambientColor) {
    ctx.save();

    // Ambient tint overlay
    if (ambientColor && ambientColor !== 'rgba(0, 0, 0, 0)') {
      ctx.fillStyle = ambientColor;
      ctx.fillRect(0, 0, viewportWidth, viewportHeight);
    }

    // Sheet lightning flash (brightens entire screen briefly in heavy rain)
    if (this.lightningIntensity > 0) {
      ctx.fillStyle = `rgba(224, 242, 254, ${this.lightningIntensity})`;
      ctx.fillRect(0, 0, viewportWidth, viewportHeight);
    }

    ctx.restore();
  }
}
