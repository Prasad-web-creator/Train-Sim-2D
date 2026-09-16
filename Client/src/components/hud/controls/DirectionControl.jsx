/**
 * DirectionControl.jsx
 * Large touch-friendly 3-position locomotive reverser lever (FORWARD, NEUTRAL, REVERSE).
 * Supports drag, tap-to-set, touchstart/move/end, pointerdown/move/up, anti-scroll preventDefault,
 * and haptic feedback.
 */

import React, { useRef, useState, useEffect } from 'react';
import { cons_REVERSER_MODES } from '../../../constants/GameConstants.js';
import { obj_SOUND_MANAGER } from '../../../game/audio/SoundManager.js';
import { obj_HAPTIC } from '../../../utils/HapticFeedback.js';

/**
 * Renders the locomotive reverser directional selector lever.
 * 
 * @param {Object} props
 * @param {number} [props.direction=1] - Current reverser mode (-1: Rev, 0: Neut, 1: Fwd)
 * @param {number} [props.speedKmh=0] - Current train speed in km/h for safety lockout
 * @param {function} props.onChange - Callback triggered on direction change: (direction) => void
 */
export function DirectionControl({
  direction = cons_REVERSER_MODES.FORWARD,
  speedKmh = 0,
  onChange,
}) {
  const slotRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const arr_positions = [
    { val: cons_REVERSER_MODES.REVERSE, label: 'REV', color: '#ef4444' },
    { val: cons_REVERSER_MODES.NEUTRAL, label: 'N', color: '#94a3b8' },
    { val: cons_REVERSER_MODES.FORWARD, label: 'FWD', color: '#22c55e' },
  ];

  // Map -1 to 0%, 0 to 50%, 1 to 100%
  const tmp_percent = ((direction + 1) / 2) * 100;
  const tmp_isLocked = Math.abs(speedKmh) >= 3.0;

  /**
   * Computes reverser position from client Y coordinate along the vertical slot.
   */
  function fn_calcDirectionFromClientY(clientY) {
    if (!slotRef.current) return direction;
    const obj_rect = slotRef.current.getBoundingClientRect();
    const tmp_distFromBottom = obj_rect.bottom - clientY;
    const tmp_ratio = Math.max(0, Math.min(1, tmp_distFromBottom / obj_rect.height));

    if (tmp_ratio < 0.33) return cons_REVERSER_MODES.REVERSE;
    if (tmp_ratio < 0.66) return cons_REVERSER_MODES.NEUTRAL;
    return cons_REVERSER_MODES.FORWARD;
  }

  /**
   * Attempts to set a new direction, respecting moving train safety interlock.
   */
  function fn_attemptChange(newDirection) {
    if (tmp_isLocked) {
      obj_HAPTIC.light();
      return;
    }
    if (newDirection !== direction) {
      obj_HAPTIC.medium();
      obj_SOUND_MANAGER.init();
      if (onChange) onChange(newDirection);
    }
  }

  /**
   * Begins pointer drag interaction.
   */
  function handlePointerDown(e) {
    if (tmp_isLocked) return;
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    const tmp_newDir = fn_calcDirectionFromClientY(e.clientY);
    fn_attemptChange(tmp_newDir);
  }

  /**
   * Updates direction while dragging pointer.
   */
  function handlePointerMove(e) {
    if (!isDragging || tmp_isLocked) return;
    const tmp_newDir = fn_calcDirectionFromClientY(e.clientY);
    fn_attemptChange(tmp_newDir);
  }

  /**
   * Releases pointer drag tracking.
   */
  function handlePointerUp(e) {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  }

  /**
   * Non-passive touch listeners to eliminate page scroll while manipulating reverser on mobile.
   */
  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;

    function onTouchStart(e) {
      if (tmp_isLocked) return;
      e.preventDefault();
      setIsDragging(true);
      if (e.touches && e.touches[0]) {
        const tmp_dir = fn_calcDirectionFromClientY(e.touches[0].clientY);
        fn_attemptChange(tmp_dir);
      }
    }

    function onTouchMove(e) {
      if (tmp_isLocked) return;
      e.preventDefault();
      if (e.touches && e.touches[0]) {
        const tmp_dir = fn_calcDirectionFromClientY(e.touches[0].clientY);
        fn_attemptChange(tmp_dir);
      }
    }

    function onTouchEnd(e) {
      e.preventDefault();
      setIsDragging(false);
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });
    el.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [tmp_isLocked, direction]);

  /**
   * Direct click on a specific position detent.
   */
  function handleDetentClick(targetDir, e) {
    e.stopPropagation();
    fn_attemptChange(targetDir);
  }

  let tmp_revText = 'FWD ▲';
  let tmp_revVariant = 'tactile-lever__badge--rev-fwd';
  if (direction === cons_REVERSER_MODES.REVERSE) {
    tmp_revText = 'REV ▼';
    tmp_revVariant = 'tactile-lever__badge--rev-rev';
  } else if (direction === cons_REVERSER_MODES.NEUTRAL) {
    tmp_revText = 'NEUT —';
    tmp_revVariant = 'tactile-lever__badge--rev-neut';
  }
  if (tmp_isLocked) {
    tmp_revVariant = `${tmp_revVariant} tactile-lever__badge--locked`;
  }

  return (
    <div
      className="tactile-lever tactile-lever--silver tactile-lever--reverser"
      aria-label={`Direction Reverser: ${tmp_revText}${tmp_isLocked ? ' (LOCKED)' : ''}`}
      title={tmp_isLocked ? 'Reverser locked while train is moving' : 'Reverser Direction (Q/E)'}
    >
      <div className="tactile-lever__header-box">
        <span className="tactile-lever__header">REVERSER</span>
        <span className={`tactile-lever__badge ${tmp_revVariant}`} title={tmp_isLocked ? 'Safety lockout active (> 3 km/h)' : `Reverser: ${tmp_revText}`}>
          {tmp_revText}{tmp_isLocked ? ' 🔒' : ''}
        </span>
      </div>

      {/* Industrial Reverser Slot with Non-Passive Anti-Scroll Touch Handling */}
      <div
        ref={slotRef}
        className="tactile-lever__slot tactile-lever__slot--reverser"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Detents List */}
        <div className="tactile-lever__notches tactile-lever__notches--reverser">
          {arr_positions.map((obj_item) => {
            const tmp_isActive = obj_item.val === direction;
            return (
              <div
                key={`rev-${obj_item.val}`}
                className={`tactile-lever__notch ${tmp_isActive ? 'tactile-lever__notch--active' : ''}`}
                onClick={(e) => handleDetentClick(obj_item.val, e)}
              >
                <span className="tactile-lever__notch-tick" style={{ backgroundColor: obj_item.color }} />
                <span className="tactile-lever__notch-label" style={{ color: obj_item.color }}>{obj_item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Moving Cast Charcoal Reverser Handle with Vertical Grip Ridge */}
        <div
          className={`tactile-lever__handle ${isDragging ? 'tactile-lever__handle--dragging' : ''}`}
          style={{ bottom: `calc((${tmp_percent} / 100) * (100% - 44px))` }}
        >
          <div className="tactile-lever__knob tactile-lever__knob--charcoal">
            <div className="tactile-lever__knob-texture tactile-lever__knob-texture--vertical" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DirectionControl;
