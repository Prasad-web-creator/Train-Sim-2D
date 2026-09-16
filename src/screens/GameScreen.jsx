/**
 * GameScreen.jsx
 * Main gameplay layout combining canvas world view, top heads-up display,
 * lower tactile locomotive cab console, and pause/mission overlays.
 */

import React, { useState, useEffect } from 'react';
import { GameCanvas } from '../components/GameCanvas.jsx';
import { TrainHUD } from '../components/TrainHUD.jsx';
import { CabControls } from '../components/CabControls.jsx';
import { PauseMenu } from './PauseMenu.jsx';
import { SettingsScreen } from './SettingsScreen.jsx';
import { useGameState } from '../hooks/useGameLoop.js';
import { cons_GAME_STATE_MODES } from '../constants/GameConstants.js';
import { obj_TRAIN_ACTIONS } from '../game/actions/TrainActions.js';

/**
 * Main in-game simulation screen composing viewport canvas and driving controls.
 */
export function GameScreen() {
  const gameState = useGameState();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Automatically request fullscreen on mounting the gameplay screen
  useEffect(() => {
    obj_TRAIN_ACTIONS.requestFullscreen();
  }, []);

  const tmp_isPaused = gameState.currentMode === cons_GAME_STATE_MODES.PAUSED;

  return (
    <main
      className="game-screen"
      onClick={() => obj_TRAIN_ACTIONS.requestFullscreen()}
      onTouchStart={() => obj_TRAIN_ACTIONS.requestFullscreen()}
    >
      {/* Top HUD: Distance, Route bar, Speed Limit, Pause button */}
      <TrainHUD onOpenPause={() => {}} />

      {/* Center/Upper World View: Real-time 2D Canvas */}
      <div className="game-screen__canvas-wrapper">
        <GameCanvas currentMission={gameState.currentMission} />
      </div>

      {/* Lower Cab Console: Levers, Round Dial Gauges, Switches */}
      <CabControls />

      {/* In-Game Pause Menu */}
      <PauseMenu
        isOpen={tmp_isPaused}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsScreen
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  );
}
