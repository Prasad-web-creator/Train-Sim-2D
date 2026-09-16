/**
 * HornButton.jsx
 * Large touch-friendly locomotive air horn button.
 * Supports touchstart, touchend, touchcancel, pointerdown, pointerup,
 * prevents accidental context menu / callout, and triggers haptic vibration.
 */

import React, { useState } from 'react';
import { obj_TRAIN_ACTIONS } from '../../../game/actions/TrainActions.js';

/**
 * Renders the locomotive horn push button.
 * 
 * @param {Object} props
 * @param {boolean} [props.isActive=false] - Whether horn is actively sounding
 * @param {function} [props.onHornChange] - Optional callback (isActive) => void
 */
export function HornButton({
  isActive = false,
  onHornChange,
}) {
  const [isPressed, setIsPressed] = useState(false);

  const tmp_active = isPressed || isActive;

  /**
   * Sounds the locomotive air horn on press.
   */
  function handlePressDown(e) {
    if (e && e.cancelable) e.preventDefault();
    if (isPressed) return;
    setIsPressed(true);
    obj_TRAIN_ACTIONS.setHorn(true);
    if (onHornChange) onHornChange(true);
  }

  /**
   * Silences the air horn upon release.
   */
  function handlePressUp(e) {
    if (e && e.cancelable) e.preventDefault();
    if (!isPressed) return;
    setIsPressed(false);
    obj_TRAIN_ACTIONS.setHorn(false);
    if (onHornChange) onHornChange(false);
  }

  return (
    <button
      type="button"
      className={`tactile-push-btn tactile-push-btn--horn ${tmp_active ? 'tactile-push-btn--pressed' : ''}`}
      onMouseDown={handlePressDown}
      onMouseUp={handlePressUp}
      onMouseLeave={handlePressUp}
      onTouchStart={handlePressDown}
      onTouchEnd={handlePressUp}
      onTouchCancel={handlePressUp}
      onPointerDown={handlePressDown}
      onPointerUp={handlePressUp}
      onPointerCancel={handlePressUp}
      onContextMenu={(e) => e.preventDefault()}
      title="Sound Air Horn (Key H)"
      aria-label="Sound Air Horn"
    >
      <div className="tactile-push-btn__collar">
        <div className="tactile-push-btn__cap">
          <span className="tactile-push-btn__icon">📢</span>
          <span className="tactile-push-btn__label">HORN</span>
        </div>
      </div>
    </button>
  );
}

export default HornButton;
