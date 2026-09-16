/**
 * GameConstants.js
 * Global configuration constants for game dimensions, UI scaling, and timing.
 */

// Master game constants dictionary
export const cons_GAME_CONFIG = Object.freeze({
  CANVAS_VIRTUAL_WIDTH: 1920,
  CANVAS_VIRTUAL_HEIGHT: 1080,
  CABIN_VIEW_HEIGHT_RATIO: 0.38, // Lower 38% for cab console
  WORLD_VIEW_HEIGHT_RATIO: 0.62, // Upper 62% for track & landscape
  TARGET_FPS: 60,
  MAX_DELTA_TIME: 0.1, // Clamp max delta time to prevent tunneling
  GRAVITY: 9.81,
  PIXELS_PER_METER: 32, // Conversion for physics units
  DEFAULT_SPEED_LIMIT: 55, // km/h
});

// Screen and game modes
export const cons_GAME_STATE_MODES = Object.freeze({
  LOADING: 'loading',
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  MISSION_SUCCESS: 'mission_success',
  MISSION_FAILED: 'mission_failed',
  SETTINGS: 'settings',
});

// Sound effect categories
export const cons_AUDIO_CHANNELS = Object.freeze({
  MASTER: 'master',
  ENGINE: 'engine',
  SFX: 'sfx',
  AMBIENCE: 'ambience',
  UI: 'ui',
});

// Control reverser positions
export const cons_REVERSER_MODES = Object.freeze({
  FORWARD: 1,
  NEUTRAL: 0,
  REVERSE: -1,
});

// Key bindings for keyboard controls
export const cons_KEY_BINDINGS = Object.freeze({
  THROTTLE_UP: ['KeyW', 'ArrowUp'],
  THROTTLE_DOWN: ['KeyS', 'ArrowDown'],
  REVERSER_FORWARD: ['KeyE'],
  REVERSER_REVERSE: ['KeyQ'],
  BRAKE_APPLY: ['Space'],
  HORN: ['KeyH'],
  SANDER: ['KeyX'],
  HEADLIGHT: ['KeyL'],
  PAUSE: ['KeyP', 'Escape'],
  CAMERA_VIEW: ['KeyC'],
});
