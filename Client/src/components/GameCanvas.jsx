/**
 * GameCanvas.jsx
 * Responsive HTML5 Canvas component with high-DPI scaling and game engine lifecycle.
 */

import React, { useRef, useEffect } from 'react';
import { Game } from '../game/core/Game.js';
import { obj_CENTRAL_GAME_STATE } from '../game/core/GameState.js';
import { obj_INPUT_MANAGER } from '../game/input/InputManager.js';
import { obj_SOUND_MANAGER } from '../game/audio/SoundManager.js';

/**
 * Manages the HTML5 Canvas lifecycle, size synchronization, and game engine loop.
 */
export function GameCanvas({ currentMission }) {
  const ref_canvas = useRef(null);
  const ref_game = useRef(null);

  useEffect(() => {
    const tmp_canvasEl = ref_canvas.current;
    if (!tmp_canvasEl) return;

    // Attach input listeners
    obj_INPUT_MANAGER.attach();

    // Create game engine instance
    const tmp_game = new Game(tmp_canvasEl);
    ref_game.current = tmp_game;
    window.__ironRailGame = tmp_game;

    // Load initial mission
    const obj_missionToLoad = currentMission || obj_CENTRAL_GAME_STATE.getSnapshot().currentMission;
    tmp_game.loadMission(obj_missionToLoad);

    /**
     * Resizes canvas buffer to match DOM container dimensions.
     */
    function handleResize() {
      if (!tmp_canvasEl || !ref_game.current) return;
      const tmp_rect = tmp_canvasEl.getBoundingClientRect();
      if (tmp_rect.width > 0 && tmp_rect.height > 0) {
        ref_game.current.resize(tmp_rect.width, tmp_rect.height);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // ResizeObserver catches container size shifts from flex/grid changes or orientation swaps immediately
    let obj_resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined' && tmp_canvasEl.parentElement) {
      obj_resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            if (ref_game.current) {
              ref_game.current.resize(entry.contentRect.width, entry.contentRect.height);
            }
          }
        }
      });
      obj_resizeObserver.observe(tmp_canvasEl.parentElement);
    }

    // Start engine loop
    tmp_game.start();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (obj_resizeObserver) {
        obj_resizeObserver.disconnect();
      }
      obj_INPUT_MANAGER.detach();
      if (window.__ironRailGame === tmp_game) {
        window.__ironRailGame = null;
      }
      if (ref_game.current) {
        ref_game.current.destroy();
        ref_game.current = null;
      }
    };
  }, []);

  // Reload mission when mission prop changes
  useEffect(() => {
    if (ref_game.current && currentMission) {
      ref_game.current.loadMission(currentMission);
    }
  }, [currentMission]);

  /**
   * Initializes audio on canvas touch or click.
   */
  function handleCanvasInteraction() {
    obj_SOUND_MANAGER.init();
  }

  return (
    <div className="game-canvas-container" onClick={handleCanvasInteraction}>
      <canvas
        ref={ref_canvas}
        className="game-canvas"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
