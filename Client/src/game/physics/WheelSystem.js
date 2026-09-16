/**
 * WheelSystem.js
 * Evaluates wheel-rail steel adhesion limits, wheel slip, sander traction boosts, and wheel rotation.
 */

import { cons_PHYSICS } from '../../constants/PhysicsConstants.js';

export class WheelSystem {
  /**
   * Initializes wheel adhesion, slip state, sander activation, and wheel rotation registers.
   */
  constructor() {
    this.isSlipping = false;
    this.isSanderActive = false;
    this.wheelRotationAngle = 0;
    this.slipDuration = 0;
  }

  /**
   * Evaluates tractive effort against wheel adhesion limit and determines effective traction.
   */
  evaluateTraction(requestedTractiveN, locomotiveMassKg, isWetTrack = false) {
    const tmp_normalForceN = locomotiveMassKg * cons_PHYSICS.GRAVITY_ACCEL;

    // Base adhesion coefficient
    let tmp_mu = isWetTrack ? cons_PHYSICS.STEEL_ON_STEEL_FRICTION_WET : cons_PHYSICS.STEEL_ON_STEEL_FRICTION_DRY;

    // Apply sander traction enhancement
    if (this.isSanderActive) {
      tmp_mu += cons_PHYSICS.SAND_FRICTION_BOOST;
    }

    // Maximum static tractive adhesion limit
    const tmp_maxAdhesiveForceN = tmp_normalForceN * tmp_mu;

    // Check if requested tractive effort exceeds rail adhesion
    if (Math.abs(requestedTractiveN) > tmp_maxAdhesiveForceN) {
      this.isSlipping = true;
      // Kinetic friction during wheel spin out is reduced
      const tmp_effectiveTractionN = tmp_maxAdhesiveForceN *
        cons_PHYSICS.KINETIC_SLIP_FRICTION_RATIO * Math.sign(requestedTractiveN);

      return {
        effectiveTractionN: tmp_effectiveTractionN,
        isSlipping: true,
        adhesionLimitN: tmp_maxAdhesiveForceN,
      };
    }

    this.isSlipping = false;
    return {
      effectiveTractionN: requestedTractiveN,
      isSlipping: false,
      adhesionLimitN: tmp_maxAdhesiveForceN,
    };
  }

  /**
   * Updates wheel angular rotation at fixed deterministic timestep.
   */
  update(fixedDeltaTime, linearSpeedMps) {
    if (this.isSlipping) {
      this.slipDuration += fixedDeltaTime;
      // Wheels spin out faster when slipping under throttle
      this.wheelRotationAngle += (linearSpeedMps * 2.2 + 8.0) * fixedDeltaTime / cons_PHYSICS.WHEEL_RADIUS_METERS;
    } else {
      this.slipDuration = 0;
      // Pure rolling contact
      this.wheelRotationAngle += linearSpeedMps * fixedDeltaTime / cons_PHYSICS.WHEEL_RADIUS_METERS;
    }
  }

  /**
   * Engages or disengages wheel sander dispenser.
   */
  setSander(isActive) {
    this.isSanderActive = isActive;
  }
}
