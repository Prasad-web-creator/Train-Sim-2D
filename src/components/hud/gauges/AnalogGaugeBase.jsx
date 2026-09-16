/**
 * AnalogGaugeBase.jsx
 * Reusable physical analog round dial gauge with machined metallic bezel,
 * recessed dial face, glass cover reflection sheen, mechanical needle, and screw rivets.
 */

import React from 'react';

/**
 * Renders an authentic physical analog round dial instrument gauge.
 * 
 * @param {Object} props
 * @param {number} props.value - Current instrument value
 * @param {number} props.min - Minimum scale value
 * @param {number} props.max - Maximum scale value
 * @param {string} props.title - Instrument title label (e.g. SPEED, RPM)
 * @param {string} props.unit - Instrument unit label (e.g. KM/H, BAR)
 * @param {number} [props.startAngle=-135] - Starting angle in degrees
 * @param {number} [props.endAngle=135] - Ending angle in degrees
 * @param {number} [props.majorTicks=5] - Number of major tick intervals
 * @param {number} [props.minorTicksPerMajor=4] - Subdivisions per interval
 * @param {string} [props.colorScheme="cyan"] - Digital LED color theme (cyan, amber, emerald, red)
 * @param {Array<{startVal: number, endVal: number, color: string}>} [props.arcs=[]] - Colored dial arc zones
 * @param {boolean} [props.showDigital=true] - Whether to render digital LED inset
 * @param {number} [props.digitalDecimals=0] - Decimal places for digital inset
 * @param {string} [props.customDigitalText] - Custom override for digital display text
 */
export function AnalogGaugeBase({
  value = 0,
  min = 0,
  max = 100,
  title = '',
  unit = '',
  startAngle = -135,
  endAngle = 135,
  majorTicks = 5,
  minorTicksPerMajor = 4,
  colorScheme = 'cyan',
  arcs = [],
  showDigital = true,
  digitalDecimals = 0,
  customDigitalText = null,
}) {
  const tmp_clamped = Math.max(min, Math.min(max, value));
  const tmp_fraction = (tmp_clamped - min) / (max - min || 1);
  const tmp_angleSpan = endAngle - startAngle;
  const tmp_needleAngle = startAngle + tmp_fraction * tmp_angleSpan;

  // Format digital readout text
  const tmp_digitalText = customDigitalText !== null
    ? customDigitalText
    : (digitalDecimals > 0 ? tmp_clamped.toFixed(digitalDecimals) : Math.round(tmp_clamped).toString());

  // Generate tick marks and numbers for SVG overlay
  const arr_ticks = [];
  const tmp_totalIntervals = majorTicks;
  const tmp_stepVal = (max - min) / tmp_totalIntervals;
  const tmp_radius = 42; // inner dial radius %
  const tmp_cx = 50;
  const tmp_cy = 50;

  for (let tmp_i = 0; tmp_i <= tmp_totalIntervals; tmp_i++) {
    const tmp_majorVal = min + tmp_i * tmp_stepVal;
    const tmp_majorAngleDeg = startAngle + (tmp_i / tmp_totalIntervals) * tmp_angleSpan;
    const tmp_majorAngleRad = ((tmp_majorAngleDeg - 90) * Math.PI) / 180;

    // Major tick line coordinates
    const tmp_x1 = tmp_cx + (tmp_radius - 8) * Math.cos(tmp_majorAngleRad);
    const tmp_y1 = tmp_cy + (tmp_radius - 8) * Math.sin(tmp_majorAngleRad);
    const tmp_x2 = tmp_cx + tmp_radius * Math.cos(tmp_majorAngleRad);
    const tmp_y2 = tmp_cy + tmp_radius * Math.sin(tmp_majorAngleRad);

    // Major tick numeric label coordinates
    const tmp_textR = tmp_radius - 14;
    const tmp_tx = tmp_cx + tmp_textR * Math.cos(tmp_majorAngleRad);
    const tmp_ty = tmp_cy + tmp_textR * Math.sin(tmp_majorAngleRad);

    arr_ticks.push({
      key: `major-${tmp_i}`,
      x1: tmp_x1,
      y1: tmp_y1,
      x2: tmp_x2,
      y2: tmp_y2,
      isMajor: true,
      label: Math.round(tmp_majorVal),
      tx: tmp_tx,
      ty: tmp_ty,
    });

    // Minor ticks between majors (except at the very end)
    if (tmp_i < tmp_totalIntervals) {
      for (let tmp_j = 1; tmp_j <= minorTicksPerMajor; tmp_j++) {
        const tmp_subFraction = (tmp_i + tmp_j / (minorTicksPerMajor + 1)) / tmp_totalIntervals;
        const tmp_subAngleDeg = startAngle + tmp_subFraction * tmp_angleSpan;
        const tmp_subAngleRad = ((tmp_subAngleDeg - 90) * Math.PI) / 180;

        const tmp_mx1 = tmp_cx + (tmp_radius - 4) * Math.cos(tmp_subAngleRad);
        const tmp_my1 = tmp_cy + (tmp_radius - 4) * Math.sin(tmp_subAngleRad);
        const tmp_mx2 = tmp_cx + tmp_radius * Math.cos(tmp_subAngleRad);
        const tmp_my2 = tmp_cy + tmp_radius * Math.sin(tmp_subAngleRad);

        arr_ticks.push({
          key: `minor-${tmp_i}-${tmp_j}`,
          x1: tmp_mx1,
          y1: tmp_my1,
          x2: tmp_mx2,
          y2: tmp_my2,
          isMajor: false,
        });
      }
    }
  }

  /**
   * Helper function to convert polar coordinates into SVG arc path data string.
   */
  function fn_describeArc(startVal, endVal, arcRadius) {
    const tmp_sFrac = Math.max(0, Math.min(1, (startVal - min) / (max - min || 1)));
    const tmp_eFrac = Math.max(0, Math.min(1, (endVal - min) / (max - min || 1)));
    const tmp_sDeg = startAngle + tmp_sFrac * tmp_angleSpan;
    const tmp_eDeg = startAngle + tmp_eFrac * tmp_angleSpan;

    const tmp_sRad = ((tmp_sDeg - 90) * Math.PI) / 180;
    const tmp_eRad = ((tmp_eDeg - 90) * Math.PI) / 180;

    const tmp_sx = tmp_cx + arcRadius * Math.cos(tmp_sRad);
    const tmp_sy = tmp_cy + arcRadius * Math.sin(tmp_sRad);
    const tmp_ex = tmp_cx + arcRadius * Math.cos(tmp_eRad);
    const tmp_ey = tmp_cy + arcRadius * Math.sin(tmp_eRad);

    const tmp_largeArcFlag = tmp_eDeg - tmp_sDeg <= 180 ? '0' : '1';
    return `M ${tmp_sx.toFixed(2)} ${tmp_sy.toFixed(2)} A ${arcRadius} ${arcRadius} 0 ${tmp_largeArcFlag} 1 ${tmp_ex.toFixed(2)} ${tmp_ey.toFixed(2)}`;
  }

  // Determine LED glow color style
  let tmp_colorClass = 'analog-gauge__digital--cyan';
  if (colorScheme === 'amber') tmp_colorClass = 'analog-gauge__digital--amber';
  if (colorScheme === 'emerald') tmp_colorClass = 'analog-gauge__digital--emerald';
  if (colorScheme === 'red') tmp_colorClass = 'analog-gauge__digital--red';

  return (
    <div className="analog-gauge" title={`${title}: ${tmp_digitalText} ${unit}`}>
      {/* Outer Machined Metal Bezel */}
      <div className="analog-gauge__bezel">
        {/* Recessed Dial Face */}
        <div className="analog-gauge__face">
          {/* SVG Scales, Ticks, and Colored Arcs */}
          <svg className="analog-gauge__arc-svg" viewBox="0 0 100 100">
            {/* Colored Warning / Operational Arcs */}
            {arcs.map((obj_arc, tmp_idx) => (
              <path
                key={`arc-${tmp_idx}`}
                d={fn_describeArc(obj_arc.startVal, obj_arc.endVal, 40)}
                fill="none"
                stroke={obj_arc.color}
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.85"
              />
            ))}

            {/* Scale Ticks & Numbers */}
            {arr_ticks.map((obj_tick) =>
              obj_tick.isMajor ? (
                <g key={obj_tick.key}>
                  <line
                    x1={obj_tick.x1}
                    y1={obj_tick.y1}
                    x2={obj_tick.x2}
                    y2={obj_tick.y2}
                    stroke="#cbd5e1"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <text
                    x={obj_tick.tx}
                    y={obj_tick.ty}
                    fill="#94a3b8"
                    fontSize="5"
                    fontFamily="var(--font-display)"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {obj_tick.label}
                  </text>
                </g>
              ) : (
                <line
                  key={obj_tick.key}
                  x1={obj_tick.x1}
                  y1={obj_tick.y1}
                  x2={obj_tick.x2}
                  y2={obj_tick.y2}
                  stroke="#64748b"
                  strokeWidth="0.8"
                />
              )
            )}
          </svg>

          {/* Instrument Title & Unit */}
          <div className="analog-gauge__title">{title}</div>
          <div className="analog-gauge__unit">{unit}</div>

          {/* Digital LED Inset Readout */}
          {showDigital && (
            <div className={`analog-gauge__digital ${tmp_colorClass}`}>
              {tmp_digitalText}
            </div>
          )}

          {/* Mechanical Rotating Needle */}
          <div
            className="analog-gauge__needle-wrapper"
            style={{ transform: `rotate(${tmp_needleAngle}deg)` }}
          >
            <div className="analog-gauge__needle" />
          </div>

          {/* Brass Center Hub Cap */}
          <div className="analog-gauge__center-cap" />

          {/* Glass Cover Reflection Sheen */}
          <div className="analog-gauge__glass" />
        </div>
      </div>
    </div>
  );
}

export default AnalogGaugeBase;
