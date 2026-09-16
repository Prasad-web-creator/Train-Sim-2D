/**
 * PhysicsConstants.js
 * Centralized configuration dictionary for train dynamics, forces, resistances, and simulation timing.
 * Zero physics values are hard-coded in logic.
 */

// Train travel directions
export const cons_TRAIN_DIRECTION = Object.freeze({
  FORWARD: 1,
  NEUTRAL: 0,
  REVERSE: -1,
});

// Centralized physics tuning parameters
export const cons_PHYSICS = Object.freeze({
  // Simulation loop timing (deterministic frame-rate independent fixed step)
  FIXED_TIMESTEP: 1 / 60, // 60 Hz deterministic physics
  MAX_ACCUMULATOR_TIME: 0.1, // Clamp max frame time to avoid spiral of death
  GRAVITY_ACCEL: 9.80665, // m/s^2

  // Locomotive power and tractive effort
  MAX_LOCOMOTIVE_POWER: 3200000, // Watts (~4300 HP)
  MAX_TRACTIVE_EFFORT: 420000,   // Newtons maximum starting tractive effort
  THROTTLE_RAMP_UP_RATE: 0.30,   // Throttle spool-up lag per second (heavy engine inertia)
  THROTTLE_RAMP_DOWN_RATE: 0.65, // Throttle power decay per second
  ENGINE_RPM_IDLE: 310,
  ENGINE_RPM_MAX: 1050,
  ENGINE_RPM_RAMP_RATE: 240,     // RPM change per second
  ENGINE_TEMP_NORMAL: 82,        // Celsius
  ENGINE_TEMP_MAX: 115,

  // Speed limits
  MAX_FORWARD_SPEED_KMH: 125,
  MAX_REVERSE_SPEED_KMH: 42,
  STOP_THRESHOLD_SPEED_MPS: 0.14, // Train snaps to full rest below ~0.5 km/h when brakes applied

  // Pneumatic & dynamic brakes
  SERVICE_BRAKE_MAX_FORCE: 195000, // Newtons (0-100% progressive service brake)
  EMERGENCY_BRAKE_FORCE: 350000,   // Newtons (emergency application)
  DYNAMIC_BRAKE_MAX_FORCE: 145000, // Newtons (rheostatic motor retardation)
  DYNAMIC_BRAKE_MIN_SPEED_KMH: 7.0, // Dynamic braking fades at low speeds
  BRAKE_PIPE_CHARGE_RATE: 0.38,    // Bar/sec charging rate
  BRAKE_PIPE_DISCHARGE_RATE: 1.4,  // Bar/sec emergency venting rate
  BRAKE_PRESSURE_RELEASED: 5.0,    // Bar
  BRAKE_PRESSURE_FULL_SERVICE: 3.2,// Bar
  BRAKE_PRESSURE_EMERGENCY: 0.0,   // Bar

  // Davis equation rolling and aerodynamic resistance: R = A*(m/100) + B*v + C*v^2
  DAVIS_A: 1250, // Mechanical rolling resistance constant (N)
  DAVIS_B: 28.5, // Wheel flange & track friction coefficient (N / (km/h))
  DAVIS_C: 0.44, // Aerodynamic profile drag coefficient (N / (km/h)^2)

  // Wheel-rail contact adhesion and wheel slip
  STEEL_ON_STEEL_FRICTION_DRY: 0.36,
  STEEL_ON_STEEL_FRICTION_WET: 0.21,
  KINETIC_SLIP_FRICTION_RATIO: 0.60, // Friction reduction when wheels spin out
  SAND_FRICTION_BOOST: 0.18,         // Sander grip enhancement
  WHEEL_RADIUS_METERS: 0.48,         // Wheel radius for rotation
});

// Throttle notch distribution table (Notch 0 to 8)
export const cons_THROTTLE_NOTCHES = Object.freeze([
  0.00, // Notch 0 (Idle)
  0.10, // Notch 1
  0.22, // Notch 2
  0.35, // Notch 3
  0.48, // Notch 4
  0.62, // Notch 5
  0.75, // Notch 6
  0.88, // Notch 7
  1.00, // Notch 8 (Full Power)
]);
