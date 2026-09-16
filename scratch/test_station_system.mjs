/**
 * test_station_system.mjs
 * Comprehensive automated verification for the reusable railway station environment system:
 * - 5 visual themes: Indian, Mountain, Urban, Rural, Industrial
 * - Modular components: Station, Platform, StationBuilding, StationSign, PlatformLamp, PassengerGroup
 * - Target zone stopping & detection (+/- 25m)
 * - Arrival and departure animation state machines & audio chime hooks
 * - Mock canvas rendering execution across all layers
 */

import {
  Station,
  cons_STATION_STATES,
  Platform,
  StationBuilding,
  StationSign,
  PlatformLamp,
  PassengerGroup,
  cons_STATION_THEMES,
  getStationThemeProfile,
} from '../src/game/environment/station/index.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('=== RUNNING RAILWAY STATION ENVIRONMENT SYSTEM TESTS ===\n');

// -------------------------------------------------------------
// 1. Visual Theme Configurations & Profiles
// -------------------------------------------------------------
console.log('1. Station Themes Profile Test:');
const arr_expectedThemes = ['indian', 'mountain', 'urban', 'rural', 'industrial'];
arr_expectedThemes.forEach((themeKey) => {
  const profile = getStationThemeProfile(themeKey);
  assert(profile && profile.id === themeKey, `Theme profile '${themeKey}' loaded correctly`);
  assert(!!profile.platform.surfaceColor && !!profile.platform.tactileColor, `Theme '${themeKey}' has platform colors`);
  assert(!!profile.canopy.style && !!profile.canopy.sheetColor, `Theme '${themeKey}' has canopy style: ${profile.canopy.style}`);
  assert(!!profile.building.style && !!profile.building.wallColor, `Theme '${themeKey}' has building style: ${profile.building.style}`);
  assert(!!profile.sign.style && !!profile.sign.bgColor, `Theme '${themeKey}' has sign style: ${profile.sign.style}`);
  assert(!!profile.lamp.style && !!profile.lamp.lightColor, `Theme '${themeKey}' has lamp style: ${profile.lamp.style}`);
  assert(!!profile.bench.style, `Theme '${themeKey}' has bench style: ${profile.bench.style}`);
  assert(Array.isArray(profile.luggage) && profile.luggage.length > 0, `Theme '${themeKey}' has luggage items`);
  assert(Array.isArray(profile.equipment) && profile.equipment.length > 0, `Theme '${themeKey}' has station equipment`);
});

// Fallback test
const fallbackProfile = getStationThemeProfile('unknown_theme_xyz');
assert(fallbackProfile.id === cons_STATION_THEMES.INDIAN, 'Unknown theme gracefully falls back to Indian theme');

// -------------------------------------------------------------
// 2. Modular Component Construction
// -------------------------------------------------------------
console.log('\n2. Modular Components Construction:');

// Platform
const platform = new Platform(cons_STATION_THEMES.INDIAN, 100, 180, 'Thoothukudi');
assert(platform.startDistMeters === 100, 'Platform start distance matches (100m)');
assert(platform.endDistMeters === 280, 'Platform end distance matches (280m)');
assert(platform.arr_canopies.length >= 1, 'Platform has generated shelter canopies');
assert(platform.arr_benches.length >= 3, 'Platform has generated benches');
assert(platform.arr_equipment.some((e) => e.type === 'chai_stall'), 'Indian platform contains chai stall equipment');
assert(platform.arr_equipment.some((e) => e.type === 'water_cooler'), 'Indian platform contains Pani water cooler');

// StationBuilding
const building = new StationBuilding(cons_STATION_THEMES.MOUNTAIN, 'Glacier Summit');
assert(building.width > 0 && building.height > 0, 'Station building has valid positive dimensions');
assert(building.theme.building.style === 'alpine_chalet', 'Mountain building style is alpine_chalet');

// StationSign
const signIndian = new StationSign(cons_STATION_THEMES.INDIAN, 'Thoothukudi Station');
assert(signIndian.stationCode.length >= 2, `Indian station generated valid code: ${signIndian.stationCode}`);
assert(signIndian.subName.includes('தூத்துக்குடி'), `Indian sign includes Tamil regional script: ${signIndian.subName}`);

const signMountain = new StationSign(cons_STATION_THEMES.MOUNTAIN, 'Glacier Summit');
assert(signMountain.subName.includes('ELEV'), `Mountain sign includes elevation tag: ${signMountain.subName}`);

// PlatformLamp
const lamp = new PlatformLamp(cons_STATION_THEMES.URBAN, true);
assert(lamp.hasClock === true, 'Platform lamp correctly flags central station clock');
lamp.update(0.1, true);
assert(lamp.currentGlowIntensity > 1.0, 'Lamp glow intensity increases during train approach');

// -------------------------------------------------------------
// 3. PassengerGroup & Boarding Animation State Machine
// -------------------------------------------------------------
console.log('\n3. PassengerGroup & Boarding Animations:');
const passengers = new PassengerGroup(cons_STATION_THEMES.INDIAN, 100, 180, 16);
assert(passengers.arr_passengers.length === 16, 'Passenger group instantiated 16 passengers');

// Check Indian porters (coolies) present
const hasCoolie = passengers.arr_passengers.some((p) => p.type === 'coolie');
assert(hasCoolie, 'Indian passenger group contains licensed railway porter (coolie) silhouettes');

// Approach anticipation
passengers.update(0.1, cons_STATION_STATES.APPROACHING, 0);
const allFacingLeft = passengers.arr_passengers.every((p) => p.facingDirection === -1);
assert(allFacingLeft, 'All passengers turn to face oncoming train during APPROACHING state');

// Boarding progress
const initialX = passengers.arr_passengers[0].dist;
passengers.update(1.0, cons_STATION_STATES.BERTHED, 0.5);
assert(passengers.isBoardingActive === true, 'isBoardingActive is true when station is BERTHED');
// Silhouettes fading as dwell completes
passengers.update(0.5, cons_STATION_STATES.BERTHED, 0.95);
const boardingPassenger = passengers.arr_passengers.find((p) => p.isBoarding);
assert(boardingPassenger && boardingPassenger.alpha < 0.5, `Boarding passenger has faded onto coach (alpha: ${boardingPassenger?.alpha.toFixed(2)})`);

// Reset to IDLE
passengers.update(0.1, cons_STATION_STATES.IDLE, 0);
assert(boardingPassenger.alpha === 1.0, 'Passengers reset to full visibility in IDLE state');

// -------------------------------------------------------------
// 4. Master Station Entity & State Transitions
// -------------------------------------------------------------
console.log('\n4. Station Entity & State Machine Transitions:');
const station = new Station(
  cons_STATION_THEMES.INDIAN,
  4720,
  'Thoothukudi Station',
  180,
  25
);

assert(station.isInsideTargetZone(4720), 'Train at 4720m is inside target zone');
assert(station.isInsideTargetZone(4740), 'Train at 4740m (+20m) is inside target zone');
assert(!station.isInsideTargetZone(4760), 'Train at 4760m (+40m) is outside target zone');

// Audio mock
const mockSoundManager = {
  arrivalChimePlayed: false,
  doorChimePlayed: false,
  guardWhistlePlayed: false,
  playStationChime() { this.arrivalChimePlayed = true; },
  playDoorChime() { this.doorChimePlayed = true; },
  playGuardWhistle() { this.guardWhistlePlayed = true; },
};

// Test 1: Train approaching from 4500m (220m away) at 45 km/h
station.update(0.1, 4500, 45, 0, mockSoundManager);
assert(station.state === cons_STATION_STATES.APPROACHING, `Station state became APPROACHING (current: ${station.state})`);
assert(mockSoundManager.arrivalChimePlayed === true, 'Arrival melodic chime triggered');

// Test 2: Train berthed inside target zone at 0 km/h
station.update(0.1, 4720, 0, 0, mockSoundManager);
assert(station.state === cons_STATION_STATES.BERTHED, `Station state became BERTHED (current: ${station.state})`);
assert(mockSoundManager.doorChimePlayed === true, 'Coach door chime triggered on berth');

// Test 3: Dwell complete (dwellProgress = 1.0) -> DEPARTING
station.update(0.1, 4720, 0, 1.0, mockSoundManager);
assert(station.state === cons_STATION_STATES.DEPARTING, `Station state became DEPARTING (current: ${station.state})`);
assert(mockSoundManager.guardWhistlePlayed === true, 'Station master guard whistle triggered on departure');

// Test 4: Train clears station (> 4850m) -> IDLE
station.update(0.1, 4900, 35, 0, mockSoundManager);
assert(station.state === cons_STATION_STATES.IDLE, `Station resets to IDLE after train departure (current: ${station.state})`);

// -------------------------------------------------------------
// 5. Mock Canvas Render Verification
// -------------------------------------------------------------
console.log('\n5. Mock Canvas Render Execution across Themes:');

function createMockCanvasContext() {
  const noop = () => {};
  const gradientMock = {
    addColorStop: noop,
  };
  return {
    save: noop,
    restore: noop,
    translate: noop,
    scale: noop,
    rotate: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    arc: noop,
    arcTo: noop,
    quadraticCurveTo: noop,
    ellipse: noop,
    rect: noop,
    fillRect: noop,
    strokeRect: noop,
    clearRect: noop,
    fill: noop,
    stroke: noop,
    clip: noop,
    fillText: noop,
    measureText: () => ({ width: 40 }),
    createLinearGradient: () => gradientMock,
    createRadialGradient: () => gradientMock,
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
    font: '10px sans-serif',
    textAlign: 'center',
    textBaseline: 'middle',
  };
}

const mockCtx = createMockCanvasContext();
const mockPpm = 16;
const elevationFn = (dist) => Math.sin(dist * 0.01) * 10 + 200;

arr_expectedThemes.forEach((themeKey) => {
  const testStation = new Station(themeKey, 1000, `Test Station ${themeKey}`, 160);
  try {
    testStation.renderLayer3(mockCtx, mockPpm, elevationFn);
    testStation.renderLayer4(mockCtx, mockPpm, elevationFn);
    testStation.renderLayer5(mockCtx, mockPpm, elevationFn);
    testStation.renderLayer6(mockCtx, mockPpm, elevationFn);
    assert(true, `Rendered all 4 layers for '${themeKey}' theme without error`);
  } catch (err) {
    assert(false, `Render failed for theme '${themeKey}': ${err.message}`);
  }
});

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All Station Environment System tests PASSED successfully!\n');
}
