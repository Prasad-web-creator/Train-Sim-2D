/**
 * WorldCamera.js
 * World-space tracking camera with smoothed dead zone, subtle speed look-ahead,
 * responsive viewport zoom scaling, and canvas 2D transformation.
 */

import { lerp, clamp } from '../../utils/MathUtils.js';

export class WorldCamera {
  /**
   * Initializes world-space camera parameters, viewport dimensions, and dead zone.
   */
  constructor() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;

    // Viewport dimensions
    this.viewportWidth = 1920;
    this.viewportHeight = 1080;

    // Zoom properties
    this.zoom = 1.0;
    this.targetZoom = 1.0;
    this.viewportScale = 1.0;
    this.userZoom = 1.0;

    // Dead zone boundaries (pixels in world space)
    this.deadZoneHalfWidth = 42.0;
    this.deadZoneHalfHeight = 24.0;

    // Speed-based look-ahead properties
    this.lookAheadDistance = 0;
    this.targetLookAheadDistance = 0;
    this.lookAheadVelocity = 0;

    // Dynamic framing offsets (for station framing, cinematic sway)
    this.framingOffsetX = 0;
    this.framingOffsetY = 0;

    // External shake offsets (applied by CameraSystem)
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  /**
   * Resizes camera viewport dimensions and calculates responsive base scale
   * ensuring the train and world remain visually proportional across all resolutions.
   */
  resize(width, height) {
    this.viewportWidth = width || 1920;
    this.viewportHeight = height || 1080;

    const isLandscape = this.viewportWidth >= this.viewportHeight;

    if (isLandscape) {
      // Height and width scaling maintains vertical world framing and balanced train length
      // Reference landscape dimensions: 1200 x 620.
      const tmp_heightRatio = this.viewportHeight / 620;
      const tmp_widthRatio = this.viewportWidth / 1200;
      this.viewportScale = clamp(Math.min(tmp_heightRatio, tmp_widthRatio), 0.50, 1.15);
    } else {
      // Portrait mode: screen is narrow (e.g. 360-412px).
      // Target visible world width of ~750 units so the locomotive maintains realistic proportions.
      const tmp_widthRatio = this.viewportWidth / 750;
      this.viewportScale = clamp(tmp_widthRatio, 0.45, 0.88);
    }

    // Scale dead zone proportionally with viewport scale
    this.deadZoneHalfWidth = 42.0 * this.viewportScale;
    this.deadZoneHalfHeight = 24.0 * this.viewportScale;
  }

  /**
   * Applies camera dead zone filtering so minor micro-jitter does not move the camera.
   * Uses smooth quadratic falloff outside dead-zone threshold to prevent motion sickness.
   */
  fn_applyDeadZone(currentPos, targetPos, halfZoneSize) {
    const tmp_delta = targetPos - currentPos;
    const tmp_absDelta = Math.abs(tmp_delta);

    // Inside dead zone: camera remains completely stationary
    if (tmp_absDelta <= halfZoneSize) {
      return currentPos;
    }

    // Outside dead zone: smoothly pull camera towards target
    const tmp_excess = tmp_absDelta - halfZoneSize;
    const tmp_sign = Math.sign(tmp_delta);
    return currentPos + tmp_sign * tmp_excess;
  }

  /**
   * Updates camera position towards target with smoothed dead zone and speed look-ahead.
   * 
   * @param {number} deltaTime - Time step in seconds
   * @param {number} trainWorldX - Locomotive world coordinate X
   * @param {number} trainWorldY - Locomotive world coordinate Y
   * @param {number} speedMps - Current locomotive ground speed in m/s
   */
  update(deltaTime, trainWorldX, trainWorldY, speedMps = 0) {
    const cons_DT = clamp(deltaTime, 0.001, 0.1);

    // 1. Calculate subtle speed-based look-ahead (shifts slightly forward down track)
    // Capped at -65px to +90px to prevent motion sickness
    const cons_LOOKAHEAD_FACTOR = 1.6;
    this.targetLookAheadDistance = clamp(speedMps * cons_LOOKAHEAD_FACTOR * 16.0, -65.0, 90.0);

    // Smooth critically damped look-ahead interpolation
    this.lookAheadDistance = lerp(this.lookAheadDistance, this.targetLookAheadDistance, cons_DT * 2.8);

    // 2. Compute intended focus target (including lookahead and dynamic framing)
    const tmp_rawTargetX = trainWorldX + this.lookAheadDistance + this.framingOffsetX;
    const tmp_rawTargetY = trainWorldY + this.framingOffsetY;

    // 3. Filter raw target through dead zone
    this.targetX = this.fn_applyDeadZone(this.x, tmp_rawTargetX, this.deadZoneHalfWidth);
    this.targetY = this.fn_applyDeadZone(this.y, tmp_rawTargetY, this.deadZoneHalfHeight);

    // 4. Smooth exponential position damping towards target
    const cons_SMOOTH_FACTOR = 4.2;
    const cons_SMOOTH_ALPHA = clamp(cons_DT * cons_SMOOTH_FACTOR, 0, 1);
    this.x = lerp(this.x, this.targetX, cons_SMOOTH_ALPHA);
    this.y = lerp(this.y, this.targetY, cons_SMOOTH_ALPHA);

    // 5. Interpolate composite zoom (targetZoom * responsive viewportScale)
    const tmp_effectiveTargetZoom = this.targetZoom * this.viewportScale * this.userZoom;
    this.zoom = lerp(this.zoom, tmp_effectiveTargetZoom, clamp(cons_DT * 3.2, 0, 1));
  }

  /**
   * Sets target zoom preset (e.g. 1.0 for Gameplay, 1.15 for Cinematic, 0.85 for Overview).
   */
  setTargetZoom(zoomValue) {
    this.targetZoom = clamp(zoomValue, 0.6, 2.0);
  }

  /**
   * Adjusts user zoom modifier incrementally.
   */
  setUserZoom(userZoomModifier) {
    this.userZoom = clamp(userZoomModifier, 0.7, 1.4);
  }

  /**
   * Sets dynamic framing offsets for station approach or cinematic view.
   */
  setFramingOffset(offsetX, offsetY) {
    this.framingOffsetX = offsetX;
    this.framingOffsetY = offsetY;
  }

  /**
   * Sets external camera shake offset coordinates.
   */
  setShakeOffset(offsetX, offsetY) {
    this.shakeOffsetX = offsetX;
    this.shakeOffsetY = offsetY;
  }

  /**
   * Resets camera coordinates immediately to a specified world position.
   */
  resetTo(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.lookAheadDistance = 0;
    this.targetLookAheadDistance = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  /**
   * Applies camera 2D matrix transformation to the canvas rendering context.
   * Anchors the locomotive in the upper visual world area (above the 38% cab console).
   */
  applyTransform(ctx, viewportWidth, viewportHeight) {
    ctx.save();

    const tmp_w = viewportWidth || this.viewportWidth;
    const tmp_h = viewportHeight || this.viewportHeight;

    const isLandscape = tmp_w >= tmp_h;
    // Anchor horizontally at ~40% so player has clear lead track view ahead
    const tmp_anchorX = tmp_w * 0.40;
    // In landscape: anchor track around 67% down screen so the rails sit right above the dashboard
    // leaving the upper 67% of the viewport for sky, mountains, trees, and structures without massive brown dirt.
    // In portrait: anchor around 48% down screen above the 2-tier dashboard.
    const tmp_anchorY = isLandscape ? (tmp_h * 0.67) : (tmp_h * 0.48);

    ctx.translate(tmp_anchorX + this.shakeOffsetX, tmp_anchorY + this.shakeOffsetY);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  }

  /**
   * Restores canvas rendering context state after rendering world scene.
   */
  restoreTransform(ctx) {
    ctx.restore();
  }
}

export default WorldCamera;
