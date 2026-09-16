/**
 * ControlsScreen.jsx
 * Full-featured controls modal dialog:
 * - Frosted glass dialog with electric blue perimeter glow
 * - Header banner with bullet train crest, dual-tone CAB title, and locomotive artwork
 * - Instructions bar with Esc kbd chip
 * - Dedicated glowing cyan SVG icons for each action
 * - Dark rounded key badges with click-to-rebind and edit pencil buttons
 * - Footer with Reset to Defaults and glowing Done buttons
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.jsx';
import {
  obj_KEY_BINDINGS,
  cons_ACTIONS,
  cons_ACTION_META,
} from '../game/input/KeyBindingManager.js';
import { obj_HAPTIC } from '../utils/HapticFeedback.js';
import { obj_SOUND_MANAGER } from '../game/audio/SoundManager.js';

/**
 * Returns a dedicated SVG icon for each simulator cab action.
 */
function renderActionIcon(action) {
  switch (action) {
    case cons_ACTIONS.THROTTLE_UP:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 14l3.5-3.5" />
          <path d="M3.34 19a10 10 0 1 1 17.32 0" />
          <line x1="12" y1="14" x2="12" y2="14.01" strokeWidth="3" />
        </svg>
      );
    case cons_ACTIONS.THROTTLE_DOWN:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    case cons_ACTIONS.BRAKE_APPLY:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 8a8 8 0 0 1 14 0" />
          <rect x="3" y="10" width="18" height="6" rx="3" fill="currentColor" fillOpacity="0.25" />
          <line x1="7" y1="13" x2="17" y2="13" />
          <line x1="12" y1="4" x2="12" y2="7" />
        </svg>
      );
    case cons_ACTIONS.HORN:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10v4a2 2 0 0 0 2 2h2l6 4V4l-6 4H5a2 2 0 0 0-2 2z" />
          <path d="M18 8c1.5 2 1.5 6 0 8" />
          <path d="M21 5c3.5 4 3.5 10 0 14" />
        </svg>
      );
    case cons_ACTIONS.REVERSE_DIRECTION:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="7 8 3 12 7 16" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <polyline points="17 8 21 12 17 16" />
        </svg>
      );
    case cons_ACTIONS.HEADLIGHTS:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5a7 7 0 0 1 7 7 7 7 0 0 1-7 7H8a4 4 0 0 1-4-4v-6a4 4 0 0 1 4-4z" />
          <line x1="18" y1="8" x2="22" y2="8" />
          <line x1="19" y1="12" x2="23" y2="12" />
          <line x1="18" y1="16" x2="22" y2="16" />
        </svg>
      );
    case cons_ACTIONS.EMERGENCY_BRAKE:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case cons_ACTIONS.CAMERA_MODE:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      );
    case cons_ACTIONS.CAMERA_LEFT:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 8 8 12 12 16" />
          <line x1="16" y1="12" x2="8" y2="12" />
        </svg>
      );
    case cons_ACTIONS.CAMERA_RIGHT:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 16 16 12 12 8" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      );
    case cons_ACTIONS.CYCLE_WEATHER:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
        </svg>
      );
    case cons_ACTIONS.CYCLE_TIME_OF_DAY:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
        </svg>
      );
    case cons_ACTIONS.FULLSCREEN:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
      );
    case cons_ACTIONS.PAUSE:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
}

/**
 * ControlsScreen component presenting keyboard keybindings and touch interactions.
 */
export function ControlsScreen({ isOpen, onClose }) {
  const [rebindingAction, setRebindingAction] = useState(null);
  const [bindings, setBindings] = useState(obj_KEY_BINDINGS.obj_bindings);

  // Subscribe to keybinding changes
  useEffect(() => {
    const fn_unsub = obj_KEY_BINDINGS.subscribe((newBindings) => {
      setBindings({ ...newBindings });
    });
    return fn_unsub;
  }, []);

  // Listen for keydown when in rebinding state
  useEffect(() => {
    if (!rebindingAction) return;

    function onKeyDownCapture(e) {
      e.preventDefault();
      e.stopPropagation();

      // Escape cancels rebinding
      if (e.code === 'Escape') {
        setRebindingAction(null);
        return;
      }

      obj_SOUND_MANAGER.init();
      obj_HAPTIC.light();
      obj_KEY_BINDINGS.rebindAction(rebindingAction, [e.code]);
      setRebindingAction(null);
    }

    window.addEventListener('keydown', onKeyDownCapture, { capture: true });
    return () => {
      window.removeEventListener('keydown', onKeyDownCapture, { capture: true });
    };
  }, [rebindingAction]);

  if (!isOpen) return null;

  /**
   * Resets all custom keybindings to factory defaults.
   */
  function handleResetDefaults() {
    obj_SOUND_MANAGER.init();
    obj_HAPTIC.medium();
    obj_KEY_BINDINGS.resetToDefaults();
  }

  // Ordered list of action items matching reference mockup
  const arr_actionKeys = [
    cons_ACTIONS.THROTTLE_UP,
    cons_ACTIONS.THROTTLE_DOWN,
    cons_ACTIONS.BRAKE_APPLY,
    cons_ACTIONS.HORN,
    cons_ACTIONS.REVERSE_DIRECTION,
    cons_ACTIONS.HEADLIGHTS,
    cons_ACTIONS.EMERGENCY_BRAKE,
    cons_ACTIONS.CAMERA_MODE,
    cons_ACTIONS.CAMERA_LEFT,
    cons_ACTIONS.CAMERA_RIGHT,
    cons_ACTIONS.CYCLE_WEATHER,
    cons_ACTIONS.CYCLE_TIME_OF_DAY,
    cons_ACTIONS.FULLSCREEN,
    cons_ACTIONS.PAUSE,
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={840} className="controls-dialog">
      <div className="controls-modal">
        {/* Keyboard Bindings Controls Section */}
        <div className="controls-modal__section">

            {/* Scrollable Action Rows List */}
            <div className="controls-modal__list">
              {arr_actionKeys.map((tmp_action) => {
                const obj_meta = cons_ACTION_META[tmp_action] || { name: tmp_action, description: '' };
                const arr_codes = bindings[tmp_action] || [];
                const tmp_isRebindingThis = rebindingAction === tmp_action;

                return (
                  <div key={tmp_action} className="controls-modal__item">
                    {/* Left: Dedicated Glowing Cyan Icon */}
                    <div className="controls-modal__icon-box">
                      {renderActionIcon(tmp_action)}
                    </div>

                    {/* Center: Action Title and Operation Description */}
                    <div className="controls-modal__item-info">
                      <span className="controls-modal__item-name">{obj_meta.name}</span>
                      <span className="controls-modal__item-desc">{obj_meta.description}</span>
                    </div>

                    {/* Right: Key Badge Group + Edit Pencil Button */}
                    <div className="controls-modal__keys-group">
                      {tmp_isRebindingThis ? (
                        <span className="controls-modal__key-chip controls-modal__key-chip--rebinding">
                          Press any key...
                        </span>
                      ) : (
                        arr_codes.map((tmp_c) => (
                          <button
                            key={tmp_c}
                            type="button"
                            className="controls-modal__key-chip"
                            onClick={() => setRebindingAction(tmp_action)}
                            title="Click to rebind"
                          >
                            {obj_KEY_BINDINGS.formatCode(tmp_c)}
                          </button>
                        ))
                      )}

                      {!tmp_isRebindingThis && (
                        <button
                          type="button"
                          className="controls-modal__rebind-btn"
                          onClick={() => setRebindingAction(tmp_action)}
                          title="Change binding"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Action Buttons */}
            <div className="controls-modal__footer-bar">
              <button
                type="button"
                className="controls-modal__btn-reset"
                onClick={handleResetDefaults}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span>RESET TO DEFAULTS</span>
              </button>

              <button
                type="button"
                className="controls-modal__btn-done"
                onClick={onClose}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Save</span>
              </button>
            </div>
          </div>
      </div>
    </Modal>
  );
}

export default ControlsScreen;

