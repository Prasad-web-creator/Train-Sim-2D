/**
 * RailSignal.js
 * Physical trackside railway signal entity positioned by world track distance.
 * Features 4-aspect optical signal head (Upper Yellow, Green, Lower Yellow, Red),
 * steel lattice/tubular mast, access ladder rungs, equipment relay box, and ID plate.
 */

import { SignalLight } from './SignalLight.js';
import {
  cons_SIGNAL_STATES,
  cons_SIGNAL_TYPES,
  cons_SIGNAL_ADVISORY_SPEEDS,
} from './SignalConstants.js';
import { drawRoundedRect } from '../../utils/CanvasUtils.js';

export class RailSignal {
  /**
   * Initializes a trackside railway signal.
   * 
   * @param {Object} options
   * @param {string} options.id - Unique signal ID
   * @param {string} [options.name] - Human-readable nameplate designation
   * @param {number} options.trackDistMeters - Track position in meters
   * @param {string} [options.state='GREEN'] - Initial signal aspect
   * @param {string} [options.type='mast'] - Mounting type ('mast', 'gantry', 'dwarf')
   */
  constructor({
    id,
    name = '',
    trackDistMeters,
    state = cons_SIGNAL_STATES.GREEN,
    type = cons_SIGNAL_TYPES.MAST,
  }) {
    this.id = id;
    this.name = name || id.replace('sig_', 'SIG ').toUpperCase();
    this.trackDistMeters = trackDistMeters;
    this.type = type;
    this.state = state;
    this.speedLimitKmh = cons_SIGNAL_ADVISORY_SPEEDS[state] || 999;

    // Crossing state tracking
    this.isPassed = false;
    this.isPassedAtDanger = false;
    this.passedSpeedKmh = 0;

    // 3-Aspect Signal Head Configuration (Green, Yellow, Red only):
    // Slot 0: Green (Top)
    // Slot 1: Yellow (Middle)
    // Slot 2: Red (Bottom)
    this.arr_lights = [
      new SignalLight('green', 0),
      new SignalLight('yellow', 1),
      new SignalLight('red', 2),
    ];

    // Configure initial lamps
    this.setAspect(state);
  }

  /**
   * Sets the signal aspect state and activates corresponding optical lamps.
   * 
   * @param {string} newState - One of RED, YELLOW, GREEN, OFF
   */
  setAspect(newState) {
    this.state = newState;
    this.speedLimitKmh = cons_SIGNAL_ADVISORY_SPEEDS[newState] ?? 999;

    // Extinguish all lamps first
    for (let tmp_i = 0; tmp_i < this.arr_lights.length; tmp_i++) {
      this.arr_lights[tmp_i].turnOff();
    }

    switch (newState) {
      case cons_SIGNAL_STATES.RED:
        // Only Red (slot 2)
        this.arr_lights[2].turnOn();
        break;

      case cons_SIGNAL_STATES.YELLOW:
      case cons_SIGNAL_STATES.DOUBLE_YELLOW:
        // Only Yellow (slot 1)
        this.arr_lights[1].turnOn();
        break;

      case cons_SIGNAL_STATES.GREEN:
        // Only Green (slot 0)
        this.arr_lights[0].turnOn();
        break;

      case cons_SIGNAL_STATES.OFF:
      default:
        // All lamps dark
        break;
    }
  }

  /**
   * Updates lamp filament transitions and optical flare timing.
   */
  update(deltaTime) {
    for (let tmp_i = 0; tmp_i < this.arr_lights.length; tmp_i++) {
      this.arr_lights[tmp_i].update(deltaTime);
    }
  }

  /**
   * Renders the complete 2D signal structure at specified world coordinates.
   */
  render(ctx, x, groundY, haloMultiplier = 1.0) {
    ctx.save();

    const tmp_mastH = 84;
    const tmp_headY = groundY - tmp_mastH;
    const tmp_pulse = 0.88 + Math.sin(Date.now() * 0.006) * 0.12;

    if (this.type === cons_SIGNAL_TYPES.MAST) {
      // ====================================================
      // 1. REINFORCED CONCRETE PLINTH FOUNDATION (Continuous ground bed)
      // ====================================================
      // Sub-surface concrete foundation block extending deep into ballast
      ctx.fillStyle = '#475569';
      ctx.fillRect(x - 12, groundY - 1, 35, 16);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.0;
      ctx.strokeRect(x - 12, groundY - 1, 35, 16);

      // Beveled concrete plinth top cap
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x - 13, groundY - 3, 37, 3);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(x - 13, groundY - 3, 37, 3);

      // Cast-steel mast base anchor flange plate
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - 5, groundY - 5, 10, 2.5);
      // Anchor bolt nuts
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x - 4, groundY - 6, 1.5, 1.5);
      ctx.fillRect(x + 2.5, groundY - 6, 1.5, 1.5);

      // ====================================================
      // 2. GALVANIZED APPARATUS RELAY CABINET (Loc Box on plinth)
      // ====================================================
      const tmp_cabX = x + 7;
      const tmp_cabW = 15;
      const tmp_cabH = 24;
      const tmp_cabY = groundY - 3 - tmp_cabH; // Sits firmly on concrete plinth

      // Cabinet main housing with galvanized steel vertical gradient
      const tmp_cabGrad = ctx.createLinearGradient(tmp_cabX, tmp_cabY, tmp_cabX + tmp_cabW, tmp_cabY + tmp_cabH);
      tmp_cabGrad.addColorStop(0, '#94a3b8');
      tmp_cabGrad.addColorStop(0.5, '#64748b');
      tmp_cabGrad.addColorStop(1, '#475569');
      ctx.fillStyle = tmp_cabGrad;
      ctx.fillRect(tmp_cabX, tmp_cabY, tmp_cabW, tmp_cabH);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.9;
      ctx.strokeRect(tmp_cabX, tmp_cabY, tmp_cabW, tmp_cabH);

      // Weather-sloped rain roof overhang
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(tmp_cabX - 1, tmp_cabY);
      ctx.lineTo(tmp_cabX + 7.5, tmp_cabY - 2.5);
      ctx.lineTo(tmp_cabX + tmp_cabW + 1, tmp_cabY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Dual-door center seam line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(tmp_cabX + 7.5, tmp_cabY + 1);
      ctx.lineTo(tmp_cabX + 7.5, tmp_cabY + tmp_cabH - 1);
      ctx.stroke();

      // Industrial padlock latch & T-handle
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(tmp_cabX + 6.5, tmp_cabY + 11, 2, 3);
      ctx.fillStyle = '#f59e0b'; // Brass padlock
      ctx.fillRect(tmp_cabX + 6.8, tmp_cabY + 14, 1.4, 2);

      // Stamped ventilation louvers with shadow
      ctx.fillStyle = '#334155';
      ctx.fillRect(tmp_cabX + 2.5, tmp_cabY + 4, 10, 1.2);
      ctx.fillRect(tmp_cabX + 2.5, tmp_cabY + 6.5, 10, 1.2);

      // Flexible cabling conduit pipe from cabinet into mast base
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(tmp_cabX, groundY - 5);
      ctx.quadraticCurveTo(x + 3, groundY - 6, x + 2, groundY - 5);
      ctx.stroke();

      // ====================================================
      // 3. TUBULAR STEEL SIGNAL MAST POST
      // ====================================================
      const tmp_mastGrad = ctx.createLinearGradient(x - 2, 0, x + 2, 0);
      tmp_mastGrad.addColorStop(0, '#e2e8f0');
      tmp_mastGrad.addColorStop(0.45, '#94a3b8');
      tmp_mastGrad.addColorStop(1, '#475569');
      ctx.fillStyle = tmp_mastGrad;
      ctx.fillRect(x - 2, tmp_headY + 34, 4, tmp_mastH - 39);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(x - 2, tmp_headY + 34, 4, tmp_mastH - 39);

      // ====================================================
      // 4. CONTINUOUS DUAL-STRINGER ACCESS LADDER
      // ====================================================
      const tmp_ladderTopY = tmp_headY + 34;
      const tmp_ladderBottomY = groundY - 4;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      // Left vertical rail stringer
      ctx.moveTo(x - 8, tmp_ladderBottomY);
      ctx.lineTo(x - 8, tmp_ladderTopY);
      // Right vertical rail stringer
      ctx.moveTo(x - 4, tmp_ladderBottomY);
      ctx.lineTo(x - 4, tmp_ladderTopY);
      // Horizontal rungs evenly spaced every 6px
      for (let tmp_ly = tmp_ladderBottomY - 4; tmp_ly > tmp_ladderTopY + 2; tmp_ly -= 6) {
        ctx.moveTo(x - 8, tmp_ly);
        ctx.lineTo(x - 4, tmp_ly);
      }
      // Structural standoff bracket connecting ladder to mast
      ctx.moveTo(x - 4, groundY - 24);
      ctx.lineTo(x - 2, groundY - 24);
      ctx.moveTo(x - 4, groundY - 52);
      ctx.lineTo(x - 2, groundY - 52);
      ctx.stroke();

      // ====================================================
      // 5. STEEL TECHNICIAN SERVICE PLATFORM (Under signal head)
      // ====================================================
      const tmp_platY = tmp_headY + 34;
      // Diamond grating walkway deck
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - 10, tmp_platY, 20, 2.8);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(x - 10, tmp_platY, 20, 2.8);

      // Under-deck cantilever diagonal support brackets
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(x - 9, tmp_platY + 2.8);
      ctx.lineTo(x - 2, tmp_platY + 9);
      ctx.moveTo(x + 9, tmp_platY + 2.8);
      ctx.lineTo(x + 2, tmp_platY + 9);
      ctx.stroke();

      // Side safety handrail stanchions (positioned beside head without obstructing front)
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      // Left safety post
      ctx.moveTo(x - 10, tmp_platY);
      ctx.lineTo(x - 10, tmp_platY - 10);
      // Right safety post
      ctx.moveTo(x + 10, tmp_platY);
      ctx.lineTo(x + 10, tmp_platY - 10);
      ctx.stroke();

      // ====================================================
      // 6. IDENTIFICATION NAMEPLATE (SIG XX - Centered & Enamelled)
      // ====================================================
      const tmp_plateW = 26;
      const tmp_plateH = 11;
      const tmp_plateX = x - tmp_plateW * 0.5;
      const tmp_plateY = tmp_headY + 45;

      // Heavy mounting clamp bracket onto mast
      ctx.fillStyle = '#334155';
      ctx.fillRect(x - 4, tmp_plateY + 3, 8, 5);

      // White enameled metal nameplate badge
      ctx.fillStyle = '#f8fafc';
      drawRoundedRect(ctx, tmp_plateX, tmp_plateY, tmp_plateW, tmp_plateH, 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Corner mounting screw rivets
      ctx.fillStyle = '#64748b';
      ctx.fillRect(tmp_plateX + 1.5, tmp_plateY + 1.5, 1, 1);
      ctx.fillRect(tmp_plateX + tmp_plateW - 2.5, tmp_plateY + 1.5, 1, 1);
      ctx.fillRect(tmp_plateX + 1.5, tmp_plateY + tmp_plateH - 2.5, 1, 1);
      ctx.fillRect(tmp_plateX + tmp_plateW - 2.5, tmp_plateY + tmp_plateH - 2.5, 1, 1);

      // Crisp bold centered identification lettering
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 6.5px "Montserrat", "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.name, x, tmp_plateY + tmp_plateH * 0.5 + 0.5);
    }

    // ====================================================
    // 7. 3-ASPECT SIGNAL HEAD (GREEN, YELLOW, RED ONLY)
    // ====================================================
    const tmp_headW = 16;
    const tmp_headH = 34; // Perfectly compact for 3 optical units
    const tmp_headX = x - tmp_headW * 0.5;
    const tmp_headTopY = tmp_headY;

    // Rear transformer casing & mounting yoke connecting head to mast
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 3.5, tmp_headTopY + 5, 7, 24);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x - 3.5, tmp_headTopY + 5, 7, 24);

    // Matte black target plate with rounded corners
    ctx.fillStyle = '#090d16';
    drawRoundedRect(ctx, tmp_headX, tmp_headTopY, tmp_headW, tmp_headH, 4.5);
    ctx.fill();

    // High-visibility retroreflective silver/white border trim
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 3 Optical Lamps Spaced from Top to Bottom:
    // Slot 0: GREEN   (Top)    y = tmp_headTopY + 6.5
    // Slot 1: YELLOW  (Middle) y = tmp_headTopY + 16.5
    // Slot 2: RED     (Bottom) y = tmp_headTopY + 26.5
    const arr_lampYOffsets = [6.5, 16.5, 26.5];

    for (let tmp_i = 0; tmp_i < this.arr_lights.length; tmp_i++) {
      const tmp_lampY = tmp_headTopY + arr_lampYOffsets[tmp_i];
      this.arr_lights[tmp_i].render(ctx, x, tmp_lampY, 3.3, tmp_pulse, haloMultiplier);
    }

    ctx.restore();
  }
}

export default RailSignal;
