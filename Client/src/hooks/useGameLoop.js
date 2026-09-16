/**
 * useGameLoop.js
 * React hook subscribing components to centralized game state updates and telemetry.
 */

import { useState, useEffect } from 'react';
import { obj_CENTRAL_GAME_STATE } from '../game/core/GameState.js';

/**
 * Hook subscribing to CentralGameState changes.
 */
export function useGameState() {
  const [gameState, setGameState] = useState(() => obj_CENTRAL_GAME_STATE.getSnapshot());

  useEffect(() => {
    /**
     * Updates local React state when central store notifies of changes.
     */
    const fn_unsubscribe = obj_CENTRAL_GAME_STATE.subscribe((obj_snapshot) => {
      setGameState(obj_snapshot);
    });

    return () => {
      fn_unsubscribe();
    };
  }, []);

  return gameState;
}

/**
 * Hook providing a throttled timer for smooth UI telemetry gauge sweeps.
 */
export function useTelemetryTick(intervalMs = 50) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const tmp_timer = setInterval(() => {
      setTick((prev) => (prev + 1) % 10000);
    }, intervalMs);

    return () => clearInterval(tmp_timer);
  }, [intervalMs]);

  return tick;
}
