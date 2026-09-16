/**
 * Gauge.jsx
 * Industrial analog round dial gauge with rotating needle and digital LED readout.
 */

import React from 'react';

/**
 * Renders an analog gauge dial with needle angle and numeric display.
 */
export function Gauge({
  value = 0,
  min = 0,
  max = 140,
  label = 'SPEED',
  unit = 'km/h',
  size = 140,
  alertThreshold = null,
  colorScheme = 'cyan', // 'cyan', 'amber', 'emerald'
}) {
  const tmp_clamped = Math.min(Math.max(value, min), max);
  const tmp_ratio = (tmp_clamped - min) / (max - min);

  // 270 degree sweep from -135deg to +135deg
  const tmp_needleDeg = -135 + tmp_ratio * 270;
  const tmp_isAlert = alertThreshold !== null && value >= alertThreshold;

  return (
    <div
      className={`iron-gauge iron-gauge--${colorScheme} ${tmp_isAlert ? 'iron-gauge--alert' : ''}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Outer metallic bezel ring */}
      <div className="iron-gauge__bezel">
        <div className="iron-gauge__dial">
          {/* Dial labels */}
          <span className="iron-gauge__label">{label}</span>
          <span className="iron-gauge__unit">{unit}</span>

          {/* Digital LED readout */}
          <div className="iron-gauge__digital">
            {Math.round(value)}
          </div>

          {/* Needle pivot & arm */}
          <div
            className="iron-gauge__needle"
            style={{ transform: `rotate(${tmp_needleDeg}deg)` }}
          >
            <div className="iron-gauge__needle-point" />
          </div>

          <div className="iron-gauge__center-cap" />
        </div>
      </div>
    </div>
  );
}
