/**
 * InputManager.js
 * Centralized keyboard input orchestrator linking configurable keybindings to unified game actions.
 * Guarantees zero typing interference in menus/inputs and suppresses unwanted browser scroll defaults.
 */

import { obj_CENTRAL_GAME_STATE } from '../core/GameState.js';
import { obj_TRAIN_ACTIONS } from '../actions/TrainActions.js';
import { obj_KEY_BINDINGS, cons_ACTIONS } from './KeyBindingManager.js';
import { cons_GAME_STATE_MODES } from '../../constants/GameConstants.js';

export class InputManager {
  /**
   * Initializes input tracking maps and binds keyboard listeners.
   */
  constructor() {
    this.obj_keysDown = {};
    this.isAttached = false;
    this.fn_handleKeyDown = this.handleKeyDown.bind(this);
    this.fn_handleKeyUp = this.handleKeyUp.bind(this);
  }

  /**
   * Attaches window event listeners for keyboard interactions.
   */
  attach() {
    if (this.isAttached) return;
    window.addEventListener('keydown', this.fn_handleKeyDown);
    window.addEventListener('keyup', this.fn_handleKeyUp);
    this.isAttached = true;
  }

  /**
   * Detaches window event listeners to avoid memory leaks.
   */
  detach() {
    if (!this.isAttached) return;
    window.removeEventListener('keydown', this.fn_handleKeyDown);
    window.removeEventListener('keyup', this.fn_handleKeyUp);
    this.isAttached = false;
  }

  /**
   * Checks whether the event originated from an editable form element (e.g. text input, slider, textarea).
   */
  fn_isTargetTypingElement(target) {
    if (!target) return false;
    const tmp_tag = target.tagName;
    return (
      tmp_tag === 'INPUT' ||
      tmp_tag === 'TEXTAREA' ||
      tmp_tag === 'SELECT' ||
      target.isContentEditable === true
    );
  }

  /**
   * Handles keyboard keydown events for train control commands.
   */
  handleKeyDown(event) {
    // 1. Never interfere with typing inside menus, settings, or search inputs
    if (this.fn_isTargetTypingElement(event.target)) {
      return;
    }

    const tmp_code = event.code;
    const tmp_action = obj_KEY_BINDINGS.getActionByCode(tmp_code);

    // If key is not bound to any locomotive action, let browser handle normally
    if (!tmp_action) {
      return;
    }

    // 2. Prevent browser default action (e.g. Space scrolling page, Arrow keys scrolling window)
    if (
      tmp_code === 'Space' ||
      tmp_code.startsWith('Arrow') ||
      tmp_code === 'Tab' ||
      (tmp_action && !tmp_code.startsWith('F'))
    ) {
      event.preventDefault();
    }

    // Avoid key repeat spam for single-shot actions
    if (this.obj_keysDown[tmp_code]) {
      return;
    }
    this.obj_keysDown[tmp_code] = true;

    // 3. Pause toggle is handled anytime (unless a modal dialog is currently open)
    if (tmp_action === cons_ACTIONS.PAUSE) {
      const tmp_hasOpenModal = typeof document !== 'undefined' && !!document.querySelector('.iron-modal');
      if (tmp_hasOpenModal) {
        return;
      }
      obj_TRAIN_ACTIONS.togglePause();
      return;
    }

    // 3b. Fullscreen toggle is handled anytime
    if (tmp_action === cons_ACTIONS.FULLSCREEN) {
      obj_TRAIN_ACTIONS.toggleFullscreen();
      return;
    }

    // 4. Ensure game is actively playing before processing locomotive commands
    const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();
    if (obj_state.currentMode !== cons_GAME_STATE_MODES.PLAYING) {
      return;
    }

    // 5. Dispatch command to unified TrainActions
    switch (tmp_action) {
      case cons_ACTIONS.THROTTLE_UP:
        obj_TRAIN_ACTIONS.increaseThrottle();
        break;

      case cons_ACTIONS.THROTTLE_DOWN:
        obj_TRAIN_ACTIONS.decreaseThrottle();
        break;

      case cons_ACTIONS.BRAKE_APPLY:
        obj_TRAIN_ACTIONS.applyBrake(0.25);
        break;

      case cons_ACTIONS.HORN:
        obj_TRAIN_ACTIONS.setHorn(true);
        break;

      case cons_ACTIONS.REVERSE_DIRECTION:
        obj_TRAIN_ACTIONS.toggleReverser();
        break;

      case cons_ACTIONS.HEADLIGHTS:
        obj_TRAIN_ACTIONS.toggleHeadlights();
        break;

      case cons_ACTIONS.EMERGENCY_BRAKE:
        obj_TRAIN_ACTIONS.triggerEmergencyBrake();
        break;

      case cons_ACTIONS.CAMERA_LEFT:
        obj_TRAIN_ACTIONS.adjustCamera(-0.15);
        break;

      case cons_ACTIONS.CAMERA_RIGHT:
        obj_TRAIN_ACTIONS.adjustCamera(0.15);
        break;

      case cons_ACTIONS.CAMERA_MODE:
        obj_TRAIN_ACTIONS.toggleCinematic();
        break;

      case cons_ACTIONS.CYCLE_WEATHER:
        obj_TRAIN_ACTIONS.cycleWeather();
        break;

      case cons_ACTIONS.CYCLE_TIME_OF_DAY:
        obj_TRAIN_ACTIONS.cycleTimeOfDay();
        break;

      default:
        break;
    }
  }

  /**
   * Handles keyboard keyup events for momentary commands (such as Horn release).
   */
  handleKeyUp(event) {
    if (this.fn_isTargetTypingElement(event.target)) {
      return;
    }

    const tmp_code = event.code;
    this.obj_keysDown[tmp_code] = false;

    const tmp_action = obj_KEY_BINDINGS.getActionByCode(tmp_code);
    if (!tmp_action) return;

    // Momentary action releases
    if (tmp_action === cons_ACTIONS.HORN) {
      obj_TRAIN_ACTIONS.setHorn(false);
    }
  }
}

// Global input manager singleton
export const obj_INPUT_MANAGER = new InputManager();
export default obj_INPUT_MANAGER;
