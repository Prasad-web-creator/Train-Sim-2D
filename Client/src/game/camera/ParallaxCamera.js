/**
 * ParallaxCamera.js
 * Multi-depth parallax scroll and vertical perspective coordinator for 2D railway scenery.
 * Computes calibrated scroll offsets for distant sky, mountain ridges, and midground vegetation.
 */

import { clamp } from '../../utils/MathUtils.js';

export class ParallaxCamera {
  /**
   * Initializes parallax depth coefficients for multi-layer rendering.
   */
  constructor() {
    // Parallax depth scroll factors (fraction of world camera speed)
    this.layerFactors = Object.freeze({
      SKY: 0.0,
      MOUNTAINS_FAR: 0.075,
      MOUNTAINS_NEAR: 0.135,
      VEGETATION: 0.65,
      WORLD: 1.0,
      FOREGROUND: 1.15,
    });

    // Vertical grade dampening (prevents mountains jumping during steep track climbs)
    this.verticalDampFactor = 0.06;
  }

  /**
   * Computes horizontal parallax coordinate for a given layer speed factor.
   * 
   * @param {number} speedFactor - Parallax speed multiplier (0.0 for sky, 0.08 for mountains, etc.)
   * @param {number} worldCameraX - Current world camera horizontal coordinate
   */
  getLayerScrollX(speedFactor, worldCameraX) {
    return worldCameraX * speedFactor;
  }

  /**
   * Computes vertical parallax coordinate with grade dampening.
   * 
   * @param {number} speedFactor - Parallax vertical multiplier
   * @param {number} worldCameraY - Current world camera vertical coordinate
   */
  getLayerScrollY(speedFactor, worldCameraY) {
    return worldCameraY * (speedFactor * this.verticalDampFactor);
  }

  /**
   * Computes parallax offset for midground elements relative to world camera.
   * 
   * @param {number} elementWorldX - World X coordinate of scenery object
   * @param {number} worldCameraX - Current world camera position
   * @param {number} [speedFactor=0.65] - Parallax factor
   */
  getMidgroundParallaxX(elementWorldX, worldCameraX, speedFactor = 0.65) {
    const tmp_screenDist = elementWorldX - worldCameraX;
    return worldCameraX + tmp_screenDist * speedFactor;
  }

  /**
   * Computes distant mountain silhouette coordinates for Layer 2.
   * 
   * @param {number} tier - Mountain tier (1 for far peaks, 2 for mid ridge)
   * @param {number} worldCameraX - World camera X position
   */
  getMountainParallaxX(tier, worldCameraX) {
    const tmp_factor = tier === 1 ? this.layerFactors.MOUNTAINS_FAR : this.layerFactors.MOUNTAINS_NEAR;
    return worldCameraX * tmp_factor;
  }
}

export default ParallaxCamera;
