/**
 * TrainPhysics.js
 * Unified physics adapter delegating to the modular, deterministic, fixed-step TrainPhysicsSystem.
 */

import { TrainPhysicsSystem } from './TrainPhysicsSystem.js';
import { cons_THROTTLE_NOTCHES } from '../../constants/PhysicsConstants.js';

export class TrainPhysics {
  /**
   * Initializes train physics adapter and master fixed-step TrainPhysicsSystem.
   */
  constructor(obj_locoModel) {
    this.locoModel = obj_locoModel;
    this.system = new TrainPhysicsSystem(obj_locoModel);
  }

  /**
   * Linear train speed in meters per second.
   */
  get speedMps() {
    return this.system.speedSystem.speedMps;
  }
  set speedMps(val) {
    this.system.speedSystem.speedMps = val;
  }

  /**
   * Acceleration in meters per second squared.
   */
  get accelerationMps2() {
    return this.system.speedSystem.accelerationMps2;
  }

  /**
   * Longitudinal distance traveled along track in meters.
   */
  get distanceMeters() {
    return this.system.speedSystem.distanceMeters;
  }
  set distanceMeters(val) {
    this.system.speedSystem.distanceMeters = val;
  }

  /**
   * Engine prime-mover RPM.
   */
  get engineRpm() {
    return this.system.throttleSystem.engineRpm;
  }

  /**
   * Engine operating temperature in Celsius.
   */
  get engineTempC() {
    return this.system.throttleSystem.engineTempC;
  }

  /**
   * Pneumatic brake pipe air pressure in Bar.
   */
  get brakePipePressureBar() {
    return this.system.brakeSystem.brakePipePressureBar;
  }

  /**
   * Telemetry output dictionary.
   */
  get obj_telemetry() {
    return this.system.obj_telemetry;
  }

  /**
   * Advances deterministic train physics simulation through the 5 dedicated sub-systems.
   */
  update(deltaTime, throttleNotchOrRatio, reverser, brakeRatio, isSanderActive, trackGradeAngleRad, totalConsistMassKg, trackSystem = null, isWetTrack = false, isCoolantActive = false) {
    // Determine throttle ratio from notch (0-8) or normalized (0.0 to 1.0)
    let tmp_throttleRatio = 0;
    if (typeof throttleNotchOrRatio === 'number') {
      if (throttleNotchOrRatio > 1.0) {
        // Notch 0 to 8
        const tmp_notchIdx = Math.min(8, Math.max(0, Math.round(throttleNotchOrRatio)));
        tmp_throttleRatio = cons_THROTTLE_NOTCHES[tmp_notchIdx] || 0;
      } else {
        // Continuous 0.0 to 1.0 (0-100%)
        tmp_throttleRatio = Math.max(0, Math.min(1.0, throttleNotchOrRatio));
      }
    }

    const tmp_isEmergency = brakeRatio >= 0.98;

    return this.system.update(
      deltaTime,
      tmp_throttleRatio,
      reverser,
      brakeRatio,
      tmp_isEmergency,
      isSanderActive,
      totalConsistMassKg,
      trackSystem,
      isWetTrack,
      isCoolantActive
    );
  }

  /**
   * Resets train position, velocity, and sub-systems to initial zero state.
   */
  reset() {
    this.system.reset();
  }
}
