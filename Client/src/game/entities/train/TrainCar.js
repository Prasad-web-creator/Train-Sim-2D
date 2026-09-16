/**
 * TrainCar.js
 * Base rail vehicle entity implementing chassis running vibration, suspension dynamics,
 * dual bogie articulation along track splines, and coupler attachments.
 */

import { WheelAssembly } from './WheelAssembly.js';
import { Coupler } from './Coupler.js';
import { cons_GAME_CONFIG } from '../../../constants/GameConstants.js';

export class TrainCar {
  /**
   * Initializes train car length, mass, bogie assemblies, couplers, and vibration oscillators.
   */
  constructor(name = 'car', lengthMeters = 18.0, totalMassKg = 80000, wheelCountPerBogie = 2) {
    this.name = name;
    this.lengthMeters = lengthMeters;
    this.lengthPixels = lengthMeters * cons_GAME_CONFIG.PIXELS_PER_METER;
    this.totalMassKg = totalMassKg;
    this.damageState = 0; // 0.0 to 1.0

    // Bogie spacing (~65% of vehicle length)
    this.bogieSpacingMeters = lengthMeters * 0.65;
    this.bogieSpacingPixels = this.bogieSpacingMeters * cons_GAME_CONFIG.PIXELS_PER_METER;

    // Assemblies
    this.frontBogie = new WheelAssembly('front_bogie', wheelCountPerBogie);
    this.rearBogie = new WheelAssembly('rear_bogie', wheelCountPerBogie);
    this.frontCoupler = new Coupler('front_coupler', true);
    this.rearCoupler = new Coupler('rear_coupler', false);
    this.isFrontCoupled = false;
    this.isRearCoupled = false;

    // Spatial world state
    this.distMeters = 0;
    this.worldX = 0;
    this.worldY = 0;
    this.pitchAngle = 0;

    // Running vibration & chassis sway state
    this.vibrationTime = 0;
    this.vibrationOffsetY = 0;
    this.vibrationRockAngle = 0;
  }

  /**
   * Updates vehicle position along track spline, articulates bogies, and computes running vibration.
   */
  update(distMeters, velocityMps, deltaTime, trackSystem) {
    this.distMeters = distMeters;
    const tmp_ppm = cons_GAME_CONFIG.PIXELS_PER_METER;

    // 1. Calculate bogie distance offsets along track profile
    const tmp_halfBogieDist = this.bogieSpacingMeters * 0.5;
    const tmp_frontDist = distMeters + tmp_halfBogieDist;
    const tmp_rearDist = distMeters - tmp_halfBogieDist;

    const tmp_frontElev = trackSystem.getElevationAt(tmp_frontDist);
    const tmp_rearElev = trackSystem.getElevationAt(tmp_rearDist);

    // 2. Position bogies in world space
    this.frontBogie.position.x = tmp_frontDist * tmp_ppm;
    this.frontBogie.position.y = tmp_frontElev;
    this.frontBogie.rotation = trackSystem.getTangentAngleAt(tmp_frontDist);
    this.frontBogie.update(deltaTime, velocityMps);

    this.rearBogie.position.x = tmp_rearDist * tmp_ppm;
    this.rearBogie.position.y = tmp_rearElev;
    this.rearBogie.rotation = trackSystem.getTangentAngleAt(tmp_rearDist);
    this.rearBogie.update(deltaTime, velocityMps);

    // 3. Compute vehicle body center world position and pitch angle
    this.worldX = distMeters * tmp_ppm;
    this.worldY = (tmp_frontElev + tmp_rearElev) * 0.5;

    const tmp_dx = this.frontBogie.position.x - this.rearBogie.position.x;
    const tmp_dy = this.frontBogie.position.y - this.rearBogie.position.y;
    this.pitchAngle = Math.atan2(tmp_dy, tmp_dx);

    // 4. Simulate subtle running vibration and body rocking based on velocity
    const tmp_speedRatio = Math.min(1.0, Math.abs(velocityMps) / 25.0);
    this.vibrationTime += deltaTime * (8.0 + tmp_speedRatio * 18.0);

    if (tmp_speedRatio > 0.02) {
      const tmp_vibAmp = tmp_speedRatio * 1.6;
      this.vibrationOffsetY = Math.sin(this.vibrationTime * 2.2) * tmp_vibAmp + (Math.random() - 0.5) * 0.4 * tmp_speedRatio;
      this.vibrationRockAngle = Math.cos(this.vibrationTime * 1.6) * (0.003 * tmp_speedRatio);
    } else {
      this.vibrationOffsetY = 0;
      this.vibrationRockAngle = 0;
    }

    // 5. Update couplers
    this.frontCoupler.update(deltaTime, velocityMps);
    this.rearCoupler.update(deltaTime, velocityMps);
  }

  /**
   * Spatial position getter for systems referencing car world coordinates.
   */
  get position() {
    return { x: this.worldX, y: this.worldY + this.vibrationOffsetY };
  }

  /**
   * Computes front coupler knuckle location in world pixels at buffer beam elevation.
   */
  getFrontCouplerPos() {
    const tmp_offsetX = this.lengthPixels * 0.5;
    const tmp_offsetY = -12; // Coupler centerline elevation (12px above rail)
    const tmp_totalAngle = this.pitchAngle + this.vibrationRockAngle;
    const tmp_cos = Math.cos(tmp_totalAngle);
    const tmp_sin = Math.sin(tmp_totalAngle);
    return {
      x: this.worldX + tmp_cos * tmp_offsetX - tmp_sin * tmp_offsetY,
      y: (this.worldY + this.vibrationOffsetY) + tmp_sin * tmp_offsetX + tmp_cos * tmp_offsetY,
    };
  }

  /**
   * Computes rear coupler knuckle location in world pixels at buffer beam elevation.
   */
  getRearCouplerPos() {
    const tmp_offsetX = -this.lengthPixels * 0.5;
    const tmp_offsetY = -12; // Coupler centerline elevation (12px above rail)
    const tmp_totalAngle = this.pitchAngle + this.vibrationRockAngle;
    const tmp_cos = Math.cos(tmp_totalAngle);
    const tmp_sin = Math.sin(tmp_totalAngle);
    return {
      x: this.worldX + tmp_cos * tmp_offsetX - tmp_sin * tmp_offsetY,
      y: (this.worldY + this.vibrationOffsetY) + tmp_sin * tmp_offsetX + tmp_cos * tmp_offsetY,
    };
  }

  /**
   * Base render method for car body and bogie trucks.
   */
  render(ctx, options = {}) {
    // 1. Render bogie trucks on track
    this.frontBogie.render(ctx, options);
    this.rearBogie.render(ctx, options);

    // 2. Render car body in local space (with running vibration & pitch)
    ctx.save();
    ctx.translate(this.worldX, this.worldY + this.vibrationOffsetY);
    ctx.rotate(this.pitchAngle + this.vibrationRockAngle);

    this.renderBody(ctx, options);

    ctx.restore();
  }

  /**
   * Abstract render method for specific vehicle bodywork.
   */
  renderBody(ctx, options) {
    // Overridden by Locomotive, PassengerCoach, CargoCoach
  }
}
