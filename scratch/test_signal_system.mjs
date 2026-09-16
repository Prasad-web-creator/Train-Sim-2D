/**
 * test_signal_system.mjs
 * Verification test suite for railway signals: RailSignal, SignalLight, SignalDetector, SignalSystem.
 */

import {
  cons_SIGNAL_STATES,
  cons_SIGNAL_TYPES,
  cons_SIGNAL_RULES,
  SignalLight,
  RailSignal,
  SignalDetector,
  SignalSystem,
} from 'file:///c:/Users/kd_pr/Downloads/TrainSim/src/game/signals/index.js';
import { arr_MISSIONS } from 'file:///c:/Users/kd_pr/Downloads/TrainSim/src/game/missions/MissionData.js';
import { TrackSystem } from 'file:///c:/Users/kd_pr/Downloads/TrainSim/src/game/systems/TrackSystem.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- 1. Testing SignalLight Optical Components ---');
const light = new SignalLight('yellow', 0);
assert(!light.isOn, 'Signal light starts OFF');
assert(light.brightness === 0, 'Brightness starts at 0 (cold filament)');

light.turnOn();
assert(light.isOn, 'Signal light is turned ON');
light.update(0.05);
assert(light.brightness > 0, `Brightness ramps up with thermal curve: ${light.brightness.toFixed(3)}`);

light.turnOff();
assert(!light.isOn, 'Signal light is turned OFF');
for (let i = 0; i < 20; i++) light.update(0.05);
assert(light.brightness === 0, 'Brightness cools down to 0');


console.log('\n--- 2. Testing RailSignal 4-Aspect Configurations ---');
const signal = new RailSignal({
  id: 'sig_test',
  name: 'SIG 01',
  trackDistMeters: 500,
  state: cons_SIGNAL_STATES.GREEN,
});

assert(signal.arr_lights.length === 4, 'Signal has 4 optical lamp units (4-aspect head)');
assert(signal.arr_lights[1].isOn, 'In GREEN state, only Green lamp (slot 1) is ON');
assert(!signal.arr_lights[3].isOn, 'In GREEN state, Red lamp (slot 3) is OFF');

// Test DOUBLE_YELLOW
signal.setAspect(cons_SIGNAL_STATES.DOUBLE_YELLOW);
assert(signal.arr_lights[0].isOn, 'In DOUBLE_YELLOW state, Upper Yellow (slot 0) is ON');
assert(signal.arr_lights[2].isOn, 'In DOUBLE_YELLOW state, Lower Yellow (slot 2) is ON');
assert(!signal.arr_lights[1].isOn, 'In DOUBLE_YELLOW state, Green lamp is OFF');
assert(!signal.arr_lights[3].isOn, 'In DOUBLE_YELLOW state, Red lamp is OFF');

// Test YELLOW
signal.setAspect(cons_SIGNAL_STATES.YELLOW);
assert(!signal.arr_lights[0].isOn, 'In YELLOW state, Upper Yellow is OFF');
assert(signal.arr_lights[2].isOn, 'In YELLOW state, Lower Yellow is ON');
assert(!signal.arr_lights[3].isOn, 'In YELLOW state, Red is OFF');

// Test RED
signal.setAspect(cons_SIGNAL_STATES.RED);
assert(signal.arr_lights[3].isOn, 'In RED state, Red lamp (slot 3) is ON');
assert(!signal.arr_lights[0].isOn && !signal.arr_lights[1].isOn && !signal.arr_lights[2].isOn, 'All other lamps are OFF');

// Test OFF
signal.setAspect(cons_SIGNAL_STATES.OFF);
assert(signal.arr_lights.every(l => !l.isOn), 'In OFF state, all 4 lamps are unlit/dark');


console.log('\n--- 3. Testing SignalDetector & SPAD Violation Enforcement ---');
const detector = new SignalDetector();
const redSig = new RailSignal({
  id: 'sig_danger',
  name: 'SIG 09',
  trackDistMeters: 1000,
  state: cons_SIGNAL_STATES.RED,
});
const greenSig = new RailSignal({
  id: 'sig_clear',
  name: 'SIG 10',
  trackDistMeters: 1800,
  state: cons_SIGNAL_STATES.GREEN,
});

const testSignals = [redSig, greenSig];

// Approaching red signal (at 700m, 300m ahead)
const telemetry1 = detector.update(700, 45, 0.1, testSignals);
assert(telemetry1.approachingSignalId === 'sig_danger', 'Detector identifies upcoming red signal');
assert(telemetry1.distanceMeters === 300, `Calculates distance to upcoming signal: ${telemetry1.distanceMeters}m`);
assert(telemetry1.aspect === cons_SIGNAL_STATES.RED, 'Reports upcoming aspect as RED');

// Dummy mission system to check penalty application
let penaltyReceived = null;
const mockMissionSystem = {
  applySignalPenalty(type, points, name) {
    penaltyReceived = { type, points, name };
  }
};

// Cross past RED signal at 1020m (prev was 980m -> crossed red!)
detector.previousTrainDistMeters = 980;
const crossingTelemetry = detector.update(1020, 50, 0.1, testSignals, mockMissionSystem);

assert(redSig.isPassedAtDanger, 'Passing red signal marks isPassedAtDanger = true');
assert(detector.isViolationActive, 'SPAD triggers active violation flag on detector');
assert(detector.violationType === 'SPAD', 'Violation type is SPAD');
assert(penaltyReceived !== null, 'SPAD penalty dispatched to mission system');
assert(penaltyReceived.points === 500, 'SPAD penalty points is 500');


console.log('\n--- 4. Testing SignalSystem Block Placement & Progression ---');
const missionDef = arr_MISSIONS[0];
const trackSys = new TrackSystem(missionDef);
const signalSys = new SignalSystem();

signalSys.loadSignals(missionDef, trackSys);
assert(signalSys.arr_signals.length >= 5, `Procedural signal generator places ${signalSys.arr_signals.length} signals along track`);

// Check signal sorting by distance
for (let i = 1; i < signalSys.arr_signals.length; i++) {
  assert(signalSys.arr_signals[i].trackDistMeters >= signalSys.arr_signals[i - 1].trackDistMeters, 'Signals ordered strictly by track distance');
}

// Range queries for rendering
const visibleSignals = signalSys.getSignalsInRange(0, 1500);
assert(visibleSignals.length > 0, `Range query finds ${visibleSignals.length} visible signals between 0m and 1500m`);

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL SIGNAL SYSTEM VERIFICATION TESTS PASSED!');
}
