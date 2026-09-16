/**
 * WebPSupport.js
 * Detects browser WebP decode support asynchronously and provides format negotiation helpers.
 */

let bool_isWebPSupported = null;
let promise_webpCheck = null;

/**
 * Checks if the current browser environment supports WebP images.
 * Uses a lightweight canvas probe with fallback to 1x1 test.
 * 
 * @returns {Promise<boolean>}
 */
export async function checkWebPSupport() {
  if (bool_isWebPSupported !== null) {
    return bool_isWebPSupported;
  }

  if (promise_webpCheck) {
    return promise_webpCheck;
  }

  promise_webpCheck = new Promise((resolve) => {
    // If not in a browser environment (e.g. Node tests), default to true
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      bool_isWebPSupported = true;
      resolve(true);
      return;
    }

    try {
      const elem = document.createElement('canvas');
      if (elem.getContext && elem.getContext('2d')) {
        // Direct canvas toDataURL check (instant)
        const isSupported = elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        bool_isWebPSupported = isSupported;
        resolve(isSupported);
        return;
      }
    } catch {
      // Fallback to Image probe
    }

    // Image probe fallback
    const img = new Image();
    img.onload = () => {
      bool_isWebPSupported = img.width > 0 && img.height > 0;
      resolve(bool_isWebPSupported);
    };
    img.onerror = () => {
      bool_isWebPSupported = false;
      resolve(false);
    };
    // 1x1 lossless WebP base64 probe
    img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });

  return promise_webpCheck;
}

/**
 * Synchronous getter for current WebP support status (defaults to true if probe pending).
 * 
 * @returns {boolean}
 */
export function isWebPSupported() {
  return bool_isWebPSupported ?? true;
}

/**
 * Resolves the preferred URL between primary (WebP) and fallback (PNG).
 * 
 * @param {string} primaryWebp
 * @param {string} fallbackPng
 * @returns {string}
 */
export function getPreferredFormatUrl(primaryWebp, fallbackPng) {
  if (!fallbackPng) return primaryWebp;
  if (isWebPSupported()) return primaryWebp;
  return fallbackPng;
}
