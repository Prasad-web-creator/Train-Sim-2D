/**
 * test_asset_pipeline.mjs
 * Automated test suite for IronRail 2D professional asset pipeline:
 * 1. Directory Structure Verification (11 required directories)
 * 2. Asset Manifest Consistency and Queries
 * 3. WebP and PNG Support and Format Negotiation
 * 4. SVG for Scalable UI Icons
 * 5. No Large Base64 Embedded Assets in Source Code
 * 6. AssetLoader and AssetManager Eager/Lazy Loading and Fail-Safe Fallbacks
 */

import fs from 'fs';
import path from 'path';

import {
  arr_ASSET_MANIFEST,
  obj_ASSET_MAP,
  fn_getAssetDefinition,
  fn_getAssetsByCategory,
  fn_getEagerAssets,
  fn_getLazyAssets,
} from '../src/game/assets/AssetManifest.js';

import {
  isWebPSupported,
  getPreferredFormatUrl,
} from '../src/game/assets/WebPSupport.js';

import { AssetLoader, obj_ASSET_LOADER } from '../src/game/assets/AssetLoader.js';
import { AssetManager, obj_ASSET_MANAGER } from '../src/game/assets/AssetManager.js';

const projectRoot = path.resolve('.');

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

console.log('=== TEST 1: ASSET DIRECTORY STRUCTURE ===');
const requiredDirectories = [
  'public/assets/trains/locomotives',
  'public/assets/trains/coaches',
  'public/assets/environment/trees',
  'public/assets/environment/stations',
  'public/assets/environment/mountains',
  'public/assets/environment/railway',
  'public/assets/ui/gauges',
  'public/assets/ui/buttons',
  'public/assets/ui/icons',
  'public/assets/effects',
  'public/assets/audio',
];

for (const dir of requiredDirectories) {
  const fullPath = path.join(projectRoot, dir);
  assert(fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory(), `Directory exists: ${dir}`);
}

console.log('\n=== TEST 2: ASSET MANIFEST INTEGRITY AND CATEGORIZATION ===');
const manifestJsonPath = path.join(projectRoot, 'public/assets/asset-manifest.json');
assert(fs.existsSync(manifestJsonPath), 'public/assets/asset-manifest.json exists');

const rawManifestJson = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
const manifestArray = Array.isArray(rawManifestJson) ? rawManifestJson : rawManifestJson.assets;
assert(Array.isArray(manifestArray), 'asset-manifest.json provides a valid assets array');
assert(manifestArray.length >= 30, `Manifest contains extensive asset entries (found ${manifestArray.length})`);
assert(manifestArray.length === arr_ASSET_MANIFEST.length, `JSON manifest matches JS manifest count (${arr_ASSET_MANIFEST.length})`);

// Verify essential schema on every item
let validSchema = true;
let hasEager = false;
let hasLazy = false;

for (const item of arr_ASSET_MANIFEST) {
  if (!item.id || !item.category || !item.src || !item.type || !item.loading) {
    validSchema = false;
    console.error('Invalid asset schema:', item);
    break;
  }
  if (item.loading === 'eager') hasEager = true;
  if (item.loading === 'lazy') hasLazy = true;
}
assert(validSchema, 'All asset manifest entries conform to id, category, src, type, loading schema');
assert(hasEager, 'Asset manifest has eager preloaded assets');
assert(hasLazy, 'Asset manifest has lazy on-demand assets');

// Helper query function tests
const locoDef = fn_getAssetDefinition('loco_titan4400');
assert(locoDef && locoDef.name.includes('Titan-4400'), 'fn_getAssetDefinition resolves valid asset');
const nullDef = fn_getAssetDefinition('non_existent_asset_id');
assert(nullDef === null, 'fn_getAssetDefinition returns null for unknown ID');

const mountainAssets = fn_getAssetsByCategory('environment/mountains');
assert(mountainAssets.length >= 3, `fn_getAssetsByCategory returns category items (found ${mountainAssets.length})`);

const eagerAssets = fn_getEagerAssets();
const lazyAssets = fn_getLazyAssets();
assert(eagerAssets.length > 0 && lazyAssets.length > 0, `Eager assets: ${eagerAssets.length}, Lazy assets: ${lazyAssets.length}`);
assert(eagerAssets.length + lazyAssets.length === arr_ASSET_MANIFEST.length, 'Eager + Lazy count equals total manifest entries');

console.log('\n=== TEST 3: WEBP AND PNG DUAL-FORMAT NEGOTIATION AND BINARY INTEGRITY ===');
// Check mountain/environment backgrounds prefer WebP
const mountainWebp = mountainAssets.find((a) => a.src.endsWith('.webp'));
assert(mountainWebp !== undefined, 'Photographic/illustrated mountain backgrounds prefer WebP');
assert(mountainWebp && mountainWebp.fallback && mountainWebp.fallback.endsWith('.png'), 'WebP mountain asset specifies fallback PNG');

// Test format resolution logic
const resolvedWebp = getPreferredFormatUrl('/test/bg.webp', '/test/bg.png');
assert(resolvedWebp === '/test/bg.webp' || resolvedWebp === '/test/bg.png', 'Format negotiation returns valid URL');

// Verify binary file headers on disk
const samplePngPath = path.join(projectRoot, 'public/assets/trains/locomotives/titan4400.png');
const sampleWebpPath = path.join(projectRoot, 'public/assets/environment/mountains/mountain_near.webp');

assert(fs.existsSync(samplePngPath), 'Sample PNG locomotive file exists on disk');
const pngBuffer = fs.readFileSync(samplePngPath);
// PNG Magic Header: 0x89 0x50 0x4E 0x47 (\x89PNG)
const isRealPng = pngBuffer[0] === 0x89 && pngBuffer[1] === 0x50 && pngBuffer[2] === 0x4e && pngBuffer[3] === 0x47;
assert(isRealPng, 'PNG file contains genuine 8-byte PNG binary signature');

assert(fs.existsSync(sampleWebpPath), 'Sample WebP mountain file exists on disk');
const webpBuffer = fs.readFileSync(sampleWebpPath);
// WebP Magic Header: 'RIFF' .... 'WEBP'
const isRealWebp = webpBuffer.toString('ascii', 0, 4) === 'RIFF' && webpBuffer.toString('ascii', 8, 12) === 'WEBP';
assert(isRealWebp, 'WebP file contains genuine RIFF/WEBP binary signature');

console.log('\n=== TEST 4: SVG FOR SCALABLE UI ICONS ===');
const iconAssets = fn_getAssetsByCategory('ui/icons');
assert(iconAssets.length >= 8, `Found ${iconAssets.length} UI icon definitions in manifest`);

let allSvg = true;
for (const icon of iconAssets) {
  if (icon.type !== 'svg' || !icon.src.endsWith('.svg')) {
    allSvg = false;
    break;
  }
  const diskPath = path.join(projectRoot, 'public', icon.src);
  const content = fs.readFileSync(diskPath, 'utf8');
  if (!content.includes('<svg') || !content.includes('viewBox')) {
    allSvg = false;
    break;
  }
}
assert(allSvg, 'All UI icons use scalable SVG format with valid SVG root and viewBox');

console.log('\n=== TEST 5: ZERO LARGE BASE64 EMBEDDED ASSETS IN JAVASCRIPT ===');
function scanDirForBase64(dir, maxAllowedBytes = 1000) {
  let violates = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      violates = violates.concat(scanDirForBase64(full, maxAllowedBytes));
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      const content = fs.readFileSync(full, 'utf8');
      const regex = /data:image\/[a-zA-Z0-9+]+;base64,([A-Za-z0-9+/=]{100,})/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        // Exempt 1x1 test probe in WebPSupport.js (30 chars)
        if (match[1].length > maxAllowedBytes) {
          violates.push({ file: full, length: match[1].length });
        }
      }
    }
  }
  return violates;
}

const base64Violations = scanDirForBase64(path.join(projectRoot, 'src'));
assert(base64Violations.length === 0, `No huge embedded base64 assets in src/ (violations: ${base64Violations.length})`);

const distAssetsDir = path.join(projectRoot, 'dist/assets');
if (fs.existsSync(distAssetsDir)) {
  const distViolations = scanDirForBase64(distAssetsDir, 2500);
  assert(distViolations.length === 0, 'No huge base64 assets embedded in production JS bundles');
}

console.log('\n=== TEST 6: ASSET LOADER AND ASSET MANAGER EXECUTION AND FALLBACKS ===');
const mgr = new AssetManager();

// Test eager loading
const eagerCount = await mgr.preloadEager();
assert(eagerCount > 0, `AssetManager.preloadEager loaded ${eagerCount} eager assets`);
assert(mgr.isEagerLoaded === true, 'mgr.isEagerLoaded flag set to true');

// Test lazy loading an on-demand asset
const lazyDef = lazyAssets[0];
assert(!mgr.isLoaded(lazyDef.id), `Lazy asset ${lazyDef.id} is not loaded initially`);
const loadedLazy = await mgr.loadAsset(lazyDef.id);
assert(loadedLazy !== null && loadedLazy !== undefined, `Lazy loaded asset ${lazyDef.id} resolved successfully`);
assert(mgr.isLoaded(lazyDef.id), `mgr.isLoaded(${lazyDef.id}) returns true after loadAsset`);

// Test category loading
const coachAssets = await mgr.loadCategory('trains/coaches');
assert(coachAssets.length >= 2, `mgr.loadCategory loaded ${coachAssets.length} coach assets`);

// Test fail-safe retrieval & missing asset fallback
const missingId = 'completely_missing_asset_12345';
const fallbackSync = mgr.get(missingId);
assert(fallbackSync !== null && fallbackSync.isFallback === true, 'mgr.get(unknownId) returns instant procedural fallback');
assert(typeof fallbackSync.width === 'number' && typeof fallbackSync.height === 'number', 'Fallback asset has numeric width and height');

// Test progress tracking
const progress = mgr.getProgress();
assert(progress.loaded > 0 && progress.total === arr_ASSET_MANIFEST.length, `mgr.getProgress() returns ${progress.loaded}/${progress.total} (${Math.round(progress.fraction * 100)}%)`);

// Test deduplication
const promiseA = mgr.loadAsset('loco_wdg4');
const promiseB = mgr.loadAsset('loco_wdg4');
assert(promiseA === promiseB, 'Concurrent loadAsset calls for the same ID are deduplicated to the same Promise');

console.log('\n========================================');
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================');

if (failed > 0) {
  process.exit(1);
}
