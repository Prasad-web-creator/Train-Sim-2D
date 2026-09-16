/**
 * BrakeGauge.jsx
 * Canvas-based pneumatic train brake application indicator (0 to 100%).
 * Displays service and emergency braking zones with pneumatic pressure cross-reference.
 */

import React from 'react';
import { AnalogGauge } from './AnalogGauge.jsx';

/**
 * Renders the locomotive pneumatic air brake dial (0 to 100%).
 * 
 * @param {Object} props
 * @param {number} [props.brakePercent=0] - Brake application percentage (0 = Released, 100 = Emergency)
 * @param {number} [props.pipePressureBar=5.0] - Brake pipe pressure in Bar for digital display
 * @param {number} [props.size=135] - Visual size in CSS pixels
 */
export function BrakeGauge({
  brakePercent = 0,
  pipePressureBar = 5.0,
  size = 135,
  isBacklit = false,
}) {
  const tmp_percent = Math.max(0, Math.min(100, brakePercent));
  const tmp_isHeavyBrake = tmp_percent >= 75;

  // Arc zones: Running charge / released (green), service braking (amber), emergency / heavy (red)
  const arr_warningZones = [
    { start: 0, end: 25, color: '#10b981' },  // Released running condition
    { start: 25, end: 70, color: '#f59e0b' }, // Progressive service application
    { start: 70, end: 100, color: '#ef4444' },// Heavy / emergency application
  ];

  /**
   * Formats digital readout displaying brake percentage.
   */
  function fn_formatBrake(val) {
    return `${Math.round(val)}%`;
  }

  return (
    <AnalogGauge
      value={tmp_percent}
      min={0}
      max={100}
      title="AIR BRAKE"
      unit="%"
      startAngle={-135}
      endAngle={135}
      majorTicks={5} // 0, 20, 40, 60, 80, 100
      minorTicksPerMajor={3}
      warningZones={arr_warningZones}
      isWarningActive={tmp_isHeavyBrake}
      enableVibration={false}
      size={size}
      colorScheme={tmp_isHeavyBrake ? 'red' : (tmp_percent > 20 ? 'amber' : 'emerald')}
      smoothingSpeed={9.0}
      formatValue={fn_formatBrake}
      isBacklit={isBacklit}
    />
  );
}

export default BrakeGauge;
