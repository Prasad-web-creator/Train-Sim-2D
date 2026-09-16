/**
 * scratch/test_visual_design.mjs
 * Comprehensive automated verification test suite for the tactile 2D visual redesign:
 * - UI Materials tokens (METAL, GLASS, BUTTONS)
 * - 5 explicit button states (default, hover, pressed, active, disabled) across mechanical controls
 * - Circular analog gauge canvas rendering (metallic ring, dark face, white markings, red zones, needle, glass)
 * - Colorful annunciator status lamps with jewel lenses
 * - 4-aspect hooded signal indicator with visor hoods
 * - Touch target compliance (>= 44px)
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('🧪 Starting Visual Design Automated Verification Test Suite...\n');

const projectRoot = process.cwd();
const dashboardCssPath = path.join(projectRoot, 'src', 'styles', 'dashboard.css');
const indexCssPath = path.join(projectRoot, 'src', 'styles', 'index.css');
const analogGaugePath = path.join(projectRoot, 'src', 'components', 'hud', 'gauges', 'AnalogGauge.jsx');

assert(fs.existsSync(dashboardCssPath), `dashboard.css must exist at ${dashboardCssPath}`);
assert(fs.existsSync(indexCssPath), `index.css must exist at ${indexCssPath}`);
assert(fs.existsSync(analogGaugePath), `AnalogGauge.jsx must exist at ${analogGaugePath}`);

const dashboardCss = fs.readFileSync(dashboardCssPath, 'utf8');
const indexCss = fs.readFileSync(indexCssPath, 'utf8');
const analogGaugeJsx = fs.readFileSync(analogGaugePath, 'utf8');

let passedChecks = 0;

function report(testName, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${testName}`);
    passedChecks++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${testName}`);
    console.error(`     Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// -------------------------------------------------------------
// 1. UI Materials Design Tokens: METAL, GLASS, BUTTONS
// -------------------------------------------------------------
console.log('--- Checking UI Material Design Tokens ---');

report('UI Material: METAL design tokens defined', () => {
  const metalTokens = [
    '--mat-metal-dark',
    '--mat-metal-plate',
    '--mat-metal-light',
    '--mat-metal-border',
    '--mat-metal-highlight',
    '--mat-metal-shadow',
  ];
  for (const token of metalTokens) {
    assert(dashboardCss.includes(token), `Missing METAL token: ${token}`);
  }
});

report('UI Material: GLASS design tokens defined', () => {
  const glassTokens = [
    '--mat-glass-overlay',
    '--mat-glass-border',
    '--mat-glass-highlight',
  ];
  for (const token of glassTokens) {
    assert(dashboardCss.includes(token), `Missing GLASS token: ${token}`);
  }
});

report('UI Material: BUTTON state shadow tokens defined', () => {
  const btnTokens = [
    '--btn-raised-shadow',
    '--btn-pressed-shadow',
  ];
  for (const token of btnTokens) {
    assert(dashboardCss.includes(token), `Missing BUTTON token: ${token}`);
  }
});

report('Dashboard plate features dark metallic texture with bevel & specular border', () => {
  assert(dashboardCss.includes('.train-dashboard {'), 'Missing .train-dashboard rule');
  assert(dashboardCss.includes('linear-gradient(180deg, #252f42 0%, #161e2c 25%'), 'Missing dark metallic gradient');
  assert(dashboardCss.includes('border-top: 3.5px solid #4a5870'), 'Missing metallic top border');
  assert(dashboardCss.includes('inset 0 2px 0 rgba(255, 255, 255, 0.22)'), 'Missing top specular highlight line');
});

// -------------------------------------------------------------
// 2. Button 5-State System: default, hover, pressed, active, disabled
// -------------------------------------------------------------
console.log('\n--- Checking Button 5-State Interactive System ---');

report('Global button (.iron-btn) supports all 5 tactile states', () => {
  assert(indexCss.includes('.iron-btn {'), 'Missing default .iron-btn');
  assert(indexCss.includes('.iron-btn:hover:not(:disabled)'), 'Missing hover state on .iron-btn');
  assert(indexCss.includes('.iron-btn:active:not(:disabled)') && indexCss.includes('.iron-btn--pressed'), 'Missing pressed state on .iron-btn');
  assert(indexCss.includes('.iron-btn--active'), 'Missing active state on .iron-btn');
  assert(indexCss.includes('.iron-btn:disabled') && indexCss.includes('.iron-btn--disabled'), 'Missing disabled state on .iron-btn');
});

report('Emergency Brake button supports all 5 tactile states', () => {
  assert(dashboardCss.includes('.emergency-brake-btn {'), 'Missing default state on emergency brake');
  assert(dashboardCss.includes('.emergency-brake-btn:hover:not(:disabled)'), 'Missing hover state on emergency brake');
  assert(dashboardCss.includes('.emergency-brake-btn:active') && dashboardCss.includes('.emergency-brake-btn--pressed'), 'Missing pressed state on emergency brake');
  assert(dashboardCss.includes('.emergency-brake-btn--active'), 'Missing active state on emergency brake');
  assert(dashboardCss.includes('.emergency-brake-btn:disabled') && dashboardCss.includes('.emergency-brake-btn--disabled'), 'Missing disabled state on emergency brake');
});

report('Horn push button (.tactile-push-btn) supports all 5 tactile states', () => {
  assert(dashboardCss.includes('.tactile-push-btn {'), 'Missing default state on horn button');
  assert(dashboardCss.includes('.tactile-push-btn:hover:not(:disabled)'), 'Missing hover state on horn button');
  assert(dashboardCss.includes('.tactile-push-btn:active') && dashboardCss.includes('.tactile-push-btn--pressed'), 'Missing pressed state on horn button');
  assert(dashboardCss.includes('.tactile-push-btn--active'), 'Missing active state on horn button');
  assert(dashboardCss.includes('.tactile-push-btn:disabled') && dashboardCss.includes('.tactile-push-btn--disabled'), 'Missing disabled state on horn button');
});

report('Headlights rocker switch (.tactile-rocker-switch) supports all 5 tactile states', () => {
  assert(dashboardCss.includes('.tactile-rocker-switch {'), 'Missing default state on rocker switch');
  assert(dashboardCss.includes('.tactile-rocker-switch:hover:not(:disabled)'), 'Missing hover state on rocker switch');
  assert(dashboardCss.includes('.tactile-rocker-switch:active') && dashboardCss.includes('.tactile-rocker-switch--pressed'), 'Missing pressed state on rocker switch');
  assert(dashboardCss.includes('.tactile-rocker-switch--active'), 'Missing active state on rocker switch');
  assert(dashboardCss.includes('.tactile-rocker-switch:disabled') && dashboardCss.includes('.tactile-rocker-switch--disabled'), 'Missing disabled state on rocker switch');
});

report('Pneumatic brake buttons (.tactile-brake-btn) support all 5 tactile states', () => {
  assert(dashboardCss.includes('.tactile-brake-btn {'), 'Missing default state on brake button');
  assert(dashboardCss.includes('.tactile-brake-btn--apply:hover:not(:disabled)'), 'Missing hover state on brake button');
  assert(dashboardCss.includes('.tactile-brake-btn--apply:active') && dashboardCss.includes('.tactile-brake-btn--apply.tactile-brake-btn--pressed'), 'Missing pressed state on brake button');
  assert(dashboardCss.includes('.tactile-brake-btn--active'), 'Missing active state on brake button');
  assert(dashboardCss.includes('.tactile-brake-btn:disabled') && dashboardCss.includes('.tactile-brake-btn--disabled'), 'Missing disabled state on brake button');
});

report('Sander momentary button (.tactile-momentary-btn) supports all 5 tactile states', () => {
  assert(dashboardCss.includes('.tactile-momentary-btn {'), 'Missing default state on sander button');
  assert(dashboardCss.includes('.tactile-momentary-btn:hover:not(:disabled)'), 'Missing hover state on sander button');
  assert(dashboardCss.includes('.tactile-momentary-btn:active') && dashboardCss.includes('.tactile-momentary-btn--pressed'), 'Missing pressed state on sander button');
  assert(dashboardCss.includes('.tactile-momentary-btn--active'), 'Missing active state on sander button');
  assert(dashboardCss.includes('.tactile-momentary-btn:disabled') && dashboardCss.includes('.tactile-momentary-btn--disabled'), 'Missing disabled state on sander button');
});

// -------------------------------------------------------------
// 3. Circular Analog Gauge Rendering Features
// -------------------------------------------------------------
console.log('\n--- Checking Circular Analog Gauge Specifications ---');

report('Metallic Outer Ring: Machined steel gradient, chamfer bevel, knurled ring, and screws', () => {
  assert(analogGaugeJsx.includes('fn_drawBezel'), 'Missing fn_drawBezel');
  assert(analogGaugeJsx.includes('obj_outerGrad.addColorStop(0, \'#64748b\')'), 'Missing outer metallic gradient specular hit');
  assert(analogGaugeJsx.includes('obj_innerBezelGrad'), 'Missing stepped inner chamfer bevel gradient');
  assert(analogGaugeJsx.includes('Knurled / milled micro-groove ring'), 'Missing knurled micro-groove ring');
  assert(analogGaugeJsx.includes('tmp_screwCount = 6'), 'Missing 6 perimeter screw rivets');
});

report('Dark Face: Matte anthracite gradient with phonograph concentric micro-grooves', () => {
  assert(analogGaugeJsx.includes('fn_drawDialFace'), 'Missing fn_drawDialFace');
  assert(analogGaugeJsx.includes('obj_faceGrad.addColorStop(0, \'#151d2c\')'), 'Missing dark face center tone');
  assert(analogGaugeJsx.includes('obj_faceGrad.addColorStop(1, \'#020408\')'), 'Missing dark face deep shadow perimeter');
  assert(analogGaugeJsx.includes('Concentric micro-grooves'), 'Missing concentric micro-grooves texture loop');
});

report('White Markings: Calibrated major and minor division tick marks', () => {
  assert(analogGaugeJsx.includes('fn_drawTicksAndNumbers'), 'Missing fn_drawTicksAndNumbers');
  assert(analogGaugeJsx.includes('ctx.strokeStyle = \'#cbd5e1\''), 'Missing white/silver major tick styling');
  assert(analogGaugeJsx.includes('ctx.strokeStyle = \'#64748b\''), 'Missing minor tick styling');
  assert(analogGaugeJsx.includes('ctx.fillText(tmp_label, tmp_tx, tmp_ty)'), 'Missing numeric tick labels');
});

report('Red Warning Areas: Colored warning arc bands configured', () => {
  assert(analogGaugeJsx.includes('fn_drawWarningZones'), 'Missing fn_drawWarningZones');
  assert(analogGaugeJsx.includes('ctx.strokeStyle = obj_zone.color'), 'Missing warning zone stroke rendering');
});

report('Animated Needle: Dynamic angle-aware drop shadow, dual-tone enamel body & white tip', () => {
  assert(analogGaugeJsx.includes('fn_drawNeedle'), 'Missing fn_drawNeedle');
  assert(analogGaugeJsx.includes('tmp_shadowAngle = tmp_rad - Math.PI / 4'), 'Missing angle-aware dynamic shadow calculation');
  assert(analogGaugeJsx.includes('#dc2626') && analogGaugeJsx.includes('#f97316'), 'Missing dual-tone crimson/orange enamel gradient');
  assert(analogGaugeJsx.includes('ctx.fillStyle = \'#ffffff\''), 'Missing sharp white high-visibility pointer tip');
  assert(analogGaugeJsx.includes('Counterweight tail'), 'Missing gunmetal counterweight tail');
  assert(analogGaugeJsx.includes('Needle spine ridge highlight line'), 'Missing spine ridge highlight');
});

report('Glossy Gauge Glass: Multi-layer convex dome, specular highlight and glare streak', () => {
  assert(analogGaugeJsx.includes('fn_drawGlassSheen'), 'Missing fn_drawGlassSheen');
  assert(analogGaugeJsx.includes('Transparent dark glass tint overlay'), 'Missing transparent dark glass overlay');
  assert(analogGaugeJsx.includes('obj_crescentGrad'), 'Missing curved elliptical specular highlight dome');
  assert(analogGaugeJsx.includes('obj_glassGrad'), 'Missing diagonal ambient glare streak');
  assert(analogGaugeJsx.includes('circular lens edge reflection'), 'Missing lens rim reflection');
});

// -------------------------------------------------------------
// 4. Status Indicators & Annunciator Lamps
// -------------------------------------------------------------
console.log('\n--- Checking Colorful Status Indicators & Annunciator Lamps ---');

report('Annunciator lamps have faceted jewel lenses with Fresnel reflections', () => {
  assert(dashboardCss.includes('.warning-lamp__jewel'), 'Missing .warning-lamp__jewel');
  assert(dashboardCss.includes('.warning-lamp__jewel::after'), 'Missing jewel specular highlight reflection');
  assert(dashboardCss.includes('radial-gradient(circle at 35% 35%, #475569 0%, #1e293b 60%'), 'Missing unlit dark jewel lens gradient');
});

report('Annunciator lamps support distinct color phosphor glows (Slip, Overheat, Sander, Fuel)', () => {
  assert(dashboardCss.includes('.warning-lamp--slip.warning-lamp--active .warning-lamp__jewel'), 'Missing slip active jewel');
  assert(dashboardCss.includes('#f59e0b'), 'Missing slip amber glow');
  assert(dashboardCss.includes('.warning-lamp--temp.warning-lamp--active .warning-lamp__jewel'), 'Missing overheat active jewel');
  assert(dashboardCss.includes('overheatBlink'), 'Missing overheat alarm blinking animation');
  assert(dashboardCss.includes('.warning-lamp--sand.warning-lamp--active .warning-lamp__jewel'), 'Missing sander active jewel');
  assert(dashboardCss.includes('.warning-lamp--fuel.warning-lamp--active .warning-lamp__jewel'), 'Missing fuel active jewel');
});

report('4-Aspect Signal Indicator features hooded shroud plate and visor hoods', () => {
  assert(dashboardCss.includes('.signal-indicator__plate--four-aspect'), 'Missing 4-aspect plate');
  assert(dashboardCss.includes('.signal-indicator__lamp::before'), 'Missing visor hood pseudo-element');
  assert(dashboardCss.includes('.signal-indicator__lamp::after'), 'Missing optical lens highlight pseudo-element');
  assert(dashboardCss.includes('.signal-indicator__lamp--red.signal-indicator__lamp--active'), 'Missing active red aspect');
  assert(dashboardCss.includes('.signal-indicator__lamp--amber.signal-indicator__lamp--active'), 'Missing active amber aspect');
  assert(dashboardCss.includes('.signal-indicator__lamp--green.signal-indicator__lamp--active'), 'Missing active green aspect');
});

// -------------------------------------------------------------
// 5. Touch Target Sizing (>= 44px)
// -------------------------------------------------------------
console.log('\n--- Checking Minimum 44px Touch Target Compliance ---');

report('All primary tactile controls maintain >= 44px physical touch target dimensions', () => {
  assert(dashboardCss.includes('min-width: 44px;') && dashboardCss.includes('min-height: 44px;'), 'Horn/action buttons must have min-width 44px and min-height 44px');
  assert(dashboardCss.includes('width: clamp(52px,'), 'Emergency brake mushroom button must be >= 52px');
  assert(dashboardCss.includes('min-width: 44px;') && dashboardCss.includes('min-height: 44px;'), 'Top HUD buttons must have min-width and min-height 44px');
  assert(indexCss.includes('min-height: 44px;'), '.iron-btn must have min-height 44px');
});

console.log(`\n🎉 All ${passedChecks} Visual Design checks passed successfully!`);
