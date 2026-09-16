/**
 * Wagon.js
 * Freight wagon entity with velocity-dependent wheel rotation, spring-damper suspension,
 * dynamic coupler slack, and clamping brake shoes.
 */

import { cons_GAME_CONFIG } from '../../constants/GameConstants.js';
import { clamp, lerp } from '../../utils/MathUtils.js';

export class Wagon {
  /**
   * Initializes wagon specifications, mass, bogie geometry, and animation states.
   */
  constructor(obj_wagonType, index) {
    this.model = obj_wagonType;
    this.index = index;
    this.lengthMeters = obj_wagonType.lengthMeters;
    this.lengthPixels = this.lengthMeters * cons_GAME_CONFIG.PIXELS_PER_METER;
    this.totalMassKg = obj_wagonType.emptyMassKg + obj_wagonType.cargoMassKg;
    this.bogieSpacingMeters = this.lengthMeters * 0.68;
    this.wheelRadiusPixels = 15;

    // Spatial world coordinates
    this.distMeters = 0;
    this.speedMps = 0;
    this.worldX = 0;
    this.worldY = 0;
    this.pitchAngle = 0;

    // Bogies tracking
    this.frontBogie = { x: 0, y: 0, angle: 0, suspensionY: 0 };
    this.rearBogie = { x: 0, y: 0, angle: 0, suspensionY: 0 };

    // Velocity-driven wheel rotation
    this.wheelRotationAngle = 0;

    // Suspension spring-damper states
    this.suspensionDisplacement = 0;
    this.suspensionVelocity = 0;

    // Brake shoe clamp
    this.brakeShoeClamp = 0;

    // Dynamic coupler slack displacement (-3px compressed to +2px taut)
    this.couplerSlackOffset = 0;
  }

  /**
   * Updates wagon position, velocity-dependent wheel rotation, suspension bounce, and couplers.
   * 
   * @param {number} distMeters - Track distance in meters
   * @param {number} speedMps - Ground speed in m/s
   * @param {number} deltaTime - Frame step time in seconds
   * @param {Object} trackSystem - Track geometry evaluator
   * @param {number} [brakeRatio=0] - Active brake ratio
   * @param {number} [tractiveForceN=0] - Tractive drawbar pull force
   */
  update(distMeters, speedMps = 0, deltaTime = 0.016, trackSystem, brakeRatio = 0, tractiveForceN = 0) {
    this.distMeters = distMeters;
    this.speedMps = speedMps;
    const cons_DT = clamp(deltaTime, 0.001, 0.1);
    const tmp_ppm = cons_GAME_CONFIG.PIXELS_PER_METER;

    // 1. Velocity-driven wheel rotation
    if (Math.abs(speedMps) > 0.001) {
      const tmp_distanceMovedPixels = speedMps * cons_DT * tmp_ppm;
      this.wheelRotationAngle = (this.wheelRotationAngle + (tmp_distanceMovedPixels / this.wheelRadiusPixels)) % (Math.PI * 2);
    }

    // 2. Bogie geometry along track spline
    const tmp_halfBogieMeters = this.bogieSpacingMeters * 0.5;
    const tmp_frontDist = distMeters + tmp_halfBogieMeters;
    const tmp_rearDist = distMeters - tmp_halfBogieMeters;

    const tmp_frontElevation = trackSystem.getElevationAt(tmp_frontDist);
    const tmp_rearElevation = trackSystem.getElevationAt(tmp_rearDist);

    // 3. Wagon spring-damper suspension bounce
    const cons_SPRING_K = 40.0;
    const cons_DAMPING_C = 7.5;
    const tmp_suspForce = -cons_SPRING_K * this.suspensionDisplacement - cons_DAMPING_C * this.suspensionVelocity;
    this.suspensionVelocity += tmp_suspForce * cons_DT;
    this.suspensionDisplacement += this.suspensionVelocity * cons_DT;
    this.suspensionDisplacement = clamp(this.suspensionDisplacement, -4.0, 4.0);

    // 4. Spatial positions
    this.worldX = distMeters * tmp_ppm;
    this.worldY = ((tmp_frontElevation + tmp_rearElevation) * 0.5) + this.suspensionDisplacement;

    this.frontBogie.x = tmp_frontDist * tmp_ppm;
    this.frontBogie.y = tmp_frontElevation + this.suspensionDisplacement;
    this.frontBogie.angle = trackSystem.getTangentAngleAt(tmp_frontDist);
    this.frontBogie.suspensionY = this.suspensionDisplacement;

    this.rearBogie.x = tmp_rearDist * tmp_ppm;
    this.rearBogie.y = tmp_rearElevation + this.suspensionDisplacement;
    this.rearBogie.angle = trackSystem.getTangentAngleAt(tmp_rearDist);
    this.rearBogie.suspensionY = this.suspensionDisplacement;

    // Body pitch
    const tmp_dx = this.frontBogie.x - this.rearBogie.x;
    const tmp_dy = this.frontBogie.y - this.rearBogie.y;
    this.pitchAngle = Math.atan2(tmp_dy, tmp_dx);

    // 5. Brake shoe clamping
    this.brakeShoeClamp = lerp(this.brakeShoeClamp, brakeRatio, cons_DT * 5.0);

    // 6. Dynamic coupler slack: stretches when pulling (+1.8px), bunches up under braking (-2.4px)
    let tmp_targetSlack = 0;
    if (brakeRatio > 0.1) {
      tmp_targetSlack = -2.4 * brakeRatio;
    } else if (tractiveForceN > 10000) {
      tmp_targetSlack = 1.8;
    }
    this.couplerSlackOffset = lerp(this.couplerSlackOffset, tmp_targetSlack, cons_DT * 4.0);
  }

  /**
   * Triggers a suspension bump impulse.
   */
  triggerSuspensionBump(intensity = 1.5) {
    this.suspensionVelocity += intensity * 3.5;
  }

  /**
   * Computes front coupler coordinate in world pixels (including dynamic slack).
   */
  getFrontCouplerPos() {
    const tmp_offset = (this.lengthPixels * 0.51) + this.couplerSlackOffset;
    return {
      x: this.worldX + Math.cos(this.pitchAngle) * tmp_offset,
      y: this.worldY + Math.sin(this.pitchAngle) * tmp_offset,
    };
  }

  /**
   * Computes rear coupler coordinate in world pixels (including dynamic slack).
   */
  getRearCouplerPos() {
    const tmp_offset = -(this.lengthPixels * 0.51) - this.couplerSlackOffset;
    return {
      x: this.worldX + Math.cos(this.pitchAngle) * tmp_offset,
      y: this.worldY + Math.sin(this.pitchAngle) * tmp_offset,
    };
  }
}

export default Wagon;
