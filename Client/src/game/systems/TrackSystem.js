/**
 * TrackSystem.js
 * Computes continuous track elevation, slope grades, tangents, bridges, and signals.
 */

import { hermiteInterpolate, hermiteDerivative, clamp } from '../../utils/MathUtils.js';
import { cons_GAME_CONFIG } from '../../constants/GameConstants.js';

export class TrackSystem {
  /**
   * Initializes track keypoints, speed limit zones, and elevation spline tangents.
   */
  constructor(obj_mission) {
    this.mission = obj_mission;
    this.totalLengthMeters = obj_mission.trackLengthMeters;
    this.arr_keypoints = obj_mission.elevationKeypoints || [];
    this.arr_speedLimits = obj_mission.speedLimits || [];
    this.arr_tangents = [];

    this.computeSplineTangents();
  }

  /**
   * Precomputes finite-difference tangents at each elevation keypoint for Hermite spline.
   */
  computeSplineTangents() {
    this.arr_tangents = new Array(this.arr_keypoints.length).fill(0);
    const tmp_n = this.arr_keypoints.length;
    if (tmp_n < 2) return;

    // Interior points: Catmull-Rom style tangent (y[i+1] - y[i-1]) / (x[i+1] - x[i-1])
    for (let tmp_i = 1; tmp_i < tmp_n - 1; tmp_i++) {
      const tmp_dx = this.arr_keypoints[tmp_i + 1].dist - this.arr_keypoints[tmp_i - 1].dist;
      const tmp_dy = this.arr_keypoints[tmp_i + 1].height - this.arr_keypoints[tmp_i - 1].height;
      this.arr_tangents[tmp_i] = tmp_dx !== 0 ? (tmp_dy / tmp_dx) : 0;
    }

    // Endpoints: zero slope for level station tracks
    this.arr_tangents[0] = 0;
    this.arr_tangents[tmp_n - 1] = 0;
  }

  /**
   * Computes elevation (in world pixel height) at a specific distance along track.
   */
  getElevationAt(distMeters) {
    const tmp_clampedDist = clamp(distMeters, 0, this.totalLengthMeters);
    const tmp_n = this.arr_keypoints.length;
    if (tmp_n === 0) return 0;
    if (tmp_clampedDist <= this.arr_keypoints[0].dist) return this.arr_keypoints[0].height * cons_GAME_CONFIG.PIXELS_PER_METER;
    if (tmp_clampedDist >= this.arr_keypoints[tmp_n - 1].dist) return this.arr_keypoints[tmp_n - 1].height * cons_GAME_CONFIG.PIXELS_PER_METER;

    // Find bounding keypoint segment
    let tmp_segIdx = 0;
    for (let tmp_i = 0; tmp_i < tmp_n - 1; tmp_i++) {
      if (tmp_clampedDist >= this.arr_keypoints[tmp_i].dist && tmp_clampedDist <= this.arr_keypoints[tmp_i + 1].dist) {
        tmp_segIdx = tmp_i;
        break;
      }
    }

    const obj_p0 = this.arr_keypoints[tmp_segIdx];
    const obj_p1 = this.arr_keypoints[tmp_segIdx + 1];
    const tmp_segLength = obj_p1.dist - obj_p0.dist;
    if (tmp_segLength <= 0) return obj_p0.height * cons_GAME_CONFIG.PIXELS_PER_METER;

    const tmp_t = (tmp_clampedDist - obj_p0.dist) / tmp_segLength;
    const tmp_m0 = this.arr_tangents[tmp_segIdx] * tmp_segLength;
    const tmp_m1 = this.arr_tangents[tmp_segIdx + 1] * tmp_segLength;

    const tmp_heightMeters = hermiteInterpolate(obj_p0.height, obj_p1.height, tmp_m0, tmp_m1, tmp_t);
    // In Canvas 2D coordinates, y increases downward, so negative elevation moves track upward
    return -tmp_heightMeters * cons_GAME_CONFIG.PIXELS_PER_METER;
  }

  /**
   * Computes vertical slope rate (dy/dx) at a specific distance along track.
   */
  getSlopeAt(distMeters) {
    const tmp_clampedDist = clamp(distMeters, 0, this.totalLengthMeters);
    const tmp_n = this.arr_keypoints.length;
    if (tmp_n < 2) return 0;

    let tmp_segIdx = 0;
    for (let tmp_i = 0; tmp_i < tmp_n - 1; tmp_i++) {
      if (tmp_clampedDist >= this.arr_keypoints[tmp_i].dist && tmp_clampedDist <= this.arr_keypoints[tmp_i + 1].dist) {
        tmp_segIdx = tmp_i;
        break;
      }
    }

    const obj_p0 = this.arr_keypoints[tmp_segIdx];
    const obj_p1 = this.arr_keypoints[tmp_segIdx + 1];
    const tmp_segLength = obj_p1.dist - obj_p0.dist;
    if (tmp_segLength <= 0) return 0;

    const tmp_t = (tmp_clampedDist - obj_p0.dist) / tmp_segLength;
    const tmp_m0 = this.arr_tangents[tmp_segIdx] * tmp_segLength;
    const tmp_m1 = this.arr_tangents[tmp_segIdx + 1] * tmp_segLength;

    const tmp_slope = hermiteDerivative(obj_p0.height, obj_p1.height, tmp_m0, tmp_m1, tmp_t) / tmp_segLength;
    return tmp_slope;
  }

  /**
   * Calculates track gradient percentage (e.g., +2.5% climb or -1.8% descent).
   */
  getGradePercentAt(distMeters) {
    const tmp_slope = this.getSlopeAt(distMeters);
    return tmp_slope * 100;
  }

  /**
   * Calculates pitch angle in radians of track surface at given distance.
   */
  getTangentAngleAt(distMeters) {
    const tmp_slope = this.getSlopeAt(distMeters);
    // Note: Canvas y is inverted so track going uphill has negative dy/dx
    return -Math.atan(tmp_slope);
  }

  /**
   * Retrieves posted speed limit in km/h for the track section at given distance.
   */
  getSpeedLimitAt(distMeters) {
    for (let tmp_i = 0; tmp_i < this.arr_speedLimits.length; tmp_i++) {
      const obj_zone = this.arr_speedLimits[tmp_i];
      if (distMeters >= obj_zone.startDist && distMeters < obj_zone.endDist) {
        return obj_zone.limitKmh;
      }
    }
    return cons_GAME_CONFIG.DEFAULT_SPEED_LIMIT;
  }

  /**
   * Determines if a track section is on an elevated bridge/viaduct structure.
   */
  isBridgeAt(distMeters) {
    // Canyon & mountain bridges occur around mid-course deep ravines
    if (this.mission.biome === 'desert' && distMeters > 2400 && distMeters < 3200) return true;
    if (this.mission.biome === 'mountain' && distMeters > 3200 && distMeters < 4200) return true;
    return false;
  }
}
