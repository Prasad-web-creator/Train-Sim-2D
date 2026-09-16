/**
 * TemperatureGauge.jsx
 * Canvas-based locomotive engine coolant temperature indicator (0 to 120 °C).
 * Features thermal operating bands and overheat warning alert state when exceeding threshold.
 */

import React from 'react';
import { AnalogGauge } from './AnalogGauge.jsx';

/**
 * Renders the locomotive engine coolant temperature round dial (0 to 120 °C).
 * 
 * @param {Object} props
 * @param {number} [props.temperatureC=82] - Engine coolant temperature in Celsius
 * @param {number} [props.threshold=100] - Overheat warning threshold temperature
 * @param {number} [props.size=135] - Visual size in CSS pixels
 */
export function TemperatureGauge({
  temperatureC = 82,
  threshold = 100,
  size = 135,
  isBacklit = false,
  title = '',
}) {
  const tmp_temp = Math.max(0, Math.min(150, temperatureC));
  const tmp_isOverheat = tmp_temp >= 115;

  // Thermal zones: Normal (0-90°C), Warning (90-120°C), Danger (120-150°C)
  const arr_warningZones = [
    { start: 0, end: 90, color: '#10b981' },
    { start: 90, end: 120, color: '#f59e0b' },
    { start: 120, end: 150, color: '#ef4444' },
  ];

  /**
   * Formats digital temperature readout with degree symbol.
   */
  function fn_formatTemp(val) {
    return Math.round(val).toString();
  }

  return (
    <AnalogGauge
      value={tmp_temp}
      min={0}
      max={150}
      title={title}
      unit="°C"
      startAngle={-135}
      endAngle={135}
      majorTicks={5} // 0, 30, 60, 90, 120, 150
      minorTicksPerMajor={3}
      warningZones={arr_warningZones}
      isWarningActive={tmp_isOverheat}
      enableVibration={false}
      size={size}
      colorScheme="cyan"
      smoothingSpeed={5.0}
      formatValue={fn_formatTemp}
      isBacklit={isBacklit}
      needleColor="green"
    />
  );
}

export default TemperatureGauge;
