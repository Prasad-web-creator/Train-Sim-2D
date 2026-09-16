/**
 * WheelPhysics.js
 * Wheel-rail contact adhesion, wheel slip detection, and sander traction boosting.
 */

import { cons_PHYSICS } from '../../constants/PhysicsConstants.js';
import { cons_GAME_CONFIG } from '../../constants/GameConstants.js';

export class WheelPhysics {
  /**
   * Initializes wheel adhesion state, slip counters, and slip threshold.
   */
  constructor() {
    this.isSlipping = false;
    this.slipDuration = 0;
    this.sparkSpawnTimer = 0;
  }

  /**
   * Evaluates tractive effort against wheel adhesion limit and detects wheel slip.
   */
  calculateAdhesion(locomotiveMassKg, tractiveEffortN, isSanderActive, isWetTrack = false) {
    // Normal force on driving wheelsets
    const tmp_normalForce = locomotiveMassKg * cons_GAME_CONFIG.GRAVITY;

    // Base steel on steel adhesion coefficient
    let tmp_frictionCoeff = isWetTrack ? cons_PHYSICS.STEEL_ON_STEEL_FRICTION_WET : cons_PHYSICS.STEEL_ON_STEEL_FRICTION_DRY;

    // Apply sander boost if driver engaged sander
    if (isSanderActive) {
      tmp_frictionCoeff += cons_PHYSICS.SAND_FRICTION_BOOST;
    }

    // Maximum adhesive tractive limit before wheels break traction and spin
    const tmp_maxAdhesiveForce = tmp_normalForce * tmp_frictionCoeff;

    // Detect wheel slip when requested tractive force exceeds adhesive limit
    if (Math.abs(tractiveEffortN) > tmp_maxAdhesiveForce) {
      this.isSlipping = true;
      // When slipping, kinetic friction is lower than static adhesion
      const tmp_slipFactor = 0.65;
      const tmp_effectiveTraction = tmp_maxAdhesiveForce * tmp_slipFactor * Math.sign(tractiveEffortN);
      return {
        effectiveTractionN: tmp_effectiveTraction,
        isSlipping: true,
        adhesionLimitN: tmp_maxAdhesiveForce,
      };
    }

    this.isSlipping = false;
    return {
      effectiveTractionN: tractiveEffortN,
      isSlipping: false,
      adhesionLimitN: tmp_maxAdhesiveForce,
    };
  }

  /**
   * Updates wheel slip timer and checks if spark particle should be spawned.
   */
  update(deltaTime, isCurrentlySlipping) {
    if (isCurrentlySlipping) {
      this.slipDuration += deltaTime;
      this.sparkSpawnTimer += deltaTime;
    } else {
      this.slipDuration = 0;
      this.sparkSpawnTimer = 0;
    }
  }
}
