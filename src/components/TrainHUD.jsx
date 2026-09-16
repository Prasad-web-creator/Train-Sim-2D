/**
 * TrainHUD.jsx
 * Top heads-up display showing route line progress, current distance, speed limits,
 * overspeed warnings, pause button, and mission status.
 * Delegates directly to the polished TopHUD component.
 */

import React from 'react';
import { TopHUD } from './hud/TopHUD.jsx';

/**
 * Renders the top HUD with route track bar, speed limit signs, and pause controls.
 * 
 * @param {Object} props
 * @param {function} [props.onOpenPause] - Callback to trigger game pause
 */
export function TrainHUD({ onOpenPause }) {
  return <TopHUD onOpenPause={onOpenPause} />;
}

export default TrainHUD;
