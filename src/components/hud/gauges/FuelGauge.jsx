/**
 * FuelGauge.jsx
 * Canvas-based diesel locomotive fuel capacity gauge (0 to 100%).
 * Displays E, 1/4, 1/2, 3/4, F dial markings and triggers low-reserve warning state below 15%.
 */

import React from 'react';
import { AnalogGauge } from './AnalogGauge.jsx';

/**
 * Renders the locomotive fuel level round dial (0 to 100%).
 * 
 * @param {Object} props
 * @param {number} [props.fuelPercent=85] - Remaining fuel in percent (0 to 100)
 * @param {number} [props.size=135] - Visual size in CSS pixels
 */
export function FuelGauge({
  fuelPercent = 85,
  size = 135,
  isBacklit = false,
}) {
  const tmp_percent = Math.max(0, Math.min(100, fuelPercent));
  const tmp_isLowReserve = tmp_percent < 15;

  // Custom tick markings: Empty (E), quarters, and Full (F)
  const arr_customLabels = [
    { val: 0, label: 'E' },
    { val: 25, label: '1/4' },
    { val: 50, label: '1/2' },
    { val: 75, label: '3/4' },
    { val: 100, label: 'F' },
  ];

  // Arc zones: Critical reserve (red), normal fuel capacity (amber)
  const arr_warningZones = [
    { start: 0, end: 15, color: '#ef4444' },   // Low reserve alert
    { start: 15, end: 100, color: '#f59e0b' }, // Operational capacity
  ];

  /**
   * Formats digital percentage value.
   */
  function fn_formatFuel(val) {
    return `${Math.round(val)}%`;
  }

  return (
    <AnalogGauge
      value={tmp_percent}
      min={0}
      max={100}
      title="FUEL LEVEL"
      unit="%"
      startAngle={-120}
      endAngle={120}
      majorTicks={4} // 0, 25, 50, 75, 100
      minorTicksPerMajor={4}
      warningZones={arr_warningZones}
      isWarningActive={tmp_isLowReserve}
      enableVibration={false}
      size={size}
      colorScheme={tmp_isLowReserve ? 'red' : 'amber'}
      smoothingSpeed={4.0}
      formatValue={fn_formatFuel}
      customTickLabels={arr_customLabels}
      isBacklit={isBacklit}
    />
  );
}

export default FuelGauge;
