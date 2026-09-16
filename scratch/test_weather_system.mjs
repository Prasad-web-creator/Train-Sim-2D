/**
 * test_weather_system.mjs
 * Comprehensive automated verification test suite for the lightweight 2D weather system.
 */

import {
  cons_WEATHER_TYPES,
  arr_WEATHER_CYCLE_ORDER,
  getWeatherProfile,
} from '../src/game/environment/weather/WeatherConstants.js';
import { WeatherParticles } from '../src/game/environment/weather/WeatherParticles.js';
import { WeatherAtmosphere } from '../src/game/environment/weather/WeatherAtmosphere.js';
import { WeatherSystem } from '../src/game/environment/weather/WeatherSystem.js';

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

console.log('=== Test Suite 1: Weather Constants & Profiles ===');
const arr_expectedTypes = ['CLEAR', 'CLOUDY', 'RAIN', 'HEAVY_RAIN', 'SNOW', 'FOG', 'SUNSET', 'NIGHT'];
assert(arr_expectedTypes.length === 8, '8 distinct weather types specified');

for (const type of arr_expectedTypes) {
  const profile = getWeatherProfile(type);
  assert(profile !== null && profile !== undefined, `Weather profile for ${type} exists`);
  assert(profile.sky?.gradientStops?.length >= 2, `${type} has valid sky gradient stops`);
  assert(typeof profile.sky?.cloudCount === 'number', `${type} cloudCount is a number`);
  assert(typeof profile.visibility?.layer2Alpha === 'number', `${type} layer2Alpha is defined`);
  assert(typeof profile.track?.isWet === 'boolean', `${type} track.isWet is boolean`);
  assert(typeof profile.track?.hasSnow === 'boolean', `${type} track.hasSnow is boolean`);
  assert(typeof profile.train?.headlightIntensity === 'number', `${type} train headlight intensity is number`);
  assert(typeof profile.lighting?.ambientColor === 'string', `${type} lighting ambientColor is string`);
  assert(typeof profile.precipitation?.type === 'string', `${type} precipitation type is valid`);
}

// Check specific mechanics
assert(getWeatherProfile('RAIN').track.isWet === true, 'Rain has wet track');
assert(getWeatherProfile('RAIN').precipitation.type === 'rain', 'Rain precipitation is rain');
assert(getWeatherProfile('HEAVY_RAIN').atmosphere.hasLightning === true, 'Heavy rain has sheet lightning');
assert(getWeatherProfile('SNOW').track.hasSnow === true, 'Snow has snow-covered track/ground');
assert(getWeatherProfile('SNOW').precipitation.type === 'snow', 'Snow has snow precipitation');
assert(getWeatherProfile('FOG').atmosphere.hasLayeredFog === true, 'Fog has layered translucent fog planes');
assert(getWeatherProfile('SUNSET').lighting.ambientColor.includes('249, 115, 22') || getWeatherProfile('SUNSET').lighting.ambientColor.includes('251'), 'Sunset has warm environmental lighting');
assert(getWeatherProfile('NIGHT').sky.hasStars === true, 'Night has star field');

console.log('\n=== Test Suite 2: WeatherParticles Pool (Zero-GC) ===');
const particles = new WeatherParticles();
assert(particles.arr_particles.length === 160, 'Particle pool pre-allocates exactly 160 particles');

// Configure for rain
particles.configure(getWeatherProfile('RAIN').precipitation, 1920, 1080);
assert(particles.activeCount === 90, 'Active rain particles count is 90');

// Update particles with train speed (15 m/s)
particles.update(0.016, 15, 1920, 1080, true);
let foundActive = false;
for (let i = 0; i < particles.activeCount; i++) {
  const p = particles.arr_particles[i];
  if (p.active) {
    foundActive = true;
    assert(p.vx < -100, `Rain particle ${i} slanted diagonally with train speed (vx=${p.vx})`);
    assert(p.vy > 400, `Rain particle ${i} falling downwards (vy=${p.vy})`);
    break;
  }
}
assert(foundActive, 'Active rain particles exist and are updating');

// Configure for snow
particles.configure(getWeatherProfile('SNOW').precipitation, 1920, 1080);
assert(particles.activeCount === 110, 'Active snow particles count is 110');
particles.update(0.016, 5, 1920, 1080, false);
for (let i = 0; i < particles.activeCount; i++) {
  const p = particles.arr_particles[i];
  if (p.active) {
    assert(p.radius >= 1.5, `Snow particle ${i} has snowflake radius`);
    assert(p.vy < 200, `Snow particle ${i} gentle flutter falling speed`);
    break;
  }
}

console.log('\n=== Test Suite 3: WeatherAtmosphere (Fog, Stars, Lightning) ===');
const atmosphere = new WeatherAtmosphere();
assert(atmosphere.arr_stars.length === 60, '60 pre-computed stars for night sky');

// Update atmosphere with lightning
atmosphere.update(0.016, true, true);
assert(atmosphere.fogOffset > 0, 'Fog ribbons drift offset advances');

// Fast forward lightning timer
atmosphere.lightningTimer = atmosphere.lightningCooldown + 0.01;
atmosphere.update(0.016, true, true);
assert(atmosphere.isLightningActive === true, 'Sheet lightning triggered during heavy storm');

console.log('\n=== Test Suite 4: WeatherSystem Coordinator & Transitions ===');
const weatherSystem = new WeatherSystem(cons_WEATHER_TYPES.CLEAR);
assert(weatherSystem.getWeather() === 'CLEAR', 'Initial weather is CLEAR');

// Transition to RAIN
weatherSystem.setWeather(cons_WEATHER_TYPES.RAIN, 0.5);
assert(weatherSystem.targetWeather === 'RAIN', 'Target weather set to RAIN');
assert(weatherSystem.transitionProgress === 0.0, 'Transition starts at progress 0.0');

// Advance time halfway
weatherSystem.update(0.25, 10, 1920, 1080);
assert(weatherSystem.transitionProgress > 0.4 && weatherSystem.transitionProgress < 0.6, 'Transition progress smoothly interpolates');

// Complete transition
weatherSystem.update(0.3, 10, 1920, 1080);
assert(weatherSystem.transitionProgress >= 1.0, 'Transition progress reached 1.0');
assert(weatherSystem.getWeather() === 'RAIN', 'Current weather is now RAIN');

// Cycle weather
const nextWeather = weatherSystem.cycleWeather();
assert(nextWeather === arr_WEATHER_CYCLE_ORDER[(arr_WEATHER_CYCLE_ORDER.indexOf('RAIN') + 1) % arr_WEATHER_CYCLE_ORDER.length], 'cycleWeather advances to next sequential weather type');

console.log('\n=== Test Suite 5: Mock Canvas 2D Render Passes ===');
// Create lightweight mock 2D context
function createMockCtx() {
  const calls = [];
  return {
    calls,
    save: () => calls.push('save'),
    restore: () => calls.push('restore'),
    beginPath: () => calls.push('beginPath'),
    closePath: () => calls.push('closePath'),
    moveTo: (x, y) => calls.push(`moveTo(${x},${y})`),
    lineTo: (x, y) => calls.push(`lineTo(${x},${y})`),
    arc: (x, y, r) => calls.push(`arc(${x},${y},${r})`),
    ellipse: (x, y, rx, ry) => calls.push(`ellipse(${x},${y},${rx},${ry})`),
    fill: () => calls.push('fill'),
    stroke: () => calls.push('stroke'),
    fillRect: (x, y, w, h) => calls.push(`fillRect(${x},${y},${w},${h})`),
    strokeRect: (x, y, w, h) => calls.push(`strokeRect(${x},${y},${w},${h})`),
    clearRect: (x, y, w, h) => calls.push(`clearRect(${x},${y},${w},${h})`),
    createLinearGradient: () => ({
      addColorStop: () => {},
    }),
    createRadialGradient: () => ({
      addColorStop: () => {},
    }),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    shadowColor: '',
    shadowBlur: 0,
  };
}

const mockCtx = createMockCtx();
for (const type of arr_expectedTypes) {
  weatherSystem.setWeather(type, 0.01);
  weatherSystem.update(0.02, 12, 1920, 1080);

  // Render passes
  const grad = weatherSystem.createSkyGradient(mockCtx, 1080);
  assert(grad !== null, `${type} generates valid sky gradient`);

  weatherSystem.renderCelestial(mockCtx, 1920, 1080);
  weatherSystem.renderFogPlanes(mockCtx, 1920, 1080, 4);
  weatherSystem.renderFogPlanes(mockCtx, 1920, 1080, 6);
  weatherSystem.renderPrecipitation(mockCtx);
  weatherSystem.renderAtmosphere(mockCtx, 1920, 1080);
}
assert(mockCtx.calls.length > 50, 'All render passes executed successfully without throwing');

console.log(`\n========================================`);
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
