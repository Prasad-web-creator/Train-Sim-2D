/**
 * HeadlightButton.jsx
 * Large touch-friendly illuminated toggle rocker switch for locomotive main headlights.
 * Supports touchstart, pointerdown, prevents page scrolling, and triggers haptic feedback.
 */

import React from 'react';
import { obj_TRAIN_ACTIONS } from '../../../game/actions/TrainActions.js';

/**
 * Renders the locomotive headlight illuminated rocker switch.
 * 
 * @param {Object} props
 * @param {boolean} [props.isOn=true] - Whether headlights are active
 * @param {function} [props.onToggle] - Optional callback () => void
 */
export function HeadlightButton({
  isOn = true,
  onToggle,
}) {
  /**
   * Toggles headlight state, triggers haptic click, and plays sound.
   */
  function handleTrigger(e) {
    if (e && e.cancelable && e.type.startsWith('touch')) {
      e.preventDefault();
    }
    obj_TRAIN_ACTIONS.toggleHeadlights();
    if (onToggle) onToggle();
  }

  return (
    <button
      type="button"
      className={`tactile-rocker-switch ${isOn ? 'tactile-rocker-switch--on' : ''}`}
      onClick={handleTrigger}
      onTouchStart={handleTrigger}
      title="Toggle Locomotive Headlights (Key L)"
      aria-label="Toggle Headlights"
      aria-pressed={isOn}
    >
      <div className="tactile-rocker-switch__casing">
        <span className="tactile-rocker-switch__led" />
        <span className="tactile-rocker-switch__icon">💡</span>
        <span className="tactile-rocker-switch__label">LIGHTS</span>
      </div>
    </button>
  );
}

export default HeadlightButton;
