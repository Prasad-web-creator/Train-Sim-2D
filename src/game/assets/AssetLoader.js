/**
 * AssetLoader.js
 * Robust image, SVG, and audio loader with WebP/PNG format negotiation,
 * retry fallback logic, and automatic procedural canvas fallback generation.
 */

import { isWebPSupported, checkWebPSupport } from './WebPSupport.js';

export class AssetLoader {
  /**
   * Initializes asset loader and kicks off asynchronous WebP capability probe.
   */
  constructor() {
    this.proceduralCache = new Map();
    // Warm up capability check
    checkWebPSupport().catch(() => {});
  }

  /**
   * Generates a guaranteed procedural fallback Canvas image if an image asset fails to load.
   * Ensures game loops and draw calls never throw or crash.
   * 
   * @param {string} assetId
   * @param {number} [width=64]
   * @param {number} [height=64]
   * @param {string} [category='']
   * @returns {HTMLImageElement|Object}
   */
  generateProceduralFallback(assetId, width = 64, height = 64, category = '') {
    if (this.proceduralCache.has(assetId)) {
      return this.proceduralCache.get(assetId);
    }

    if (typeof document === 'undefined') {
      const mockImg = {
        src: `data:image/mock;${assetId}`,
        width,
        height,
        complete: true,
        isFallback: true,
      };
      this.proceduralCache.set(assetId, mockImg);
      return mockImg;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(32, width);
    canvas.height = Math.max(32, height);
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // 1. Dark industrial background with crosshatch grid
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. High-visibility warning border
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

      // 3. Diagonal corner warning slash
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(8, 0);
      ctx.moveTo(canvas.width - 8, canvas.height);
      ctx.lineTo(canvas.width, canvas.height - 8);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 4. Asset label text
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 9px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const shortName = assetId.replace(/^(loco_|coach_|tree_|station_|mountain_|railway_|icon_|effect_)/, '');
      ctx.fillText(shortName.slice(0, 8), canvas.width / 2, canvas.height / 2);
    }

    const img = new Image();
    img.src = canvas.toDataURL('image/png');
    img.isFallback = true;
    this.proceduralCache.set(assetId, img);
    return img;
  }

  /**
   * Loads an image asset with automatic format negotiation, retry fallback, and procedural recovery.
   * 
   * @param {Object} assetDef - Asset definition from manifest
   * @returns {Promise<HTMLImageElement>}
   */
  async loadImage(assetDef) {
    const { id, src, fallback, category } = assetDef;
    const isWebP = isWebPSupported();
    const primaryUrl = isWebP ? src : (fallback || src);
    const secondaryUrl = primaryUrl === src ? fallback : src;

    // Node environment mock support
    if (typeof Image === 'undefined') {
      return this.generateProceduralFallback(id, 64, 64, category);
    }

    try {
      // 1. Attempt primary URL
      return await this.fn_fetchImage(primaryUrl, 7000);
    } catch (primaryErr) {
      console.warn(`[AssetLoader] Primary load failed for "${id}" (${primaryUrl}):`, primaryErr.message);

      // 2. Attempt fallback secondary URL if available
      if (secondaryUrl && secondaryUrl !== primaryUrl) {
        try {
          return await this.fn_fetchImage(secondaryUrl, 7000);
        } catch (secondaryErr) {
          console.warn(`[AssetLoader] Secondary load failed for "${id}" (${secondaryUrl}):`, secondaryErr.message);
        }
      }

      // 3. Graceful procedural fallback recovery
      console.info(`[AssetLoader] Using procedural fallback for asset "${id}"`);
      return this.generateProceduralFallback(id, 64, 64, category);
    }
  }

  /**
   * Loads a scalable SVG vector asset.
   * 
   * @param {Object} assetDef
   * @returns {Promise<HTMLImageElement|string>}
   */
  async loadSvg(assetDef) {
    const { id, src, fallback } = assetDef;

    if (typeof Image === 'undefined') {
      return this.generateProceduralFallback(id, 24, 24, 'ui/icons');
    }

    try {
      return await this.fn_fetchImage(src, 6000);
    } catch {
      if (fallback) {
        try {
          return await this.fn_fetchImage(fallback, 6000);
        } catch {}
      }
      return this.generateProceduralFallback(id, 24, 24, 'ui/icons');
    }
  }

  /**
   * Helper that wraps HTMLImageElement loading in a Promise with timeout.
   */
  fn_fetchImage(url, timeoutMs = 7000) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      let timer = null;

      function cleanup() {
        if (timer) clearTimeout(timer);
        img.onload = null;
        img.onerror = null;
      }

      img.onload = () => {
        cleanup();
        resolve(img);
      };

      img.onerror = (e) => {
        cleanup();
        reject(new Error(`Failed to load image from ${url}`));
      };

      timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Timed out loading image from ${url} (${timeoutMs}ms)`));
      }, timeoutMs);

      img.src = url;
      if (img.complete && img.naturalWidth > 0) {
        cleanup();
        resolve(img);
      }
    });
  }
}

export const obj_ASSET_LOADER = new AssetLoader();
