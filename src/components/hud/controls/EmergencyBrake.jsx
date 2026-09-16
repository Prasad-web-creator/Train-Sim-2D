/**
 * EmergencyBrake.jsx
 * Large red mushroom-style emergency stop push button with high-visibility yellow collar.
 * Supports touchstart, pointerdown, click, anti-scroll preventDefault, and heavy haptic feedback.
 */

import React, { useState } from 'react';
import { obj_TRAIN_ACTIONS } from '../../../game/actions/TrainActions.js';

/**
 * Renders the locomotive emergency brake mushroom slam button.
 * 
 * @param {Object} props
 * @param {boolean} [props.isEngaged=false] - Whether emergency brake is actively engaged
 * @param {function} [props.onTrigger] - Optional callback () => void
 */
export function EmergencyBrake({
  isEngaged = false,
  onTrigger,
}) {
  const [isSlammed, setIsSlammed] = useState(false);

  const tmp_active = isSlammed || isEngaged;

  /**
   * Applies immediate maximum emergency braking effort and cuts traction throttle.
   */
  function handleEmergencySlam(e) {
    if (e && e.cancelable && e.type.startsWith('touch')) {
      e.preventDefault();
    }
    setIsSlammed(true);
    obj_TRAIN_ACTIONS.triggerEmergencyBrake();

    if (onTrigger) onTrigger();

    // Auto release visual depression state after brief mechanical shock
    setTimeout(() => {
      setIsSlammed(false);
    }, 1500);
  }

  return (
    <button
      type="button"
      className={`emergency-brake-btn ${tmp_active ? 'emergency-brake-btn--active' : ''}`}
      onClick={handleEmergencySlam}
      onTouchStart={handleEmergencySlam}
      title="EMERGENCY BRAKE (Spacebar) - Cut traction and apply full stopping force"
      aria-label="Emergency Brake"
    >
      {/* High-visibility yellow safety ring collar */}
      <div className="emergency-brake-btn__collar">
        {/* Large red mushroom plunger */}
        <div className="emergency-brake-btn__mushroom">
          <span>EMERG</span>
        </div>
      </div>
      <span className="emergency-brake-btn__label">E-BRAKE</span>
    </button>
  );
}

export default EmergencyBrake;
