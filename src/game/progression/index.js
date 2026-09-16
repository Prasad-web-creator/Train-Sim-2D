/**
 * index.js
 * Unified export barrel for the IronRail 2D progression subsystem:
 * SaveSystem and ProgressionSystem.
 */

export {
  SaveSystem,
  obj_SAVE_SYSTEM,
  cons_STORAGE_KEY_PROGRESSION,
  cons_DEFAULT_PLAYER_DATA,
} from './SaveSystem.js';

export {
  ProgressionSystem,
  obj_PROGRESSION_SYSTEM,
} from './ProgressionSystem.js';

