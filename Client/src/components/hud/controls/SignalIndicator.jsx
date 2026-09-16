/**
 * SignalIndicator.jsx
 * Cab signaling trackside repeater displaying 4-aspect signal plate (Upper Yellow, Green, Lower Yellow, Red)
 * and optical beacon supporting RED, YELLOW, DOUBLE_YELLOW, GREEN, and OFF states with advisory speeds and distance readouts.
 */

import React from 'react';

/**
 * Renders the locomotive cab signal aspect repeater.
 * 
 * @param {Object} props
 * @param {'RED'|'YELLOW'|'DOUBLE_YELLOW'|'GREEN'|'OFF'|string} [props.aspect='GREEN'] - Current signal aspect
 * @param {number} [props.distanceMeters=1200] - Distance to next trackside signal in meters
 * @param {string} [props.signalName='SIG 01'] - Signal identification designation
 * @param {number} [props.advisorySpeedKmh=999] - Target advisory speed limit
 */
export function SignalIndicator({
  aspect = 'GREEN',
  distanceMeters = 1200,
  signalName = 'SIG 01',
  advisorySpeedKmh = 999,
}) {
  const tmp_state = (aspect || 'GREEN').toUpperCase();

  // Active lamp states for 4-aspect head (Upper Yellow, Green, Lower Yellow, Red)
  const tmp_isUpperYellowActive = tmp_state === 'DOUBLE_YELLOW';
  const tmp_isGreenActive = tmp_state === 'GREEN';
  const tmp_isLowerYellowActive = tmp_state === 'YELLOW' || tmp_state === 'DOUBLE_YELLOW';
  const tmp_isRedActive = tmp_state === 'RED';

  // Display label, theme class, and advisory speed text
  let tmp_labelText = 'CLEAR';
  let tmp_themeClass = 'signal-indicator--green';
  let tmp_advisoryText = 'LINE SPD';

  if (tmp_state === 'RED') {
    tmp_labelText = 'DANGER';
    tmp_themeClass = 'signal-indicator--red';
    tmp_advisoryText = 'STOP';
  } else if (tmp_state === 'YELLOW') {
    tmp_labelText = 'CAUTION';
    tmp_themeClass = 'signal-indicator--yellow';
    tmp_advisoryText = '45 KM/H';
  } else if (tmp_state === 'DOUBLE_YELLOW') {
    tmp_labelText = 'PRE-CAUTION';
    tmp_themeClass = 'signal-indicator--double-yellow';
    tmp_advisoryText = '75 KM/H';
  } else if (tmp_state === 'OFF') {
    tmp_labelText = 'UNLIT';
    tmp_themeClass = 'signal-indicator--off';
    tmp_advisoryText = 'STOP';
  }

  const tmp_distStr = distanceMeters > 9999
    ? '--'
    : (distanceMeters > 1000 ? `${(distanceMeters / 1000).toFixed(1)} km` : `${Math.round(distanceMeters)} m`);

  const tmp_lensClass = `signal-indicator__lens--${tmp_state.toLowerCase().replace('_', '-')}`;

  return (
    <div
      className={`signal-indicator ${tmp_themeClass}`}
      title={`Signal ${signalName}: ${tmp_labelText} in ${tmp_distStr}${tmp_advisoryText ? ` (Target: ${tmp_advisoryText})` : ''}`}
    >
      {/* 1. Luminous Optical Aspect Beacon */}
      <div className="signal-indicator__beacon" aria-hidden="true">
        <div className={`signal-indicator__lens ${tmp_lensClass}`}>
          {tmp_state === 'DOUBLE_YELLOW' ? (
            <div className="signal-indicator__lens-dual">
              <span className="signal-indicator__lens-dot" />
              <span className="signal-indicator__lens-dot" />
            </div>
          ) : null}
          <span className="signal-indicator__lens-specular" />
        </div>
      </div>

      {/* 2. Micro 4-Aspect Railway Plate */}
      <div className="signal-indicator__plate signal-indicator__plate--four-aspect" aria-hidden="true">
        <div
          className={`signal-indicator__lamp signal-indicator__lamp--amber ${tmp_isUpperYellowActive ? 'signal-indicator__lamp--active' : ''}`}
          title="Upper Yellow"
        />
        <div
          className={`signal-indicator__lamp signal-indicator__lamp--green ${tmp_isGreenActive ? 'signal-indicator__lamp--active' : ''}`}
          title="Green"
        />
        <div
          className={`signal-indicator__lamp signal-indicator__lamp--amber ${tmp_isLowerYellowActive ? 'signal-indicator__lamp--active' : ''}`}
          title="Lower Yellow"
        />
        <div
          className={`signal-indicator__lamp signal-indicator__lamp--red ${tmp_isRedActive ? 'signal-indicator__lamp--active' : ''}`}
          title="Red"
        />
      </div>

      {/* 3. Hairline Divider */}
      <div className="signal-indicator__sep" />

      {/* 4. Structured Telemetry Information */}
      <div className="signal-indicator__info">
        <div className="signal-indicator__meta-row">
          <span className="signal-indicator__badge">{signalName}</span>
          <span className="signal-indicator__meta-dot">•</span>
          <span className="signal-indicator__dist">{tmp_distStr}</span>
        </div>
        <div className="signal-indicator__status-row">
          <span className="signal-indicator__text">{tmp_labelText}</span>
          {tmp_advisoryText && (
            <span className="signal-indicator__advisory">{tmp_advisoryText}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default SignalIndicator;
