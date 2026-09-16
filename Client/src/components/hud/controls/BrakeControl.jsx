/**
 * BrakeControl.jsx
 * Large touch-friendly pneumatic train brake lever controller supporting drag, press, and release.
 * Implements dual touch (touchstart, touchmove, touchend, touchcancel) and pointer
 * (pointerdown, pointermove, pointerup, pointercancel) events with non-passive preventDefault
 * to completely eliminate accidental mobile browser page scrolling.
 */

import React, { useRef, useState, useEffect } from 'react';
import { obj_SOUND_MANAGER } from '../../../game/audio/SoundManager.js';
import { obj_HAPTIC } from '../../../utils/HapticFeedback.js';

/**
 * Renders the tactile train brake controller lever for mobile and desktop.
 * 
 * @param {Object} props
 * @param {number} [props.brakeRatio=0] - Current brake ratio (0.0 released to 1.0 emergency)
 * @param {function} props.onChange - Callback triggered on change: (ratio) => void
 * @param {boolean} [props.disabled=false] - Whether control is disabled
 */
export function BrakeControl({
  brakeRatio = 0,
  onChange,
  disabled = false,
}) {
  const slotRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastNotchRef = useRef(0);

  const arr_notches = [
    { ratio: 0.0, label: 'REL' },
    { ratio: 0.25, label: 'MIN' },
    { ratio: 0.50, label: 'SVC' },
    { ratio: 0.75, label: 'FULL' },
    { ratio: 1.0, label: 'EMG' },
  ];

  const tmp_clampedRatio = Math.max(0, Math.min(1, brakeRatio));
  const tmp_percent = tmp_clampedRatio * 100;

  /**
   * Computes brake ratio (0 to 1) from client Y coordinate along the vertical slot.
   */
  function fn_calcRatioFromClientY(clientY) {
    if (!slotRef.current) return tmp_clampedRatio;
    const obj_rect = slotRef.current.getBoundingClientRect();
    const tmp_height = obj_rect.height;
    if (tmp_height <= 0) return 0;

    // Bottom is 0 (released), Top is 1.0 (full/emergency brake)
    const tmp_distFromBottom = obj_rect.bottom - clientY;
    const tmp_rawRatio = Math.max(0, Math.min(1, tmp_distFromBottom / tmp_height));

    // Snap to nearest 5% for clean control feel
    return Math.round(tmp_rawRatio * 20) / 20;
  }

  /**
   * Dispatches new brake ratio with haptic feedback and brake sound effects.
   */
  function fn_commitRatio(newRatio) {
    if (disabled) return;
    const tmp_norm = Math.max(0, Math.min(1, newRatio));

    // Determine if crossed an integer notch for haptic tap
    const tmp_notchIndex = Math.round(tmp_norm * 4);
    if (tmp_notchIndex !== lastNotchRef.current) {
      lastNotchRef.current = tmp_notchIndex;
      obj_HAPTIC.notch();
    }

    if (Math.abs(tmp_norm - tmp_clampedRatio) > 0.01) {
      obj_SOUND_MANAGER.init();
      if (tmp_norm > tmp_clampedRatio + 0.1) {
        obj_SOUND_MANAGER.playBrakeHiss();
      }
      if (onChange) onChange(tmp_norm);
    }
  }

  /**
   * Handles pointerdown event for mouse and modern touch.
   */
  function handlePointerDown(e) {
    if (disabled) return;
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if capture fails
    }
    const tmp_ratio = fn_calcRatioFromClientY(e.clientY);
    fn_commitRatio(tmp_ratio);
  }

  /**
   * Handles pointermove event while dragging.
   */
  function handlePointerMove(e) {
    if (!isDragging || disabled) return;
    const tmp_ratio = fn_calcRatioFromClientY(e.clientY);
    fn_commitRatio(tmp_ratio);
  }

  /**
   * Handles pointerup / cancel event.
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
   * Direct touch listeners with non-passive preventDefault to prevent mobile page scrolling.
   */
  useEffect(() => {
    const el = slotRef.current;
    if (!el) return;

    /**
     * Touchstart handler preventing mobile scrolling.
     */
    function onTouchStart(e) {
      if (disabled) return;
      e.preventDefault(); // Crucial: stops pull-to-refresh & browser viewport dragging
      setIsDragging(true);
      if (e.touches && e.touches[0]) {
        const tmp_ratio = fn_calcRatioFromClientY(e.touches[0].clientY);
        fn_commitRatio(tmp_ratio);
      }
    }

    /**
     * Touchmove handler tracking touch drag without scrolling page.
     */
    function onTouchMove(e) {
      if (disabled) return;
      e.preventDefault(); // Prevents page pan during drag
      if (e.touches && e.touches[0]) {
        const tmp_ratio = fn_calcRatioFromClientY(e.touches[0].clientY);
        fn_commitRatio(tmp_ratio);
      }
    }

    /**
     * Touchend / Touchcancel handler.
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
  }, [disabled, tmp_clampedRatio]);

  /**
   * Direct click on a specific notch label.
   */
  function handleNotchClick(targetRatio, e) {
    e.stopPropagation();
    if (disabled) return;
    obj_HAPTIC.light();
    fn_commitRatio(targetRatio);
  }

  let tmp_badgeText = 'RELEASE';
  let tmp_badgeVariant = 'tactile-lever__badge--brake-rel';
  if (tmp_clampedRatio >= 0.95) {
    tmp_badgeText = 'EMG 100%';
    tmp_badgeVariant = 'tactile-lever__badge--brake-emg';
  } else if (tmp_clampedRatio >= 0.6) {
    tmp_badgeText = `FULL ${Math.round(tmp_percent)}%`;
    tmp_badgeVariant = 'tactile-lever__badge--brake-svc';
  } else if (tmp_clampedRatio > 0.05) {
    tmp_badgeText = `SVC ${Math.round(tmp_percent)}%`;
    tmp_badgeVariant = 'tactile-lever__badge--brake-svc';
  }

  return (
    <div className="tactile-lever tactile-lever--amber tactile-lever--brake-ref" aria-label={`Train Air Brake: ${tmp_badgeText}`}>
      <div className="tactile-lever__header-box">
        <span className="tactile-lever__header">BRAKE</span>
        <span className={`tactile-lever__badge ${tmp_badgeVariant}`} title={`Brake Application: ${tmp_badgeText}`}>
          {tmp_badgeText}
        </span>
      </div>

      {/* Industrial Lever Slot with Non-Passive Anti-Scroll Touch Handling */}
      <div
        ref={slotRef}
        className="tactile-lever__slot tactile-lever__slot--brake"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Glowing green central guidance track line */}
        <div className="tactile-lever__track-glow" />

        {/* Detent Notches List */}
        <div className="tactile-lever__notches">
          {arr_notches.map((obj_notch) => {
            const tmp_isActive = Math.abs(obj_notch.ratio - tmp_clampedRatio) < 0.12;
            return (
              <div
                key={`brake-notch-${obj_notch.label}`}
                className={`tactile-lever__notch ${tmp_isActive ? 'tactile-lever__notch--active' : ''}`}
                onClick={(e) => handleNotchClick(obj_notch.ratio, e)}
              >
                <span className="tactile-lever__notch-tick" />
              </div>
            );
          })}
        </div>

        {/* Moving Horizontal Silver Lever Handle Bar */}
        <div
          className={`tactile-lever__handle tactile-lever__handle--bar ${isDragging ? 'tactile-lever__handle--dragging' : ''}`}
          style={{ bottom: `calc((${tmp_percent} / 100) * (100% - 44px))` }}
        >
          <div className="tactile-lever__bar-knob" />
        </div>
      </div>
    </div>
  );
}

export default BrakeControl;
