/**
 * useAsset.js
 * React hook to lazily load and subscribe to game assets with loading states and graceful fallbacks.
 */

import { useState, useEffect } from 'react';
import { obj_ASSET_MANAGER } from '../game/assets/AssetManager.js';

/**
 * Custom React hook to load and return an asset by its manifest ID.
 * 
 * @param {string} assetId - Unique manifest asset ID
 * @returns {{ asset: any, isLoading: boolean, error: Error|null }}
 */
export function useAsset(assetId) {
  const [asset, setAsset] = useState(() => obj_ASSET_MANAGER.get(assetId));
  const [isLoading, setIsLoading] = useState(!obj_ASSET_MANAGER.isLoaded(assetId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!assetId) return;

    if (obj_ASSET_MANAGER.isLoaded(assetId)) {
      setAsset(obj_ASSET_MANAGER.get(assetId));
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    obj_ASSET_MANAGER.loadAsset(assetId)
      .then((loaded) => {
        if (isMounted) {
          setAsset(loaded);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setAsset(obj_ASSET_MANAGER.get(assetId)); // Procedural fallback
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [assetId]);

  return { asset, isLoading, error };
}

export default useAsset;
