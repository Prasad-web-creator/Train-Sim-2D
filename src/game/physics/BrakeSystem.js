/**
 * BrakeSystem.js
 * Manages 0-100% progressive pneumatic service braking, emergency brake dumping, and dynamic braking.
 */

import { cons_PHYSICS } from '../../constants/PhysicsConstants.js';
import { clamp, mpsToKmh } from '../../utils/MathUtils.js';

export class BrakeSystem {
  /**
   * Initializes service brake ratio, emergency state, and brake pipe air pressure.
   */
  constructor() {
    this.targetBrakeRatio = 0;    // 0.0 to 1.0 (0-100%)
    this.effectiveBrakeRatio = 0; // Lagged pneumatic cylinder application
    this.isEmergencyBrake = false;
    this.brakePipePressureBar = cons_PHYSICS.BRAKE_PRESSURE_RELEASED; // 5.0 bar
    this.dynamicBrakeRatio = 0;   // 0.0 to 1.0
  }

  /**
   * Sets driver progressive service brake handle setting (0.0 to 1.0).
   */
  setTargetServiceBrake(ratio) {
    this.targetBrakeRatio = clamp(ratio, 0.0, 1.0);
    if (this.targetBrakeRatio < 0.02 && this.isEmergencyBrake) {
      this.isEmergencyBrake = false;
    }
  }

  /**
   * Triggers emergency stop application, completely venting brake pipe to 0 bar.
   */
  applyEmergencyBrake() {
    this.isEmergencyBrake = true;
    this.targetBrakeRatio = 1.0;
    this.brakePipePressureBar = cons_PHYSICS.BRAKE_PRESSURE_EMERGENCY;
    this.effectiveBrakeRatio = 1.0;
  }

  /**
   * Releases emergency brake and recharges air system.
   */
  releaseEmergencyBrake() {
    this.isEmergencyBrake = false;
    this.targetBrakeRatio = 0;
  }

  /**
   * Updates pneumatic brake pipe pressure and smooth cylinder application at fixed timestep.
   */
  update(fixedDeltaTime) {
    if (this.isEmergencyBrake) {
      this.effectiveBrakeRatio = 1.0;
      this.brakePipePressureBar = cons_PHYSICS.BRAKE_PRESSURE_EMERGENCY;
      return;
    }

    // 1. Smooth pneumatic air pressure propagation: fill & discharge rates
    const tmp_targetPressure = cons_PHYSICS.BRAKE_PRESSURE_RELEASED -
      this.targetBrakeRatio * (cons_PHYSICS.BRAKE_PRESSURE_RELEASED - cons_PHYSICS.BRAKE_PRESSURE_FULL_SERVICE);

    if (this.brakePipePressureBar < tmp_targetPressure) {
      // Recharging air
      this.brakePipePressureBar = Math.min(
        tmp_targetPressure,
        this.brakePipePressureBar + cons_PHYSICS.BRAKE_PIPE_CHARGE_RATE * fixedDeltaTime
      );
    } else if (this.brakePipePressureBar > tmp_targetPressure) {
      // Venting air
      this.brakePipePressureBar = Math.max(
        tmp_targetPressure,
        this.brakePipePressureBar - cons_PHYSICS.BRAKE_PIPE_DISCHARGE_RATE * fixedDeltaTime
      );
    }

    // Effective cylinder brake ratio derived from pressure drop
    const tmp_pressureDrop = cons_PHYSICS.BRAKE_PRESSURE_RELEASED - this.brakePipePressureBar;
    const tmp_maxServiceDrop = cons_PHYSICS.BRAKE_PRESSURE_RELEASED - cons_PHYSICS.BRAKE_PRESSURE_FULL_SERVICE;
    this.effectiveBrakeRatio = clamp(tmp_pressureDrop / tmp_maxServiceDrop, 0.0, 1.0);
  }

  /**
   * Computes aggregate total braking retardation force in Newtons.
   */
  calculateBrakingForce(currentSpeedMps) {
    if (Math.abs(currentSpeedMps) < 0.01) {
      return 0; // Zero force when stopped
    }

    let tmp_totalForceN = 0;

    // 1. Emergency brake force
    if (this.isEmergencyBrake) {
      tmp_totalForceN = cons_PHYSICS.EMERGENCY_BRAKE_FORCE;
    } else if (this.effectiveBrakeRatio > 0.01) {
      // 2. Service brake force (progressive 0-100%)
      tmp_totalForceN = cons_PHYSICS.SERVICE_BRAKE_MAX_FORCE * this.effectiveBrakeRatio;
    }

    // 3. Dynamic rheostatic brake force (effective above threshold speed)
    const tmp_speedKmh = Math.abs(mpsToKmh(currentSpeedMps));
    if (this.dynamicBrakeRatio > 0.01 && tmp_speedKmh > cons_PHYSICS.DYNAMIC_BRAKE_MIN_SPEED_KMH) {
      const tmp_dynamicFactor = Math.min(1.0, (tmp_speedKmh - cons_PHYSICS.DYNAMIC_BRAKE_MIN_SPEED_KMH) / 15.0);
      tmp_totalForceN += cons_PHYSICS.DYNAMIC_BRAKE_MAX_FORCE * this.dynamicBrakeRatio * tmp_dynamicFactor;
    }

    // Braking force always opposes direction of motion
    return tmp_totalForceN * Math.sign(currentSpeedMps);
  }

  /**
   * Resets brake state to fully released.
   */
  reset() {
    this.targetBrakeRatio = 0;
    this.effectiveBrakeRatio = 0;
    this.isEmergencyBrake = false;
    this.brakePipePressureBar = cons_PHYSICS.BRAKE_PRESSURE_RELEASED;
    this.dynamicBrakeRatio = 0;
  }
}
