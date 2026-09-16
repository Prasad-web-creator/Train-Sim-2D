/**
 * test_day_night_system.mjs
 * Automated test suite verifying the dynamic Day/Night system:
 * - 7 distinct time phases (DAWN, MORNING, NOON, AFTERNOON, SUNSET, EVENING, NIGHT)
 * - Continuous 24-hour interpolation and celestial coordinates
 * - Single-pass Canvas ambient darkness (no expensive DOM filters)
 * - Station lighting activation and building window illumination
 * - Headlight intensity/importance expansion at night
 * - Signal optical halo multipliers
 * - Dashboard backlight levels
 */

import {
  cons_TIME_PHASES,
  arr_TIME_PHASE_ORDER,
  obj_TIME_PHASE_PROFILES,
  fn_interpolateDayNight,
} from '../src/game/environment/time/DayNightConstants.js';

import { DayNightSystem } from '../src/game/environment/time/DayNightSystem.js';

let tmp_passedCount = 0;
let tmp_totalCount = 0;

function assert(condition, message) {
  tmp_totalCount++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    tmp_passedCount++;
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('=== RUNNING DAY/NIGHT SYSTEM TEST SUITE ===\n');

// 1. Verify 7 time phases constant definitions
console.log('--- Phase 1: Constants & Profiles ---');
assert(arr_TIME_PHASE_ORDER.length === 7, 'There are exactly 7 discrete time phases in order');
assert(arr_TIME_PHASE_ORDER[0] === 'DAWN', 'First phase is DAWN');
assert(arr_TIME_PHASE_ORDER[1] === 'MORNING', 'Second phase is MORNING');
assert(arr_TIME_PHASE_ORDER[2] === 'NOON', 'Third phase is NOON');
assert(arr_TIME_PHASE_ORDER[3] === 'AFTERNOON', 'Fourth phase is AFTERNOON');
assert(arr_TIME_PHASE_ORDER[4] === 'SUNSET', 'Fifth phase is SUNSET');
assert(arr_TIME_PHASE_ORDER[5] === 'EVENING', 'Sixth phase is EVENING');
assert(arr_TIME_PHASE_ORDER[6] === 'NIGHT', 'Seventh phase is NIGHT');

// Check profile definitions
for (const phase of arr_TIME_PHASE_ORDER) {
  const profile = obj_TIME_PHASE_PROFILES[phase];
  assert(!!profile, `Profile exists for phase ${phase}`);
  assert(typeof profile.hour === 'number' && profile.hour >= 0 && profile.hour <= 24, `Profile ${phase} has valid clock hour: ${profile.hour}`);
  assert(Array.isArray(profile.skyGradientStops) && profile.skyGradientStops.length >= 3, `Profile ${phase} has rich linear gradient stops`);
  assert(profile.ambient && typeof profile.ambient.brightnessMultiplier === 'number', `Profile ${phase} has ambient brightness multiplier`);
  assert(profile.ambient && typeof profile.ambient.darknessOverlayRgba === 'string', `Profile ${phase} has ambient darkness overlay rgba`);
  assert(profile.lighting && typeof profile.lighting.stationLampIntensity === 'number', `Profile ${phase} has station lamp intensity`);
  assert(profile.lighting && typeof profile.lighting.signalHaloMultiplier === 'number', `Profile ${phase} has signal halo multiplier`);
  assert(profile.lighting && typeof profile.lighting.headlightIntensity === 'number', `Profile ${phase} has headlight intensity`);
  assert(profile.lighting && typeof profile.lighting.dashboardBacklight === 'number', `Profile ${phase} has dashboard backlight level`);
}

// 2. Interpolation math across key clock hours
console.log('\n--- Phase 2: Continuous Interpolation Math ---');

// Test Noon (12.00)
const noonState = fn_interpolateDayNight(12.0);
assert(noonState.phase === cons_TIME_PHASES.NOON, 'Hour 12.0 correctly maps to NOON');
assert(noonState.ambient.brightnessMultiplier === 1.0, 'Noon has 1.0 brightness multiplier (maximum daylight)');
assert(noonState.lighting.stationLampIntensity === 0.0, 'Noon station lights are turned off (0.0)');
assert(noonState.lighting.buildingLightsActive === 0.0, 'Noon building windows are not lit (0.0)');
assert(noonState.lighting.signalHaloMultiplier === 1.0, 'Noon signal halo multiplier is standard 1.0x');
assert(noonState.lighting.headlightNeed <= 0.15, 'Noon headlight need is minimal <= 0.15 (sunlight dominates)');
assert(noonState.lighting.dashboardBacklight === 0.0, 'Noon dashboard backlight is 0.0 (unlit)');

// Test Night (23.50)
const nightState = fn_interpolateDayNight(23.5);
assert(nightState.phase === cons_TIME_PHASES.NIGHT, 'Hour 23.5 correctly maps to NIGHT');
assert(nightState.ambient.brightnessMultiplier < 0.5, `Night has low brightness multiplier (${nightState.ambient.brightnessMultiplier.toFixed(2)})`);
assert(nightState.lighting.stationLampIntensity === 1.0, 'Night station lights are fully active (1.0)');
assert(nightState.lighting.buildingLightsActive === 1.0, 'Night building windows glow incandescent warm (1.0)');
assert(nightState.lighting.signalHaloMultiplier >= 2.0, `Night signal halo is amplified >= 2.0x (${nightState.lighting.signalHaloMultiplier.toFixed(2)}x)`);
assert(nightState.lighting.headlightIntensity >= 1.7, `Night headlight beam intensity is boosted >= 1.7x (${nightState.lighting.headlightIntensity.toFixed(2)}x)`);
assert(nightState.lighting.headlightNeed === 1.0, 'Night headlight need is 1.0 (headlights critical to see track)');
assert(nightState.lighting.dashboardBacklight === 1.0, 'Night dashboard backlight is 1.0 (full console glow)');

// Test DayNightSystem instance getters for night
const dnNightTest = new DayNightSystem(cons_TIME_PHASES.NIGHT);
const lNight = dnNightTest.getLightingState();
assert(lNight.buildingLightsActive === true, 'DayNightSystem getLightingState buildingLightsActive is boolean true at night');
assert(lNight.stationLightsFactor === 1.0, 'DayNightSystem getLightingState stationLightsFactor is 1.0 at night');
assert(lNight.headlightImportance === 1.0, 'DayNightSystem getLightingState headlightImportance is 1.0 at night');
// Test Sunset (18.50)
const sunsetState = fn_interpolateDayNight(18.5);
assert(sunsetState.phase === cons_TIME_PHASES.SUNSET, 'Hour 18.5 correctly maps to SUNSET');
assert(sunsetState.lighting.stationLampIntensity >= 0.25, 'Sunset station lights are warming up (>= 0.25)');
assert(sunsetState.sun.alpha > 0.5, 'Sunset sun is visible near horizon');

// 3. System clock advancement and transitions
console.log('\n--- Phase 3: DayNightSystem Clock Progression ---');
const dn = new DayNightSystem(cons_TIME_PHASES.NOON);
assert(dn.currentHour === 12.0, 'Initialized at 12:00 NOON');
assert(dn.getTimeString() === '12:00', 'Formatted time string is 12:00');

// Advance clock naturally
dn.update(10.0); // 10 real seconds * 0.0125 = +0.125 hours
assert(dn.currentHour > 12.0, `Clock advanced smoothly to ${dn.currentHour.toFixed(3)}h`);

// Test Phase Cycling
console.log('\n--- Phase 4: Phase Cycling & Setting ---');
dn.setTimePhase(cons_TIME_PHASES.NOON, 0); // instant
assert(dn.getTimePhase() === cons_TIME_PHASES.NOON, 'Instantly set to NOON');

const p1 = dn.cycleTimePhase();
assert(p1 === cons_TIME_PHASES.AFTERNOON, `Cycled from NOON -> ${p1} (expected AFTERNOON)`);

dn.setTimePhase(cons_TIME_PHASES.NIGHT, 0);
assert(dn.getTimePhase() === cons_TIME_PHASES.NIGHT, 'Instantly set to NIGHT');

const p2 = dn.cycleTimePhase();
assert(p2 === cons_TIME_PHASES.DAWN, `Cycled from NIGHT -> ${p2} (expected DAWN wrap-around)`);

// 4. Mock Canvas 2D Rendering Passes
console.log('\n--- Phase 5: Canvas 2D Layer Rendering Passes ---');

// Mock Canvas 2D context
const mockCalls = [];
const mockCtx = {
  save: () => mockCalls.push('save'),
  restore: () => mockCalls.push('restore'),
  beginPath: () => mockCalls.push('beginPath'),
  arc: (x, y, r, sa, ea) => mockCalls.push(`arc(${Math.round(x)},${Math.round(y)},${Math.round(r)})`),
  fill: () => mockCalls.push('fill'),
  fillRect: (x, y, w, h) => mockCalls.push(`fillRect(${x},${y},${w},${h})`),
  createLinearGradient: () => ({
    addColorStop: (stop, color) => mockCalls.push(`gradStop(${stop},${color})`),
  }),
  createRadialGradient: () => ({
    addColorStop: (stop, color) => mockCalls.push(`radialStop(${stop},${color})`),
  }),
  set fillStyle(val) { mockCalls.push(`fillStyle=${typeof val === 'string' ? val : 'gradient'}`); },
  set globalAlpha(val) { mockCalls.push(`globalAlpha=${val.toFixed(2)}`); },
};

// Test sky gradient construction
mockCalls.length = 0;
const grad = dn.createSkyGradient(mockCtx, 1080);
assert(mockCalls.some(c => c.startsWith('gradStop')), 'createSkyGradient created multi-stop linear gradient');

// Test celestial rendering at Night (moon + stars)
dn.setTimePhase(cons_TIME_PHASES.NIGHT, 0);
mockCalls.length = 0;
dn.renderCelestial(mockCtx, 1920, 1080);
assert(mockCalls.some(c => c.includes('arc')), 'renderCelestial drew celestial bodies (moon and twinkling stars)');

// Test ambient darkness wash (Canvas layers only)
mockCalls.length = 0;
dn.renderAmbientDarkness(mockCtx, 1920, 1080);
assert(mockCalls.some(c => c.includes('fillRect(0,0,1920,1080)')), 'renderAmbientDarkness executed single-pass screen-space rectangle');

console.log(`\n==============================================`);
console.log(`ALL ${tmp_passedCount}/${tmp_totalCount} TESTS PASSED SUCCESSFULLY!`);
console.log(`==============================================\n`);
