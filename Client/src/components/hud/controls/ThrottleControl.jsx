/**
 * ThrottleControl.jsx
 * Large touch-friendly locomotive throttle lever supporting drag, press, and release.
 * Implements dual touch (touchstart, touchmove, touchend, touchcancel) and pointer
 * (pointerdown, pointermove, pointerup, pointercancel) events with non-passive preventDefault
 * to completely eliminate accidental mobile browser page scrolling, plus haptic feedback.
 */

import React, { useRef, useState, useEffect } from 'react';
import { obj_SOUND_MANAGER } from '../../../game/audio/SoundManager.js';
import { obj_HAPTIC } from '../../../utils/HapticFeedback.js';

/**
 * Renders the tactile locomotive throttle controller lever.
 * 
 * @param {Object} props
 * @param {number} [props.notch=0] - Current throttle notch (0 to 8)
 * @param {function} props.onChange - Callback triggered on notch change: (notch) => void
 * @param {boolean} [props.disabled=false] - Whether control is disabled
 */
export function ThrottleControl({
  notch = 0,
  onChange,
  disabled = false,
}) {
  const slotRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastNotchRef = useRef(notch);

  const arr_notches = [
    { val: 0, label: 'IDLE' },
    { val: 1, label: '1' },
    { val: 2, label: '2' },
    { val: 3, label: '3' },
    { val: 4, label: '4' },
    { val: 5, label: '5' },
    { val: 6, label: '6' },
    { val: 7, label: '7' },
    { val: 8, label: '8' },
  ];

  const tmp_currentNotch = Math.max(0, Math.min(8, Math.round(notch)));
  const tmp_percent = (tmp_currentNotch / 8) * 100;

  /**
   * Computes notch value from client Y coordinate along the vertical lever slot.
   */
  function fn_calcNotchFromClientY(clientY) {
    if (!slotRef.current) return tmp_currentNotch;
    const obj_rect = slotRef.current.getBoundingClientRect();
    const tmp_height = obj_rect.height;
    if (tmp_height <= 0) return 0;

    // Bottom is notch 0 (IDLE), Top is notch 8
    const tmp_distFromBottom = obj_rect.bottom - clientY;
    const tmp_ratio = Math.max(0, Math.min(1, tmp_distFromBottom / tmp_height));
    return Math.round(tmp_ratio * 8);
  }

  /**
   * Commits notch change and triggers haptic detent feedback.
   */
  function fn_commitNotch(newNotch) {
    if (disabled) return;
    const tmp_clamped = Math.max(0, Math.min(8, Math.round(newNotch)));
    if (tmp_clamped !== lastNotchRef.current) {
      lastNotchRef.current = tmp_clamped;
      obj_HAPTIC.notch();
    }
    if (tmp_clamped !== tmp_currentNotch) {
      obj_SOUND_MANAGER.init();
      if (onChange) onChange(tmp_clamped);
    }
  }

  /**
   * Begins pointer drag tracking.
   */
  function handlePointerDown(e) {
    if (disabled) return;
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    const tmp_newNotch = fn_calcNotchFromClientY(e.clientY);
    fn_commitNotch(tmp_newNotch);
  }

  /**
   * Updates notch position while dragging pointer.
   */
  function handlePointerMove(e) {
    if (!isDragging || disabled) return;
    const tmp_newNotch = fn_calcNotchFromClientY(e.clientY);
    fn_commitNotch(tmp_newNotch);
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
   * Direct touch event listeners with non-passive preventDefault to eliminate accidental page scrolling.
   */
  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;

    /**
     * Prevents page scroll on touch start and sets notch.
     */
    function onTouchStart(e) {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);
      if (e.touches && e.touches[0]) {
        const tmp_notch = fn_calcNotchFromClientY(e.touches[0].clientY);
        fn_commitNotch(tmp_notch);
      }
    }

    /**
     * Prevents page scroll during drag.
     */
    function onTouchMove(e) {
      if (disabled) return;
      e.preventDefault();
      if (e.touches && e.touches[0]) {
        const tmp_notch = fn_calcNotchFromClientY(e.touches[0].clientY);
        fn_commitNotch(tmp_notch);
      }
    }

    /**
     * Touch release handler.
     */
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
  }, [disabled, tmp_currentNotch]);

  /**
   * Direct click on a specific notch detent label.
   */
  function handleNotchClick(targetNotch, e) {
    e.stopPropagation();
    if (disabled) return;
    obj_HAPTIC.light();
    fn_commitNotch(targetNotch);
  }

  const tmp_throttleLabel = tmp_currentNotch === 0 ? 'IDLE • 0%' : `INT - ${Math.round(tmp_percent)}%`;

  return (
    <div className="tactile-lever tactile-lever--red tactile-lever--throttle-ref" aria-label={`Locomotive Throttle: ${tmp_throttleLabel}`}>
      <div className="tactile-lever__header-box">
        <span className="tactile-lever__header">THROTTLE</span>
        <span className="tactile-lever__badge tactile-lever__badge--throttle" title={`Throttle: ${tmp_throttleLabel}`}>
          {tmp_throttleLabel}
        </span>
      </div>

      {/* Heavy Industrial Lever Slot with Non-Passive Anti-Scroll Touch Handling */}
      <div
        ref={slotRef}
        className="tactile-lever__slot tactile-lever__slot--throttle"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Detent Notches List: clean tick ridges without text collision */}
        <div className="tactile-lever__notches">
          {arr_notches.map((obj_item) => {
            const tmp_isActive = obj_item.val === tmp_currentNotch;
            return (
              <div
                key={`notch-${obj_item.val}`}
                className={`tactile-lever__notch ${tmp_isActive ? 'tactile-lever__notch--active' : ''}`}
                onClick={(e) => handleNotchClick(obj_item.val, e)}
              >
                <span className="tactile-lever__notch-tick" />
              </div>
            );
          })}
        </div>

        {/* Right-hand Percentage Scale Markings (100%, 50%, 0%) */}
        <div className="tactile-lever__percent-scale">
          <span className="tactile-lever__percent-mark" style={{ top: '6px' }}>100%</span>
          <span className="tactile-lever__percent-mark" style={{ top: '50%', transform: 'translateY(-50%)' }}>50%</span>
          <span className="tactile-lever__percent-mark" style={{ bottom: '6px' }}>0%</span>
        </div>

        {/* Moving Lever Handle with Red Grip */}
        <div
          className={`tactile-lever__handle ${isDragging ? 'tactile-lever__handle--dragging' : ''}`}
          style={{ bottom: `calc((${tmp_percent} / 100) * (100% - 44px))` }}
        >
          <div className="tactile-lever__knob tactile-lever__knob--red">
            <div className="tactile-lever__knob-texture" />
          </div>
        </div>
      </div>

      {/* Footer Label: NOTCH 0-8 */}
      <div className="tactile-lever__footer-tag">NOTCH 0-8</div>
    </div>
  );
}

export default ThrottleControl;
