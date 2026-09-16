/**
 * Barrel export for the time-of-day and day/night system.
 */

export {
  cons_TIME_PHASES,
  arr_TIME_PHASE_ORDER,
  obj_TIME_PHASE_PROFILES,
  fn_interpolateDayNight,
  fn_lerp,
  fn_lerpColor,
} from './DayNightConstants.js';

export { DayNightSystem } from './DayNightSystem.js';
