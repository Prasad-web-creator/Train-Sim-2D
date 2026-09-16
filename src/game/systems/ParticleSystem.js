/**
 * ParticleSystem.js
 * High-performance pre-allocated lightweight 2D particle pool for mobile browsers.
 * Simulates diesel exhaust smoke plumes, ballast dust kick-up, wheel & brake sparks,
 * sander grit, and electrical catenary wire arcs with zero runtime memory allocations.
 */

import { randomRange, clamp } from '../../utils/MathUtils.js';

const cons_MAX_PARTICLES = 160;

export class ParticleSystem {
  /**
   * Pre-allocates a fixed-capacity pool of reusable particle slots.
   */
  constructor() {
    this.maxParticles = cons_MAX_PARTICLES;
    this.arr_pool = new Array(this.maxParticles);

    // Instantiate fixed slots once to completely eliminate GC garbage collection overhead
    for (let tmp_i = 0; tmp_i < this.maxParticles; tmp_i++) {
      this.arr_pool[tmp_i] = {
        active: false,
        type: 'smoke',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 0,
        growthRate: 0,
        alpha: 0,
        life: 0,
        maxLife: 1,
        color: '#ffffff',
        rotation: 0,
        rotSpeed: 0,
        gravity: 0,
      };
    }

    this.activeCount = 0;
  }

  /**
   * Retrieves an available inactive particle slot from the pre-allocated pool.
   * If the pool is completely full, recycles the oldest active particle to avoid dropouts.
   */
  fn_obtainSlot() {
    for (let tmp_i = 0; tmp_i < this.maxParticles; tmp_i++) {
      if (!this.arr_pool[tmp_i].active) {
        return this.arr_pool[tmp_i];
      }
    }

    // Overwrite the particle with the highest life if pool is completely saturated
    let obj_oldest = this.arr_pool[0];
    for (let tmp_i = 1; tmp_i < this.maxParticles; tmp_i++) {
      if (this.arr_pool[tmp_i].life > obj_oldest.life) {
        obj_oldest = this.arr_pool[tmp_i];
      }
    }
    return obj_oldest;
  }

  /**
   * Spawns diesel exhaust smoke (Disabled per user request).
   */
  emitSmoke(worldX, worldY, trainSpeedMps, throttleNotch, engineRpm) {
    // Disabled smoke animation
    return;
  }

  /**
   * Spawns wheel slip sparks when traction is lost.
   */
  emitSparks(worldX, worldY, trainSpeedMps, count = 4) {
    for (let tmp_i = 0; tmp_i < count; tmp_i++) {
      const obj_p = this.fn_obtainSlot();
      obj_p.active = true;
      obj_p.type = 'spark';
      obj_p.x = worldX + randomRange(-8, 8);
      obj_p.y = worldY + randomRange(-2, 2);
      obj_p.vx = -trainSpeedMps * 0.3 + randomRange(-18, 18);
      obj_p.vy = randomRange(-12, -4);
      obj_p.radius = randomRange(1.5, 3.0);
      obj_p.growthRate = -2.0;
      obj_p.alpha = 1.0;
      obj_p.maxLife = randomRange(0.25, 0.45);
      obj_p.life = 0;
      obj_p.color = Math.random() > 0.3 ? '#f59e0b' : '#fbbf24';
      obj_p.gravity = 38.0;
    }
  }

  /**
   * Spawns fiery brake shoe friction sparks scattering backward under heavy braking.
   */
  emitBrakeSparks(worldX, worldY, trainSpeedMps, count = 3) {
    for (let tmp_i = 0; tmp_i < count; tmp_i++) {
      const obj_p = this.fn_obtainSlot();
      obj_p.active = true;
      obj_p.type = 'spark';
      obj_p.x = worldX + randomRange(-6, 6);
      obj_p.y = worldY + randomRange(0, 4);
      obj_p.vx = -trainSpeedMps * 0.4 + randomRange(-25, -5);
      obj_p.vy = randomRange(-8, 6);
      obj_p.radius = randomRange(1.2, 2.6);
      obj_p.growthRate = -1.5;
      obj_p.alpha = 1.0;
      obj_p.maxLife = randomRange(0.2, 0.4);
      obj_p.life = 0;
      obj_p.color = Math.random() > 0.5 ? '#f43f5e' : '#fb923c'; // Hot cherry red to incandescent orange
      obj_p.gravity = 42.0;
    }
  }

  /**
   * Spawns subtle low-lying ballast dust motes kicking up behind bogies at speed.
   */
  emitDust(worldX, worldY, trainSpeedMps, count = 2) {
    for (let tmp_i = 0; tmp_i < count; tmp_i++) {
      const obj_p = this.fn_obtainSlot();
      obj_p.active = true;
      obj_p.type = 'dust';
      obj_p.x = worldX + randomRange(-10, 10);
      obj_p.y = worldY + randomRange(-1, 3);
      obj_p.vx = -trainSpeedMps * 0.25 + randomRange(-8, 8);
      obj_p.vy = randomRange(-6, -2);
      obj_p.radius = randomRange(6, 12);
      obj_p.growthRate = randomRange(14, 24);
      obj_p.alpha = 0.45;
      obj_p.maxLife = randomRange(0.8, 1.4);
      obj_p.life = 0;
      obj_p.color = 'rgba(214, 199, 178'; // Light sandy loam / ballast dust
      obj_p.gravity = 2.0;
    }
  }

  /**
   * Spawns traction sand granules near wheel rail contact.
   */
  emitSand(worldX, worldY, count = 3) {
    for (let tmp_i = 0; tmp_i < count; tmp_i++) {
      const obj_p = this.fn_obtainSlot();
      obj_p.active = true;
      obj_p.type = 'sand';
      obj_p.x = worldX + randomRange(-4, 4);
      obj_p.y = worldY + randomRange(-1, 3);
      obj_p.vx = randomRange(-6, 6);
      obj_p.vy = randomRange(4, 12);
      obj_p.radius = randomRange(1.2, 2.2);
      obj_p.growthRate = 0;
      obj_p.alpha = 0.9;
      obj_p.maxLife = randomRange(0.2, 0.35);
      obj_p.life = 0;
      obj_p.color = '#fef08a';
      obj_p.gravity = 25.0;
    }
  }

  /**
   * Spawns subtle electric catenary contact arc flash.
   */
  emitCatenarySpark(worldX, worldY, count = 2) {
    for (let tmp_i = 0; tmp_i < count; tmp_i++) {
      const obj_p = this.fn_obtainSlot();
      obj_p.active = true;
      obj_p.type = 'catenary';
      obj_p.x = worldX + randomRange(-4, 4);
      obj_p.y = worldY + randomRange(-2, 2);
      obj_p.vx = randomRange(-15, 15);
      obj_p.vy = randomRange(-10, 8);
      obj_p.radius = randomRange(2.0, 4.5);
      obj_p.growthRate = -4.0;
      obj_p.alpha = 1.0;
      obj_p.maxLife = randomRange(0.08, 0.16);
      obj_p.life = 0;
      obj_p.color = '#38bdf8'; // Brilliant electric blue
      obj_p.gravity = 0;
    }
  }

  /**
   * Advances active particles in-place with zero array allocation.
   */
  update(deltaTime) {
    const cons_DT = clamp(deltaTime, 0.001, 0.1);
    let tmp_count = 0;

    for (let tmp_i = 0; tmp_i < this.maxParticles; tmp_i++) {
      const obj_p = this.arr_pool[tmp_i];
      if (!obj_p.active) continue;

      obj_p.life += cons_DT;
      if (obj_p.life >= obj_p.maxLife) {
        obj_p.active = false;
        continue;
      }

      tmp_count++;
      const tmp_lifeRatio = obj_p.life / obj_p.maxLife;

      obj_p.x += obj_p.vx * cons_DT;
      obj_p.y += obj_p.vy * cons_DT;
      obj_p.vy += obj_p.gravity * cons_DT;

      if (obj_p.growthRate !== 0) {
        obj_p.radius = Math.max(0.5, obj_p.radius + obj_p.growthRate * cons_DT);
      }

      if (obj_p.type === 'smoke') {
        obj_p.rotation += obj_p.rotSpeed * cons_DT;
        obj_p.alpha = (1 - tmp_lifeRatio) * 0.72;
      } else if (obj_p.type === 'dust') {
        obj_p.alpha = (1 - tmp_lifeRatio) * 0.42;
      } else if (obj_p.type === 'spark') {
        obj_p.alpha = 1 - tmp_lifeRatio;
      } else if (obj_p.type === 'sand') {
        obj_p.alpha = 1 - tmp_lifeRatio;
      } else if (obj_p.type === 'catenary') {
        obj_p.alpha = (1 - tmp_lifeRatio);
      }
    }

    this.activeCount = tmp_count;
  }

  /**
   * Efficient batch rendering pass of all active pooled particles.
   */
  render(ctx) {
    if (this.activeCount === 0) return;
    ctx.save();

    for (let tmp_i = 0; tmp_i < this.maxParticles; tmp_i++) {
      const obj_p = this.arr_pool[tmp_i];
      if (!obj_p.active) continue;

      if (obj_p.type === 'dust') {
        ctx.fillStyle = `${obj_p.color}, ${obj_p.alpha})`;
        ctx.beginPath();
        ctx.arc(obj_p.x, obj_p.y, obj_p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj_p.type === 'spark') {
        ctx.fillStyle = obj_p.color;
        ctx.globalAlpha = obj_p.alpha;
        ctx.beginPath();
        ctx.arc(obj_p.x, obj_p.y, obj_p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj_p.type === 'sand') {
        ctx.fillStyle = obj_p.color;
        ctx.globalAlpha = obj_p.alpha;
        ctx.beginPath();
        ctx.arc(obj_p.x, obj_p.y, obj_p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj_p.type === 'catenary') {
        ctx.fillStyle = obj_p.color;
        ctx.globalAlpha = obj_p.alpha;
        ctx.beginPath();
        ctx.arc(obj_p.x, obj_p.y, obj_p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Deactivates all particles in the pool without reallocation.
   */
  clear() {
    for (let tmp_i = 0; tmp_i < this.maxParticles; tmp_i++) {
      this.arr_pool[tmp_i].active = false;
    }
    this.activeCount = 0;
  }

  /**
   * Returns the count of currently active particles in the pool.
   */
  getActiveCount() {
    let tmp_count = 0;
    for (let tmp_i = 0; tmp_i < this.maxParticles; tmp_i++) {
      if (this.arr_pool[tmp_i].active) tmp_count++;
    }
    return tmp_count;
  }
}

export default ParticleSystem;
