/**
 * WheelAssembly.js
 * High-detail railway bogie truck component managing cast-steel sideframes,
 * spring-damper suspension travel, brake shoes, wheel rims, and velocity-coupled wheelsets.
 */

import { TrainComponent } from './TrainComponent.js';
import { drawRoundedRect } from '../../../utils/CanvasUtils.js';

export class WheelAssembly extends TrainComponent {
  /**
   * Initializes bogie dimensions, wheel count, wheel radius, and suspension spring physics.
   */
  constructor(name = 'bogie', wheelCount = 3, wheelRadius = 15.5) {
    super(name);
    this.wheelCount = wheelCount;
    this.wheelRadius = wheelRadius;
    this.wheelSpacing = 36;
    this.wheelRotationAngle = 0;

    // Suspension spring-damper parameters
    this.suspensionDeflection = 0; // Current vertical compression in pixels
    this.suspensionVelocity = 0;
    this.springStiffness = 65.0; // Spring constant k
    this.springDamping = 12.0;   // Damping constant c
  }

  /**
   * Updates wheel rotation based on linear velocity and simulates suspension spring oscillation.
   */
  update(deltaTime, velocityMps, isUnderLoad = false) {
    super.update(deltaTime, velocityMps, isUnderLoad);

    // 1. Wheel rotation derived from linear train velocity: dTheta = (v * dt) / R
    const cons_PPM = 32;
    const tmp_distPixels = velocityMps * cons_PPM * deltaTime;
    this.wheelRotationAngle += tmp_distPixels / this.wheelRadius;

    // 2. Harmonic spring-damper suspension dynamics: a = -k*x - c*v
    // Add road noise / track bump input proportional to speed
    const tmp_bumpForce = Math.abs(velocityMps) > 0.5 ? (Math.random() - 0.5) * 8.0 * (Math.abs(velocityMps) / 20) : 0;
    const tmp_springForce = -this.springStiffness * this.suspensionDeflection;
    const tmp_dampingForce = -this.springDamping * this.suspensionVelocity;
    const tmp_accel = tmp_springForce + tmp_dampingForce + tmp_bumpForce;

    this.suspensionVelocity += tmp_accel * deltaTime;
    this.suspensionDeflection += this.suspensionVelocity * deltaTime;

    // Clamp suspension travel (-6px to +6px)
    this.suspensionDeflection = Math.max(-6, Math.min(6, this.suspensionDeflection));
  }

  /**
   * Renders the complete bogie truck: brake shoes, wheels, rims, coil springs, and sideframe.
   */
  render(ctx, options = {}) {
    if (!this.visibility) return;
    this.applyTransform(ctx);

    const tmp_count = this.wheelCount;
    const tmp_spacing = this.wheelSpacing;
    const tmp_startOffsetX = -(tmp_count - 1) * tmp_spacing * 0.5;
    const tmp_r = this.wheelRadius;

    // Dynamic suspension vertical offset
    const tmp_suspY = this.suspensionDeflection;

    // 1. Heavy cast-steel bogie sideframe
    ctx.save();
    ctx.translate(0, tmp_suspY);

    const tmp_frameWidth = (tmp_count - 1) * tmp_spacing + 36;
    const tmp_leftX = tmp_startOffsetX - 18;

    // Top beam of cast-steel bogie sideframe
    ctx.fillStyle = '#1e293b'; // Charcoal dark cast steel
    drawRoundedRect(ctx, tmp_leftX, -tmp_r - 10, tmp_frameWidth, 12, 3);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Central bolster suspension post
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-8, -tmp_r - 14, 16, 6);

    // Axle pedestals and journal box housings over each axle
    for (let tmp_i = 0; tmp_i < tmp_count; tmp_i++) {
      const tmp_wx = tmp_startOffsetX + tmp_i * tmp_spacing;
      // Pedestal guide horns
      ctx.fillStyle = '#334155';
      ctx.fillRect(tmp_wx - 10, -tmp_r - 4, 3, 9);
      ctx.fillRect(tmp_wx + 7, -tmp_r - 4, 3, 9);

      // Heavy journal box housing
      ctx.fillStyle = '#1e293b';
      drawRoundedRect(ctx, tmp_wx - 7, -tmp_r - 2, 14, 9, 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Equalizer beam bar linking the journal boxes
    ctx.fillStyle = '#334155';
    ctx.fillRect(tmp_startOffsetX - 14, -tmp_r + 3, (tmp_count - 1) * tmp_spacing + 28, 4);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.0;
    ctx.strokeRect(tmp_startOffsetX - 14, -tmp_r + 3, (tmp_count - 1) * tmp_spacing + 28, 4);

    // 2. Coil suspension springs over each axle
    const springColor = tmp_count === 2 ? '#65a30d' : '#64748b'; // Lime-green/yellow for LHB coach bogies matching Image
    for (let tmp_i = 0; tmp_i < tmp_count; tmp_i++) {
      const tmp_wx = tmp_startOffsetX + tmp_i * tmp_spacing;
      this.renderCoilSpring(ctx, tmp_wx, -tmp_r - 3, 11, 8 - tmp_suspY * 0.4, springColor);
    }

    // Secondary central bolster suspension spring for 2-axle LHB bogies
    if (tmp_count === 2) {
      this.renderCoilSpring(ctx, 0, -tmp_r - 5, 13, 9 - tmp_suspY * 0.5, '#eab308');
    }

    // Brake shoe calipers clasping each wheel
    for (let tmp_i = 0; tmp_i < tmp_count; tmp_i++) {
      const tmp_wx = tmp_startOffsetX + tmp_i * tmp_spacing;
      ctx.fillStyle = '#475569';
      ctx.fillRect(tmp_wx - tmp_r - 2, -tmp_r - 1, 3, 8);
      ctx.fillRect(tmp_wx + tmp_r - 1, -tmp_r - 1, 3, 8);
    }

    ctx.restore();

    // 3. Rotating steel wheelsets (remain on track surface)
    for (let tmp_i = 0; tmp_i < tmp_count; tmp_i++) {
      const tmp_wx = tmp_startOffsetX + tmp_i * tmp_spacing;
      this.renderSingleWheel(ctx, tmp_wx, -tmp_r + 2, tmp_r, this.wheelRotationAngle);
    }

    this.restoreTransform(ctx);
  }

  /**
   * Renders a coiled helical steel suspension spring with compression.
   */
  renderCoilSpring(ctx, x, y, width, height, color = '#64748b') {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x - width * 0.4, y);
    const tmp_coils = 4;
    const tmp_coilH = height / tmp_coils;
    for (let tmp_c = 0; tmp_c < tmp_coils; tmp_c++) {
      const tmp_cy = y - tmp_c * tmp_coilH;
      ctx.lineTo(x + width * 0.4, tmp_cy - tmp_coilH * 0.5);
      ctx.lineTo(x - width * 0.4, tmp_cy - tmp_coilH);
    }
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Renders a single heavy railway steel wheel with beveled rim, flange, recessed web, and rotating spokes.
   */
  renderSingleWheel(ctx, cx, cy, radius, rotation) {
    ctx.save();
    ctx.translate(cx, cy);

    // Outer wheel tire & rim
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Polished steel tread contact shine (rim sheen)
    ctx.beginPath();
    ctx.arc(0, 0, radius - 1, 0, Math.PI * 2);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Wheel flange lip
    ctx.beginPath();
    ctx.arc(0, 0, radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Recessed wheel center dish
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // Rotating wheel inspection holes / spokes
    ctx.rotate(rotation);
    ctx.fillStyle = '#0f172a';
    for (let tmp_sp = 0; tmp_sp < 4; tmp_sp++) {
      ctx.beginPath();
      const tmp_ang = (tmp_sp * Math.PI) / 2;
      ctx.arc(Math.cos(tmp_ang) * (radius * 0.45), Math.sin(tmp_ang) * (radius * 0.45), 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Axle roller bearing journal box cap with center bolt
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.restore();
  }
}
