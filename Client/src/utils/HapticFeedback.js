/**
 * HapticFeedback.js
 * Mobile browser haptic feedback utility leveraging the Web Vibration API.
 * Provides tuned vibration patterns for light taps, lever notch detents,
 * toggle switches, emergency brake slams, and warning alerts.
 * Gracefully no-ops on browsers without vibration hardware/support (e.g. iOS Safari).
 */

class HapticManager {
  /**
   * Checks whether the current device and browser support the Vibration API.
   */
  isSupported() {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  }

  /**
   * Internal helper to trigger a vibration pattern safely.
   */
  vibrate(pattern) {
    if (!this.isSupported()) return false;
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }

  /**
   * Light subtle tap for standard button presses and UI interactions (~12ms).
   */
  light() {
    return this.vibrate(12);
  }

  /**
   * Distinct mechanical detent click for throttle and brake notches (~18ms).
   */
  notch() {
    return this.vibrate(18);
  }

  /**
   * Medium haptic pulse for rocker switches, reverser shifts, and mode toggles (~35ms).
   */
  medium() {
    return this.vibrate(35);
  }

  /**
   * Heavy thud for emergency brake slam and coupler impacts (~75ms).
   */
  heavy() {
    return this.vibrate(75);
  }

  /**
   * Double pulse alert pattern for speed limit violations or engine alarms.
   */
  warning() {
    return this.vibrate([70, 40, 70]);
  }

  /**
   * Positive celebration pattern for objective completions and station arrivals (~[25, 40, 35]ms).
   */
  success() {
    return this.vibrate([25, 40, 35]);
  }
}

// Export singleton haptic feedback instance
export const obj_HAPTIC = new HapticManager();
export default obj_HAPTIC;
