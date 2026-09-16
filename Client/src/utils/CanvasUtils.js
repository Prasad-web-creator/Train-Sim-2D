/**
 * CanvasUtils.js
 * Canvas 2D drawing utility routines for rounded rectangles, gauges, dials, and rivets.
 */

/**
 * Draws a rounded rectangle path on the given canvas 2D rendering context.
 */
export function drawRoundedRect(ctx, x, y, width, height, radius) {
  const tmp_r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + tmp_r, y);
  ctx.lineTo(x + width - tmp_r, y);
  ctx.arcTo(x + width, y, x + width, y + tmp_r, tmp_r);
  ctx.lineTo(x + width, y + height - tmp_r);
  ctx.arcTo(x + width, y + height, x + width - tmp_r, y + height, tmp_r);
  ctx.lineTo(x + tmp_r, y + height);
  ctx.arcTo(x, y + height, x, y + height - tmp_r, tmp_r);
  ctx.lineTo(x, y + tmp_r);
  ctx.arcTo(x, y, x + tmp_r, y, tmp_r);
  ctx.closePath();
}

/**
 * Draws a metallic rivet circle with realistic highlight and drop shadow.
 */
export function drawRivet(ctx, cx, cy, radius = 3) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#475569';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx - radius * 0.3, cy - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fill();
  ctx.restore();
}

/**
 * Draws an analog gauge dial with needle, ticks, and numeric labels.
 */
export function drawAnalogDial(ctx, cx, cy, radius, value, minVal, maxVal, label, unit, alertThreshold = null) {
  ctx.save();
  // Outer metallic bezel
  const tmp_gradient = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius);
  tmp_gradient.addColorStop(0, '#1e293b');
  tmp_gradient.addColorStop(0.85, '#0f172a');
  tmp_gradient.addColorStop(1, '#64748b');
  ctx.fillStyle = tmp_gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#334155';
  ctx.stroke();

  // Dial face inner circle
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.88, 0, Math.PI * 2);
  ctx.fillStyle = '#090d16';
  ctx.fill();

  // Tick marks (from 135 deg to 405 deg)
  const cons_START_ANGLE = Math.PI * 0.75;
  const cons_END_ANGLE = Math.PI * 2.25;
  const cons_TOTAL_ANGLE = cons_END_ANGLE - cons_START_ANGLE;
  const tmp_numTicks = 8;

  for (let tmp_i = 0; tmp_i <= tmp_numTicks; tmp_i++) {
    const tmp_ratio = tmp_i / tmp_numTicks;
    const tmp_angle = cons_START_ANGLE + tmp_ratio * cons_TOTAL_ANGLE;
    const tmp_isMajor = tmp_i % 2 === 0;
    const tmp_rInner = radius * (tmp_isMajor ? 0.68 : 0.75);
    const tmp_rOuter = radius * 0.84;

    const tmp_x1 = cx + Math.cos(tmp_angle) * tmp_rInner;
    const tmp_y1 = cy + Math.sin(tmp_angle) * tmp_rInner;
    const tmp_x2 = cx + Math.cos(tmp_angle) * tmp_rOuter;
    const tmp_y2 = cy + Math.sin(tmp_angle) * tmp_rOuter;

    ctx.beginPath();
    ctx.moveTo(tmp_x1, tmp_y1);
    ctx.lineTo(tmp_x2, tmp_y2);
    ctx.lineWidth = tmp_isMajor ? 2.5 : 1.5;
    ctx.strokeStyle = alertThreshold && (minVal + tmp_ratio * (maxVal - minVal)) >= alertThreshold ? '#ef4444' : '#94a3b8';
    ctx.stroke();
  }

  // Value text & unit
  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${Math.round(radius * 0.28)}px 'Chakra Petch', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(Math.round(value).toString(), cx, cy + radius * 0.3);

  ctx.fillStyle = '#64748b';
  ctx.font = `${Math.round(radius * 0.16)}px sans-serif`;
  ctx.fillText(unit || '', cx, cy + radius * 0.52);
  ctx.fillText(label || '', cx, cy - radius * 0.35);

  // Needle angle
  const tmp_normVal = Math.min(Math.max((value - minVal) / (maxVal - minVal), 0), 1);
  const tmp_needleAngle = cons_START_ANGLE + tmp_normVal * cons_TOTAL_ANGLE;
  const tmp_needleLen = radius * 0.72;

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(tmp_needleAngle) * tmp_needleLen, cy + Math.sin(tmp_needleAngle) * tmp_needleLen);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ef4444';
  ctx.stroke();

  // Needle center cap
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = '#dc2626';
  ctx.fill();
  ctx.restore();
}
