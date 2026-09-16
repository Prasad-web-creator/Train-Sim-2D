/**
 * Speedometer.jsx
 * Canvas-based locomotive speedometer displaying speed from 0 to 140 km/h.
 * Features safe operating, warning, and overspeed arc zones, overspeed warning state,
 * and mobile device haptic vibration on overspeed.
 */

import React from 'react';
import { AnalogGauge } from './AnalogGauge.jsx';

/**
 * Renders the primary locomotive speedometer analog dial using Canvas.
 * 
 * @param {Object} props
 * @param {number} [props.speedKmh=0] - Current train speed in km/h
 * @param {number} [props.speedLimitKmh=60] - Current track speed limit in km/h
 * @param {number} [props.size=135] - Visual size in CSS pixels
 */
export function Speedometer({
  speedKmh = 0,
  speedLimitKmh = 60,
  size = 135,
  isBacklit = false,
  title = '',
}) {
  const tmp_speed = Math.max(0, speedKmh);
  const tmp_limit = Math.max(10, Math.min(140, speedLimitKmh));

  // Determine overspeed alert state
  const tmp_isOverspeed = tmp_speed > tmp_limit;

  // Dynamic arc zones adapting to current track speed limit
  const arr_warningZones = [
    { start: 0, end: tmp_limit, color: '#10b981' }, // Safe compliance (green)
    { start: tmp_limit, end: Math.min(140, tmp_limit + 15), color: '#f59e0b' }, // Margin (amber)
    { start: Math.min(140, tmp_limit + 15), end: 140, color: '#ef4444' }, // Overspeed hazard (red)
  ];

  /**
   * Formats digital display value as integer km/h.
   */
  function fn_formatSpeed(val) {
    return Math.round(val).toString();
  }

  return (
    <AnalogGauge
      value={tmp_speed}
      min={0}
      max={120}
      title={title}
      unit="km/h"
      startAngle={-135}
      endAngle={135}
      majorTicks={6} // 0, 20, 40, 60, 80, 100, 120
      minorTicksPerMajor={3}
      warningZones={arr_warningZones}
      isWarningActive={tmp_isOverspeed}
      enableVibration={true}
      size={size}
      colorScheme={tmp_isOverspeed ? 'red' : 'cyan'}
      smoothingSpeed={9.0}
      formatValue={fn_formatSpeed}
      isBacklit={isBacklit}
    />
  );
}

export default Speedometer;
