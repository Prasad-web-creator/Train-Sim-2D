/**
 * SignalConstants.js
 * Definitions, enums, advisory speeds, and penalty constants for railway signalling.
 */

// 5 Signal aspect states
export const cons_SIGNAL_STATES = Object.freeze({
  RED: 'RED',
  YELLOW: 'YELLOW',
  DOUBLE_YELLOW: 'DOUBLE_YELLOW',
  GREEN: 'GREEN',
  OFF: 'OFF',
});

// Signal physical structure mounting types
export const cons_SIGNAL_TYPES = Object.freeze({
  MAST: 'mast',       // Ground tubular/lattice mast with ladder and base relay cabinet
  GANTRY: 'gantry',   // Cantilever steel truss bridge suspended over tracks
  DWARF: 'dwarf',     // Ground-level miniature shunting signal
});

// Advisory speed limits associated with signal aspects (km/h)
export const cons_SIGNAL_ADVISORY_SPEEDS = Object.freeze({
  [cons_SIGNAL_STATES.GREEN]: 999, // Unrestricted (governed by track line speed)
  [cons_SIGNAL_STATES.DOUBLE_YELLOW]: 75, // Preliminary caution: prepare to reduce speed
  [cons_SIGNAL_STATES.YELLOW]: 45, // Caution: prepare to stop at next signal
  [cons_SIGNAL_STATES.RED]: 0,    // Danger: absolute stop before signal
  [cons_SIGNAL_STATES.OFF]: 0,    // Unlit / failed signal: treat as most restrictive (stop)
});

// Gameplay rules, detection thresholds, and penalty points
export const cons_SIGNAL_RULES = Object.freeze({
  DETECTION_RANGE_METERS: 1500,     // Forward scanning preview range for cab signalling
  AWS_WARNING_DISTANCE_METERS: 350,  // Distance at which caution buzzer sounds if aspect != Green
  SPAD_PENALTY_POINTS: 500,          // Penalty deducted on Signal Passed At Danger (RED)
  OVERSPEED_PENALTY_POINTS: 50,      // Penalty for speeding past caution signals
  SPAD_VIOLATION_DURATION_SEC: 6.0,  // On-screen violation alert display duration
  DEFAULT_BLOCK_LENGTH_METERS: 850,  // Standard spacing between automatic block signals
});
