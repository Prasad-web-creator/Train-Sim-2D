/**
 * SpeedSystem.js
 * Integrates velocity, acceleration, distance, Davis rolling resistance, and heavy inertia.
 */

import { cons_PHYSICS } from '../../constants/PhysicsConstants.js';
import { clamp, mpsToKmh, kmhToMps } from '../../utils/MathUtils.js';

export class SpeedSystem {
  /**
   * Initializes speed, acceleration, distance traveled, and rolling resistance states.
   */
  constructor() {
    this.speedMps = 0;
    this.accelerationMps2 = 0;
    this.distanceMeters = 0;
  }

  /**
   * Calculates Davis rolling and aerodynamic drag resistance force in Newtons.
   */
  calculateDavisResistance(speedMps, totalMassKg) {
    if (Math.abs(speedMps) < 0.02) return 0;

    const tmp_speedKmh = Math.abs(mpsToKmh(speedMps));
    const tmp_massTons = totalMassKg / 1000;

    // Davis formula: R = A*(m/100) + B*v + C*v^2
    const tmp_dragN = cons_PHYSICS.DAVIS_A * (tmp_massTons / 100) +
                      cons_PHYSICS.DAVIS_B * tmp_speedKmh +
                      cons_PHYSICS.DAVIS_C * tmp_speedKmh * tmp_speedKmh;

    // Resistance always opposes direction of motion
    return tmp_dragN * Math.sign(speedMps);
  }

  /**
   * Advances velocity and position integration at fixed deterministic timestep: a = F / m.
   */
  integrate(fixedDeltaTime, netForceN, totalMassKg, isBrakeActive = false) {
    // 1. Newton's Second Law: a = F_net / m
    this.accelerationMps2 = netForceN / totalMassKg;

    const tmp_prevSpeedMps = this.speedMps;
    this.speedMps += this.accelerationMps2 * fixedDeltaTime;

    // 2. Bring train to a clean full stop when braking at near-zero crawl speed
    if (isBrakeActive) {
      if ((tmp_prevSpeedMps > 0 && this.speedMps < 0) ||
          (tmp_prevSpeedMps < 0 && this.speedMps > 0) ||
          Math.abs(this.speedMps) < cons_PHYSICS.STOP_THRESHOLD_SPEED_MPS) {
        this.speedMps = 0;
        this.accelerationMps2 = 0;
      }
    }

    // 3. Enforce maximum speed limits
    const tmp_maxForwardMps = kmhToMps(cons_PHYSICS.MAX_FORWARD_SPEED_KMH);
    const tmp_maxReverseMps = kmhToMps(cons_PHYSICS.MAX_REVERSE_SPEED_KMH);
    this.speedMps = clamp(this.speedMps, -tmp_maxReverseMps, tmp_maxForwardMps);

    // 4. Integrate longitudinal distance along track
    this.distanceMeters += this.speedMps * fixedDeltaTime;
    if (this.distanceMeters < 0) {
      this.distanceMeters = 0;
      this.speedMps = Math.max(0, this.speedMps);
    }

    return {
      speedMps: this.speedMps,
      speedKmh: mpsToKmh(this.speedMps),
      accelerationMps2: this.accelerationMps2,
      distanceMeters: this.distanceMeters,
    };
  }

  /**
   * Resets speed, distance, and acceleration to zero.
   */
  reset() {
    this.speedMps = 0;
    this.accelerationMps2 = 0;
    this.distanceMeters = 0;
  }
}
