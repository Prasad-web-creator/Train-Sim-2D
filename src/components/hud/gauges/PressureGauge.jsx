/**
 * PressureGauge.jsx
 * Canvas-based pneumatic pressure gauge (0 to 150 PSI) for Brake Pipe and Main Reservoir.
 * Features calibrated operating and warning arc zones, high-contrast needle,
 * and bold digital PSI readout inset.
 */

import React from 'react';
import { AnalogGauge } from './AnalogGauge.jsx';

/**
 * Renders an analog pneumatic pressure gauge (0 to 150 PSI).
 * 
 * @param {Object} props
 * @param {number} [props.psi=98] - Current pressure in PSI
 * @param {string} [props.title='PSI'] - Title label
 * @param {number} [props.size=100] - Base size in CSS pixels
 * @param {boolean} [props.isBacklit=false] - Night illumination
 */
export function PressureGauge({
  psi = 98,
  title = 'PSI',
  size = 100,
  isBacklit = false,
}) {
  const tmp_psi = Math.max(0, Math.min(150, psi));
  const tmp_isWarning = tmp_psi < 60 || tmp_psi > 135;

  // Arc zones matching pneumatic operating specifications:
  // Operating pressure (green: 0-100), caution margin (amber: 100-125), high pressure (red: 125-150)
  const arr_warningZones = [
    { start: 0, end: 100, color: '#10b981' },
    { start: 100, end: 125, color: '#f59e0b' },
    { start: 125, end: 150, color: '#ef4444' },
  ];

  function fn_formatPsi(val) {
    return Math.round(val).toString();
  }

  return (
    <AnalogGauge
      value={tmp_psi}
      min={0}
      max={150}
      title={title}
      unit="PSI"
      startAngle={-135}
      endAngle={135}
      majorTicks={3} // 0, 50, 100, 150
      minorTicksPerMajor={4}
      warningZones={arr_warningZones}
      isWarningActive={tmp_isWarning}
      size={size}
      colorScheme="cyan"
      smoothingSpeed={9.0}
      formatValue={fn_formatPsi}
      isBacklit={isBacklit}
      needleColor="orange"
    />
  );
}

export default PressureGauge;
