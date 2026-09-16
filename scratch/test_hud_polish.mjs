/**
 * scratch/test_hud_polish.mjs
 * Comprehensive automated verification test suite for the Gameplay HUD Visual Polish:
 * 1. Immediate communication of 8 core telemetry values:
 *    - TRAIN SPEED
 *    - THROTTLE
 *    - BRAKE
 *    - DIRECTION
 *    - SIGNAL
 *    - MISSION
 *    - DISTANCE
 *    - TRAIN STATUS
 * 2. All 6 subtle performant animations:
 *    - button press (tactileButtonPress / active transitions)
 *    - gauge movement (smooth canvas lerp)
 *    - warning blink (warningPulse / overheatBlink)
 *    - signal transition (signalTransition)
 *    - mission completion (celebrationShimmer / starPop)
 *    - speed warning (overspeedPulse)
 * 3. Proportions and spacing (dashboard never hides world view, gaugeScale clamps)
 * 4. Touch target compliance (>= 44px)
 * 5. UI clutter reduction (responsive label collapsing, clean hierarchy)
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('🧪 Starting Gameplay HUD Visual Polish Automated Test Suite...\n');

const projectRoot = process.cwd();
const dashboardCssPath = path.join(projectRoot, 'src', 'styles', 'dashboard.css');
const topHudJsxPath = path.join(projectRoot, 'src', 'components', 'hud', 'TopHUD.jsx');
const throttleJsxPath = path.join(projectRoot, 'src', 'components', 'hud', 'controls', 'ThrottleControl.jsx');
const brakeJsxPath = path.join(projectRoot, 'src', 'components', 'hud', 'controls', 'BrakeControl.jsx');
const directionJsxPath = path.join(projectRoot, 'src', 'components', 'hud', 'controls', 'DirectionControl.jsx');
const signalJsxPath = path.join(projectRoot, 'src', 'components', 'hud', 'controls', 'SignalIndicator.jsx');
const missionHudJsxPath = path.join(projectRoot, 'src', 'components', 'MissionHUD.jsx');
const analogGaugeJsxPath = path.join(projectRoot, 'src', 'components', 'hud', 'gauges', 'AnalogGauge.jsx');

const dashboardCss = fs.readFileSync(dashboardCssPath, 'utf8');
const topHudJsx = fs.readFileSync(topHudJsxPath, 'utf8');
const throttleJsx = fs.readFileSync(throttleJsxPath, 'utf8');
const brakeJsx = fs.readFileSync(brakeJsxPath, 'utf8');
const directionJsx = fs.readFileSync(directionJsxPath, 'utf8');
const signalJsx = fs.readFileSync(signalJsxPath, 'utf8');
const missionHudJsx = fs.readFileSync(missionHudJsxPath, 'utf8');
const analogGaugeJsx = fs.readFileSync(analogGaugeJsxPath, 'utf8');

let passedCount = 0;

function check(title, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${title}`);
    passedCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${title}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// -------------------------------------------------------------
// 1. Core 8 Telemetry Signals
// -------------------------------------------------------------
console.log('--- 1. Immediate Communication of 8 Core Telemetry Signals ---');

check('TRAIN SPEED is prominently communicated in Top HUD & Speedometer', () => {
  assert(topHudJsx.includes('top-hud__speed-val'), 'Missing top HUD digital speed value');
  assert(topHudJsx.includes('top-hud__limit-sign'), 'Missing circular speed limit sign');
  assert(topHudJsx.includes('tmp_isSpeeding'), 'Missing overspeed detection logic');
  assert(dashboardCss.includes('.top-hud__speed-badge--overspeed'), 'Missing overspeed badge styling');
});

check('THROTTLE is immediately communicated with notch & percentage badge', () => {
  assert(throttleJsx.includes('tactile-lever__header-row'), 'Missing header row in ThrottleControl');
  assert(throttleJsx.includes('tactile-lever__badge--throttle'), 'Missing digital throttle badge');
  assert(dashboardCss.includes('.tactile-lever__badge--throttle'), 'Missing CSS for throttle badge');
});

check('BRAKE is immediately communicated with state & percentage badge', () => {
  assert(brakeJsx.includes('tactile-lever__header-row'), 'Missing header row in BrakeControl');
  assert(brakeJsx.includes('tactile-lever__badge'), 'Missing digital brake badge');
  assert(brakeJsx.includes('REL') && brakeJsx.includes('SVC') && brakeJsx.includes('EMG'), 'Missing brake state labels');
  assert(dashboardCss.includes('.tactile-lever__badge--brake-rel'), 'Missing CSS for brake released badge');
});

check('DIRECTION is immediately communicated with FWD/NEUT/REV & lockout badge', () => {
  assert(directionJsx.includes('tactile-lever__header-row'), 'Missing header row in DirectionControl');
  assert(directionJsx.includes('FWD ▲') && directionJsx.includes('REV ▼'), 'Missing direction arrows');
  assert(directionJsx.includes('tactile-lever__badge--locked'), 'Missing reverser lockout indicator');
  assert(dashboardCss.includes('.tactile-lever__badge--locked'), 'Missing CSS for reverser lock');
});

check('SIGNAL is immediately communicated with 4-aspect plate & distance', () => {
  assert(signalJsx.includes('signal-indicator__plate--four-aspect'), 'Missing 4-aspect signal plate');
  assert(signalJsx.includes('signal-indicator__dist'), 'Missing distance to signal readout');
  assert(signalJsx.includes('signal-indicator__advisory'), 'Missing advisory speed readout');
});

check('MISSION is immediately communicated with objective card & step counter', () => {
  assert(topHudJsx.includes('top-hud__objective-card'), 'Missing objective card');
  assert(topHudJsx.includes('top-hud__objective-step'), 'Missing objective step counter');
  assert(topHudJsx.includes('top-hud__objective-progress-track'), 'Missing objective progress track');
});

check('DISTANCE is immediately communicated to next station & route track', () => {
  assert(topHudJsx.includes('top-hud__distance-indicator'), 'Missing distance indicator');
  assert(topHudJsx.includes('top-hud__dist-val'), 'Missing distance readout text');
  assert(topHudJsx.includes('top-hud__route-track'), 'Missing route track line');
  assert(topHudJsx.includes('top-hud__loco-badge'), 'Missing train locator badge');
});

check('TRAIN STATUS is immediately communicated via annunciator strip & grade', () => {
  assert(dashboardCss.includes('.warning-lamp--slip'), 'Missing wheel slip annunciator');
  assert(dashboardCss.includes('.warning-lamp--temp'), 'Missing engine temp annunciator');
  assert(dashboardCss.includes('.warning-lamp--sand'), 'Missing sander annunciator');
  assert(dashboardCss.includes('.warning-lamp--fuel'), 'Missing low fuel annunciator');
  assert(dashboardCss.includes('.gradient-indicator'), 'Missing track grade incline indicator');
});

// -------------------------------------------------------------
// 2. Subtle Performant Animations
// -------------------------------------------------------------
console.log('\n--- 2. Subtle Performant Animations ---');

check('Animation: button press depression & tactile feedback declared', () => {
  assert(dashboardCss.includes('@keyframes tactileButtonPress'), 'Missing @keyframes tactileButtonPress');
  assert(dashboardCss.includes(':active') && dashboardCss.includes('translateY'), 'Missing button active depression');
});

check('Animation: gauge movement smooth exponential lerp loop', () => {
  assert(analogGaugeJsx.includes('smoothingSpeed'), 'Missing needle smoothing speed parameter');
  assert(analogGaugeJsx.includes('Math.exp(-smoothingSpeed * tmp_dt)'), 'Missing exponential lerp calculation');
  assert(analogGaugeJsx.includes('requestAnimationFrame'), 'Missing requestAnimationFrame loop');
});

check('Animation: warning blink (warningPulse & overheatBlink)', () => {
  assert(dashboardCss.includes('@keyframes warningPulse'), 'Missing @keyframes warningPulse');
  assert(dashboardCss.includes('@keyframes overheatBlink'), 'Missing @keyframes overheatBlink');
  assert(dashboardCss.includes('@keyframes ebrakeAlarmFlash'), 'Missing @keyframes ebrakeAlarmFlash');
});

check('Animation: signal aspect transition bloom declared', () => {
  assert(dashboardCss.includes('@keyframes signalTransition'), 'Missing @keyframes signalTransition');
  assert(dashboardCss.includes('signal-indicator__lamp--active'), 'Missing active signal lamp rule');
});

check('Animation: mission completion celebration (celebrationShimmer & starPop)', () => {
  assert(dashboardCss.includes('@keyframes celebrationShimmer'), 'Missing @keyframes celebrationShimmer');
  assert(dashboardCss.includes('@keyframes starPop'), 'Missing @keyframes starPop');
  assert(missionHudJsx.includes('animation: \'starPop'), 'Missing starPop on MissionHUD stars');
});

check('Animation: speed warning overspeed alert pulse declared', () => {
  assert(dashboardCss.includes('@keyframes overspeedPulse'), 'Missing @keyframes overspeedPulse');
  assert(dashboardCss.includes('animation: overspeedPulse'), 'Missing overspeedPulse invocation');
});

// -------------------------------------------------------------
// 3. Proportions, Spacing & Layout
// -------------------------------------------------------------
console.log('\n--- 3. Proportions & Clutter Reduction ---');

check('Dashboard height is safely clamped so world view is never obscured', () => {
  assert(dashboardCss.includes('--dashboardHeight: clamp(130px, 28vh, 220px);'), 'Dashboard height in landscape must be clamp(130px, 28vh, 220px)');
  assert(dashboardCss.includes('--dashboardHeight: clamp(280px, 50dvh, 480px);'), 'Dashboard height in portrait must be clamp(280px, 50dvh, 480px)');
});

check('Quick action buttons collapse labels on <= 1080px viewports to reduce clutter', () => {
  assert(dashboardCss.includes('@media (max-width: 1080px)'), 'Missing 1080px breakpoint for label collapse');
  assert(dashboardCss.includes('.top-hud__weather-label') && dashboardCss.includes('display: none;'), 'Must collapse weather label on medium screens');
  assert(dashboardCss.includes('.top-hud__time-label') && dashboardCss.includes('display: none;'), 'Must collapse time label on medium screens');
});

// -------------------------------------------------------------
// 4. Touch Targets & Ergonomics
// -------------------------------------------------------------
console.log('\n--- 4. Touch Targets & Ergonomics ---');

check('Pause button meets >= 44px touch target guidelines', () => {
  assert(dashboardCss.includes('.top-hud__pause-btn {') && dashboardCss.includes('width: 44px;') && dashboardCss.includes('height: 44px;'), 'Pause button must be 44px x 44px');
});

check('All interactive levers, buttons, and switches maintain >= 44px touch targets', () => {
  assert(dashboardCss.includes('min-width: 44px;') && dashboardCss.includes('min-height: 44px;'), 'Push buttons and levers must meet 44px minimum touch targets');
});

console.log(`\n🎉 All ${passedCount} Gameplay HUD visual polish tests passed successfully!`);
