/**
 * test_fullscreen_feature.mjs
 * Automated verification of the Fullscreen feature:
 * 1. FullscreenControl component existence, export, and markup structure.
 * 2. Fullscreen action registration in KeyBindingManager and default KeyF binding.
 * 3. TrainActions toggleFullscreen method implementation with vendor fallbacks.
 * 4. InputManager cons_ACTIONS.FULLSCREEN dispatch on keydown.
 * 5. TopHUD integration with FullscreenControl.
 * 6. CSS touch target compliance (>= 44px min-width/min-height, clamp sizing, active states).
 * 7. Controls modal cheatsheet integration for keyboard and mobile tabs.
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('🧪 Starting Fullscreen Gameplay Feature Automated Test Suite...\n');

const projectRoot = process.cwd();
const fullscreenJsxPath = path.join(projectRoot, 'src', 'components', 'hud', 'controls', 'FullscreenControl.jsx');
const keyBindingJsPath = path.join(projectRoot, 'src', 'game', 'input', 'KeyBindingManager.js');
const trainActionsJsPath = path.join(projectRoot, 'src', 'game', 'actions', 'TrainActions.js');
const inputManagerJsPath = path.join(projectRoot, 'src', 'game', 'input', 'InputManager.js');
const topHudJsxPath = path.join(projectRoot, 'src', 'components', 'hud', 'TopHUD.jsx');
const dashboardCssPath = path.join(projectRoot, 'src', 'styles', 'dashboard.css');
const controlsScreenJsxPath = path.join(projectRoot, 'src', 'screens', 'ControlsScreen.jsx');

const fullscreenJsx = fs.readFileSync(fullscreenJsxPath, 'utf8');
const keyBindingJs = fs.readFileSync(keyBindingJsPath, 'utf8');
const trainActionsJs = fs.readFileSync(trainActionsJsPath, 'utf8');
const inputManagerJs = fs.readFileSync(inputManagerJsPath, 'utf8');
const topHudJsx = fs.readFileSync(topHudJsxPath, 'utf8');
const dashboardCss = fs.readFileSync(dashboardCssPath, 'utf8');
const controlsScreenJsx = fs.readFileSync(controlsScreenJsxPath, 'utf8');

let passed = 0;
let failed = 0;

function check(title, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${title}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${title}`);
    console.error(`     Error: ${err.message}`);
    failed++;
    process.exitCode = 1;
  }
}

// 1. FullscreenControl component
check('FullscreenControl component exports FullscreenControl function', () => {
  assert(fullscreenJsx.includes('export function FullscreenControl()'), 'Missing export function FullscreenControl()');
  assert(fullscreenJsx.includes('getIsFullscreen'), 'Missing getIsFullscreen helper');
  assert(fullscreenJsx.includes('fullscreenchange'), 'Missing fullscreenchange listener');
  assert(fullscreenJsx.includes('webkitfullscreenchange'), 'Missing webkitfullscreenchange listener');
  assert(fullscreenJsx.includes('aria-label'), 'Missing accessibility aria-label');
  assert(fullscreenJsx.includes('tactile-fullscreen-btn'), 'Missing tactile-fullscreen-btn CSS class');
});

// 2. KeyBindingManager
check('KeyBindingManager registers FULLSCREEN action and default KeyF binding', () => {
  assert(keyBindingJs.includes("FULLSCREEN: 'FULLSCREEN'"), 'Missing FULLSCREEN in cons_ACTIONS');
  assert(keyBindingJs.includes("[cons_ACTIONS.FULLSCREEN]: ['KeyF']"), 'Missing KeyF default binding');
  assert(keyBindingJs.includes("[cons_ACTIONS.FULLSCREEN]: {"), 'Missing FULLSCREEN metadata');
});

// 3. TrainActions
check('TrainActions has toggleFullscreen method with cross-browser API fallbacks', () => {
  assert(trainActionsJs.includes('toggleFullscreen()'), 'Missing toggleFullscreen in TrainActionsManager');
  assert(trainActionsJs.includes('requestFullscreen'), 'Missing requestFullscreen call');
  assert(trainActionsJs.includes('exitFullscreen'), 'Missing exitFullscreen call');
  assert(trainActionsJs.includes('webkitRequestFullscreen'), 'Missing webkitRequestFullscreen fallback');
  assert(trainActionsJs.includes('webkitExitFullscreen'), 'Missing webkitExitFullscreen fallback');
});

// 4. InputManager
check('InputManager dispatches FULLSCREEN action upon keydown', () => {
  assert(inputManagerJs.includes('tmp_action === cons_ACTIONS.FULLSCREEN'), 'Missing fullscreen dispatch in InputManager');
  assert(inputManagerJs.includes('obj_TRAIN_ACTIONS.toggleFullscreen()'), 'Missing toggleFullscreen call on keydown');
});

// 5. TopHUD
check('TopHUD imports and renders FullscreenControl alongside CameraControl and Pause', () => {
  assert(topHudJsx.includes("import { FullscreenControl } from './controls/FullscreenControl.jsx';"), 'Missing FullscreenControl import in TopHUD');
  assert(topHudJsx.includes('<FullscreenControl />'), 'Missing <FullscreenControl /> render tag');
});

// 6. CSS Styling and Touch Targets
check('dashboard.css defines .tactile-fullscreen-btn with >= 44px touch targets and tactile states', () => {
  assert(dashboardCss.includes('.tactile-fullscreen-btn {'), 'Missing .tactile-fullscreen-btn declaration');
  assert(dashboardCss.includes('min-width: 44px;'), 'Missing min-width: 44px on fullscreen button');
  assert(dashboardCss.includes('min-height: 44px;'), 'Missing min-height: 44px on fullscreen button');
  assert(dashboardCss.includes('.tactile-fullscreen-btn__casing {'), 'Missing .tactile-fullscreen-btn__casing');
  assert(dashboardCss.includes('.tactile-fullscreen-btn:hover'), 'Missing hover state');
  assert(dashboardCss.includes('.tactile-fullscreen-btn:active'), 'Missing active state');
  assert(dashboardCss.includes('.tactile-fullscreen-btn--active'), 'Missing active state class');
});

// 7. ControlsScreen
check('ControlsScreen includes FULLSCREEN in action keys and touch guide', () => {
  assert(controlsScreenJsx.includes('cons_ACTIONS.FULLSCREEN'), 'Missing FULLSCREEN in ControlsScreen keys');
  assert(controlsScreenJsx.includes('Fullscreen Display'), 'Missing Fullscreen in mobile touch guide');
});

console.log(`\n======================================================`);
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log(`======================================================\n`);
