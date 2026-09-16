/**
 * MathUtils.js
 * Mathematical helpers for interpolation, clamping, angles, and cubic Hermite splines.
 */

/**
 * Clamps a number between a minimum and maximum value.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Performs linear interpolation between two numeric values.
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Smoothstep interpolation function with zero 1st and 2nd derivatives at endpoints.
 */
export function smoothstep(min, max, value) {
  const tmp_x = clamp((value - min) / (max - min), 0, 1);
  return tmp_x * tmp_x * (3 - 2 * tmp_x);
}

/**
 * Converts degrees to radians.
 */
export function degToRad(degrees) {
  const cons_FACTOR = Math.PI / 180;
  return degrees * cons_FACTOR;
}

/**
 * Converts radians to degrees.
 */
export function radToDeg(radians) {
  const cons_FACTOR = 180 / Math.PI;
  return radians * cons_FACTOR;
}

/**
 * Converts meters per second to kilometers per hour.
 */
export function mpsToKmh(mps) {
  const cons_FACTOR = 3.6;
  return mps * cons_FACTOR;
}

/**
 * Converts kilometers per hour to meters per second.
 */
export function kmhToMps(kmh) {
  const cons_FACTOR = 1 / 3.6;
  return kmh * cons_FACTOR;
}

/**
 * Generates a pseudo-random number within a given range.
 */
export function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Calculates a point on a cubic Hermite spline segment.
 */
export function hermiteInterpolate(p0, p1, m0, m1, t) {
  const tmp_t2 = t * t;
  const tmp_t3 = tmp_t2 * t;
  const tmp_h00 = 2 * tmp_t3 - 3 * tmp_t2 + 1;
  const tmp_h10 = tmp_t3 - 2 * tmp_t2 + t;
  const tmp_h01 = -2 * tmp_t3 + 3 * tmp_t2;
  const tmp_h11 = tmp_t3 - tmp_t2;
  return tmp_h00 * p0 + tmp_h10 * m0 + tmp_h01 * p1 + tmp_h11 * m1;
}

/**
 * Calculates the first derivative (tangent slope) of a cubic Hermite spline segment.
 */
export function hermiteDerivative(p0, p1, m0, m1, t) {
  const tmp_t2 = t * t;
  const tmp_dh00 = 6 * tmp_t2 - 6 * t;
  const tmp_dh10 = 3 * tmp_t2 - 4 * t + 1;
  const tmp_dh01 = -6 * tmp_t2 + 6 * t;
  const tmp_dh11 = 3 * tmp_t2 - 2 * t;
  return tmp_dh00 * p0 + tmp_dh10 * m0 + tmp_dh01 * p1 + tmp_dh11 * m1;
}
