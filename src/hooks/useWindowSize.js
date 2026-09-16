/**
 * useWindowSize.js
 * React hook tracking browser window dimensions and device pixel ratio.
 */

import { useState, useEffect } from 'react';

/**
 * Hook providing live window width and height.
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    /**
     * Updates recorded dimensions on window resize event.
     */
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
