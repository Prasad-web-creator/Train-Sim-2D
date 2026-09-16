/**
 * test_progression_system.mjs
 * Comprehensive automated test suite for IronRail 2D progression subsystem:
 * - SaveSystem (saveGame, loadGame, resetGame, corruption protection, safe recovery, schema validation)
 * - ProgressionSystem (level, experience, coins, unlockedTrains, completedMissions, completedRoutes, bestScores, settings)
 * - AchievementSystem (milestone tracking, threshold unlocks, automatic reward payouts)
 */

import {
  SaveSystem,
  cons_DEFAULT_PLAYER_DATA,
} from '../src/game/progression/SaveSystem.js';

import {
  ProgressionSystem,
} from '../src/game/progression/ProgressionSystem.js';

import {
  AchievementSystem,
} from '../src/game/progression/AchievementSystem.js';

import { arr_ACHIEVEMENTS } from '../src/data/achievements.js';

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

// In-Memory localStorage mock for node.js test environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.window = {
  localStorage: new MockLocalStorage(),
};

console.log('=== TEST 1: SAVE SYSTEM - BASIC SAVE, LOAD, & RESET ===');
const testSaveKey = 'test_ironrail_save_key';
const saveSys = new SaveSystem(testSaveKey);

// 1. Initial load with empty storage returns default data
const defaultLoaded = saveSys.loadGame();
assert(defaultLoaded.level === 1, 'Default level is 1');
assert(defaultLoaded.experience === 0, 'Default experience is 0');
assert(defaultLoaded.coins === 25000, 'Default coins is 25,000');
assert(Array.isArray(defaultLoaded.unlockedTrains), 'unlockedTrains is an array');
assert(defaultLoaded.unlockedTrains.includes('loco_gp40_green'), 'Starter train is included');
assert(Array.isArray(defaultLoaded.completedMissions), 'completedMissions is an array');
assert(Array.isArray(defaultLoaded.completedRoutes), 'completedRoutes is an array');
assert(typeof defaultLoaded.bestScores === 'object', 'bestScores is an object');
assert(typeof defaultLoaded.settings === 'object', 'settings is an object');

// 2. saveGame & loadGame roundtrip
const customData = {
  level: 4,
  experience: 450,
  coins: 48000,
  unlockedTrains: ['loco_gp40_green', 'loco_wdm3d_blue'],
  completedMissions: ['mission_thoothukudi_express'],
  completedRoutes: ['route_thoothukudi'],
  bestScores: {
    mission_thoothukudi_express: { score: 1120, stars: 3, bestTimeSeconds: 230 },
  },
  settings: {
    masterVolume: 0.65,
    engineVolume: 0.8,
    environmentVolume: 0.5,
    weatherVolume: 0.6,
    sfxVolume: 0.9,
    cameraZoom: 1.15,
  },
};

const saveSuccess = saveSys.saveGame(customData);
assert(saveSuccess === true, 'saveGame returns true');

const reloadedData = saveSys.loadGame();
assert(reloadedData.level === 4, 'Reloaded level matches');
assert(reloadedData.experience === 450, 'Reloaded experience matches');
assert(reloadedData.coins === 48000, 'Reloaded coins matches');
assert(reloadedData.unlockedTrains.length === 2, 'Reloaded unlockedTrains contains 2 trains');
assert(reloadedData.completedMissions.includes('mission_thoothukudi_express'), 'Reloaded completedMissions matches');
assert(reloadedData.completedRoutes.includes('route_thoothukudi'), 'Reloaded completedRoutes matches');
assert(reloadedData.bestScores['mission_thoothukudi_express']?.score === 1120, 'Reloaded bestScores matches');
assert(reloadedData.settings.cameraZoom === 1.15, 'Reloaded settings matches');

// 3. resetGame
const resetData = saveSys.resetGame();
assert(resetData.level === 1, 'Reset restored level to 1');
assert(resetData.coins === 25000, 'Reset restored coins to 25,000');
assert(resetData.completedMissions.length === 0, 'Reset cleared completed missions');

console.log('\n=== TEST 2: SAVE SYSTEM - CORRUPTION PROTECTION & SAFE RECOVERY ===');
// Corrupted JSON string in localStorage
window.localStorage.setItem(testSaveKey, '{"level": 99, "corrupted_syntax: ... INVALID JSON');
const recoveredFromJsonError = saveSys.loadGame();
assert(recoveredFromJsonError.level === 1, 'Corrupted JSON safely recovered with default level 1');
assert(recoveredFromJsonError.coins === 25000, 'Corrupted JSON safely recovered with default coins');
assert(Array.isArray(recoveredFromJsonError.unlockedTrains), 'Corrupted JSON safely recovered with valid unlockedTrains');

// Corrupted data types (NaN level, negative coins, invalid types)
window.localStorage.setItem(
  testSaveKey,
  JSON.stringify({
    level: NaN,
    experience: -500,
    coins: -99999,
    unlockedTrains: 'NOT_AN_ARRAY_MALFORMED',
    completedMissions: null,
    completedRoutes: 12345,
    bestScores: 'MALFORMED',
    settings: 'MALFORMED',
  })
);
const sanitizedData = saveSys.loadGame();
assert(sanitizedData.level >= 1, `NaN level safely repaired to: ${sanitizedData.level}`);
assert(sanitizedData.experience === 0, `Negative experience safely clamped to: ${sanitizedData.experience}`);
assert(sanitizedData.coins === 0, `Negative coins safely clamped to: ${sanitizedData.coins}`);
assert(Array.isArray(sanitizedData.unlockedTrains), 'Malformed unlockedTrains repaired to valid array');
assert(sanitizedData.unlockedTrains.includes('loco_gp40_green'), 'Repaired array retains starter train');
assert(Array.isArray(sanitizedData.completedMissions), 'Malformed completedMissions repaired to array');
assert(Array.isArray(sanitizedData.completedRoutes), 'Malformed completedRoutes repaired to array');
assert(typeof sanitizedData.bestScores === 'object', 'Malformed bestScores repaired to object');
assert(typeof sanitizedData.settings === 'object', 'Malformed settings repaired to object');

// Filter unnecessary / transient runtime data
saveSys.saveGame({
  ...customData,
  transientVelocity: 85.4,
  runtimeFps: 60,
  domElementRef: '<div id="test"/>',
  canvasBuffer: [1, 2, 3],
});
const cleanCheck = JSON.parse(window.localStorage.getItem(testSaveKey));
assert(cleanCheck.transientVelocity === undefined, 'Transient velocity is omitted from storage');
assert(cleanCheck.runtimeFps === undefined, 'Runtime FPS is omitted from storage');
assert(cleanCheck.domElementRef === undefined, 'DOM references are omitted from storage');
assert(cleanCheck.canvasBuffer === undefined, 'Canvas buffer is omitted from storage');

console.log('\n=== TEST 3: PROGRESSION SYSTEM - LEVEL, XP, & COINS ===');
window.localStorage.clear();
const progKey = 'test_prog_system_key';
const progSaveSys = new SaveSystem(progKey);
const progSys = new ProgressionSystem(progSaveSys);

// Reset clean
progSys.resetGame();
let currentData = progSys.getPlayerData();
assert(currentData.level === 1, 'Initial level is 1');
assert(currentData.experience === 0, 'Initial experience is 0');

// Experience addition and level up
// Level 1 threshold: 1000 XP
let xpRes = progSys.addExperience(400);
assert(xpRes.levelUps === 0, '400 XP gained, no level up yet');
assert(progSys.getPlayerData().experience === 400, 'XP is 400');
assert(progSys.fn_getLevelProgressFraction() === 0.4, 'XP progress fraction is 0.4');

// Cross threshold with +700 XP (total 1100 XP -> Level 2 + 100 remainder)
const coinsBeforeLvlUp = progSys.getPlayerData().coins;
xpRes = progSys.addExperience(700);
assert(xpRes.levelUps === 1, 'Level up triggered');
assert(progSys.getPlayerData().level === 2, 'Level is now 2');
assert(progSys.getPlayerData().experience === 100, 'Experience remainder is 100 XP');
assert(progSys.getPlayerData().coins === coinsBeforeLvlUp + 1500, 'Level-up bonus coins (+1500) awarded');

// Economy: Add and spend coins
const beforeCoins = progSys.getPlayerData().coins;
progSys.addCoins(5000);
assert(progSys.getPlayerData().coins === beforeCoins + 5000, 'addCoins adds 5000 coins');
assert(progSys.canAfford(3000) === true, 'canAfford returns true for 3000');
assert(progSys.canAfford(9999999) === false, 'canAfford returns false for excess amount');

const spendSuccess = progSys.spendCoins(3000);
assert(spendSuccess === true, 'spendCoins succeeds for affordable amount');
assert(progSys.getPlayerData().coins === beforeCoins + 5000 - 3000, 'Coins deducted properly');

const overspendSuccess = progSys.spendCoins(9999999);
assert(overspendSuccess === false, 'spendCoins fails for unaffordable amount');

console.log('\n=== TEST 4: PROGRESSION SYSTEM - TRAIN UNLOCKS & MISSIONS ===');
assert(progSys.isTrainUnlocked('loco_gp40_green') === true, 'Default train is unlocked');
assert(progSys.isTrainUnlocked('loco_wap7_red') === false, 'WAP-7 is locked initially');

const unlockWap7 = progSys.unlockTrain('loco_wap7_red');
assert(unlockWap7.success === true, 'WAP-7 unlock succeeded');
assert(progSys.isTrainUnlocked('loco_wap7_red') === true, 'WAP-7 is now unlocked');
assert(progSys.getPlayerData().unlockedTrains.includes('loco_wap7_red'), 'unlockedTrains array updated');

// Record Mission Completion
const missionResultMock = {
  isSuccess: true,
  finalScore: 1150,
  stars: 3,
  elapsedTimeSeconds: 240,
  rewardFunds: 1800,
};

const missionSummary = progSys.recordMissionCompletion('mission_thoothukudi_express', 'route_thoothukudi', missionResultMock);
assert(missionSummary.awardedCoins === 1800, 'Mission coins awarded');
assert(missionSummary.awardedXp > 0, 'Mission XP awarded');
assert(progSys.getPlayerData().completedMissions.includes('mission_thoothukudi_express'), 'completedMissions updated');
assert(progSys.getPlayerData().completedRoutes.includes('route_thoothukudi'), 'completedRoutes updated');
assert(progSys.getPlayerData().bestScores['mission_thoothukudi_express'].score === 1150, 'Best score recorded');
assert(progSys.getPlayerData().bestScores['mission_thoothukudi_express'].stars === 3, '3 stars recorded');

console.log('\n=== TEST 5: ACHIEVEMENT SYSTEM - TRACKING & UNLOCKS ===');
const achSys = new AchievementSystem(progSys);

const allAchs = achSys.getAllAchievements();
assert(allAchs.length === arr_ACHIEVEMENTS.length, `Loaded all ${arr_ACHIEVEMENTS.length} achievements`);

// Test milestone progress and threshold unlock
// Highballer: Reach 100 km/h
const achProgressRes = achSys.recordProgress('ach_highballer', 105, true);
assert(achProgressRes.isUnlocked === true, 'Highballer achievement unlocked at 105 km/h');
assert(achProgressRes.wasNewlyUnlocked === true, 'wasNewlyUnlocked is true on first unlock');

const achCheckAgain = achSys.recordProgress('ach_highballer', 110, true);
assert(achCheckAgain.wasNewlyUnlocked === false, 'wasNewlyUnlocked is false when already unlocked');

// Automated mission evaluation
achSys.checkMissionAchievements(
  { biome: 'mountain', defaultWeather: 'NIGHT' },
  { isSuccess: true, arr_infractions: [] },
  { maxSpeedKmh: 110, stoppedWithinMeters: 1.5, emergencyBrakeCount: 0 }
);

const allAchsAfter = achSys.getAllAchievements();
const mountainAch = allAchsAfter.find((a) => a.id === 'ach_mountain_conqueror');
assert(mountainAch.isUnlocked === true, 'Mountain Conqueror unlocked via automated evaluation');

const nightAch = allAchsAfter.find((a) => a.id === 'ach_midnight_express');
assert(nightAch.isUnlocked === true, 'Night Owl unlocked via automated evaluation');

assert(achSys.getUnlockedCount() >= 3, `Unlocked count is at least 3 (Actual: ${achSys.getUnlockedCount()})`);
assert(achSys.getTotalEarnedCoins() > 0, `Total earned coins calculated: ${achSys.getTotalEarnedCoins()}`);

// Verify persisted in storage
const reloadedProgData = progSaveSys.loadGame();
assert(reloadedProgData.achievements['ach_highballer']?.isUnlocked === true, 'Achievement unlock persisted in SaveSystem');
assert(reloadedProgData.achievements['ach_mountain_conqueror']?.isUnlocked === true, 'Mountain Conqueror persisted in SaveSystem');

console.log('\n======================================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('======================================================');

if (failed > 0) {
  process.exit(1);
}
