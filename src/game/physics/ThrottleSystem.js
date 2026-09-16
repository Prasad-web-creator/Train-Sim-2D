/**
 * ThrottleSystem.js
 * Manages 0-100% throttle input, engine spool-up lag, prime-mover RPM, direction, and tractive effort.
 */

import { cons_PHYSICS, cons_TRAIN_DIRECTION } from '../../constants/PhysicsConstants.js';
import { clamp, lerp } from '../../utils/MathUtils.js';

export class ThrottleSystem {
  /**
   * Initializes throttle registers, spool-up rates, direction, and engine thermal state.
   */
  constructor(obj_locoModel = null) {
    this.locoModel = obj_locoModel;
    this.targetThrottle = 0;   // 0.0 to 1.0 (0-100%)
    this.effectiveThrottle = 0;// Lagged actual engine output
    this.direction = cons_TRAIN_DIRECTION.FORWARD; // 1, 0, -1

    this.engineRpm = cons_PHYSICS.ENGINE_RPM_IDLE;
    this.targetRpm = cons_PHYSICS.ENGINE_RPM_IDLE;
    this.engineTempC = cons_PHYSICS.ENGINE_TEMP_NORMAL;
    this.isCoolantActive = false;

    this.isDynamicBraking = false;
    this.dynamicBrakeRatio = 0; // 0.0 to 1.0
  }

  /**
   * Sets engine radiator coolant fan status.
   */
  setCoolant(isActive) {
    this.isCoolantActive = isActive;
  }

  /**
   * Sets target driver throttle setting from 0.0 to 1.0 (0% to 100%).
   */
  setTargetThrottle(ratio) {
    this.targetThrottle = clamp(ratio, 0.0, 1.0);
    // If opening throttle, cancel dynamic braking
    if (this.targetThrottle > 0.05) {
      this.isDynamicBraking = false;
      this.dynamicBrakeRatio = 0;
    }
  }

  /**
   * Sets reverser travel direction (FORWARD, NEUTRAL, REVERSE) safely.
   */
  setDirection(newDirection) {
    this.direction = newDirection;
  }

  /**
   * Engages or disengages dynamic rheostatic motor braking.
   */
  setDynamicBrake(ratio) {
    this.dynamicBrakeRatio = clamp(ratio, 0.0, 1.0);
    this.isDynamicBraking = this.dynamicBrakeRatio > 0.01;
    if (this.isDynamicBraking) {
      this.targetThrottle = 0;
    }
  }

  /**
   * Advances throttle spool-up lag and engine RPM at fixed deterministic rate.
   */
  update(fixedDeltaTime) {
    // 1. Heavy engine inertia: smooth spool-up and spool-down
    if (this.effectiveThrottle < this.targetThrottle) {
      this.effectiveThrottle = Math.min(
        this.targetThrottle,
        this.effectiveThrottle + cons_PHYSICS.THROTTLE_RAMP_UP_RATE * fixedDeltaTime
      );
    } else if (this.effectiveThrottle > this.targetThrottle) {
      this.effectiveThrottle = Math.max(
        this.targetThrottle,
        this.effectiveThrottle - cons_PHYSICS.THROTTLE_RAMP_DOWN_RATE * fixedDeltaTime
      );
    }

    // 2. Engine RPM follows effective throttle
    this.targetRpm = cons_PHYSICS.ENGINE_RPM_IDLE +
      this.effectiveThrottle * (cons_PHYSICS.ENGINE_RPM_MAX - cons_PHYSICS.ENGINE_RPM_IDLE);

    const tmp_rpmDelta = (this.targetRpm - this.engineRpm) * fixedDeltaTime * 2.8;
    this.engineRpm += tmp_rpmDelta;

    // 3. Engine operating temperature (coolant reduces temp by 16°C)
    const tmp_coolingDelta = this.isCoolantActive ? 16.0 : 0.0;
    const tmp_targetTemp = (cons_PHYSICS.ENGINE_TEMP_NORMAL + this.effectiveThrottle * 26.0) - tmp_coolingDelta;
    this.engineTempC = lerp(this.engineTempC, tmp_targetTemp, fixedDeltaTime * 0.08);
  }

  /**
   * Calculates tractive effort in Newtons based on power curve and speed.
   */
  calculateTractiveForce(currentSpeedMps) {
    if (this.direction === cons_TRAIN_DIRECTION.NEUTRAL || this.effectiveThrottle <= 0.005) {
      return 0;
    }

    const tmp_maxPower = this.locoModel ? this.locoModel.maxPowerWatts : cons_PHYSICS.MAX_LOCOMOTIVE_POWER;
    const tmp_maxTraction = this.locoModel ? this.locoModel.maxTractiveEffortN : cons_PHYSICS.MAX_TRACTIVE_EFFORT;

    const tmp_availablePower = tmp_maxPower * this.effectiveThrottle;
    const tmp_absSpeed = Math.max(Math.abs(currentSpeedMps), 0.65); // Avoid division by near-zero

    // Force = Power / Velocity, bounded by maximum starting adhesion limit
    const tmp_powerForce = tmp_availablePower / tmp_absSpeed;
    const tmp_effortMagnitude = Math.min(tmp_maxTraction * this.effectiveThrottle, tmp_powerForce);

    // Apply direction (1 for forward, -1 for reverse)
    return tmp_effortMagnitude * this.direction;
  }

  /**
   * Resets throttle and engine state to initial conditions.
   */
  reset() {
    this.targetThrottle = 0;
    this.effectiveThrottle = 0;
    this.targetRpm = cons_PHYSICS.ENGINE_RPM_IDLE;
    this.engineRpm = cons_PHYSICS.ENGINE_RPM_IDLE;
    this.engineTempC = cons_PHYSICS.ENGINE_TEMP_NORMAL;
    this.isCoolantActive = false;
    this.direction = cons_TRAIN_DIRECTION.FORWARD;
    this.isDynamicBraking = false;
    this.dynamicBrakeRatio = 0;
  }
}
