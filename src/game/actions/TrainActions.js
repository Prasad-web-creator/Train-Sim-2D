/**
 * TrainActions.js
 * Unified game action dispatcher for locomotive controls.
 * Guarantees that keyboard, mobile touch, and UI buttons execute the exact same game logic.
 * Single source of truth for locomotive command execution.
 */

import { obj_CENTRAL_GAME_STATE } from '../core/GameState.js';
import { obj_AUDIO_MANAGER, obj_SOUND_MANAGER } from '../audio/index.js';
import { obj_HAPTIC } from '../../utils/HapticFeedback.js';
import { cons_GAME_STATE_MODES, cons_REVERSER_MODES } from '../../constants/GameConstants.js';

class TrainActionsManager {
  /**
   * Increases throttle notch by 1 (max 8).
   * If service brakes are applied, releases brake first before advancing power.
   */
  increaseThrottle() {
    obj_SOUND_MANAGER.init();
    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();
    const tmp_telemetry = obj_state.telemetry;

    // If brakes are engaged, release brakes first
    if (tmp_telemetry.brakeAppliedRatio > 0) {
      const tmp_newBrake = Math.max(0, tmp_telemetry.brakeAppliedRatio - 0.35);
      obj_CENTRAL_GAME_STATE.setBrakeRatio(tmp_newBrake);
      obj_HAPTIC.notch();
      return;
    }

    const tmp_curNotch = tmp_telemetry.throttleNotch;
    if (tmp_curNotch < 8) {
      const tmp_nextNotch = tmp_curNotch + 1;
      if (tmp_curNotch === 0 && Math.abs(tmp_telemetry.speedKmh) < 1.0) {
        obj_AUDIO_MANAGER.playCouplingClank();
      }
      obj_CENTRAL_GAME_STATE.setThrottleNotch(tmp_nextNotch);
      obj_HAPTIC.notch();
    }
  }

  /**
   * Decreases throttle notch by 1 (min 0).
   */
  decreaseThrottle() {
    obj_AUDIO_MANAGER.init();
    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();
    const tmp_curNotch = obj_state.telemetry.throttleNotch;

    if (tmp_curNotch > 0) {
      const tmp_nextNotch = tmp_curNotch - 1;
      obj_CENTRAL_GAME_STATE.setThrottleNotch(tmp_nextNotch);
      obj_HAPTIC.notch();
    }
  }

  /**
   * Sets throttle notch directly (0 to 8).
   */
  setThrottleNotch(notch) {
    const tmp_clamped = Math.max(0, Math.min(8, Math.round(notch)));
    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();

    // Auto-release brakes if opening throttle
    if (tmp_clamped > 0 && obj_state.telemetry.brakeAppliedRatio > 0) {
      obj_CENTRAL_GAME_STATE.setBrakeRatio(0);
    }

    if (obj_state.telemetry.throttleNotch === 0 && tmp_clamped > 0 && Math.abs(obj_state.telemetry.speedKmh) < 1.0) {
      obj_AUDIO_MANAGER.playCouplingClank();
    }

    obj_CENTRAL_GAME_STATE.setThrottleNotch(tmp_clamped);
    obj_HAPTIC.notch();
  }

  /**
   * Progressively applies service pneumatic train brakes.
   * If applying heavy braking, automatically cuts throttle to idle.
   */
  applyBrake(step = 0.25) {
    obj_SOUND_MANAGER.init();
    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();
    const tmp_curRatio = obj_state.telemetry.brakeAppliedRatio;
    const tmp_curNotch = obj_state.telemetry.throttleNotch;

    // Cut throttle if applying brake
    if (tmp_curNotch > 0) {
      obj_CENTRAL_GAME_STATE.setThrottleNotch(0);
    }

    const tmp_nextRatio = Math.min(1.0, tmp_curRatio + step);
    obj_CENTRAL_GAME_STATE.setBrakeRatio(tmp_nextRatio);
    obj_SOUND_MANAGER.playBrakeHiss();
    obj_HAPTIC.notch();
  }

  /**
   * Sets pneumatic brake application ratio directly (0.0 to 1.0).
   */
  setBrakeRatio(ratio) {
    const tmp_norm = Math.max(0, Math.min(1.0, ratio));
    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();

    // Cut throttle if applying heavy brakes
    if (tmp_norm > 0.35 && obj_state.telemetry.throttleNotch > 0) {
      obj_CENTRAL_GAME_STATE.setThrottleNotch(0);
    }

    obj_CENTRAL_GAME_STATE.setBrakeRatio(tmp_norm);
    obj_HAPTIC.notch();
  }

  /**
   * Releases train service brakes completely.
   */
  releaseBrake() {
    obj_SOUND_MANAGER.init();
    obj_CENTRAL_GAME_STATE.setBrakeRatio(0);
    obj_HAPTIC.light();
  }

  /**
   * Toggles reverser direction between FORWARD and REVERSE.
   * Enforces movement safety interlock when train speed is above 3 km/h.
   */
  toggleReverser() {
    obj_SOUND_MANAGER.init();
    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();
    const tmp_speed = Math.abs(obj_state.telemetry.speedKmh);

    if (tmp_speed >= 3.0) {
      // Reverser interlock locked while in motion
      obj_HAPTIC.light();
      return;
    }

    const tmp_currentDir = obj_state.telemetry.reverser;
    const tmp_nextDir = tmp_currentDir === cons_REVERSER_MODES.FORWARD
      ? cons_REVERSER_MODES.REVERSE
      : cons_REVERSER_MODES.FORWARD;

    obj_CENTRAL_GAME_STATE.setReverser(tmp_nextDir);
    obj_HAPTIC.medium();
  }

  /**
   * Sets reverser direction directly (Forward, Neutral, Reverse).
   * Enforces speed safety interlock when train is in motion (> 3 km/h).
   */
  setReverser(direction) {
    obj_SOUND_MANAGER.init();
    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();
    const tmp_speed = Math.abs(obj_state.telemetry.speedKmh);

    if (tmp_speed >= 3.0) {
      obj_HAPTIC.light();
      return;
    }

    obj_CENTRAL_GAME_STATE.setReverser(direction);
    obj_HAPTIC.medium();
  }

  /**
   * Sets locomotive air horn active sound state.
   */
  setHorn(isActive) {
    obj_SOUND_MANAGER.init();
    obj_CENTRAL_GAME_STATE.setHorn(isActive);
    obj_SOUND_MANAGER.setHorn(isActive);
    if (isActive) {
      obj_HAPTIC.medium();
    }
  }

  /**
   * Toggles locomotive main front headlights.
   */
  toggleHeadlights() {
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.playSwitchToggle();
    obj_CENTRAL_GAME_STATE.toggleHeadlight();
    obj_HAPTIC.light();
  }

  /**
   * Triggers emergency stop brake application.
   * Cuts throttle to 0, dumps brake pipe, plays air hiss, warning alarm, and fires heavy haptic thud.
   */
  triggerEmergencyBrake() {
    obj_AUDIO_MANAGER.init();
    obj_HAPTIC.heavy();
    obj_CENTRAL_GAME_STATE.setThrottleNotch(0);
    obj_CENTRAL_GAME_STATE.setBrakeRatio(1.0);
    obj_AUDIO_MANAGER.playBrakeHiss();
    obj_AUDIO_MANAGER.playWarningAlarm();
  }

  /**
   * Plays knuckle coupler engagement clank sound.
   */
  playCouplingClank() {
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.playCouplingClank();
    obj_HAPTIC.medium();
  }

  /**
   * Plays passenger coach door closing warning chime.
   */
  playDoorChime() {
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.playDoorChime();
    obj_HAPTIC.light();
  }

  /**
   * Triggers cab warning alarm.
   */
  triggerWarningAlarm() {
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.playWarningAlarm();
    obj_HAPTIC.heavy();
  }

  /**
   * Toggles pause state between PLAYING and PAUSED.
   */
  togglePause() {
    obj_SOUND_MANAGER.init();
    obj_HAPTIC.light();
    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();

    if (obj_state.currentMode === cons_GAME_STATE_MODES.PLAYING) {
      obj_CENTRAL_GAME_STATE.setGameMode(cons_GAME_STATE_MODES.PAUSED);
    } else if (obj_state.currentMode === cons_GAME_STATE_MODES.PAUSED) {
      obj_CENTRAL_GAME_STATE.setGameMode(cons_GAME_STATE_MODES.PLAYING);
    }
  }

  /**
   * Adjusts camera perspective or zoom level incrementally.
   * @param {number} delta - Negative zooms out / pans left; positive zooms in / pans right.
   */
  adjustCamera(delta) {
    obj_HAPTIC.light();
    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();
    const tmp_curZoom = obj_state.settings.cameraZoom || 1.0;
    const tmp_newZoom = Math.max(0.65, Math.min(1.4, Math.round((tmp_curZoom + delta) * 100) / 100));

    obj_CENTRAL_GAME_STATE.updateSettings({ cameraZoom: tmp_newZoom });
  }

  /**
   * Cycles camera zoom presets matching specification: Gameplay (1.0x) -> Cinematic (1.15x) -> Overview (0.85x).
   */
  cycleCamera() {
    obj_HAPTIC.light();
    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();
    const tmp_curZoom = obj_state.settings.cameraZoom || 1.0;

    // Presets: Gameplay 1.0x, Cinematic 1.15x, Overview 0.85x
    let tmp_nextZoom = 1.0;
    let tmp_nextMode = 'gameplay';

    if (Math.abs(tmp_curZoom - 1.0) < 0.05) {
      tmp_nextZoom = 1.15;
      tmp_nextMode = 'cinematic';
    } else if (Math.abs(tmp_curZoom - 1.15) < 0.05) {
      tmp_nextZoom = 0.85;
      tmp_nextMode = 'overview';
    } else {
      tmp_nextZoom = 1.0;
      tmp_nextMode = 'gameplay';
    }

    obj_CENTRAL_GAME_STATE.updateSettings({ cameraZoom: tmp_nextZoom, cameraMode: tmp_nextMode });
  }

  /**
   * Toggles optional Cinematic camera tracking view (1.15x with steady-cam drift).
   */
  toggleCinematic() {
    obj_HAPTIC.light();
    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();
    const tmp_curZoom = obj_state.settings.cameraZoom || 1.0;
    const tmp_isCinematic = Math.abs(tmp_curZoom - 1.15) < 0.05;

    const tmp_nextZoom = tmp_isCinematic ? 1.0 : 1.15;
    const tmp_nextMode = tmp_isCinematic ? 'gameplay' : 'cinematic';

    obj_CENTRAL_GAME_STATE.updateSettings({ cameraZoom: tmp_nextZoom, cameraMode: tmp_nextMode });
  }

  /**
   * Toggles sander activation state.
   */
  setSander(isActive) {
    obj_SOUND_MANAGER.init();
    obj_CENTRAL_GAME_STATE.setSander(isActive);
    if (isActive) {
      obj_HAPTIC.light();
    }
  }

  /**
   * Toggles locomotive engine cooling radiator fans / coolant pump.
   */
  toggleCoolant() {
    obj_SOUND_MANAGER.init();
    obj_HAPTIC.medium();
    obj_SOUND_MANAGER.playLeverClick();
    obj_CENTRAL_GAME_STATE.toggleCoolant();
  }

  /**
   * Cycles to next environmental weather condition across all 8 weather states.
   */
  cycleWeather() {
    obj_HAPTIC.light();
    if (window.__ironRailGame && typeof window.__ironRailGame.cycleWeather === 'function') {
      return window.__ironRailGame.cycleWeather();
    }
    return null;
  }

  /**
   * Sets weather state directly with smooth cross-fade transition.
   */
  setWeather(weatherType, duration = 1.2) {
    if (window.__ironRailGame && typeof window.__ironRailGame.setWeather === 'function') {
      window.__ironRailGame.setWeather(weatherType, duration);
    }
  }

  /**
   * Cycles to next time phase (DAWN -> MORNING -> NOON -> AFTERNOON -> SUNSET -> EVENING -> NIGHT).
   */
  cycleTimeOfDay() {
    obj_HAPTIC.light();
    if (window.__ironRailGame && typeof window.__ironRailGame.cycleTimePhase === 'function') {
      return window.__ironRailGame.cycleTimePhase();
    }
    return null;
  }

  /**
   * Sets specific day/night time phase with optional transition duration.
   */
  setTimePhase(phase, duration = 1.2) {
    if (window.__ironRailGame && typeof window.__ironRailGame.setTimePhase === 'function') {
      window.__ironRailGame.setTimePhase(phase, duration);
    }
  }

  /**
   * Toggles browser full screen display mode for the entire window/screen.
   */
  async toggleFullscreen() {
    obj_HAPTIC.light();
    if (typeof document === 'undefined') return;

    try {
      const isFs = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (!isFs) {
        const docEl = document.documentElement;
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Browser fullscreen request failed:', err);
    }
  }

  /**
   * Automatically requests browser fullscreen mode if not already active.
   * Safe to call during user interactions across all tabs, menu, and gameplay.
   */
  async requestFullscreen() {
    if (typeof document === 'undefined') return;

    const isFs = Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
    if (isFs) return;

    try {
      const docEl = document.documentElement;
      let p = null;
      if (docEl.requestFullscreen) {
        p = docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        p = docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        p = docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        p = docEl.msRequestFullscreen();
      }
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    } catch (err) {
      // Defer if gesture context is missing; will trigger on next user interaction
    }
  }
}

// Global actions dispatcher singleton
export const obj_TRAIN_ACTIONS = new TrainActionsManager();
export default obj_TRAIN_ACTIONS;
