/**
 * WarningLights.jsx
 * Industrial annunciator warning lamp cluster displaying wheel slip, engine overheat,
 * sander active, low fuel, and track incline grade indicators.
 */

import React from 'react';

/**
 * Renders the locomotive cab annunciator warning lights panel.
 * 
 * @param {Object} props
 * @param {boolean} [props.isWheelSlipping=false] - Traction loss indicator
 * @param {boolean} [props.isOverheating=false] - High temperature alarm
 * @param {boolean} [props.isSanderActive=false] - Sand application active
 * @param {boolean} [props.isLowFuel=false] - Low fuel reserve warning
 * @param {boolean} [props.isBrakeApplied=false] - Brake application indicator
 * @param {number} [props.trackGradePercent=0] - Current track gradient percentage
 */
export function WarningLights({
  isWheelSlipping = false,
  isOverheating = false,
  isSanderActive = false,
  isLowFuel = false,
  isBrakeApplied = false,
  trackGradePercent = 0,
}) {
  const tmp_gradeNum = parseFloat(trackGradePercent || 0);
  const tmp_gradeFormatted = Math.abs(tmp_gradeNum).toFixed(1);

  // Grade arrow and text
  let tmp_gradeClass = '';
  let tmp_gradeArrow = '—';
  if (tmp_gradeNum > 0.05) {
    tmp_gradeClass = 'gradient-indicator__val--up';
    tmp_gradeArrow = `+${tmp_gradeFormatted}% ↗`;
  } else if (tmp_gradeNum < -0.05) {
    tmp_gradeClass = 'gradient-indicator__val--down';
    tmp_gradeArrow = `-${tmp_gradeFormatted}% ↘`;
  } else {
    tmp_gradeArrow = '0.0% —';
  }

  return (
    <div className="warning-lights" aria-label="Annunciator Warning Panel">
      {/* Wheel Slip Lamp */}
      <div
        className={`warning-lamp warning-lamp--slip ${isWheelSlipping ? 'warning-lamp--active' : ''}`}
        title="Traction Adhesion / Wheel Slip Warning"
      >
        <span className="warning-lamp__jewel" />
        <span className="warning-lamp__title">WHEEL SLIP</span>
      </div>

      {/* Engine Overheat Lamp */}
      <div
        className={`warning-lamp warning-lamp--temp ${isOverheating ? 'warning-lamp--active' : ''}`}
        title="Engine Coolant Temperature Alarm"
      >
        <span className="warning-lamp__jewel" />
        <span className="warning-lamp__title">OVERHEAT</span>
      </div>

      {/* Sander Active Lamp */}
      <div
        className={`warning-lamp warning-lamp--sand ${isSanderActive ? 'warning-lamp--active' : ''}`}
        title="Wheel Sanding System Active"
      >
        <span className="warning-lamp__jewel" />
        <span className="warning-lamp__title">SANDER</span>
      </div>

      {/* Low Fuel Lamp */}
      <div
        className={`warning-lamp warning-lamp--fuel ${isLowFuel ? 'warning-lamp--active' : ''}`}
        title="Fuel Reserve Alert"
      >
        <span className="warning-lamp__jewel" />
        <span className="warning-lamp__title">LOW FUEL</span>
      </div>

      {/* Track Gradient Grade Incline */}
      <div className="gradient-indicator" title="Current Track Incline Gradient">
        <span className="gradient-indicator__label">GRADE:</span>
        <span className={`gradient-indicator__val ${tmp_gradeClass}`}>{tmp_gradeArrow}</span>
      </div>
    </div>
  );
}

export default WarningLights;
