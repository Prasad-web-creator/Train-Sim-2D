/**
 * CameraControl.jsx
 * Large touch-friendly camera perspective controller cycling through zoom levels
 * (1.0x Normal, 0.8x Wide Train Overview, 1.25x Close-up Cab) and views.
 * Supports touchstart, pointerdown, prevents page scroll, and triggers haptic tap.
 */

import React from 'react';
import { useGameState } from '../../../hooks/useGameLoop.js';
import { obj_TRAIN_ACTIONS } from '../../../game/actions/TrainActions.js';

/**
 * Renders the touch-friendly camera perspective selector button.
 */
export function CameraControl() {
  const gameState = useGameState();
  const tmp_zoom = gameState.settings.cameraZoom || 1.0;

  /**
   * Cycles to the next camera zoom preset.
   */
  function handleCycleCamera(e) {
    if (e && e.cancelable && e.type.startsWith('touch')) {
      e.preventDefault();
    }
    obj_TRAIN_ACTIONS.cycleCamera();
  }

  // Label for current zoom preset (Gameplay: 1.0x, Cinematic: 1.15x, Overview: 0.85x)
  let tmp_currentLabel = '1.0x';
  if (Math.abs(tmp_zoom - 0.85) < 0.05) tmp_currentLabel = 'OVER';
  if (Math.abs(tmp_zoom - 1.15) < 0.05) tmp_currentLabel = 'CINE';

  return (
    <button
      type="button"
      className="tactile-camera-btn"
      onClick={handleCycleCamera}
      onTouchStart={handleCycleCamera}
      title="Cycle Camera Zoom & Perspective"
      aria-label="Cycle Camera View"
    >
      <div className="tactile-camera-btn__casing">
        <span className="tactile-camera-btn__icon">🎥</span>
        <span className="tactile-camera-btn__tag">{tmp_currentLabel}</span>
      </div>
    </button>
  );
}

export default CameraControl;
