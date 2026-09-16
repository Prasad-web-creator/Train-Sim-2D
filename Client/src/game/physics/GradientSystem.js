/**
 * GradientSystem.js
 * Evaluates track slope, grade percentage, and gravitational incline resistance forces.
 */

import { cons_PHYSICS } from '../../constants/PhysicsConstants.js';

export class GradientSystem {
  /**
   * Initializes current grade percentage and tangent angle tracking.
   */
  constructor() {
    this.currentGradePercent = 0;
    this.currentSlopeAngleRad = 0;
  }

  /**
   * Computes gravitational gradient resistance force in Newtons: F = m * g * sin(theta).
   */
  calculateGradientForce(distMeters, totalMassKg, trackSystem) {
    if (!trackSystem) return 0;

    // Track tangent angle in radians
    this.currentSlopeAngleRad = trackSystem.getTangentAngleAt(distMeters);
    this.currentGradePercent = trackSystem.getGradePercentAt(distMeters);

    // Gravitational component along track slope
    // Canvas y is inverted, so tangent angle positive is uphill
    const tmp_gravityForceN = totalMassKg * cons_PHYSICS.GRAVITY_ACCEL * Math.sin(this.currentSlopeAngleRad);
    return tmp_gravityForceN;
  }

  /**
   * Returns current track slope grade percentage (e.g. +2.5% or -1.8%).
   */
  getGradePercent() {
    return this.currentGradePercent;
  }

  /**
   * Returns current track pitch angle in radians.
   */
  getSlopeAngleRad() {
    return this.currentSlopeAngleRad;
  }
}
