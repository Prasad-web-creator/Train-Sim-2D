/**
 * AnalogGauge.jsx
 * Reusable HTML5 Canvas-based analog instrument gauge.
 * Features machined metallic ring, recessed dial face, colored warning arcs,
 * tick marks with numbers, mechanical needle with drop shadow, center brass hub,
 * convex glass sheen reflection, digital LED inset, smooth needle animation,
 * and visual/haptic warning alerts.
 */

import React, { useRef, useEffect } from 'react';

/**
 * Renders an authentic Canvas-based circular analog instrument gauge.
 * 
 * @param {Object} props
 * @param {number} [props.value=0] - Target numeric value to display
 * @param {number} [props.min=0] - Minimum scale value
 * @param {number} [props.max=100] - Maximum scale value
 * @param {string} [props.title=''] - Instrument title label (e.g. SPEED, RPM)
 * @param {string} [props.unit=''] - Measurement unit label (e.g. KM/H, °C)
 * @param {number} [props.startAngle=-135] - Scale start angle in degrees
 * @param {number} [props.endAngle=135] - Scale end angle in degrees
 * @param {number} [props.majorTicks=5] - Number of major scale divisions
 * @param {number} [props.minorTicksPerMajor=4] - Number of minor subdivisions per division
 * @param {Array<{start: number, end: number, color: string}>} [props.warningZones=[]] - Arc bands
 * @param {boolean} [props.isWarningActive=false] - Whether warning alert state is triggered
 * @param {boolean} [props.enableVibration=false] - Whether to trigger mobile haptic feedback on alert
 * @param {number} [props.size=140] - Base gauge size in CSS pixels
 * @param {string} [props.colorScheme='cyan'] - Digital LED color theme (cyan, amber, emerald, red)
 * @param {number} [props.smoothingSpeed=9.0] - Needle exponential interpolation speed
 * @param {function} [props.formatValue] - Optional custom value formatting function
 * @param {Array<{val: number, label: string}>} [props.customTickLabels] - Optional custom tick labels
 */
export function AnalogGauge({
  value = 0,
  min = 0,
  max = 100,
  title = '',
  unit = '',
  startAngle = -135,
  endAngle = 135,
  majorTicks = 5,
  minorTicksPerMajor = 4,
  warningZones = [],
  isWarningActive = false,
  enableVibration = false,
  size = 140,
  colorScheme = 'cyan',
  smoothingSpeed = 9.0,
  formatValue = null,
  customTickLabels = null,
  isBacklit = false,
  needleColor = 'orange',
}) {
  const canvasRef = useRef(null);

  // Persistent animation state refs
  const currentValRef = useRef(value);
  const targetValRef = useRef(value);
  const lastTimeRef = useRef(performance.now());
  const animFrameIdRef = useRef(null);
  const lastVibrateTimeRef = useRef(0);

  // Keep target value updated
  useEffect(() => {
    targetValRef.current = Math.max(min, Math.min(max, value));
  }, [value, min, max]);

  // Haptic feedback for mobile devices when entering warning state
  useEffect(() => {
    if (isWarningActive && enableVibration) {
      const tmp_now = performance.now();
      // Throttle vibration so it only fires at most once every 3.5 seconds
      if (tmp_now - lastVibrateTimeRef.current > 3500) {
        lastVibrateTimeRef.current = tmp_now;
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
          try {
            navigator.vibrate([70, 40, 70]);
          } catch {
            // Ignore if vibration permissions are restricted
          }
        }
      }
    }
  }, [isWarningActive, enableVibration]);

  // Main Canvas animation render loop
  useEffect(() => {
    const obj_canvas = canvasRef.current;
    if (!obj_canvas) return;

    const ctx = obj_canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    /**
     * Primary rendering frame function driven by requestAnimationFrame.
     */
    function fn_renderFrame(timestamp) {
      if (!isMounted) return;

      const tmp_dt = Math.min(0.1, (timestamp - lastTimeRef.current) / 1000);
      lastTimeRef.current = timestamp;

      // Exponential smoothing lerp: currentVal moves towards targetVal smoothly
      const tmp_target = targetValRef.current;
      const tmp_current = currentValRef.current;
      const tmp_diff = tmp_target - tmp_current;

      // Smooth step
      currentValRef.current += tmp_diff * (1 - Math.exp(-smoothingSpeed * tmp_dt));

      // Snap if very close
      if (Math.abs(tmp_target - currentValRef.current) < 0.005) {
        currentValRef.current = tmp_target;
      }

      // Draw the complete analog gauge on canvas
      fn_drawGauge(ctx, obj_canvas, currentValRef.current, timestamp);

      animFrameIdRef.current = requestAnimationFrame(fn_renderFrame);
    }

    lastTimeRef.current = performance.now();
    animFrameIdRef.current = requestAnimationFrame(fn_renderFrame);

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [
    min,
    max,
    title,
    unit,
    startAngle,
    endAngle,
    majorTicks,
    minorTicksPerMajor,
    warningZones,
    isWarningActive,
    size,
    colorScheme,
    smoothingSpeed,
    formatValue,
    customTickLabels,
    isBacklit,
    needleColor,
  ]);

  /**
   * Draws the complete multi-layer analog gauge on the 2D canvas context.
   * Dynamically tracks rendered client dimensions and scales backing store for razor sharpness.
   */
  function fn_drawGauge(ctx, canvas, curValue, timeMs) {
    const tmp_dpr = Math.max(window.devicePixelRatio || 1, 2);
    const tmp_clientW = canvas ? canvas.clientWidth : 0;
    const tmp_clientH = canvas ? canvas.clientHeight : 0;
    const tmp_dim = (tmp_clientW > 0 && tmp_clientH > 0 && tmp_clientW <= size * 2.0) ? Math.min(tmp_clientW, tmp_clientH) : size;

    // Ensure backing store matches device pixel ratio for razor sharpness
    const tmp_targetW = Math.round(tmp_dim * tmp_dpr);
    const tmp_targetH = Math.round(tmp_dim * tmp_dpr);
    if (canvas.width !== tmp_targetW || canvas.height !== tmp_targetH) {
      canvas.width = tmp_targetW;
      canvas.height = tmp_targetH;
    }

    ctx.save();
    ctx.scale(tmp_dpr, tmp_dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, tmp_dim, tmp_dim);

    const tmp_cx = tmp_dim / 2;
    const tmp_cy = tmp_dim / 2;
    const tmp_radius = (tmp_dim / 2) - 2;

    // 1. Outer Metallic Bezel Ring with machined metal gradient
    fn_drawBezel(ctx, tmp_cx, tmp_cy, tmp_radius, isWarningActive, timeMs);

    // 2. Recessed Dial Face with subtle radial depth
    const tmp_faceRadius = tmp_radius - 6;
    fn_drawDialFace(ctx, tmp_cx, tmp_cy, tmp_faceRadius);

    // 3. Colored Warning Arc Zones
    fn_drawWarningZones(ctx, tmp_cx, tmp_cy, tmp_faceRadius - 8);

    // 4. Tick Marks and Numeric Labels
    fn_drawTicksAndNumbers(ctx, tmp_cx, tmp_cy, tmp_faceRadius - 8, tmp_dim);

    // 5. Gauge Title and Measurement Unit Labels
    fn_drawLabels(ctx, tmp_cx, tmp_cy, tmp_faceRadius, tmp_dim);

    // 6. Digital LED Inset Readout
    fn_drawDigitalInset(ctx, tmp_cx, tmp_cy, tmp_faceRadius, curValue, tmp_dim);

    // 7. Mechanical Needle with subtle drop shadow
    fn_drawNeedle(ctx, tmp_cx, tmp_cy, tmp_faceRadius - 10, curValue, tmp_dim);

    // 8. Center Hub Brass Cap
    fn_drawCenterHub(ctx, tmp_cx, tmp_cy, tmp_dim);

    // 9. Convex Glass Cover Reflection Sheen & Specular Highlight
    fn_drawGlassSheen(ctx, tmp_cx, tmp_cy, tmp_faceRadius);

    ctx.restore();
  }

  /**
   * Draws the outer machined metallic ring with knurled bevel, screws, and warning glow.
   */
  function fn_drawBezel(ctx, cx, cy, radius, isWarning, timeMs) {
    ctx.save();

    // 1. Deep outer panel ambient occlusion shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.88)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 5;

    // 2. Heavy machined steel outer bezel with multi-stop brushed reflections
    const obj_outerGrad = ctx.createLinearGradient(
      cx - radius,
      cy - radius,
      cx + radius,
      cy + radius
    );
    obj_outerGrad.addColorStop(0, '#64748b'); // Specular light hit
    obj_outerGrad.addColorStop(0.25, '#334155');
    obj_outerGrad.addColorStop(0.5, '#475569');
    obj_outerGrad.addColorStop(0.75, '#1e293b');
    obj_outerGrad.addColorStop(1, '#0f172a'); // Shadowed bottom

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = obj_outerGrad;
    ctx.fill();

    ctx.restore();

    // 3. Crisp metallic outer rim highlight
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 0.75, 0, Math.PI * 2);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#94a3b8';
    ctx.stroke();

    // 4. Stepped inner metallic chamfer ring (beveled edge before glass)
    const tmp_innerBezelR = radius - 3.5;
    const obj_innerBezelGrad = ctx.createLinearGradient(
      cx,
      cy - tmp_innerBezelR,
      cx,
      cy + tmp_innerBezelR
    );
    obj_innerBezelGrad.addColorStop(0, '#0f172a'); // Inset top shadow
    obj_innerBezelGrad.addColorStop(0.5, '#1e293b');
    obj_innerBezelGrad.addColorStop(1, '#475569'); // Inset bottom bounce

    ctx.beginPath();
    ctx.arc(cx, cy, tmp_innerBezelR, 0, Math.PI * 2);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = obj_innerBezelGrad;
    ctx.stroke();

    // 5. Knurled / milled micro-groove ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 2, 0, Math.PI * 2);
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.stroke();
    ctx.restore();

    // 6. Warning alert rim pulse if active
    if (isWarning) {
      const tmp_pulse = (Math.sin(timeMs * 0.008) + 1) / 2; // 0 to 1
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 1.5, 0, Math.PI * 2);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.45 + tmp_pulse * 0.55})`;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10 + tmp_pulse * 8;
      ctx.stroke();
      ctx.restore();
    }

    // 7. Industrial slotted screw rivets (6 around circumference)
    const tmp_screwCount = 6;
    const tmp_screwDist = radius - 2.8;
    for (let tmp_i = 0; tmp_i < tmp_screwCount; tmp_i++) {
      const tmp_sa = (tmp_i / tmp_screwCount) * Math.PI * 2 + Math.PI / 6;
      const tmp_sx = cx + Math.cos(tmp_sa) * tmp_screwDist;
      const tmp_sy = cy + Math.sin(tmp_sa) * tmp_screwDist;

      // Rivet head
      ctx.beginPath();
      ctx.arc(tmp_sx, tmp_sy, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#cbd5e1';
      ctx.fill();

      // Rivet shadow edge
      ctx.beginPath();
      ctx.arc(tmp_sx, tmp_sy, 1.8, 0, Math.PI);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Slotted screw indentation
      const tmp_slotAngle = tmp_sa + 0.5;
      ctx.beginPath();
      ctx.moveTo(
        tmp_sx - Math.cos(tmp_slotAngle) * 1.2,
        tmp_sy - Math.sin(tmp_slotAngle) * 1.2
      );
      ctx.lineTo(
        tmp_sx + Math.cos(tmp_slotAngle) * 1.2,
        tmp_sy + Math.sin(tmp_slotAngle) * 1.2
      );
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  /**
   * Draws the recessed inner dial face with depth shading and micro-groove texture.
   */
  function fn_drawDialFace(ctx, cx, cy, radius) {
    ctx.save();

    // 1. Deep matte anthracite instrument face gradient
    const obj_faceGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    obj_faceGrad.addColorStop(0, '#151d2c');
    obj_faceGrad.addColorStop(0.65, '#0c121e');
    obj_faceGrad.addColorStop(0.92, '#070b13');
    obj_faceGrad.addColorStop(1, '#020408');

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = obj_faceGrad;
    ctx.fill();

    // 2. Concentric micro-grooves (phonograph/tachometer fine texture)
    ctx.lineWidth = 0.6;
    for (let r = radius * 0.25; r < radius * 0.95; r += radius * 0.12) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.022)';
      ctx.stroke();
    }

    // 3. Night electroluminescent instrument backlighting
    if (isBacklit) {
      const obj_backlightGrad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
      obj_backlightGrad.addColorStop(0, 'rgba(6, 182, 212, 0.24)');
      obj_backlightGrad.addColorStop(0.65, 'rgba(6, 182, 212, 0.12)');
      obj_backlightGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
      ctx.fillStyle = obj_backlightGrad;
      ctx.fill();
    }

    // 4. Inset bezel drop shadow ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = isBacklit ? '#0284c7' : '#0a0f18';
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Helper to convert scale value to angle in radians.
   */
  function fn_valToRad(v) {
    const tmp_norm = (v - min) / (max - min || 1);
    const tmp_deg = startAngle + tmp_norm * (endAngle - startAngle);
    return ((tmp_deg - 90) * Math.PI) / 180;
  }

  /**
   * Draws colored warning arc bands along the outer dial perimeter.
   */
  function fn_drawWarningZones(ctx, cx, cy, arcRadius) {
    if (!warningZones || warningZones.length === 0) return;

    ctx.save();
    for (let tmp_i = 0; tmp_i < warningZones.length; tmp_i++) {
      const obj_zone = warningZones[tmp_i];
      const tmp_startRad = fn_valToRad(obj_zone.start);
      const tmp_endRad = fn_valToRad(obj_zone.end);

      ctx.beginPath();
      ctx.arc(cx, cy, arcRadius, tmp_startRad, tmp_endRad);
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = obj_zone.color;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Draws calibrated major/minor tick marks and numeric labels.
   */
  function fn_drawTicksAndNumbers(ctx, cx, cy, arcRadius, gaugeDim = size) {
    ctx.save();

    const tmp_dim = gaugeDim || size;
    const tmp_totalMajor = majorTicks;
    const tmp_stepVal = (max - min) / tmp_totalMajor;
    const tmp_fontSize = Math.max(7.5, Math.round(tmp_dim * 0.082));

    ctx.font = `800 ${tmp_fontSize}px "Inter", "Montserrat", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let tmp_i = 0; tmp_i <= tmp_totalMajor; tmp_i++) {
      const tmp_majorVal = min + tmp_i * tmp_stepVal;
      const tmp_majorRad = fn_valToRad(tmp_majorVal);

      // Major Tick line
      const tmp_tickLength = Math.max(5, tmp_dim * 0.056);
      const tmp_x1 = cx + Math.cos(tmp_majorRad) * (arcRadius - tmp_tickLength);
      const tmp_y1 = cy + Math.sin(tmp_majorRad) * (arcRadius - tmp_tickLength);
      const tmp_x2 = cx + Math.cos(tmp_majorRad) * arcRadius;
      const tmp_y2 = cy + Math.sin(tmp_majorRad) * arcRadius;

      ctx.beginPath();
      ctx.moveTo(tmp_x1, tmp_y1);
      ctx.lineTo(tmp_x2, tmp_y2);
      ctx.lineWidth = Math.max(1.8, tmp_dim * 0.016);
      ctx.strokeStyle = '#ffffff';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Major Tick Label
      let tmp_label = Math.round(tmp_majorVal).toString();
      if (customTickLabels && customTickLabels[tmp_i] !== undefined) {
        tmp_label = customTickLabels[tmp_i].label;
      }

      const tmp_labelRadius = arcRadius - Math.max(9, tmp_dim * 0.11);
      const tmp_tx = cx + Math.cos(tmp_majorRad) * tmp_labelRadius;
      const tmp_ty = cy + Math.sin(tmp_majorRad) * tmp_labelRadius;

      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 3;
      ctx.fillText(tmp_label, tmp_tx, tmp_ty);
      ctx.shadowBlur = 0;

      // Minor Ticks between majors
      if (tmp_i < tmp_totalMajor) {
        for (let tmp_j = 1; tmp_j <= minorTicksPerMajor; tmp_j++) {
          const tmp_subVal = tmp_majorVal + (tmp_j / (minorTicksPerMajor + 1)) * tmp_stepVal;
          const tmp_subRad = fn_valToRad(tmp_subVal);

          const tmp_minTickLen = Math.max(2.5, tmp_dim * 0.030);
          const tmp_mx1 = cx + Math.cos(tmp_subRad) * (arcRadius - tmp_minTickLen);
          const tmp_my1 = cy + Math.sin(tmp_subRad) * (arcRadius - tmp_minTickLen);
          const tmp_mx2 = cx + Math.cos(tmp_subRad) * arcRadius;
          const tmp_my2 = cy + Math.sin(tmp_subRad) * arcRadius;

          ctx.beginPath();
          ctx.moveTo(tmp_mx1, tmp_my1);
          ctx.lineTo(tmp_mx2, tmp_my2);
          ctx.lineWidth = Math.max(1.2, tmp_dim * 0.010);
          ctx.strokeStyle = '#94a3b8';
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  /**
   * Draws title and unit labels.
   */
  function fn_drawLabels(ctx, cx, cy, radius, gaugeDim = size) {
    ctx.save();

    const tmp_dim = gaugeDim || size;
    // Instrument title - Crisp white uppercase
    const tmp_titleFontSize = Math.max(7.5, Math.round(tmp_dim * 0.078));
    ctx.font = `800 ${tmp_titleFontSize}px "Montserrat", "Inter", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 4;
    ctx.fillText(title, cx, cy - radius * 0.40);
    ctx.shadowBlur = 0;

    // Measurement unit - Crisp silver
    const tmp_unitFontSize = Math.max(6, Math.round(tmp_dim * 0.062));
    ctx.font = `700 ${tmp_unitFontSize}px "Inter", system-ui, sans-serif`;
    ctx.fillStyle = '#bae6fd';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 2;
    ctx.fillText(unit, cx, cy + radius * 0.64);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  /**
   * Draws the digital LED readout inset in the lower center.
   */
  function fn_drawDigitalInset(ctx, cx, cy, radius, curVal, gaugeDim = size) {
    ctx.save();

    const tmp_dim = gaugeDim || size;
    const tmp_insetY = cy + radius * 0.32;
    const tmp_insetWidth = tmp_dim * 0.40;
    const tmp_insetHeight = tmp_dim * 0.16;
    const tmp_rx = cx - tmp_insetWidth / 2;
    const tmp_ry = tmp_insetY - tmp_insetHeight / 2;

    // Recessed dark LED background box with subtle cyan border
    ctx.beginPath();
    ctx.roundRect(tmp_rx, tmp_ry, tmp_insetWidth, tmp_insetHeight, 4);
    ctx.fillStyle = '#030712';
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.stroke();

    // Determine LED color
    let tmp_ledColor = '#38bdf8';
    let tmp_glowColor = 'rgba(56, 189, 248, 0.9)';
    if (colorScheme === 'amber') {
      tmp_ledColor = '#f59e0b';
      tmp_glowColor = 'rgba(245, 158, 11, 0.9)';
    } else if (colorScheme === 'emerald') {
      tmp_ledColor = '#10b981';
      tmp_glowColor = 'rgba(16, 185, 129, 0.9)';
    } else if (colorScheme === 'red' || isWarningActive) {
      tmp_ledColor = '#ef4444';
      tmp_glowColor = 'rgba(239, 68, 68, 0.95)';
    }

    // Formatted digital text
    let tmp_text = formatValue ? formatValue(curVal) : Math.round(curVal).toString();

    const tmp_fontSize = Math.max(9.5, Math.round(tmp_dim * 0.125));
    ctx.font = `800 ${tmp_fontSize}px "Montserrat", "Inter", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glowing digital LED numerals
    ctx.shadowColor = tmp_glowColor;
    ctx.shadowBlur = 8;
    ctx.fillStyle = tmp_ledColor;
    ctx.fillText(tmp_text, cx, tmp_insetY);

    ctx.restore();
  }

  /**
   * Draws the mechanical tapered needle with dynamic angular shadow, vibrant enamel, and white tip.
   */
  function fn_drawNeedle(ctx, cx, cy, needleLength, curVal, gaugeDim = size) {
    const tmp_dim = gaugeDim || size;
    const tmp_rad = fn_valToRad(curVal);

    ctx.save();

    // 1. Dynamic angle-aware drop shadow cast across the recessed dial face
    const tmp_shadowDist = Math.max(2, tmp_dim * 0.022);
    const tmp_shadowAngle = tmp_rad - Math.PI / 4;
    const tmp_shadowOffsetX = Math.cos(tmp_shadowAngle) * tmp_shadowDist;
    const tmp_shadowOffsetY = Math.sin(tmp_shadowAngle) * tmp_shadowDist + 1.5;

    ctx.save();
    ctx.translate(cx + tmp_shadowOffsetX, cy + tmp_shadowOffsetY);
    ctx.rotate(tmp_rad + Math.PI / 2);
    const tmp_w = Math.max(2.4, tmp_dim * 0.026);
    const tmp_tail = needleLength * 0.24;

    ctx.beginPath();
    ctx.moveTo(-tmp_w * 0.5, 0);
    ctx.lineTo(-tmp_w * 0.2, -needleLength);
    ctx.lineTo(0, -needleLength - 3.5);
    ctx.lineTo(tmp_w * 0.2, -needleLength);
    ctx.lineTo(tmp_w * 0.5, 0);
    ctx.lineTo(tmp_w * 0.75, tmp_tail);
    ctx.lineTo(-tmp_w * 0.75, tmp_tail);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
    ctx.filter = 'blur(1.5px)';
    ctx.fill();
    ctx.restore();

    // 2. Draw actual needle body
    ctx.translate(cx, cy);
    ctx.rotate(tmp_rad + Math.PI / 2); // 0 degrees points straight up

    const tmp_tipLen = needleLength * 0.28;
    const tmp_mainLen = needleLength - tmp_tipLen;

    const obj_needleGrad = ctx.createLinearGradient(-tmp_w * 0.5, 0, tmp_w * 0.5, 0);
    let tmp_tipColor = '#ffffff';

    if (needleColor === 'green') {
      obj_needleGrad.addColorStop(0, '#15803d');
      obj_needleGrad.addColorStop(0.35, '#22c55e');
      obj_needleGrad.addColorStop(0.65, '#4ade80');
      obj_needleGrad.addColorStop(1, '#166534');
      tmp_tipColor = '#bbf7d0';
    } else {
      // High-visibility orange enamel needle matching reference speedometer & PSI gauges
      obj_needleGrad.addColorStop(0, '#c2410c');
      obj_needleGrad.addColorStop(0.35, '#ea580c');
      obj_needleGrad.addColorStop(0.65, '#f97316');
      obj_needleGrad.addColorStop(1, '#9a3412');
      tmp_tipColor = '#ffedd5';
    }

    ctx.beginPath();
    ctx.moveTo(-tmp_w * 0.5, 0);
    ctx.lineTo(-tmp_w * 0.25, -tmp_mainLen);
    ctx.lineTo(tmp_w * 0.25, -tmp_mainLen);
    ctx.lineTo(tmp_w * 0.5, 0);
    ctx.closePath();
    ctx.fillStyle = obj_needleGrad;
    ctx.fill();

    // Pointer tip
    ctx.beginPath();
    ctx.moveTo(-tmp_w * 0.25, -tmp_mainLen);
    ctx.lineTo(0, -needleLength - 3.5);
    ctx.lineTo(tmp_w * 0.25, -tmp_mainLen);
    ctx.closePath();
    ctx.fillStyle = tmp_tipColor;
    ctx.fill();

    // Counterweight tail (gunmetal with bevel)
    ctx.beginPath();
    ctx.moveTo(-tmp_w * 0.5, 0);
    ctx.lineTo(-tmp_w * 0.8, tmp_tail);
    ctx.lineTo(tmp_w * 0.8, tmp_tail);
    ctx.lineTo(tmp_w * 0.5, 0);
    ctx.closePath();
    const obj_tailGrad = ctx.createLinearGradient(-tmp_w * 0.8, 0, tmp_w * 0.8, 0);
    obj_tailGrad.addColorStop(0, '#1e293b');
    obj_tailGrad.addColorStop(0.5, '#475569');
    obj_tailGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = obj_tailGrad;
    ctx.fill();

    // Needle spine ridge highlight line
    ctx.beginPath();
    ctx.moveTo(0, tmp_tail * 0.8);
    ctx.lineTo(0, -needleLength);
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draws the central machined brass/metallic hub cap.
   */
  function fn_drawCenterHub(ctx, cx, cy, gaugeDim = size) {
    ctx.save();

    const tmp_dim = gaugeDim || size;
    const tmp_hubRadius = Math.max(5.5, tmp_dim * 0.07);

    // Hub drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2.5;

    // Outer machined gunmetal bezel ring
    const obj_hubGrad = ctx.createRadialGradient(
      cx - tmp_hubRadius * 0.35,
      cy - tmp_hubRadius * 0.35,
      0,
      cx,
      cy,
      tmp_hubRadius
    );
    obj_hubGrad.addColorStop(0, '#e2e8f0');
    obj_hubGrad.addColorStop(0.3, '#94a3b8');
    obj_hubGrad.addColorStop(0.7, '#475569');
    obj_hubGrad.addColorStop(1, '#1e293b');

    ctx.beginPath();
    ctx.arc(cx, cy, tmp_hubRadius, 0, Math.PI * 2);
    ctx.fillStyle = obj_hubGrad;
    ctx.fill();

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    // Center brass pivot rivet
    ctx.beginPath();
    ctx.arc(cx, cy, tmp_hubRadius * 0.45, 0, Math.PI * 2);
    const obj_brassGrad = ctx.createRadialGradient(
      cx - 1,
      cy - 1,
      0,
      cx,
      cy,
      tmp_hubRadius * 0.45
    );
    obj_brassGrad.addColorStop(0, '#fde047');
    obj_brassGrad.addColorStop(0.6, '#ca8a04');
    obj_brassGrad.addColorStop(1, '#713f12');
    ctx.fillStyle = obj_brassGrad;
    ctx.fill();

    // Micro pivot dot
    ctx.beginPath();
    ctx.arc(cx, cy, 1, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draws the multi-layer glossy convex glass cover with curved specular highlight,
   * diagonal glare streak, and bottom bounce reflection.
   */
  function fn_drawGlassSheen(ctx, cx, cy, radius) {
    ctx.save();

    // 1. Transparent dark glass tint overlay
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(6, 11, 20, 0.12)';
    ctx.fill();

    // 2. Curved elliptical specular highlight (convex glass dome reflection)
    const obj_crescentGrad = ctx.createLinearGradient(
      cx - radius * 0.5,
      cy - radius,
      cx + radius * 0.3,
      cy + radius * 0.1
    );
    obj_crescentGrad.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
    obj_crescentGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.18)');
    obj_crescentGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.03)');
    obj_crescentGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    ctx.beginPath();
    ctx.ellipse(
      cx - radius * 0.12,
      cy - radius * 0.42,
      radius * 0.78,
      radius * 0.38,
      -Math.PI / 10,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = obj_crescentGrad;
    ctx.fill();

    // 3. Diagonal ambient glare streak
    const obj_glassGrad = ctx.createLinearGradient(
      cx - radius,
      cy - radius,
      cx + radius,
      cy + radius
    );
    obj_glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    obj_glassGrad.addColorStop(0.28, 'rgba(255, 255, 255, 0.05)');
    obj_glassGrad.addColorStop(0.48, 'rgba(255, 255, 255, 0.00)');
    obj_glassGrad.addColorStop(0.72, 'rgba(255, 255, 255, 0.02)');
    obj_glassGrad.addColorStop(0.9, 'rgba(255, 255, 255, 0.12)');
    obj_glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.20)');

    ctx.beginPath();
    ctx.arc(cx, cy, radius - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = obj_glassGrad;
    ctx.fill();

    // 4. Subtle circular lens edge reflection
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();

    ctx.restore();
  }

  return (
    <div
      className={`analog-gauge ${isWarningActive ? 'analog-gauge--warning-active' : ''}`}
      style={{
        width: `calc(${size}px * var(--gaugeScale))`,
        height: `calc(${size}px * var(--gaugeScale))`,
        maxWidth: `calc(${size}px * var(--gaugeScale))`,
        maxHeight: `calc(${size}px * var(--gaugeScale))`,
        minWidth: '50px',
        minHeight: '50px',
        flexShrink: 0,
        aspectRatio: '1 / 1',
      }}
      title={`${title}: ${value} ${unit}`}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}

export default AnalogGauge;
