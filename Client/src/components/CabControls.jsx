/**
 * CabControls.jsx
 * Realistic lower locomotive cab dashboard console featuring reverser, throttle,
 * analog gauges (speed, engine temp/RPM, air brake, fuel), switches, and warning lights.
 * Delegates directly to the authentic physical TrainDashboard console component.
 */

import React from 'react';
import { TrainDashboard } from './hud/TrainDashboard.jsx';

/**
 * Renders the tactile lower locomotive dashboard console.
 */
export function CabControls() {
  return <TrainDashboard />;
}

export default CabControls;
