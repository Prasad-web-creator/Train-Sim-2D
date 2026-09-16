/**
 * CargoCoach.js
 * Modular freight wagon entity supporting grain hoppers, lumber flatbeds, boxcars,
 * intermodal container cars, and cylindrical tankers with suspension travel and vibration.
 */

import { TrainCar } from './TrainCar.js';
import { drawRoundedRect } from '../../../utils/CanvasUtils.js';

export class CargoCoach extends TrainCar {
  /**
   * Initializes cargo wagon configuration, mass, length, and cargo type.
   */
  constructor(obj_wagonType, index = 0) {
    const tmp_len = obj_wagonType.lengthMeters || 17.5;
    const tmp_mass = (obj_wagonType.emptyMassKg || 26000) + (obj_wagonType.cargoMassKg || 55000);
    super(obj_wagonType.name, tmp_len, tmp_mass, 2);

    this.model = obj_wagonType;
    this.index = index;
    this.wagonKind = obj_wagonType.wagonKind || 'boxcar';
  }

  /**
   * Renders the specific cargo coach body based on its wagonKind.
   */
  renderBody(ctx, options = {}) {
    const tmp_len = this.lengthPixels;
    const tmp_halfLen = tmp_len * 0.5;
    const tmp_model = this.model;

    // Heavy under-frame steel sill
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-tmp_halfLen, -16, tmp_len, 8);

    // Delegate body rendering by cargo wagon kind
    if (this.wagonKind === 'hopper') {
      this.renderHopper(ctx, tmp_len, tmp_model);
    } else if (this.wagonKind === 'flatbed') {
      this.renderFlatbed(ctx, tmp_len, tmp_model);
    } else if (this.wagonKind === 'boxcar') {
      this.renderBoxcar(ctx, tmp_len, tmp_model);
    } else if (this.wagonKind === 'container') {
      this.renderContainer(ctx, tmp_len, tmp_model);
    } else {
      this.renderTanker(ctx, tmp_len, tmp_model);
    }

    // Couplers at Buffer Beam Centerline (y = -12)
    this.frontCoupler.position = { x: tmp_halfLen, y: -12 };
    this.rearCoupler.position = { x: -tmp_halfLen, y: -12 };

    if (!this.isFrontCoupled) {
      this.frontCoupler.render(ctx);
    }
    if (!this.isRearCoupled) {
      this.rearCoupler.render(ctx);
    }
  }

  /**
   * Renders grain hopper wagon with angled slopes and discharge chutes.
   */
  renderHopper(ctx, length, model) {
    const tmp_w = length * 0.94;
    const tmp_halfW = tmp_w * 0.5;
    const tmp_h = 72;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-tmp_halfW, -12);
    ctx.lineTo(-tmp_halfW + 28, -tmp_h);
    ctx.lineTo(tmp_halfW - 28, -tmp_h);
    ctx.lineTo(tmp_halfW, -12);
    ctx.closePath();
    ctx.fillStyle = model.bodyColor || '#854d0e';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Grain cargo visible in open top
    ctx.fillStyle = model.cargoColor || '#fde047';
    ctx.beginPath();
    ctx.moveTo(-tmp_halfW + 36, -tmp_h + 8);
    ctx.quadraticCurveTo(0, -tmp_h - 6, tmp_halfW - 36, -tmp_h + 8);
    ctx.lineTo(tmp_halfW - 36, -tmp_h + 16);
    ctx.lineTo(-tmp_halfW + 36, -tmp_h + 16);
    ctx.closePath();
    ctx.fill();

    // Vertical structural reinforcement ribs
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    for (let tmp_rx = -tmp_halfW + 45; tmp_rx < tmp_halfW - 45; tmp_rx += 32) {
      ctx.beginPath();
      ctx.moveTo(tmp_rx, -12);
      ctx.lineTo(tmp_rx, -tmp_h);
      ctx.stroke();
    }

    // Bottom discharge hopper chutes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-tmp_halfW + 70, -8, 28, 7);
    ctx.fillRect(tmp_halfW - 98, -8, 28, 7);

    ctx.restore();
  }

  /**
   * Renders flatbed lumber wagon with stacked timber tree logs.
   */
  renderFlatbed(ctx, length, model) {
    const tmp_w = length * 0.96;
    const tmp_halfW = tmp_w * 0.5;

    // Wooden deck
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-tmp_halfW, -18, tmp_w, 8);

    // Steel stanchions holding logs
    ctx.fillStyle = '#1e293b';
    for (let tmp_sx = -tmp_halfW + 16; tmp_sx <= tmp_halfW - 16; tmp_sx += 45) {
      ctx.fillRect(tmp_sx - 3, -80, 6, 70);
    }

    // Stacked logs with bark rings
    const tmp_r = 11;
    const tmp_countX = Math.floor((tmp_w - 40) / (tmp_r * 2));
    const tmp_startX = -tmp_halfW + 25;

    // Bottom tier
    for (let tmp_i = 0; tmp_i < tmp_countX; tmp_i++) {
      const tmp_lx = tmp_startX + tmp_i * (tmp_r * 2);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(tmp_lx - tmp_r, -38, tmp_r * 2, 20);
    }

    // Top tier
    for (let tmp_i = 0; tmp_i < tmp_countX - 1; tmp_i++) {
      const tmp_lx = tmp_startX + tmp_r + tmp_i * (tmp_r * 2);
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(tmp_lx - tmp_r, -58, tmp_r * 2, 20);
    }

    // End cut circles
    this.renderLogEnd(ctx, tmp_startX, -28, tmp_r);
    this.renderLogEnd(ctx, tmp_startX + (tmp_countX - 1) * tmp_r * 2, -28, tmp_r);
    this.renderLogEnd(ctx, tmp_startX + tmp_r, -48, tmp_r);
  }

  /**
   * Renders timber log end circle.
   */
  renderLogEnd(ctx, cx, cy, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fde68a';
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Renders steel boxcar with sliding cargo doors and roof walkway.
   */
  renderBoxcar(ctx, length, model) {
    const tmp_w = length * 0.95;
    const tmp_halfW = tmp_w * 0.5;
    const tmp_h = 76;

    ctx.fillStyle = model.bodyColor || '#991b1b';
    drawRoundedRect(ctx, -tmp_halfW, -tmp_h - 2, tmp_w, tmp_h - 10, 4);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sliding center cargo door
    ctx.fillStyle = '#7f1d1d';
    drawRoundedRect(ctx, -38, -tmp_h + 6, 76, tmp_h - 22, 2);
    ctx.fill();
    ctx.stroke();

    // Door latch bar
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-1, -tmp_h + 10);
    ctx.lineTo(-1, -16);
    ctx.stroke();
  }

  /**
   * Renders intermodal container car.
   */
  renderContainer(ctx, length, model) {
    const tmp_w = length * 0.94;
    const tmp_halfW = tmp_w * 0.5;
    const tmp_h = 80;

    ctx.fillStyle = model.cargoColor || '#0284c7';
    drawRoundedRect(ctx, -tmp_halfW + 12, -tmp_h - 2, tmp_w - 24, tmp_h - 14, 3);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vertical flutes
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 2;
    for (let tmp_cx = -tmp_halfW + 28; tmp_cx < tmp_halfW - 28; tmp_cx += 14) {
      ctx.beginPath();
      ctx.moveTo(tmp_cx, -tmp_h + 2);
      ctx.lineTo(tmp_cx, -18);
      ctx.stroke();
    }
  }

  /**
   * Renders cylindrical chemical tanker car with manhole dome and hazard placards.
   */
  renderTanker(ctx, length, model) {
    const tmp_w = length * 0.92;
    const tmp_halfW = tmp_w * 0.5;
    const tmp_tankR = 32;

    ctx.save();
    // Cylindrical tank body
    ctx.fillStyle = '#cbd5e1'; // Stainless steel / silver
    drawRoundedRect(ctx, -tmp_halfW, -tmp_tankR * 2 - 12, tmp_w, tmp_tankR * 2, tmp_tankR * 0.7);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tanker top manhole inspection dome
    ctx.fillStyle = '#475569';
    drawRoundedRect(ctx, -14, -tmp_tankR * 2 - 20, 28, 9, 3);
    ctx.fill();

    // Tank mounting bands
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-tmp_halfW * 0.5, -tmp_tankR * 2 - 12, 5, tmp_tankR * 2);
    ctx.fillRect(tmp_halfW * 0.5, -tmp_tankR * 2 - 12, 5, tmp_tankR * 2);

    // Hazard diamond placard
    ctx.save();
    ctx.translate(0, -tmp_tankR - 12);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#ef4444'; // Flammable red diamond
    ctx.fillRect(-7, -7, 14, 14);
    ctx.restore();

    ctx.restore();
  }
}
