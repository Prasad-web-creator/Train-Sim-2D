/**
 * KeyBindingManager.js
 * Configurable keyboard mapping manager storing user keybindings in LocalStorage.
 * Provides default bindings, key-to-action resolution, friendly display formatting,
 * and rebinding capabilities.
 */

// Action identifier constants
export const cons_ACTIONS = Object.freeze({
  THROTTLE_UP: 'THROTTLE_UP',
  THROTTLE_DOWN: 'THROTTLE_DOWN',
  BRAKE_APPLY: 'BRAKE_APPLY',
  HORN: 'HORN',
  REVERSE_DIRECTION: 'REVERSE_DIRECTION',
  HEADLIGHTS: 'HEADLIGHTS',
  EMERGENCY_BRAKE: 'EMERGENCY_BRAKE',
  PAUSE: 'PAUSE',
  CAMERA_LEFT: 'CAMERA_LEFT',
  CAMERA_RIGHT: 'CAMERA_RIGHT',
  CAMERA_MODE: 'CAMERA_MODE',
  CYCLE_WEATHER: 'CYCLE_WEATHER',
  CYCLE_TIME_OF_DAY: 'CYCLE_TIME_OF_DAY',
  FULLSCREEN: 'FULLSCREEN',
});

// Factory default bindings per user specification
export const cons_DEFAULT_KEY_BINDINGS = Object.freeze({
  [cons_ACTIONS.THROTTLE_UP]: ['KeyW', 'ArrowUp', 'KeyD'],
  [cons_ACTIONS.THROTTLE_DOWN]: ['KeyA'],
  [cons_ACTIONS.BRAKE_APPLY]: ['KeyS', 'ArrowDown'],
  [cons_ACTIONS.HORN]: ['Space'],
  [cons_ACTIONS.REVERSE_DIRECTION]: ['KeyR'],
  [cons_ACTIONS.HEADLIGHTS]: ['KeyL'],
  [cons_ACTIONS.EMERGENCY_BRAKE]: ['KeyB'],
  [cons_ACTIONS.PAUSE]: ['KeyP', 'Escape'],
  [cons_ACTIONS.CAMERA_LEFT]: ['ArrowLeft'],
  [cons_ACTIONS.CAMERA_RIGHT]: ['ArrowRight'],
  [cons_ACTIONS.CAMERA_MODE]: ['KeyC'],
  [cons_ACTIONS.CYCLE_WEATHER]: ['KeyK'],
  [cons_ACTIONS.CYCLE_TIME_OF_DAY]: ['KeyT'],
  [cons_ACTIONS.FULLSCREEN]: ['KeyF'],
});

// Human-readable labels and descriptions for each action
export const cons_ACTION_META = Object.freeze({
  [cons_ACTIONS.THROTTLE_UP]: {
    name: 'Increase Throttle',
    description: 'Advance engine power notch (auto-releases brakes)',
  },
  [cons_ACTIONS.THROTTLE_DOWN]: {
    name: 'Decrease Throttle',
    description: 'Reduce engine power notch towards idle',
  },
  [cons_ACTIONS.BRAKE_APPLY]: {
    name: 'Apply Brake',
    description: 'Progressively apply train pneumatic service brakes',
  },
  [cons_ACTIONS.HORN]: {
    name: 'Train Horn',
    description: 'Sound Nathan multi-chime air horn (held down)',
  },
  [cons_ACTIONS.REVERSE_DIRECTION]: {
    name: 'Reverse Direction',
    description: 'Toggle reverser between Forward and Reverse',
  },
  [cons_ACTIONS.HEADLIGHTS]: {
    name: 'Toggle Headlights',
    description: 'Switch locomotive front twin sealed-beam headlights and ditch lights',
  },
  [cons_ACTIONS.EMERGENCY_BRAKE]: {
    name: 'Emergency Brake',
    description: 'Drop train pipe pressure to 0 bar and initiate rapid emergency stop',
  },
  [cons_ACTIONS.PAUSE]: {
    name: 'Pause Game',
    description: 'Suspend or resume the simulation',
  },
  [cons_ACTIONS.CAMERA_LEFT]: {
    name: 'Camera Left / Zoom Out',
    description: 'Pan camera leftward or widen field of view',
  },
  [cons_ACTIONS.CAMERA_RIGHT]: {
    name: 'Camera Right / Zoom In',
    description: 'Pan camera rightward or zoom in on the train',
  },
  [cons_ACTIONS.CAMERA_MODE]: {
    name: 'Camera Perspective',
    description: 'Cycle between Gameplay, Cinematic, and Overview camera angles',
  },
  [cons_ACTIONS.CYCLE_WEATHER]: {
    name: 'Cycle Weather',
    description: 'Cycle through Clear, Rain, Snow, Fog, Sunset, Night',
  },
  [cons_ACTIONS.CYCLE_TIME_OF_DAY]: {
    name: 'Cycle Time of Day',
    description: 'Cycle between Dawn, Morning, Noon, Afternoon, Sunset, Evening, and Night',
  },
  [cons_ACTIONS.FULLSCREEN]: {
    name: 'Toggle Fullscreen',
    description: 'Enter or exit full screen browser gameplay display',
  },
});

const cons_STORAGE_KEY = 'ironrail_keybindings_v1';

class KeyBindingManager {
  /**
   * Initializes bindings from LocalStorage or defaults.
   */
  constructor() {
    this.obj_bindings = this.loadBindings();
    this.arr_listeners = [];
  }

  /**
   * Loads bindings from localStorage or returns default set.
   */
  loadBindings() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const tmp_raw = localStorage.getItem(cons_STORAGE_KEY);
        if (tmp_raw) {
          const obj_parsed = JSON.parse(tmp_raw);
          return { ...cons_DEFAULT_KEY_BINDINGS, ...obj_parsed };
        }
      }
    } catch {
      // Fallback on storage errors
    }
    return { ...cons_DEFAULT_KEY_BINDINGS };
  }

  /**
   * Saves current bindings to localStorage and notifies subscribers.
   */
  saveBindings() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(cons_STORAGE_KEY, JSON.stringify(this.obj_bindings));
      }
    } catch {
      // Ignore storage write errors
    }
    this.notify();
  }

  /**
   * Registers a subscriber callback for binding updates.
   */
  subscribe(fn_callback) {
    this.arr_listeners.push(fn_callback);
    return () => {
      this.arr_listeners = this.arr_listeners.filter((fn) => fn !== fn_callback);
    };
  }

  /**
   * Dispatches change notification to all subscribers.
   */
  notify() {
    for (let tmp_i = 0; tmp_i < this.arr_listeners.length; tmp_i++) {
      this.arr_listeners[tmp_i](this.obj_bindings);
    }
  }

  /**
   * Retrieves array of key codes bound to a specific action.
   */
  getCodesForAction(actionName) {
    return this.obj_bindings[actionName] || [];
  }

  /**
   * Rebinds a specific action to a single or array of key codes.
   */
  rebindAction(actionName, newCodes) {
    const arr_normalized = Array.isArray(newCodes) ? newCodes : [newCodes];
    this.obj_bindings[actionName] = arr_normalized;
    this.saveBindings();
  }

  /**
   * Resets all keybindings back to factory defaults.
   */
  resetToDefaults() {
    this.obj_bindings = { ...cons_DEFAULT_KEY_BINDINGS };
    this.saveBindings();
  }

  /**
   * Identifies which action matches a given KeyboardEvent.code.
   * Returns action string or null.
   */
  getActionByCode(code) {
    const arr_actions = Object.keys(this.obj_bindings);
    for (let tmp_i = 0; tmp_i < arr_actions.length; tmp_i++) {
      const tmp_action = arr_actions[tmp_i];
      const arr_codes = this.obj_bindings[tmp_action] || [];
      if (arr_codes.includes(code)) {
        return tmp_action;
      }
    }
    return null;
  }

  /**
   * Formats a raw KeyboardEvent.code into a clean human-readable label.
   */
  formatCode(code) {
    if (!code) return 'None';
    if (code.startsWith('Key')) return code.slice(3).toUpperCase();
    if (code.startsWith('Digit')) return code.slice(5);
    if (code === 'Space') return 'Spacebar';
    if (code === 'ArrowUp') return '↑ Up';
    if (code === 'ArrowDown') return '↓ Down';
    if (code === 'ArrowLeft') return '← Left';
    if (code === 'ArrowRight') return '→ Right';
    if (code === 'Escape') return 'Esc';
    if (code === 'Enter') return 'Enter';
    return code;
  }
}

// Global key binding manager singleton
export const obj_KEY_BINDINGS = new KeyBindingManager();
export default obj_KEY_BINDINGS;
