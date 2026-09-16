/**
 * Coupler.js
 * Heavy knuckle coupler drawbar assembly with draft gear spring pocket,
 * uncoupling lever rods, and flexible pneumatic air brake hoses.
 */

import { TrainComponent } from './TrainComponent.js';
import { drawRoundedRect } from '../../../utils/CanvasUtils.js';

export class Coupler extends TrainComponent {
  /**
   * Initializes coupler head position, knuckle orientation, and slack spring.
   */
  constructor(name = 'coupler', isFront = true) {
    super(name);
    this.isFront = isFront;
    this.slackTension = 0; // Negative for buff/compression, positive for draft/tension
  }

  /**
   * Updates coupler slack tension based on consist acceleration and braking force.
   */
  update(deltaTime, velocityMps, isUnderLoad = false) {
    super.update(deltaTime, velocityMps, isUnderLoad);
    // Smooth decay of slack tension back towards neutral equilibrium
    this.slackTension *= Math.max(0, 1 - deltaTime * 4.0);
  }

  /**
   * Renders standalone knuckle coupler head for uncoupled train ends.
   */
  render(ctx, options = {}) {
    if (!this.visibility) return;
    this.applyTransform(ctx);

    const tmp_dir = this.isFront ? 1 : -1;
    const tmp_shankLen = 16;

    // 1. Buffer beam striker pocket
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-2, -7, 4, 14);

    // 2. Coupler drawbar shank extending from buffer beam
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, -4, tmp_shankLen * tmp_dir, 8);
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, -4, tmp_shankLen * tmp_dir, 1.5);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(0, -4, tmp_shankLen * tmp_dir, 8);

    // 3. Heavy knuckle coupler head casting
    const tmp_headX = tmp_shankLen * tmp_dir;
    ctx.beginPath();
    ctx.arc(tmp_headX, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Knuckle lock pin
    ctx.beginPath();
    ctx.arc(tmp_headX + (tmp_dir * 2), 0, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#94a3b8';
    ctx.fill();

    // 4. Drooping uncoupled air brake hose with gladhand connector
    ctx.beginPath();
    ctx.moveTo(tmp_dir * 4, 4);
    ctx.quadraticCurveTo(tmp_dir * 10, 14, tmp_dir * 14, 10);
    ctx.strokeStyle = '#0a0f18';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.fillRect(tmp_dir * 12, 9, 3, 3);

    this.restoreTransform(ctx);
  }

  /**
   * Static helper to render connecting air hoses, drawbar, and CBC knuckle lock between two adjacent cars.
   */
  static renderConnection(ctx, posA, posB) {
    ctx.save();

    const dx = posB.x - posA.x;
    const dy = posB.y - posA.y;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const midX = (posA.x + posB.x) * 0.5;
    const midY = (posA.y + posB.y) * 0.5;

    // 1. Buffer beam draft gear striker plates on both vehicle faces
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(posA.x - 2, posA.y - 7, 4, 14);
    ctx.fillRect(posB.x - 2, posB.y - 7, 4, 14);

    // 2. Heavy steel drawbar shank and central CBC interlocking knuckle lock
    ctx.save();
    ctx.translate(posA.x, posA.y);
    ctx.rotate(angle);

    // Continuous heavy cast-steel drawbar bridging the draft gears
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, -4, dist, 8);

    // Top metallic highlight on drawbar
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, -4, dist, 1.5);

    // Drawbar border outline
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(0, -4, dist, 8);

    // Central CBC (Center Buffer Coupler) interlocking knuckle lock head casting
    const midDist = dist * 0.5;
    ctx.fillStyle = '#334155';
    drawRoundedRect(ctx, midDist - 6, -6, 12, 12, 2.5);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Knuckle lock pin & contour ridge
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(midDist - 1.5, -5, 3, 10);
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(midDist, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 3. Twin flexible pneumatic rubber air brake hoses hanging with catenary sag
    // Upper Brake Pipe (BP)
    ctx.beginPath();
    ctx.moveTo(posA.x, posA.y + 4);
    ctx.quadraticCurveTo(midX, midY + 11, posB.x, posB.y + 4);
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = '#0a0f18';
    ctx.stroke();

    // Lower Feed Pipe (FP)
    ctx.beginPath();
    ctx.moveTo(posA.x, posA.y + 6);
    ctx.quadraticCurveTo(midX, midY + 16, posB.x, posB.y + 6);
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // Metal gladhand coupling clamp at bottom center of hoses
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(midX - 2, midY + 9.5, 4, 2.5);
    ctx.fillRect(midX - 2, midY + 14.5, 4, 2.5);

    ctx.restore();
  }
}
