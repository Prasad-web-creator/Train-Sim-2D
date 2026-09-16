/**
 * Lever.jsx
 * Industrial locomotive lever control for throttle and reverser with mouse and touch drag support.
 */

import React, { useRef, useState, useEffect } from 'react';
import { obj_AUDIO_MANAGER, obj_SOUND_MANAGER } from '../game/audio/index.js';

/**
 * Renders an interactive tactile locomotive lever with notches and touch drag mechanics.
 */
export function Lever({
  value = 0,
  min = 0,
  max = 8,
  step = 1,
  labels = [],
  title = 'THROTTLE',
  orientation = 'vertical',
  handleColor = 'red', // 'red', 'silver', 'black'
  onChange,
}) {
  const ref_container = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Updates lever value based on mouse or touch coordinate along the lever slot.
   */
  function updateValueFromCoord(clientY) {
    if (!ref_container.current) return;
    const obj_rect = ref_container.current.getBoundingClientRect();
    const tmp_relY = clientY - obj_rect.top;
    // Lever top is max value, lever bottom is min value
    const tmp_ratio = 1 - Math.min(Math.max(tmp_relY / obj_rect.height, 0), 1);
    const tmp_rawVal = min + tmp_ratio * (max - min);
    const tmp_stepped = Math.round(tmp_rawVal / step) * step;
    const tmp_clamped = Math.min(Math.max(tmp_stepped, min), max);

    if (tmp_clamped !== value && onChange) {
      obj_AUDIO_MANAGER.init();
      obj_AUDIO_MANAGER.playLeverNotch();
      onChange(tmp_clamped);
    }
  }

  /**
   * Begins mouse or touch dragging.
   */
  function handlePointerDown(e) {
    e.preventDefault();
    setIsDragging(true);
    updateValueFromCoord(e.clientY || (e.touches && e.touches[0].clientY));
  }

  useEffect(() => {
    /**
     * Tracks pointer move while dragging.
     */
    function handlePointerMove(e) {
      if (!isDragging) return;
      updateValueFromCoord(e.clientY || (e.touches && e.touches[0].clientY));
    }

    /**
     * Ends dragging on pointer up.
     */
    function handlePointerUp() {
      if (isDragging) {
        setIsDragging(false);
      }
    }

    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('touchend', handlePointerUp);
    }

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, value, min, max, step]);

  // Visual position fraction from bottom (0 to 1)
  const tmp_fraction = (value - min) / (max - min || 1);
  const tmp_bottomPercent = tmp_fraction * 78 + 11; // Constrain travel within slot

  return (
    <div className={`iron-lever iron-lever--${handleColor}`} ref={ref_container}>
      <div className="iron-lever__title">{title}</div>

      <div
        className="iron-lever__track"
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        {/* Notch indicators along track */}
        <div className="iron-lever__notches">
          {labels.length > 0
            ? labels.map((obj_notch, idx) => (
                <div
                  key={idx}
                  className={`iron-lever__notch ${value === obj_notch.val ? 'iron-lever__notch--active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onChange) onChange(obj_notch.val);
                  }}
                >
                  <span className="iron-lever__notch-line" />
                  <span className="iron-lever__notch-label">{obj_notch.label}</span>
                </div>
              ))
            : Array.from({ length: (max - min) / step + 1 }).map((_, idx) => {
                const tmp_val = min + idx * step;
                return (
                  <div
                    key={idx}
                    className={`iron-lever__notch ${value === tmp_val ? 'iron-lever__notch--active' : ''}`}
                  >
                    <span className="iron-lever__notch-line" />
                    <span className="iron-lever__notch-label">{tmp_val}</span>
                  </div>
                );
              })}
        </div>

        {/* Moving lever handle arm & knob */}
        <div
          className={`iron-lever__handle ${isDragging ? 'iron-lever__handle--dragging' : ''}`}
          style={{ bottom: `${tmp_bottomPercent}%` }}
        >
          <div className="iron-lever__arm" />
          <div className="iron-lever__knob">
            <span className="iron-lever__knob-grip" />
          </div>
        </div>
      </div>
    </div>
  );
}
