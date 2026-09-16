/**
 * RPMGauge.jsx
 * Canvas-based diesel locomotive engine tachometer displaying 0 to 3000 RPM.
 * Features idle, operating power, and redline over-rev warning zones with smooth interpolation.
 */

import React from 'react';
import { AnalogGauge } from './AnalogGauge.jsx';

/**
 * Renders the locomotive prime-mover tachometer dial (0 to 3000 RPM).
 * 
 * @param {Object} props
 * @param {number} [props.rpm=650] - Current engine crankshaft / prime-mover RPM
 * @param {number} [props.size=135] - Visual size in CSS pixels
 */
export function RPMGauge({
  rpm = 650,
  size = 135,
  isBacklit = false,
  title = '',
}) {
  const tmp_rpm = Math.max(0, Math.min(2400, rpm));
  const tmp_isRedline = tmp_rpm >= 2100;

  // Tachometer color bands: Green (0-1800), Amber (1800-2100), Redline (2100-2400)
  const arr_warningZones = [
    { start: 300, end: 1800, color: '#10b981' },
    { start: 1800, end: 2100, color: '#f59e0b' },
    { start: 2100, end: 2400, color: '#ef4444' },
  ];

  /**
   * Formats digital RPM value.
   */
  function fn_formatRpm(val) {
    return Math.round(val).toString();
  }

  return (
    <AnalogGauge
      value={tmp_rpm}
      min={0}
      max={2400}
      title={title}
      unit="RPM"
      startAngle={-135}
      endAngle={135}
      majorTicks={4} // 0, 600, 1200, 1800, 2400
      minorTicksPerMajor={4}
      warningZones={arr_warningZones}
      isWarningActive={tmp_isRedline}
      enableVibration={false}
      size={size}
      colorScheme="cyan"
      smoothingSpeed={8.0}
      formatValue={fn_formatRpm}
      isBacklit={isBacklit}
      needleColor="green"
    />
  );
}

export default RPMGauge;
