/**
 * WeatherParticles.js
 * Pre-allocated, zero-GC lightweight precipitation particle emitter for mobile browsers.
 * Simulates diagonal rain streaks (angled with train speed), ground splashes, and fluttering snow.
 */

const cons_MAX_WEATHER_PARTICLES = 160;

export class WeatherParticles {
  /**
   * Pre-allocates a fixed pool of weather particle slots.
   */
  constructor() {
    this.maxParticles = cons_MAX_WEATHER_PARTICLES;
    this.arr_particles = new Array(this.maxParticles);

    for (let tmp_i = 0; tmp_i < this.maxParticles; tmp_i++) {
      this.arr_particles[tmp_i] = {
        active: false,
        type: 'rain',
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        vx: -140,
        vy: 720,
        baseVy: 720,
        length: 16,
        radius: 2,
        alpha: 0.7,
        phase: Math.random() * Math.PI * 2,
        isSplash: false,
        splashProgress: 0,
      };
    }

    this.activeCount = 0;
    this.animTimer = 0;
  }

  /**
   * Configures active particle count and type according to the active weather precipitation profile.
   */
  configure(precipitationProfile, viewportWidth, viewportHeight) {
    const tmp_type = precipitationProfile.type;

    if (tmp_type === 'none') {
      this.activeCount = 0;
      for (let tmp_i = 0; tmp_i < this.maxParticles; tmp_i++) {
        this.arr_particles[tmp_i].active = false;
      }
      return;
    }

    const tmp_targetCount = Math.min(this.maxParticles, precipitationProfile.density || 80);
    this.activeCount = tmp_targetCount;

    for (let tmp_i = 0; tmp_i < this.maxParticles; tmp_i++) {
      const obj_p = this.arr_particles[tmp_i];
      if (tmp_i < tmp_targetCount) {
        if (!obj_p.active || obj_p.type !== tmp_type) {
          obj_p.active = true;
          obj_p.type = tmp_type;
          obj_p.x = Math.random() * (viewportWidth + 200) - 100;
          obj_p.y = Math.random() * viewportHeight;
          obj_p.baseVy = precipitationProfile.speedY * (0.85 + Math.random() * 0.3);
          obj_p.length = tmp_type === 'heavy_rain' ? (18 + Math.random() * 10) : (12 + Math.random() * 8);
          obj_p.radius = tmp_type === 'snow' ? (1.6 + Math.random() * 1.8) : 2.0;
          obj_p.alpha = 0.55 + Math.random() * 0.35;
          obj_p.isSplash = false;
          obj_p.splashProgress = 0;
        }
      } else {
        obj_p.active = false;
      }
    }
  }

  /**
   * Updates particle positions in-place, handling wrap-around and train velocity slanting.
   */
  update(deltaTime, trainSpeedMps, viewportWidth, viewportHeight, hasSplashes = false) {
    if (this.activeCount === 0) return;
    this.animTimer += deltaTime;

    // Train speed imparts relative horizontal velocity to falling precipitation
    const tmp_trainSlant = -trainSpeedMps * 8.5;

    for (let tmp_i = 0; tmp_i < this.activeCount; tmp_i++) {
      const obj_p = this.arr_particles[tmp_i];
      if (!obj_p.active) continue;

      if (obj_p.isSplash) {
        // Advance ground splash ripple
        obj_p.splashProgress += deltaTime * 5.0;
        if (obj_p.splashProgress >= 1.0) {
          // Recycle back to top of screen
          obj_p.isSplash = false;
          obj_p.splashProgress = 0;
          obj_p.x = Math.random() * (viewportWidth + 300) - 100;
          obj_p.y = -20 - Math.random() * 50;
        }
        continue;
      }

      if (obj_p.type === 'snow') {
        // Floating flutter movement with sine wave sway
        const tmp_sway = Math.sin(this.animTimer * 2.5 + obj_p.phase) * 22;
        obj_p.vx = tmp_sway - (trainSpeedMps * 3.5);
        obj_p.vy = obj_p.baseVy;
      } else {
        // Diagonal rain streak
        obj_p.vx = -150 + tmp_trainSlant;
        obj_p.vy = obj_p.baseVy;
      }

      obj_p.x += obj_p.vx * deltaTime;
      obj_p.y += obj_p.vy * deltaTime;

      // Ground splash check (bottom 15% of viewport)
      const tmp_groundThreshold = viewportHeight * 0.84;
      if (hasSplashes && (obj_p.type === 'rain' || obj_p.type === 'heavy_rain') && obj_p.y >= tmp_groundThreshold) {
        if (Math.random() < 0.35) {
          obj_p.isSplash = true;
          obj_p.splashProgress = 0;
          obj_p.y = tmp_groundThreshold + (Math.random() * 20);
          continue;
        }
      }

      // Screen boundary wrap-around (zero allocation recycling)
      if (obj_p.y > viewportHeight + 20) {
        obj_p.y = -20 - Math.random() * 30;
        obj_p.x = Math.random() * (viewportWidth + 300) - 100;
      } else if (obj_p.x < -150) {
        obj_p.x = viewportWidth + 50 + Math.random() * 100;
      } else if (obj_p.x > viewportWidth + 150) {
        obj_p.x = -50 - Math.random() * 100;
      }
    }
  }

  /**
   * Fast batch render pass of all active weather particles in screen space.
   */
  render(ctx, color = 'rgba(224, 242, 254, 0.7)') {
    if (this.activeCount === 0) return;
    ctx.save();

    for (let tmp_i = 0; tmp_i < this.activeCount; tmp_i++) {
      const obj_p = this.arr_particles[tmp_i];
      if (!obj_p.active) continue;

      if (obj_p.isSplash) {
        // Expanding 2px ground splash ripple ring
        const tmp_r = 2 + obj_p.splashProgress * 6;
        const tmp_a = (1.0 - obj_p.splashProgress) * 0.55;
        ctx.strokeStyle = `rgba(224, 242, 254, ${tmp_a})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        if (typeof ctx.ellipse === 'function') {
          ctx.ellipse(obj_p.x, obj_p.y, tmp_r * 1.5, tmp_r * 0.45, 0, 0, Math.PI * 2);
        } else {
          ctx.arc(obj_p.x, obj_p.y, tmp_r, 0, Math.PI * 2);
        }
        ctx.stroke();
        continue;
      }

      if (obj_p.type === 'snow') {
        // Soft white circular snowflake
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = obj_p.alpha;
        ctx.beginPath();
        ctx.arc(obj_p.x, obj_p.y, obj_p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Diagonal rain streak line
        ctx.strokeStyle = color;
        ctx.lineWidth = obj_p.type === 'heavy_rain' ? 1.6 : 1.2;
        ctx.globalAlpha = obj_p.alpha;

        const tmp_dt = 0.024;
        const tmp_tailX = obj_p.x + obj_p.vx * tmp_dt;
        const tmp_tailY = obj_p.y + obj_p.vy * tmp_dt;

        ctx.beginPath();
        ctx.moveTo(obj_p.x, obj_p.y);
        ctx.lineTo(tmp_tailX, tmp_tailY);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
