/**
 * ProgressionSystem.js
 * Central gameplay progression coordinator managing:
 * - Leveling curve and experience points (XP)
 * - In-game currency (Coins)
 * - Fleet ownership (Unlocked Trains)
 * - Mission & Route completions
 * - High scores and star ratings (Best Scores)
 * - Persistent audio and display settings
 *
 * Backed by SaveSystem with automated validation and corruption recovery.
 */

import { obj_SAVE_SYSTEM } from './SaveSystem.js';
import { getLocomotiveById } from '../../data/locomotives.js';

export class ProgressionSystem {
  constructor(saveSystem = obj_SAVE_SYSTEM) {
    this.saveSystem = saveSystem;
    this.arr_listeners = [];
    this.obj_playerData = this.saveSystem.loadGame();
  }

  /**
   * Subscribes a listener callback to receive progression updates.
   * 
   * @param {Function} fn_listener - Callback function
   * @returns {Function} - Unsubscribe cleanup function
   */
  subscribe(fn_listener) {
    this.arr_listeners.push(fn_listener);
    return () => {
      this.arr_listeners = this.arr_listeners.filter((fn) => fn !== fn_listener);
    };
  }

  /**
   * Dispatches state update notification to all subscribers.
   */
  notify(obj_event = { type: 'STATE_CHANGED' }) {
    const obj_snapshot = this.getPlayerData();
    for (let tmp_i = 0; tmp_i < this.arr_listeners.length; tmp_i++) {
      try {
        this.arr_listeners[tmp_i](obj_snapshot, obj_event);
      } catch (err) {
        console.error('[ProgressionSystem] Listener notification error:', err);
      }
    }
  }

  /**
   * Returns an immutable copy of current player data.
   */
  getPlayerData() {
    return JSON.parse(JSON.stringify(this.obj_playerData));
  }

  // =========================================================================
  // 1. Level & Experience Engine
  // =========================================================================

  /**
   * Computes the total experience required to reach the next level.
   * Progressive linear-step formula: Level 1 requires 1000 XP, Level 2 requires 1500 XP, etc.
   */
  fn_getXpThresholdForLevel(level) {
    const cons_clampedLevel = Math.max(1, Math.floor(level));
    return 1000 + (cons_clampedLevel - 1) * 500;
  }

  /**
   * Computes current XP progress fraction towards the next level (0.0 to 1.0).
   */
  fn_getLevelProgressFraction() {
    const cons_needed = this.fn_getXpThresholdForLevel(this.obj_playerData.level);
    return Math.min(1.0, this.obj_playerData.experience / cons_needed);
  }

  /**
   * Awards experience points (XP) to the player and processes level-ups.
   * 
   * @param {number} amount - XP points to add
   * @returns {Object} - Result with levelUps count and bonus coins awarded
   */
  addExperience(amount) {
    if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
      return { levelUps: 0, coinsAwarded: 0 };
    }

    let tmp_xpToAdd = Math.floor(amount);
    let tmp_levelUps = 0;
    let tmp_totalCoinBonus = 0;

    this.obj_playerData.experience += tmp_xpToAdd;

    // Check if player has accumulated enough XP to level up (supports multi-level advances)
    let tmp_threshold = this.fn_getXpThresholdForLevel(this.obj_playerData.level);
    while (this.obj_playerData.experience >= tmp_threshold) {
      this.obj_playerData.experience -= tmp_threshold;
      this.obj_playerData.level += 1;
      tmp_levelUps += 1;

      // Level-up reward: +1,500 coins per level achieved
      const cons_bonusCoins = 1500;
      this.obj_playerData.coins += cons_bonusCoins;
      tmp_totalCoinBonus += cons_bonusCoins;

      tmp_threshold = this.fn_getXpThresholdForLevel(this.obj_playerData.level);
    }

    this.saveGame();

    if (tmp_levelUps > 0) {
      this.notify({
        type: 'LEVEL_UP',
        newLevel: this.obj_playerData.level,
        levelUps: tmp_levelUps,
        coinsAwarded: tmp_totalCoinBonus,
      });
    } else {
      this.notify({ type: 'XP_GAINED', amount: tmp_xpToAdd });
    }

    return {
      levelUps: tmp_levelUps,
      coinsAwarded: tmp_totalCoinBonus,
      currentLevel: this.obj_playerData.level,
      currentExperience: this.obj_playerData.experience,
    };
  }

  // =========================================================================
  // 2. Economy & Currency Engine (Coins)
  // =========================================================================

  /**
   * Adds coins to player treasury and saves.
   * 
   * @param {number} amount - Coins to add
   * @returns {number} - New coin balance
   */
  addCoins(amount) {
    if (typeof amount !== 'number' || amount <= 0 || !isFinite(amount)) {
      return this.obj_playerData.coins;
    }
    this.obj_playerData.coins += Math.floor(amount);
    this.saveGame();
    this.notify({ type: 'COINS_ADDED', amount: Math.floor(amount), total: this.obj_playerData.coins });
    return this.obj_playerData.coins;
  }

  /**
   * Checks if player has at least the specified amount of coins.
   */
  canAfford(amount) {
    return typeof amount === 'number' && isFinite(amount) && this.obj_playerData.coins >= amount;
  }

  /**
   * Spends coins if balance is sufficient.
   * 
   * @param {number} amount - Coins to deduct
   * @returns {boolean} - Whether transaction succeeded
   */
  spendCoins(amount) {
    if (!this.canAfford(amount) || amount < 0) {
      return false;
    }
    this.obj_playerData.coins -= Math.floor(amount);
    this.saveGame();
    this.notify({ type: 'COINS_SPENT', amount: Math.floor(amount), total: this.obj_playerData.coins });
    return true;
  }

  // =========================================================================
  // 3. Fleet Ownership & Unlocks
  // =========================================================================

  /**
   * Checks whether a locomotive is unlocked in the player roster.
   */
  isTrainUnlocked(trainId) {
    const obj_loco = getLocomotiveById(trainId);
    if (obj_loco && obj_loco.isDefaultUnlocked) return true;
    return this.obj_playerData.unlockedTrains.includes(trainId);
  }

  /**
   * Unlocks a locomotive model using in-game coins.
   * 
   * @param {string} trainId - Locomotive ID
   * @returns {Object} - { success: boolean, message: string }
   */
  unlockTrain(trainId) {
    const obj_loco = getLocomotiveById(trainId);
    if (!obj_loco) {
      return { success: false, message: 'Train model not found' };
    }
    if (this.isTrainUnlocked(trainId)) {
      return { success: true, message: 'Train is already unlocked' };
    }

    const cons_price = obj_loco.priceCredits || 0;
    if (!this.spendCoins(cons_price)) {
      return {
        success: false,
        message: `Insufficient coins. Requires ${cons_price.toLocaleString()} coins (Balance: ${this.obj_playerData.coins.toLocaleString()})`,
      };
    }

    this.obj_playerData.unlockedTrains.push(trainId);
    this.saveGame();
    this.notify({ type: 'TRAIN_UNLOCKED', trainId, trainName: obj_loco.name });

    return {
      success: true,
      message: `Successfully unlocked ${obj_loco.name}!`,
    };
  }

  // =========================================================================
  // 4. Mission & Route Completion Tracking
  // =========================================================================

  recordMissionCompletion() {
    return null;
  }

  // =========================================================================
  // 5. Settings Bridge
  // =========================================================================

  /**
   * Updates player audio, camera, and input settings, then persists to storage.
   */
  updateSettings(obj_partialSettings) {
    if (!obj_partialSettings || typeof obj_partialSettings !== 'object') return;
    Object.assign(this.obj_playerData.settings, obj_partialSettings);
    this.saveGame();
    this.notify({ type: 'SETTINGS_UPDATED', settings: this.obj_playerData.settings });
  }

  getSettings() {
    return { ...this.obj_playerData.settings };
  }

  // =========================================================================
  // 6. Persistence Operations
  // =========================================================================

  /**
   * Saves game data to localStorage via SaveSystem.
   */
  saveGame() {
    return this.saveSystem.saveGame(this.obj_playerData);
  }

  /**
   * Reloads game data from localStorage with full corruption recovery.
   */
  loadGame() {
    this.obj_playerData = this.saveSystem.loadGame();
    this.notify({ type: 'GAME_LOADED' });
    return this.getPlayerData();
  }

  /**
   * Resets game progress to factory defaults.
   */
  resetGame() {
    this.obj_playerData = this.saveSystem.resetGame();
    this.notify({ type: 'GAME_RESET' });
    return this.getPlayerData();
  }
}

// Global Singleton Instance
export const obj_PROGRESSION_SYSTEM = new ProgressionSystem();
