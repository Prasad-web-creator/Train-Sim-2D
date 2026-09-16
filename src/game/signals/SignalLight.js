/**
 * SignalLight.js
 * Represents an individual optical lamp unit on a railway signal head.
 * Features incandescent filament heating/cooling curves, Fresnel lens cores, and animated glow halos.
 */

import { clamp, lerp } from '../../utils/MathUtils.js';

export class SignalLight {
  /**
   * Initializes a single optical signal lamp with color, position, and filament dynamics.
   * 
   * @param {string} color - Lamp color ('red' | 'yellow' | 'green')
   * @param {number} [slotIndex=0] - Vertical slot index on signal head
   */
  constructor(color, slotIndex = 0) {
    this.color = color;
    this.slotIndex = slotIndex;
    this.isOn = false;
    this.isFlashing = false;
    this.brightness = 0.0; // 0 (cold filament) to 1.0 (fully incandescent)
    this.flashTimer = 0.0;
    this.flashVisible = true;

    // Optical color configurations
    if (color === 'red') {
      this.hexColor = '#ef4444';
      this.glowPrefix = 'rgba(239, 68, 68,';
      this.unlitColor = '#3f1515';
    } else if (color === 'yellow') {
      this.hexColor = '#f59e0b';
      this.glowPrefix = 'rgba(245, 158, 11,';
      this.unlitColor = '#3b2910';
    } else { // green
      this.hexColor = '#22c55e';
      this.glowPrefix = 'rgba(34, 197, 94,';
      this.unlitColor = '#10331e';
    }
  }

  /**
   * Illuminates this lamp unit, optionally in a flashing call-on/warning cadence.
   */
  turnOn(isFlashing = false) {
    this.isOn = true;
    this.isFlashing = isFlashing;
  }

  /**
   * Extinguishes this lamp unit.
   */
  turnOff() {
    this.isOn = false;
    this.isFlashing = false;
  }

  /**
   * Updates lamp filament temperature transition and flash cadence.
   */
  update(deltaTime) {
    const cons_DT = clamp(deltaTime, 0.001, 0.1);

    // Handle flashing cadence (1.2 Hz)
    if (this.isOn && this.isFlashing) {
      this.flashTimer += cons_DT;
      if (this.flashTimer >= 0.42) {
        this.flashTimer = 0;
        this.flashVisible = !this.flashVisible;
      }
    } else {
      this.flashVisible = true;
    }

    const tmp_targetBrightness = (this.isOn && this.flashVisible) ? 1.0 : 0.0;

    // Incandescent bulb thermal simulation: fast heating (22/s), realistic cooling (10/s)
    const tmp_speed = tmp_targetBrightness > this.brightness ? 22.0 : 10.0;
    this.brightness = lerp(this.brightness, tmp_targetBrightness, cons_DT * tmp_speed);
    if (this.brightness < 0.005) this.brightness = 0;
  }

  /**
   * Renders the optical lamp: hood visor, lens casing, hot core, and radiant halo.
   * Modulates optical Fresnel glow halo by time-of-day haloMultiplier (pierces darkness at night).
   */
  render(ctx, x, y, radius = 3.5, pulseFactor = 1.0, haloMultiplier = 1.0) {
    // 1. Radiant Atmospheric Glow Halo (drawn behind the visor/casing when illuminated)
    if (this.brightness > 0.02) {
      const tmp_haloRadius = (radius * 4.2) * pulseFactor * this.brightness * haloMultiplier;
      if (tmp_haloRadius > 2.0) {
        const tmp_coreAlpha = Math.min(0.95, 0.78 * this.brightness * pulseFactor * Math.min(1.35, haloMultiplier));
        const tmp_midAlpha = Math.min(0.55, 0.35 * this.brightness * pulseFactor * Math.min(1.2, haloMultiplier));
        const tmp_haloGrad = ctx.createRadialGradient(x, y, radius * 0.4, x, y, tmp_haloRadius);
        tmp_haloGrad.addColorStop(0, `${this.glowPrefix} ${tmp_coreAlpha})`);
        tmp_haloGrad.addColorStop(0.35, `${this.glowPrefix} ${tmp_midAlpha})`);
        tmp_haloGrad.addColorStop(1, `${this.glowPrefix} 0)`);

        ctx.fillStyle = tmp_haloGrad;
        ctx.beginPath();
        ctx.arc(x, y, tmp_haloRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Beveled circular lens casing and blackened recessed well
    ctx.beginPath();
    ctx.arc(x, y, radius + 0.8, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 3. Colored Glass Optical Lens (Fresnel rings & incandescent hot core)
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (this.brightness > 0.02) {
      // Lit lens with multi-stop radial gradient for optical depth
      const tmp_lensGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      tmp_lensGrad.addColorStop(0, '#ffffff');
      tmp_lensGrad.addColorStop(0.28, this.hexColor);
      tmp_lensGrad.addColorStop(0.85, this.hexColor);
      tmp_lensGrad.addColorStop(1, '#020617');

      ctx.fillStyle = tmp_lensGrad;
      ctx.globalAlpha = 0.45 + this.brightness * 0.55;
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Concentric inner Fresnel optic ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.55, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Unlit dark tinted Fresnel glass with realistic concentric rings and reflection
      ctx.fillStyle = this.unlitColor;
      ctx.fill();

      // Outer and inner Fresnel prism rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, radius * 0.32, 0, Math.PI * 2);
      ctx.stroke();

      // Specular curved glint on glass dome
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.beginPath();
      ctx.arc(x - radius * 0.35, y - radius * 0.35, radius * 0.24, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Protruding 3D Metal Sun Visor / Hood (Eyebrow cowl projecting over lens)
    // Underside deep shadow
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(x, y - 0.2, radius + 1.2, Math.PI * 1.08, Math.PI * -0.08);
    ctx.lineTo(x + radius + 1.2, y + 1.2);
    ctx.arc(x, y + 0.6, radius + 0.6, 0, Math.PI, true);
    ctx.lineTo(x - radius - 1.2, y + 1.2);
    ctx.closePath();
    ctx.fill();

    // Top metal cowl visor hood with metallic highlight rim
    ctx.beginPath();
    ctx.arc(x, y - 0.4, radius + 1.8, Math.PI * 1.05, Math.PI * -0.05);
    ctx.lineTo(x + radius + 1.6, y + 1.0);
    ctx.arc(x, y + 0.2, radius + 1.0, 0, Math.PI, true);
    ctx.lineTo(x - radius - 1.6, y + 1.0);
    ctx.closePath();

    const tmp_hoodGrad = ctx.createLinearGradient(x - radius, y - radius, x + radius, y);
    tmp_hoodGrad.addColorStop(0, '#475569');
    tmp_hoodGrad.addColorStop(0.4, '#1e293b');
    tmp_hoodGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = tmp_hoodGrad;
    ctx.fill();

    // Exterior highlight edge line on hood rim
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(x, y - 0.4, radius + 1.8, Math.PI * 1.05, Math.PI * -0.05);
    ctx.stroke();
  }
}

export default SignalLight;
