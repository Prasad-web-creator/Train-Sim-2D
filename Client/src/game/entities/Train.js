/**
 * Train.js
 * Locomotive entity managing kinematics, velocity-dependent wheel rotation,
 * spring-damper suspension bounce, body vibration, clamping brake shoes,
 * and pantograph articulation.
 */

import { cons_GAME_CONFIG } from '../../constants/GameConstants.js';
import { clamp, lerp } from '../../utils/MathUtils.js';

export class Train {
  /**
   * Initializes locomotive specifications, dimensions, bogie spacing, and animation states.
   */
  constructor(obj_locoModel) {
    this.model = obj_locoModel;
    this.lengthMeters = obj_locoModel.lengthMeters;
    this.lengthPixels = this.lengthMeters * cons_GAME_CONFIG.PIXELS_PER_METER;
    this.bogieSpacingMeters = this.lengthMeters * 0.62;
    this.bogieSpacingPixels = this.bogieSpacingMeters * cons_GAME_CONFIG.PIXELS_PER_METER;
    this.wheelRadiusPixels = 16;

    // Spatial world coordinates
    this.distMeters = 0;
    this.speedMps = 0;
    this.worldX = 0;
    this.worldY = 0;
    this.pitchAngle = 0; // Body tilt

    // Bogies tracking
    this.frontBogie = { x: 0, y: 0, angle: 0, suspensionY: 0 };
    this.rearBogie = { x: 0, y: 0, angle: 0, suspensionY: 0 };

    // Velocity-driven wheel rotation angle (radians)
    this.wheelRotationAngle = 0;

    // Suspension spring-damper physics states
    this.frontSuspensionDisplacement = 0;
    this.frontSuspensionVelocity = 0;
    this.rearSuspensionDisplacement = 0;
    this.rearSuspensionVelocity = 0;

    // Subtle engine body micro-vibration
    this.bodyVibrationY = 0;
    this.bodyVibrationAngle = 0;
    this.vibrationTimer = 0;

    // Brake shoe clamping and thermal friction glow
    this.brakeShoeClamp = 0;
    this.brakeShoeThermalGlow = 0;

    // Roof pantograph (for electric locomotives)
    this.hasPantograph = !!obj_locoModel.hasPantograph;
    this.pantographHeight = this.hasPantograph ? 1.0 : 0;
    this.pantographSway = 0;

    // Cab door animation
    this.cabDoorOpenRatio = 0; // 0 = fully closed, 1 = open
  }

  /**
   * Updates locomotive position, velocity-dependent wheel rotation, suspension bounce, and vibration.
   * 
   * @param {number} distMeters - Track distance in meters
   * @param {number} speedMps - Ground speed in m/s
   * @param {number} deltaTime - Frame step time in seconds
   * @param {Object} trackSystem - Track geometry evaluator
   * @param {number} [throttleNotch=0] - Current engine throttle (0-8)
   * @param {number} [brakeRatio=0] - Active brake application (0-1)
   */
  update(distMeters, speedMps = 0, deltaTime = 0.016, trackSystem, throttleNotch = 0, brakeRatio = 0) {
    this.distMeters = distMeters;
    this.speedMps = speedMps;
    const cons_DT = clamp(deltaTime, 0.001, 0.1);
    const tmp_ppm = cons_GAME_CONFIG.PIXELS_PER_METER;

    // 1. Velocity-driven wheel rotation (strictly dependent on ground velocity)
    if (Math.abs(speedMps) > 0.001) {
      const tmp_circumference = Math.PI * 2 * this.wheelRadiusPixels;
      const tmp_distanceMovedPixels = speedMps * cons_DT * tmp_ppm;
      this.wheelRotationAngle = (this.wheelRotationAngle + (tmp_distanceMovedPixels / this.wheelRadiusPixels)) % (Math.PI * 2);
    }

    // 2. Bogie distance offsets along track spline
    const tmp_halfBogieMeters = this.bogieSpacingMeters * 0.5;
    const tmp_frontDist = distMeters + tmp_halfBogieMeters;
    const tmp_rearDist = distMeters - tmp_halfBogieMeters;

    const tmp_frontElevation = trackSystem.getElevationAt(tmp_frontDist);
    const tmp_rearElevation = trackSystem.getElevationAt(tmp_rearDist);

    // 3. Spring-damper suspension physics simulation
    const cons_SPRING_K = 48.0; // Spring stiffness
    const cons_DAMPING_C = 8.5; // Shock absorber damping

    // Pitch transfer: heavy braking compresses front suspension and lifts rear
    const tmp_speedKmh = Math.abs(speedMps * 3.6);
    const tmp_pitchTransfer = brakeRatio > 0.1 ? (brakeRatio * 3.0) : 0;

    // Front suspension spring
    const tmp_frontForce = -cons_SPRING_K * this.frontSuspensionDisplacement - cons_DAMPING_C * this.frontSuspensionVelocity + tmp_pitchTransfer;
    this.frontSuspensionVelocity += tmp_frontForce * cons_DT;
    this.frontSuspensionDisplacement += this.frontSuspensionVelocity * cons_DT;
    this.frontSuspensionDisplacement = clamp(this.frontSuspensionDisplacement, -5.0, 5.0);

    // Rear suspension spring
    const tmp_rearForce = -cons_SPRING_K * this.rearSuspensionDisplacement - cons_DAMPING_C * this.rearSuspensionVelocity - tmp_pitchTransfer;
    this.rearSuspensionVelocity += tmp_rearForce * cons_DT;
    this.rearSuspensionDisplacement += this.rearSuspensionVelocity * cons_DT;
    this.rearSuspensionDisplacement = clamp(this.rearSuspensionDisplacement, -5.0, 5.0);

    // 4. Subtle body micro-vibration (engine idle rumble / RPM vibration)
    this.vibrationTimer += cons_DT;
    const tmp_rpmFrequency = 16.0 + throttleNotch * 4.0;
    const tmp_vibeAmplitude = 0.35 + throttleNotch * 0.12;
    this.bodyVibrationY = Math.sin(this.vibrationTimer * tmp_rpmFrequency) * tmp_vibeAmplitude;
    this.bodyVibrationAngle = Math.cos(this.vibrationTimer * 12.0) * 0.0015;

    // 5. Compute vehicle world coordinates
    this.worldX = distMeters * tmp_ppm;
    this.worldY = ((tmp_frontElevation + tmp_rearElevation) * 0.5) + this.bodyVibrationY;

    // Bogie positions with suspension deflection
    this.frontBogie.x = tmp_frontDist * tmp_ppm;
    this.frontBogie.y = tmp_frontElevation + this.frontSuspensionDisplacement;
    this.frontBogie.angle = trackSystem.getTangentAngleAt(tmp_frontDist);
    this.frontBogie.suspensionY = this.frontSuspensionDisplacement;

    this.rearBogie.x = tmp_rearDist * tmp_ppm;
    this.rearBogie.y = tmp_rearElevation + this.rearSuspensionDisplacement;
    this.rearBogie.angle = trackSystem.getTangentAngleAt(tmp_rearDist);
    this.rearBogie.suspensionY = this.rearSuspensionDisplacement;

    // 6. Body pitch angle derived from front/rear bogie height difference
    const tmp_dx = this.frontBogie.x - this.rearBogie.x;
    const tmp_dy = this.frontBogie.y - this.rearBogie.y;
    this.pitchAngle = Math.atan2(tmp_dy, tmp_dx) + this.bodyVibrationAngle;

    // 7. Mechanical brake shoe clamping and thermal friction glow
    this.brakeShoeClamp = lerp(this.brakeShoeClamp, brakeRatio, cons_DT * 6.0);

    // Thermal glow: heats up during heavy braking at speed (> 20 km/h)
    if (brakeRatio > 0.45 && tmp_speedKmh > 20.0) {
      this.brakeShoeThermalGlow = Math.min(1.0, this.brakeShoeThermalGlow + cons_DT * 0.6);
    } else {
      this.brakeShoeThermalGlow = Math.max(0.0, this.brakeShoeThermalGlow - cons_DT * 0.25);
    }

    // 8. Pantograph overhead wire sway (subtle oscillation)
    if (this.hasPantograph) {
      this.pantographSway = Math.sin(this.vibrationTimer * 7.0) * 1.5;
    }
  }

  /**
   * Triggers a suspension bump impulse (e.g. crossing rail expansion joint or switch frog).
   */
  triggerSuspensionBump(intensity = 1.8) {
    this.frontSuspensionVelocity += intensity * 4.0;
    this.rearSuspensionVelocity += intensity * 3.5;
  }

  /**
   * Gets position of the roof exhaust stack in world coordinates.
   */
  getExhaustStackWorldPos() {
    const tmp_stackOffsetAlongBody = -this.lengthPixels * 0.12;
    const tmp_stackHeightAboveTrack = -this.lengthPixels * 0.28;

    const tmp_cos = Math.cos(this.pitchAngle);
    const tmp_sin = Math.sin(this.pitchAngle);

    const tmp_x = this.worldX + tmp_stackOffsetAlongBody * tmp_cos - tmp_stackHeightAboveTrack * tmp_sin;
    const tmp_y = this.worldY + tmp_stackOffsetAlongBody * tmp_sin + tmp_stackHeightAboveTrack * tmp_cos;

    return { x: tmp_x, y: tmp_y };
  }

  /**
   * Gets position of the roof pantograph contact head in world coordinates.
   */
  getPantographWorldPos() {
    const tmp_pantoOffsetAlongBody = -this.lengthPixels * 0.22;
    const tmp_pantoHeightAboveTrack = -this.lengthPixels * 0.36;

    const tmp_cos = Math.cos(this.pitchAngle);
    const tmp_sin = Math.sin(this.pitchAngle);

    const tmp_x = this.worldX + tmp_pantoOffsetAlongBody * tmp_cos - tmp_pantoHeightAboveTrack * tmp_sin;
    const tmp_y = this.worldY + tmp_pantoOffsetAlongBody * tmp_sin + tmp_pantoHeightAboveTrack * tmp_cos;

    return { x: tmp_x, y: tmp_y };
  }

  /**
   * Gets front coupler coordinate in world space.
   */
  getFrontCouplerPos() {
    const tmp_offset = this.lengthPixels * 0.52;
    return {
      x: this.worldX + Math.cos(this.pitchAngle) * tmp_offset,
      y: this.worldY + Math.sin(this.pitchAngle) * tmp_offset,
    };
  }

  /**
   * Gets rear coupler coordinate in world space.
   */
  getRearCouplerPos() {
    const tmp_offset = -this.lengthPixels * 0.52;
    return {
      x: this.worldX + Math.cos(this.pitchAngle) * tmp_offset,
      y: this.worldY + Math.sin(this.pitchAngle) * tmp_offset,
    };
  }
}

export default Train;
