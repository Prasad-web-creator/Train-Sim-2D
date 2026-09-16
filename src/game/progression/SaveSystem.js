/**
 * SaveSystem.js
 * Robust, corruption-protected persistence engine for IronRail 2D.
 * Handles serializing player data to localStorage, deep schema validation,
 * corruption detection, and automatic safe recovery using default fallback data.
 * Does not store transient runtime or unnecessary information.
 */

// Storage key for unified progression save
export const cons_STORAGE_KEY_PROGRESSION = 'ironrail_progression_save_v1';

// Clean, standard default player progression state
export const cons_DEFAULT_PLAYER_DATA = Object.freeze({
  level: 1,
  experience: 0,
  coins: 25000,
  unlockedTrains: ['loco_wap7_red'],
  settings: {
    masterVolume: 0.8,
    engineVolume: 0.75,
    environmentVolume: 0.7,
    weatherVolume: 0.7,
    sfxVolume: 0.85,
    cameraZoom: 1.0,
  },
});

export class SaveSystem {
  constructor(storageKey = cons_STORAGE_KEY_PROGRESSION) {
    this.storageKey = storageKey;
  }

  /**
   * Sanitizes, validates, and serializes player data into localStorage.
   * Filters out transient runtime values to guarantee clean storage.
   * 
   * @param {Object} obj_playerData - Raw player data object
   * @returns {boolean} - Whether save succeeded
   */
  saveGame(obj_playerData) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }

      // Sanitize and extract strictly necessary persistent information
      const obj_cleanData = this.fn_sanitizePlayerData(obj_playerData);
      const str_serialized = JSON.stringify(obj_cleanData);

      window.localStorage.setItem(this.storageKey, str_serialized);
      return true;
    } catch (err) {
      console.error('[SaveSystem] Error saving game to localStorage:', err);
      return false;
    }
  }

  /**
   * Loads player data from localStorage with full corruption recovery.
   * If save data is missing, invalid, or corrupted, safely recovers using defaults.
   * 
   * @returns {Object} - Guaranteed valid and sanitized player data
   */
  loadGame() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return this.fn_cloneDefaultData();
      }

      const str_raw = window.localStorage.getItem(this.storageKey);

      if (!str_raw) {
        return this.fn_cloneDefaultData();
      }

      // Attempt parsing JSON
      let obj_parsed;
      try {
        obj_parsed = JSON.parse(str_raw);
      } catch (parseError) {
        console.warn('[SaveSystem] Corrupted JSON detected. Safely recovering with default data:', parseError);
        const obj_recovered = this.fn_cloneDefaultData();
        this.saveGame(obj_recovered);
        return obj_recovered;
      }

      // Validate and repair fields
      const obj_validated = this.fn_sanitizePlayerData(obj_parsed);

      return obj_validated;
    } catch (err) {
      console.warn('[SaveSystem] Unexpected error loading game, recovering safely with defaults:', err);
      return this.fn_cloneDefaultData();
    }
  }

  /**
   * Resets stored game data in localStorage to defaults.
   * 
   * @returns {Object} - Fresh copy of default player data
   */
  resetGame() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.storageKey);
      }
    } catch (err) {
      console.error('[SaveSystem] Error resetting game in localStorage:', err);
    }
    const obj_fresh = this.fn_cloneDefaultData();
    this.saveGame(obj_fresh);
    return obj_fresh;
  }

  /**
   * Sanitizes, type-checks, and clamps every required player data field.
   * Repairs corrupted, missing, or out-of-bounds properties safely.
   */
  fn_sanitizePlayerData(obj_raw) {
    const obj_defaults = cons_DEFAULT_PLAYER_DATA;
    if (!obj_raw || typeof obj_raw !== 'object' || Array.isArray(obj_raw)) {
      return this.fn_cloneDefaultData();
    }

    // 1. level: positive integer >= 1
    let tmp_level = obj_defaults.level;
    if (typeof obj_raw.level === 'number' && isFinite(obj_raw.level)) {
      tmp_level = Math.max(1, Math.floor(obj_raw.level));
    }

    // 2. experience: non-negative integer >= 0
    let tmp_experience = obj_defaults.experience;
    if (typeof obj_raw.experience === 'number' && isFinite(obj_raw.experience)) {
      tmp_experience = Math.max(0, Math.floor(obj_raw.experience));
    }

    // 3. coins: non-negative integer >= 0
    let tmp_coins = obj_defaults.coins;
    if (typeof obj_raw.coins === 'number' && isFinite(obj_raw.coins)) {
      tmp_coins = Math.max(0, Math.floor(obj_raw.coins));
    }

    // 4. unlockedTrains: array of string IDs, must always include starter locomotive
    let arr_unlocked = [...obj_defaults.unlockedTrains];
    if (Array.isArray(obj_raw.unlockedTrains)) {
      const arr_cleanStrings = obj_raw.unlockedTrains.filter((id) => typeof id === 'string' && id.trim().length > 0);
      arr_unlocked = Array.from(new Set([...arr_unlocked, ...arr_cleanStrings]));
    }

    // 5. settings: audio volumes (0.0 to 1.0) and cameraZoom
    const obj_rawSettings = obj_raw.settings && typeof obj_raw.settings === 'object' ? obj_raw.settings : {};
    const obj_cleanSettings = {
      masterVolume: this.fn_clampRatio(obj_rawSettings.masterVolume, obj_defaults.settings.masterVolume),
      engineVolume: this.fn_clampRatio(obj_rawSettings.engineVolume, obj_defaults.settings.engineVolume),
      environmentVolume: this.fn_clampRatio(obj_rawSettings.environmentVolume, obj_defaults.settings.environmentVolume),
      weatherVolume: this.fn_clampRatio(obj_rawSettings.weatherVolume, obj_defaults.settings.weatherVolume),
      sfxVolume: this.fn_clampRatio(obj_rawSettings.sfxVolume, obj_defaults.settings.sfxVolume),
      cameraZoom: typeof obj_rawSettings.cameraZoom === 'number' && isFinite(obj_rawSettings.cameraZoom)
        ? Math.max(0.5, Math.min(2.0, obj_rawSettings.cameraZoom))
        : obj_defaults.settings.cameraZoom,
    };

    return {
      level: tmp_level,
      experience: tmp_experience,
      coins: tmp_coins,
      unlockedTrains: arr_unlocked,
      settings: obj_cleanSettings,
    };
  }

  /**
   * Clamps a volume ratio safely between 0.0 and 1.0.
   */
  fn_clampRatio(val, defaultVal) {
    if (typeof val === 'number' && isFinite(val)) {
      return Math.max(0.0, Math.min(1.0, val));
    }
    return defaultVal;
  }

  /**
   * Produces a deep copy of the default player data schema.
   */
  fn_cloneDefaultData() {
    return JSON.parse(JSON.stringify(cons_DEFAULT_PLAYER_DATA));
  }
}

// Global Singleton Instance
export const obj_SAVE_SYSTEM = new SaveSystem();
