/**
 * TrainPhysicsSystem.js
 * Master deterministic physics orchestrator executing fixed-timestep integration
 * across Throttle, Brake, Speed, Gradient, and Wheel subsystems.
 */

import { ThrottleSystem } from './ThrottleSystem.js';
import { BrakeSystem } from './BrakeSystem.js';
import { SpeedSystem } from './SpeedSystem.js';
import { GradientSystem } from './GradientSystem.js';
import { WheelSystem } from './WheelSystem.js';
import { cons_PHYSICS } from '../../constants/PhysicsConstants.js';

export class TrainPhysicsSystem {
  /**
   * Initializes master physics orchestrator and instantiates all 5 dedicated sub-systems.
   */
  constructor(obj_locoModel = null) {
    this.locoModel = obj_locoModel;
    this.throttleSystem = new ThrottleSystem(obj_locoModel);
    this.brakeSystem = new BrakeSystem();
    this.speedSystem = new SpeedSystem();
    this.gradientSystem = new GradientSystem();
    this.wheelSystem = new WheelSystem();

    // Fixed timestep accumulator for frame-rate independence
    this.accumulator = 0;

    // Telemetry output object
    this.obj_telemetry = {
      speedKmh: 0,
      speedMps: 0,
      accelerationMps2: 0,
      distanceMeters: 0,
      engineRpm: cons_PHYSICS.ENGINE_RPM_IDLE,
      engineTempC: cons_PHYSICS.ENGINE_TEMP_NORMAL,
      brakePipePressureBar: cons_PHYSICS.BRAKE_PRESSURE_RELEASED,
      isWheelSlipping: false,
      isSanderActive: false,
      effectiveThrottleRatio: 0,
      effectiveBrakeRatio: 0,
      trackGradePercent: 0,
      tractiveEffortN: 0,
      resistanceN: 0,
      slopeForceN: 0,
      brakingForceN: 0,
    };
  }

  /**
   * Sets locomotive model specifications.
   */
  setLocomotiveModel(obj_locoModel) {
    this.locoModel = obj_locoModel;
    this.throttleSystem.locoModel = obj_locoModel;
  }

  /**
   * Advances physics simulation with deterministic fixed timestep accumulator loop.
   */
  update(deltaTime, throttleRatio, direction, serviceBrakeRatio, isEmergencyBrake, isSanderActive, totalConsistMassKg, trackSystem, isWetTrack = false, isCoolantActive = false) {
    // 1. Apply driver inputs to subsystems
    this.throttleSystem.setTargetThrottle(throttleRatio);
    this.throttleSystem.setDirection(direction);
    this.throttleSystem.setCoolant(isCoolantActive);

    if (isEmergencyBrake) {
      this.brakeSystem.applyEmergencyBrake();
      this.throttleSystem.setTargetThrottle(0);
    } else {
      this.brakeSystem.setTargetServiceBrake(serviceBrakeRatio);
    }

    this.wheelSystem.setSander(isSanderActive);

    // 2. Fixed timestep accumulator to guarantee frame-rate independence
    const tmp_clampedDelta = Math.min(deltaTime, cons_PHYSICS.MAX_ACCUMULATOR_TIME);
    this.accumulator += tmp_clampedDelta;

    const cons_STEP = cons_PHYSICS.FIXED_TIMESTEP;
    while (this.accumulator >= cons_STEP) {
      this.fixedStep(cons_STEP, totalConsistMassKg, trackSystem, isWetTrack);
      this.accumulator -= cons_STEP;
    }

    // 3. Populate telemetry record
    this.obj_telemetry.speedKmh = this.speedSystem.speedMps * 3.6;
    this.obj_telemetry.speedMps = this.speedSystem.speedMps;
    this.obj_telemetry.accelerationMps2 = this.speedSystem.accelerationMps2;
    this.obj_telemetry.distanceMeters = this.speedSystem.distanceMeters;
    this.obj_telemetry.engineRpm = this.throttleSystem.engineRpm;
    this.obj_telemetry.engineTempC = this.throttleSystem.engineTempC;
    this.obj_telemetry.brakePipePressureBar = this.brakeSystem.brakePipePressureBar;
    this.obj_telemetry.isWheelSlipping = this.wheelSystem.isSlipping;
    this.obj_telemetry.isSanderActive = this.wheelSystem.isSanderActive;
    this.obj_telemetry.isCoolantActive = isCoolantActive;
    this.obj_telemetry.effectiveThrottleRatio = this.throttleSystem.effectiveThrottle;
    this.obj_telemetry.effectiveBrakeRatio = this.brakeSystem.effectiveBrakeRatio;
    this.obj_telemetry.trackGradePercent = this.gradientSystem.getGradePercent();

    return this.obj_telemetry;
  }

  /**
   * Executes a single deterministic fixed timestep step across all 5 subsystems.
   */
  fixedStep(fixedDeltaTime, totalConsistMassKg, trackSystem, isWetTrack = false) {
    const tmp_locoMassKg = this.locoModel ? this.locoModel.massKg : 168000;
    const tmp_curSpeedMps = this.speedSystem.speedMps;
    const tmp_curDistMeters = this.speedSystem.distanceMeters;

    // A. Update throttle spool-up & engine thermals
    this.throttleSystem.update(fixedDeltaTime);

    // B. Update pneumatic brake cylinder pressures
    this.brakeSystem.update(fixedDeltaTime);

    // C. Calculate raw tractive effort requested by throttle
    const tmp_rawTractiveN = this.throttleSystem.calculateTractiveForce(tmp_curSpeedMps);

    // D. Evaluate tractive effort against wheel adhesion limits (with wet rail physics)
    const obj_adhesion = this.wheelSystem.evaluateTraction(tmp_rawTractiveN, tmp_locoMassKg, isWetTrack);
    const tmp_effectiveTractiveN = obj_adhesion.effectiveTractionN;

    // E. Calculate braking retardation force
    const tmp_brakingForceN = this.brakeSystem.calculateBrakingForce(tmp_curSpeedMps);

    // F. Calculate Davis rolling resistance and aerodynamic drag
    const tmp_resistanceN = this.speedSystem.calculateDavisResistance(tmp_curSpeedMps, totalConsistMassKg);

    // G. Calculate gravitational slope gradient force
    const tmp_slopeForceN = this.gradientSystem.calculateGradientForce(tmp_curDistMeters, totalConsistMassKg, trackSystem);

    // H. Sum net forces: F_net = F_traction - F_drag - F_grade - F_brakes
    const tmp_netForceN = tmp_effectiveTractiveN - tmp_resistanceN - tmp_slopeForceN - tmp_brakingForceN;

    // I. Deterministic velocity and distance integration: a = F_net / m
    const tmp_isBraking = this.brakeSystem.effectiveBrakeRatio > 0.02 || this.brakeSystem.isEmergencyBrake;
    this.speedSystem.integrate(fixedDeltaTime, tmp_netForceN, totalConsistMassKg, tmp_isBraking);

    // J. Update wheel rotation
    this.wheelSystem.update(fixedDeltaTime, this.speedSystem.speedMps);

    // Store force components
    this.obj_telemetry.tractiveEffortN = tmp_effectiveTractiveN;
    this.obj_telemetry.brakingForceN = tmp_brakingForceN;
    this.obj_telemetry.resistanceN = tmp_resistanceN;
    this.obj_telemetry.slopeForceN = tmp_slopeForceN;
  }

  /**
   * Resets all subsystems to initial zero-velocity rest state.
   */
  reset() {
    this.throttleSystem.reset();
    this.brakeSystem.reset();
    this.speedSystem.reset();
    this.accumulator = 0;
  }
}
