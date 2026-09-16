/**
 * PauseMenu.jsx
 * In-game pause modal dialog with resume, restart, settings, and main menu actions.
 */

import React, { useState } from 'react';
import { obj_CENTRAL_GAME_STATE } from '../game/core/GameState.js';
import { obj_SOUND_MANAGER } from '../game/audio/SoundManager.js';
import { Button } from '../ui/Button.jsx';
import { Modal } from '../ui/Modal.jsx';
import { ControlsScreen } from './ControlsScreen.jsx';
import { cons_GAME_STATE_MODES } from '../constants/GameConstants.js';
import { obj_TRAIN_ACTIONS } from '../game/actions/TrainActions.js';


/**
 * Renders the pause menu overlay during gameplay.
 */
export function PauseMenu({ isOpen, onResume, onOpenSettings }) {
  const [showControls, setShowControls] = useState(false);

  if (!isOpen) return null;

  /**
   * Resumes gameplay.
   */
  function handleResume() {
    obj_SOUND_MANAGER.init();
    obj_TRAIN_ACTIONS.requestFullscreen();
    if (onResume) {
      onResume();
    } else {
      obj_CENTRAL_GAME_STATE.setGameMode(cons_GAME_STATE_MODES.PLAYING);
    }
  }

  /**
   * Restarts current mission run.
   */
  function handleRestart() {
    obj_SOUND_MANAGER.init();
    obj_TRAIN_ACTIONS.requestFullscreen();
    obj_CENTRAL_GAME_STATE.restartCurrentMission();
  }

  /**
   * Returns to main menu.
   */
  function handleQuit() {
    obj_SOUND_MANAGER.init();
    obj_CENTRAL_GAME_STATE.setGameMode(cons_GAME_STATE_MODES.MENU);
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleResume} title="GAME PAUSED" maxWidth={400}>
        <div className="pause-menu">
          <p className="pause-menu__hint">Simulation is temporarily suspended.</p>

          <div className="pause-menu__actions">
            <Button variant="primary" onClick={handleResume}>
              ▶ Resume Run
            </Button>
            <Button variant="secondary" onClick={handleRestart}>
              ↻ Restart Run
            </Button>
            <Button variant="neutral" onClick={() => setShowControls(true)}>
              ⌨ Controls & Key-Bindings
            </Button>
            <Button variant="neutral" onClick={onOpenSettings}>
              ⚙ Audio & Settings
            </Button>
            <Button variant="danger" onClick={handleQuit}>
              ⏏ Quit to Main Menu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Controls & Rebinding Modal */}
      <ControlsScreen
        isOpen={showControls}
        onClose={() => setShowControls(false)}
      />
    </>
  );
}

export default PauseMenu;

