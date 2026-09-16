/**
 * FullscreenControl.jsx
 * Large tactile touch-friendly button allowing players to toggle
 * entire browser full screen gameplay mode.
 * Dynamically synchronizes state with browser Fullscreen API events,
 * provides responsive mobile touch targets (>= 44px), and supports
 * keyboard shortcut 'F'.
 */

import React, { useState, useEffect } from 'react';
import { obj_TRAIN_ACTIONS } from '../../../game/actions/TrainActions.js';
import { obj_HAPTIC } from '../../../utils/HapticFeedback.js';

/**
 * Checks whether the browser is currently in fullscreen display mode.
 * 
 * @returns {boolean}
 */
function getIsFullscreen() {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

/**
 * Renders the tactile fullscreen toggle button with dynamic expand/compress icons.
 */
export function FullscreenControl() {
  const [isFullscreen, setIsFullscreen] = useState(getIsFullscreen());

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(getIsFullscreen());
    }

    // Initial check
    handleFullscreenChange();

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  /**
   * Toggles browser fullscreen and triggers haptic tap.
   */
  function handleToggle(e) {
    if (e && e.cancelable && e.type.startsWith('touch')) {
      e.preventDefault();
    }
    obj_HAPTIC.light();
    obj_TRAIN_ACTIONS.toggleFullscreen();
  }

  return (
    <button
      type="button"
      className={`tactile-fullscreen-btn ${isFullscreen ? 'tactile-fullscreen-btn--active' : ''}`}
      onClick={handleToggle}
      onTouchStart={handleToggle}
      title={isFullscreen ? 'Exit Full Screen (Esc / F)' : 'Enter Full Screen (F)'}
      aria-label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
      aria-pressed={isFullscreen}
    >
      <div className="tactile-fullscreen-btn__casing">
        <span className="tactile-fullscreen-btn__icon" aria-hidden="true">
          {isFullscreen ? (
            /* Compress / Exit Fullscreen SVG Icon */
            <svg
              className="tactile-fullscreen-btn__svg"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Inward corner brackets */}
              <path d="M4 9h5V4" />
              <path d="M20 9h-5V4" />
              <path d="M4 15h5v5" />
              <path d="M20 15h-5v5" />
            </svg>
          ) : (
            /* Expand / Enter Fullscreen SVG Icon */
            <svg
              className="tactile-fullscreen-btn__svg"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Outward corner brackets */}
              <path d="M3 9V5a2 2 0 0 1 2-2h4" />
              <path d="M15 3h4a2 2 0 0 1 2 2v4" />
              <path d="M21 15v4a2 2 0 0 1-2 2h-4" />
              <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
            </svg>
          )}
        </span>
        <span className="tactile-fullscreen-btn__tag">
          {isFullscreen ? 'EXIT' : 'FULL'}
        </span>
      </div>
    </button>
  );
}

export default FullscreenControl;
