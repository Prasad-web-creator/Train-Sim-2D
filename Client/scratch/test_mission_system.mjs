/**
 * test_mission_system.mjs
 * Comprehensive automated verification test suite for the realistic train driving mission system.
 */

import { Objective, cons_OBJECTIVE_TYPES } from 'file:///c:/Users/kd_pr/Downloads/TrainSim/src/game/missions/Objective.js';
import { ObjectiveTracker } from 'file:///c:/Users/kd_pr/Downloads/TrainSim/src/game/missions/ObjectiveTracker.js';
import { MissionResult } from 'file:///c:/Users/kd_pr/Downloads/TrainSim/src/game/missions/MissionResult.js';
import { Mission } from 'file:///c:/Users/kd_pr/Downloads/TrainSim/src/game/missions/Mission.js';
import { arr_MISSIONS, getMissionById } from 'file:///c:/Users/kd_pr/Downloads/TrainSim/src/game/missions/MissionData.js';
import { MissionSystem } from 'file:///c:/Users/kd_pr/Downloads/TrainSim/src/game/systems/MissionSystem.js';
import { TrackSystem } from 'file:///c:/Users/kd_pr/Downloads/TrainSim/src/game/systems/TrackSystem.js';
import { obj_CENTRAL_GAME_STATE } from 'file:///c:/Users/kd_pr/Downloads/TrainSim/src/game/core/GameState.js';

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

console.log('--- 1. Testing Objective Types & Evaluation Logic ---');

// 1.1 START_LOCOMOTIVE
const startObj = new Objective({
  id: 'test_start',
  type: cons_OBJECTIVE_TYPES.START_LOCOMOTIVE,
  title: 'Start Locomotive',
  description: 'Release brakes & notch throttle',
});
assert(!startObj.isCompleted, 'Start locomotive objective initially incomplete');

// Reverser in neutral or brakes held -> should not complete
startObj.evaluate(0, 0, 0.1, { reverser: 0, brakeRatio: 1.0, throttleNotch: 0 });
assert(!startObj.isCompleted, 'Objective remains incomplete while brakes held and reverser neutral');

// Shift reverser to forward, release brakes, notch 2, speed moving
const completedStart = startObj.evaluate(5, 5.0, 0.1, { reverser: 1, brakeRatio: 0, throttleNotch: 2 });
assert(completedStart && startObj.isCompleted, 'Start locomotive objective completes when controls engaged and moving');

// 1.2 DEPART_STATION
const departObj = new Objective({
  id: 'test_depart',
  type: cons_OBJECTIVE_TYPES.DEPART_STATION,
  title: 'Depart Station',
  description: 'Clear platform area',
  targetDistanceMeters: 150,
});
departObj.evaluate(50, 20.0, 0.1);
assert(!departObj.isCompleted && departObj.progressFraction > 0.3, 'Depart station objective progresses with distance');

departObj.evaluate(160, 30.0, 0.1);
assert(departObj.isCompleted, 'Depart station objective completes upon clearing target distance');

// 1.3 MAINTAIN_SPEED
const speedCorridorObj = new Objective({
  id: 'test_speed',
  type: cons_OBJECTIVE_TYPES.MAINTAIN_SPEED,
  title: 'Maintain Speed Corridor',
  description: 'Hold 60 km/h',
  targetSpeedKmh: 60,
  requiredCorridorSeconds: 4.0,
});
// 20 km/h is below corridor (52-66 km/h) -> does not accumulate
speedCorridorObj.evaluate(200, 20.0, 1.0);
assert(speedCorridorObj.timeInCorridorSeconds === 0, 'Speed below corridor does not accumulate corridor time');

// In corridor (58 km/h) for 4 seconds
speedCorridorObj.evaluate(250, 58.0, 2.0);
assert(speedCorridorObj.progressFraction >= 0.5, 'Driving inside speed corridor advances progress fraction');
speedCorridorObj.evaluate(300, 60.0, 2.5);
assert(speedCorridorObj.isCompleted, 'Maintain speed completes after required duration in corridor');

// 1.4 STOP_AT_STATION (Target Zone)
const stopAtStationObj = new Objective({
  id: 'test_stop',
  type: cons_OBJECTIVE_TYPES.STOP_AT_STATION,
  title: 'Arrive at Thoothukudi Station',
  description: 'Stop inside the target zone.',
  targetDistanceMeters: 2400,
  targetZoneRadiusMeters: 25,
});
// Approaching station at 45 km/h -> should not complete
stopAtStationObj.evaluate(2390, 45.0, 0.1, { brakeRatio: 0.5 });
assert(!stopAtStationObj.isCompleted, 'Station arrival incomplete while train is still moving at speed');

// Stopped (0.5 km/h) inside target zone (2405m, diff = 5m <= 25m) with brakes applied
const stopSuccess = stopAtStationObj.evaluate(2405, 0.5, 0.1, { brakeRatio: 0.8 });
assert(stopSuccess && stopAtStationObj.isCompleted, 'Stop at station completes inside +/- 25m target zone with brakes applied');

// Test platform overshoot failure
const overshootObj = new Objective({
  id: 'test_overshoot',
  type: cons_OBJECTIVE_TYPES.STOP_AT_STATION,
  title: 'Arrive at Station',
  description: 'Stop inside target zone',
  targetDistanceMeters: 1000,
  targetZoneRadiusMeters: 25,
});
overshootObj.evaluate(1060, 35.0, 0.1, { brakeRatio: 0 });
assert(overshootObj.isFailed, 'Breezing past platform by > 45m without stopping fails the objective');

// 1.5 PICK_UP_PASSENGERS (Dwell Timer)
const dwellObj = new Objective({
  id: 'test_dwell',
  type: cons_OBJECTIVE_TYPES.PICK_UP_PASSENGERS,
  title: 'Pick Up Passengers',
  description: 'Hold stopped while passengers board',
  requiredDwellSeconds: 4.0,
});
// Stopped with brakes -> dwell initiates
dwellObj.evaluate(2405, 0, 2.0, { brakeRatio: 0.8 });
assert(dwellObj.isDwellActive, 'Dwell timer activates while stopped with service brakes applied');
assert(dwellObj.progressFraction >= 0.5, 'Dwell progress fraction advances with time');

dwellObj.evaluate(2405, 0, 2.5, { brakeRatio: 0.8 });
assert(dwellObj.isCompleted && !dwellObj.isDwellActive, 'Passenger boarding completes upon dwell timer expiration');

// 1.6 NO_VIOLATIONS (Constraint)
const constraintObj = new Objective({
  id: 'test_no_violation',
  type: cons_OBJECTIVE_TYPES.NO_VIOLATIONS,
  title: 'No Violations',
  description: 'Avoid penalties',
  isConstraint: true,
});
constraintObj.evaluate(1000, 40, 0.1, { penaltiesCount: 0 });
assert(!constraintObj.isFailed, 'Constraint passes when penalties count is 0');
constraintObj.evaluate(1050, 40, 0.1, { penaltiesCount: 1 });
assert(constraintObj.isFailed, 'Constraint fails immediately if a penalty is recorded');


console.log('\n--- 2. Testing ObjectiveTracker Sequential Progression ---');
const tracker = new ObjectiveTracker([
  { id: 'seq_1', type: cons_OBJECTIVE_TYPES.START_LOCOMOTIVE, title: 'Step 1: Start' },
  { id: 'seq_2', type: cons_OBJECTIVE_TYPES.DEPART_STATION, title: 'Step 2: Depart', targetDistanceMeters: 100 },
  { id: 'seq_3', type: cons_OBJECTIVE_TYPES.REACH_DESTINATION, title: 'Step 3: Arrive', targetDistanceMeters: 500 },
  { id: 'seq_const', type: cons_OBJECTIVE_TYPES.NO_VIOLATIONS, title: 'Zero Violations', isConstraint: true },
]);

assert(tracker.arr_sequence.length === 3, 'ObjectiveTracker parsed exactly 3 sequential steps');
assert(tracker.arr_constraints.length === 1, 'ObjectiveTracker parsed 1 persistent constraint');
assert(tracker.getCurrentObjective().id === 'seq_1', 'Active objective starts at Step 1');

// Step 1: Start locomotive
tracker.update(0.1, 10, 5.0, { reverser: 1, brakeRatio: 0, throttleNotch: 2 });
assert(tracker.getCurrentObjective().id === 'seq_2', 'Tracker seamlessly advances to Step 2 after Step 1 completion');

// Step 2: Depart station
tracker.update(0.1, 120, 25.0);
assert(tracker.getCurrentObjective().id === 'seq_3', 'Tracker advances to Step 3 after departing station');

// Test HUD Summary Format
const hudSummary = tracker.getSummaryForHUD(200, 60);
assert(hudSummary.title === 'Step 3: Arrive', 'HUD summary title matches current objective');
assert(hudSummary.distanceMeters === 300, `HUD distance correctly calculates distance to target: ${hudSummary.distanceMeters}m`);
assert(hudSummary.speedLimitKmh === 60, 'HUD summary conveys speed limit');
assert(hudSummary.currentSequenceStep === 3, 'HUD summary conveys step 3');
assert(hudSummary.totalSequenceCount === 3, 'HUD summary conveys total steps 3');


console.log('\n--- 3. Testing MissionResult Scoring & Star Ratings ---');
// Perfect run: under par time (240s < 300s target), 0 infractions
const perfectResult = new MissionResult({
  isSuccess: true,
  statusMessage: 'Arrived on schedule',
  elapsedTimeSeconds: 240,
  targetTimeSeconds: 300,
  baseScore: 1000,
  rewardFunds: 1800,
  arr_infractions: [],
  passengerCount: 280,
});
assert(perfectResult.timeBonus === 120, `Time bonus awarded for beating target time: +${perfectResult.timeBonus} pts`);
assert(perfectResult.finalScore === 1120, `Final score equals base + bonus: ${perfectResult.finalScore}`);
assert(perfectResult.stars === 3, 'Clean run with 0 infractions awards 3 Stars');
assert(perfectResult.rewardFunds === 1800, 'Full reward funds awarded');

// Run with penalties (e.g. SPAD -500 pts)
const penaltyResult = new MissionResult({
  isSuccess: true,
  statusMessage: 'Arrived with infractions',
  elapsedTimeSeconds: 310,
  targetTimeSeconds: 300,
  baseScore: 1000,
  rewardFunds: 1800,
  arr_infractions: [{ type: 'SPAD', reason: 'Red signal overrun', points: 500 }],
});
assert(penaltyResult.timeBonus === 0, 'No time bonus when over par time');
assert(penaltyResult.totalPenaltyPoints === 500, 'Penalty points calculated accurately');
assert(penaltyResult.finalScore === 500, `Final score deducted: ${penaltyResult.finalScore}`);
assert(penaltyResult.stars === 1, 'Run with major penalty awards 1 Star');


console.log('\n--- 4. Testing Mission Data & Thoothukudi Scenario ---');
const thoothukudiMission = getMissionById('mission_thoothukudi_express');
assert(thoothukudiMission !== undefined, 'Thoothukudi Coastal Express exists in mission roster');
assert(thoothukudiMission.startStation === 'Tirunelveli Junction', 'Start station is Tirunelveli Junction');
assert(thoothukudiMission.endStation === 'Thoothukudi Station', 'End station is Thoothukudi Station');
assert(thoothukudiMission.passengerCount === 280, 'Passenger requirement is 280');
assert(thoothukudiMission.objectives.length >= 7, 'Scenario contains full realistic driving objective sequence');


console.log('\n--- 5. Testing MissionSystem End-to-End Simulation ---');
const dummyMissionDef = arr_MISSIONS[0];
const trackSystem = new TrackSystem(dummyMissionDef);
const missionSys = new MissionSystem(dummyMissionDef, trackSystem);

assert(missionSys.score === 1000, 'Initial mission score is 1000');
assert(missionSys.penaltiesCount === 0, 'Initial penalties count is 0');

// Test speeding penalty accumulation (> speedLimit + 2km/h)
for (let step = 0; step < 20; step++) {
  missionSys.update(0.1, 50, 65.0); // Limit is 45 in zone 1 -> speeding at 65 km/h
}
assert(missionSys.penaltiesCount > 0, `Persistent speeding logs infraction penalty: ${missionSys.penaltiesCount}`);
assert(missionSys.score < 1000, `Score is deducted for speeding: ${missionSys.score}`);

// Test SPAD penalty injection
missionSys.applySignalPenalty('SPAD', 500, 'SIG 04');
assert(missionSys.penaltiesCount >= 2, 'SPAD penalty increments penalty count');
assert(missionSys.score <= 500, `Score deducted by 500 for SPAD: ${missionSys.score}`);

// Test GameState Telemetry Synchronization
const stateSnapshot = obj_CENTRAL_GAME_STATE.getSnapshot();
assert(stateSnapshot.mission.activeObjective !== null, 'Central GameState holds active objective telemetry');
assert(stateSnapshot.mission.activeObjective.title !== undefined, 'Active objective has title for HUD');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL MISSION SYSTEM VERIFICATION TESTS PASSED!');
}
