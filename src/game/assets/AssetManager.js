/**
 * AssetManager.js
 * Master asset manager coordinating manifest registration, lazy loading queues,
 * in-memory caching, category preloading, progress reporting, and fail-safe retrieval.
 */

import { arr_ASSET_MANIFEST, obj_ASSET_MAP, fn_getAssetsByCategory, fn_getEagerAssets } from './AssetManifest.js';
import { obj_ASSET_LOADER } from './AssetLoader.js';

export class AssetManager {
  /**
   * Initializes registries, caches, and queue states.
   */
  constructor() {
    this.cache = new Map();
    this.inFlight = new Map();
    this.failed = new Set();
    this.isEagerLoaded = false;
    this.loadedCount = 0;
    this.totalCount = arr_ASSET_MANIFEST.length;
  }

  /**
   * Preloads all eager core assets (UI icons, starter locomotives, default tracks).
   * 
   * @param {function} [onProgress] - Progress callback: (loaded, total, item) => void
   * @returns {Promise<number>} Number of loaded eager assets
   */
  async preloadEager(onProgress = null) {
    const arr_eager = fn_getEagerAssets();
    let count = 0;

    for (const item of arr_eager) {
      try {
        await this.loadAsset(item.id);
        count++;
        if (onProgress) {
          onProgress(count, arr_eager.length, item);
        }
      } catch (err) {
        console.warn(`[AssetManager] Failed eager asset: ${item.id}`, err);
      }
    }

    this.isEagerLoaded = true;
    return count;
  }

  /**
   * Loads a single asset by its ID lazily on demand.
   * Deduplicates concurrent requests through in-flight Promise caching.
   * 
   * @param {string} assetId
   * @returns {Promise<any>}
   */
  loadAsset(assetId) {
    // 1. Return from cache immediately if already resolved
    if (this.cache.has(assetId)) {
      return Promise.resolve(this.cache.get(assetId));
    }

    // 2. Return in-flight promise to avoid duplicate concurrent network fetches
    if (this.inFlight.has(assetId)) {
      return this.inFlight.get(assetId);
    }

    const def = obj_ASSET_MAP.get(assetId);
    if (!def) {
      console.warn(`[AssetManager] Asset ID not found in manifest: ${assetId}`);
      const fallback = obj_ASSET_LOADER.generateProceduralFallback(assetId);
      this.cache.set(assetId, fallback);
      return Promise.resolve(fallback);
    }

    const promise = (async () => {
      try {
        let loadedAsset;
        if (def.type === 'svg') {
          loadedAsset = await obj_ASSET_LOADER.loadSvg(def);
        } else if (def.type === 'image') {
          loadedAsset = await obj_ASSET_LOADER.loadImage(def);
        } else if (def.type === 'data') {
          // JSON or manifest data
          if (typeof fetch !== 'undefined') {
            const resp = await fetch(def.src);
            loadedAsset = await resp.json();
          } else {
            loadedAsset = {};
          }
        } else {
          loadedAsset = obj_ASSET_LOADER.generateProceduralFallback(def.id);
        }

        this.cache.set(assetId, loadedAsset);
        this.loadedCount = this.cache.size;
        return loadedAsset;
      } catch (err) {
        this.failed.add(assetId);
        const fallback = obj_ASSET_LOADER.generateProceduralFallback(assetId, 64, 64, def.category);
        this.cache.set(assetId, fallback);
        return fallback;
      } finally {
        this.inFlight.delete(assetId);
      }
    })();

    this.inFlight.set(assetId, promise);
    return promise;
  }

  /**
   * Lazy-loads an entire category of assets on demand (e.g. 'environment/mountains').
   * 
   * @param {string} category
   * @param {function} [onProgress]
   * @returns {Promise<Array<any>>}
   */
  async loadCategory(category, onProgress = null) {
    const arr_items = fn_getAssetsByCategory(category);
    let loadedInCat = 0;

    const arr_results = await Promise.all(
      arr_items.map(async (item) => {
        const res = await this.loadAsset(item.id);
        loadedInCat++;
        if (onProgress) {
          onProgress(loadedInCat, arr_items.length, item);
        }
        return res;
      })
    );

    return arr_results;
  }

  /**
   * Synchronous safe getter.
   * Returns cached asset if loaded; otherwise returns a guaranteed procedural fallback immediately
   * and triggers lazy loading in the background.
   * 
   * @param {string} assetId
   * @returns {any}
   */
  get(assetId) {
    if (this.cache.has(assetId)) {
      return this.cache.get(assetId);
    }

    // Trigger lazy background load without blocking caller
    this.loadAsset(assetId).catch(() => {});

    // Return instant fallback so renderer never stalls or throws
    return obj_ASSET_LOADER.generateProceduralFallback(assetId);
  }

  /**
   * Checks if an asset is fully loaded and cached in memory.
   * 
   * @param {string} assetId
   * @returns {boolean}
   */
  isLoaded(assetId) {
    return this.cache.has(assetId);
  }

  /**
   * Returns current overall loading progress.
   * 
   * @returns {{loaded: number, total: number, fraction: number}}
   */
  getProgress() {
    const loaded = this.cache.size;
    const total = this.totalCount;
    return {
      loaded,
      total,
      fraction: total > 0 ? loaded / total : 1.0,
    };
  }

  /**
   * Clears all cached assets from memory.
   */
  clear() {
    this.cache.clear();
    this.inFlight.clear();
    this.failed.clear();
  }
}

export const obj_ASSET_MANAGER = new AssetManager();
