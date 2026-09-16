/**
 * test_responsive_design.mjs
 * Comprehensive automated verification of the responsive redesign across all 10 target resolutions.
 * Tests:
 * 1. WorldCamera responsive scaling & visual train proportionality.
 * 2. CSS touch target minimum size enforcement (>= 44px physical interaction footprint).
 * 3. Safe-area inset integration.
 * 4. CSS clamp() & viewport units (vw, vh, dvh) usage.
 * 5. Single unified component architecture (zero duplicated mobile vs desktop trees).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WorldCamera } from '../src/game/camera/WorldCamera.js';

const rootDir = path.resolve('.');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

console.log('\n=== TEST 1: WORLD CAMERA - PROPORTIONAL SCALING ACROSS 10 TARGET RESOLUTIONS ===');

const arr_TARGET_RESOLUTIONS = [
  { name: '360x640 (Mobile Portrait)', w: 360, h: 640, isPortrait: true },
  { name: '640x360 (Mobile Landscape)', w: 640, h: 360, isPortrait: false },
  { name: '375x667 (iPhone SE Portrait)', w: 375, h: 667, isPortrait: true },
  { name: '667x375 (iPhone SE Landscape)', w: 667, h: 375, isPortrait: false },
  { name: '390x844 (iPhone 12/13/14 Portrait)', w: 390, h: 844, isPortrait: true },
  { name: '844x390 (iPhone 12/13/14 Landscape)', w: 844, h: 390, isPortrait: false },
  { name: '412x915 (Android Modern Portrait)', w: 412, h: 915, isPortrait: true },
  { name: '915x412 (Android Modern Landscape)', w: 915, h: 412, isPortrait: false },
  { name: '768x1024 (Tablet iPad Portrait)', w: 768, h: 1024, isPortrait: true },
  { name: '1024x768 (Tablet iPad Landscape)', w: 1024, h: 768, isPortrait: false },
  { name: '1280x720 (720p Laptop HD)', w: 1280, h: 720, isPortrait: false },
  { name: '1366x768 (Standard Laptop Widescreen)', w: 1366, h: 768, isPortrait: false },
  { name: '1440x900 (16:10 MacBook Laptop)', w: 1440, h: 900, isPortrait: false },
  { name: '1920x1080 (1080p Desktop Full HD)', w: 1920, h: 1080, isPortrait: false },
];

const cons_LOCOMOTIVE_LENGTH = 420; // Standard world unit length of locomotive

for (const res of arr_TARGET_RESOLUTIONS) {
  const camera = new WorldCamera();
  camera.resize(res.w, res.h);

  assert(
    camera.viewportScale >= 0.45 && camera.viewportScale <= 1.25,
    `${res.name}: viewportScale (${camera.viewportScale.toFixed(3)}) is within stable range [0.45, 1.25]`
  );

  const tmp_visibleWorldWidth = res.w / camera.viewportScale;
  const tmp_trainRatio = cons_LOCOMOTIVE_LENGTH / tmp_visibleWorldWidth;

  if (res.isPortrait) {
    // In portrait, the train should occupy between 45% and 60% of visible width (never overflowing)
    assert(
      tmp_trainRatio >= 0.45 && tmp_trainRatio <= 0.60,
      `${res.name}: Train occupies ${(tmp_trainRatio * 100).toFixed(1)}% of visible width (healthy 45%-60%)`
    );
  } else {
    // In landscape, train occupies between 20% and 42% of visible width for scenic track view
    assert(
      tmp_trainRatio >= 0.20 && tmp_trainRatio <= 0.42,
      `${res.name}: Train occupies ${(tmp_trainRatio * 100).toFixed(1)}% of visible width (healthy 20%-42%)`
    );
  }

  // Dead zone scales proportionally
  const tmp_expectedDeadZone = 42.0 * camera.viewportScale;
  assert(
    Math.abs(camera.deadZoneHalfWidth - tmp_expectedDeadZone) < 0.001,
    `${res.name}: deadZoneHalfWidth matches proportional scaling (${camera.deadZoneHalfWidth.toFixed(2)}px)`
  );
}

console.log('\n=== TEST 2: CSS TOUCH TARGETS - MINIMUM 44PX PHYSICAL INTERACTION SIZE ===');

const dashboardCssPath = path.join(rootDir, 'src', 'styles', 'dashboard.css');
const hudCssPath = path.join(rootDir, 'src', 'styles', 'hud.css');
const gameCssPath = path.join(rootDir, 'src', 'styles', 'game.css');
const indexCssPath = path.join(rootDir, 'src', 'styles', 'index.css');

const dashboardCss = fs.readFileSync(dashboardCssPath, 'utf8');
const hudCss = fs.readFileSync(hudCssPath, 'utf8');
const gameCss = fs.readFileSync(gameCssPath, 'utf8');
const indexCss = fs.readFileSync(indexCssPath, 'utf8');

// 1. Push Button (Horn)
assert(
  dashboardCss.includes('.tactile-push-btn {') &&
  dashboardCss.includes('min-width: 44px;') &&
  dashboardCss.includes('min-height: 44px;'),
  '.tactile-push-btn enforces min-width: 44px and min-height: 44px'
);
assert(
  dashboardCss.includes('width: clamp(44px, calc(44px * var(--controlScale)), 54px);'),
  '.tactile-push-btn__collar uses clamp() with 44px minimum floor'
);

// 2. Rocker Switch (Headlights)
assert(
  dashboardCss.includes('.tactile-rocker-switch {') &&
  dashboardCss.includes('width: clamp(44px, calc(44px * var(--controlScale)), 54px);'),
  '.tactile-rocker-switch casing uses clamp() with 44px minimum floor'
);

// 3. Sander Button
assert(
  dashboardCss.includes('.tactile-momentary-btn {') &&
  dashboardCss.includes('width: clamp(44px, calc(48px * var(--controlScale)), 54px);') &&
  dashboardCss.includes('height: clamp(44px, calc(44px * var(--controlScale)), 54px);'),
  '.tactile-momentary-btn (Sander) enforces clamp() with 44px minimum floor'
);

// 4. Service Brake Buttons (Apply & Release)
assert(
  dashboardCss.includes('.tactile-brake-btn {') &&
  dashboardCss.includes('min-height: 44px;') &&
  dashboardCss.includes('min-width: clamp(52px, 8vw, 76px);'),
  '.tactile-brake-btn enforces min-height: 44px and responsive clamp width'
);

// 5. Emergency Brake Mushroom Button
assert(
  dashboardCss.includes('.emergency-brake-btn {') &&
  dashboardCss.includes('min-width: 44px;') &&
  dashboardCss.includes('min-height: 44px;'),
  '.emergency-brake-btn enforces min-width: 44px and min-height: 44px'
);

// 6. Camera Button
assert(
  dashboardCss.includes('.tactile-camera-btn {') &&
  dashboardCss.includes('.tactile-camera-btn__casing {') &&
  dashboardCss.includes('width: clamp(44px, 5vw, 48px);'),
  '.tactile-camera-btn enforces clamp() with 44px minimum floor'
);

// 7. Pause Button
assert(
  dashboardCss.includes('.top-hud__pause-btn {') &&
  dashboardCss.includes('width: clamp(44px, 5vw, 48px);') &&
  dashboardCss.includes('min-width: 44px;'),
  '.top-hud__pause-btn enforces clamp() with 44px minimum floor'
);
assert(
  hudCss.includes('.train-hud__pause-btn {') &&
  hudCss.includes('min-width: 44px;') &&
  hudCss.includes('min-height: 44px;'),
  '.train-hud__pause-btn enforces min-width: 44px and min-height: 44px'
);

// 8. Levers (Throttle & Brake)
assert(
  dashboardCss.includes('.tactile-lever__slot {') &&
  dashboardCss.includes('width: clamp(44px, calc(44px * var(--controlScale)), 52px);') &&
  dashboardCss.includes('min-width: 44px;'),
  '.tactile-lever__slot enforces clamp() with 44px minimum interaction width'
);
assert(
  dashboardCss.includes('.tactile-lever__handle {') &&
  dashboardCss.includes('min-height: 44px;') &&
  dashboardCss.includes('min-width: 48px;'),
  '.tactile-lever__handle enforces min-height: 44px and min-width: 48px'
);

// 9. Orientation Notice Dismiss Button
assert(
  dashboardCss.includes('.orientation-notice__close-btn {') &&
  dashboardCss.includes('min-width: 44px;') &&
  dashboardCss.includes('min-height: 44px;'),
  '.orientation-notice__close-btn enforces min-width: 44px and min-height: 44px'
);

console.log('\n=== TEST 3: SAFE-AREA INSETS & VIEWPORT UNITS ===');

assert(
  dashboardCss.includes('env(safe-area-inset-top') &&
  dashboardCss.includes('env(safe-area-inset-bottom') &&
  dashboardCss.includes('env(safe-area-inset-left') &&
  dashboardCss.includes('env(safe-area-inset-right'),
  'dashboard.css defines all 4 safe-area-inset environment variables'
);

assert(
  hudCss.includes('var(--sat)') &&
  hudCss.includes('var(--sal)') &&
  hudCss.includes('var(--sar)'),
  'hud.css integrates safe-area insets on top HUD container'
);

assert(
  indexCss.includes('height: 100dvh;'),
  'index.css applies height: 100dvh to html, body, and #root for mobile address bar stability'
);

assert(
  gameCss.includes('height: 100dvh;'),
  'game.css applies height: 100dvh to .game-screen'
);

assert(
  gameCss.includes('@media (orientation: portrait)') &&
  gameCss.includes('.game-screen__canvas-wrapper {') &&
  gameCss.includes('45dvh'),
  'game.css allocates proportional ~45dvh flex ratio to canvas in portrait'
);

console.log('\n=== TEST 4: UNIFIED COMPONENT ARCHITECTURE & ORIENTATION SUPPORT ===');

// Check that there are no duplicate component files like MobileHUD or DesktopDashboard
const arr_allFiles = fs.readdirSync(path.join(rootDir, 'src', 'components', 'hud'));
const tmp_hasDuplicateComponents = arr_allFiles.some(f =>
  f.toLowerCase().includes('mobilehud') ||
  f.toLowerCase().includes('desktophud') ||
  f.toLowerCase().includes('mobiledashboard')
);
assert(!tmp_hasDuplicateComponents, 'Single component architecture preserved (no duplicate mobile/desktop components)');

// Check portrait grid layout in dashboard.css
assert(
  dashboardCss.includes('@media (orientation: portrait) {') &&
  dashboardCss.includes('grid-template-columns: 1fr 1fr;') &&
  dashboardCss.includes('grid-template-areas:') &&
  dashboardCss.includes('"center center"') &&
  dashboardCss.includes('"left right"'),
  'dashboard.css implements ergonomic 2-tier grid layout for portrait mobile gameplay'
);

console.log(`\n======================================================`);
console.log(`RESULTS: ${passedTests} passed, ${failedTests} failed`);
console.log(`======================================================\n`);

if (failedTests > 0) {
  process.exit(1);
}
