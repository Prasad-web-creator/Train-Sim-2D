/**
 * SignalSystem.js
 * Master coordinator for railway line signalling.
 * Manages physical trackside signals positioned by track chainage,
 * runs 4-aspect dynamic block occupancy progression, evaluates cab signal detection,
 * and renders signals at exact track elevation coordinates.
 */

import { RailSignal } from './RailSignal.js';
import { SignalDetector } from './SignalDetector.js';
import {
  cons_SIGNAL_STATES,
  cons_SIGNAL_TYPES,
  cons_SIGNAL_RULES,
} from './SignalConstants.js';
import { cons_GAME_CONFIG } from '../../constants/GameConstants.js';
import { obj_CENTRAL_GAME_STATE } from '../core/GameState.js';

export class SignalSystem {
  /**
   * Initializes the signalling system and its locomotive detector.
   */
  constructor() {
    this.arr_signals = [];
    this.detector = new SignalDetector();
    this.trackLengthMeters = 5000;
  }

  /**
   * Loads or procedurally distributes trackside signals along the route.
   * 
   * @param {Object} obj_mission - Mission scenario definition
   * @param {Object} trackSystem - Track geometry evaluator
   */
  loadSignals(obj_mission, trackSystem) {
    this.arr_signals = [];
    this.detector.reset();
    this.trackLengthMeters = obj_mission.trackLengthMeters || 5000;

    // Check if the mission defines explicit signals
    if (obj_mission.signals && Array.isArray(obj_mission.signals) && obj_mission.signals.length > 0) {
      for (let tmp_i = 0; tmp_i < obj_mission.signals.length; tmp_i++) {
        const obj_def = obj_mission.signals[tmp_i];
        this.arr_signals.push(new RailSignal({
          id: obj_def.id || `sig_${tmp_i + 1}`,
          name: obj_def.name || `SIG ${(tmp_i + 1).toString().padStart(2, '0')}`,
          trackDistMeters: obj_def.trackDistMeters,
          state: obj_def.state || cons_SIGNAL_STATES.GREEN,
          type: obj_def.type || cons_SIGNAL_TYPES.MAST,
        }));
      }
    } else {
      // Procedurally generate realistic 4-aspect block signals based on track chainage
      this.generateProceduralSignals(obj_mission, trackSystem);
    }

    // Sort signals in ascending order along the track
    this.arr_signals.sort((a, b) => a.trackDistMeters - b.trackDistMeters);
  }

  /**
   * Procedurally places signals along the track with realistic block spacing,
   * station starters, distant warnings, and station approach home signals.
   */
  generateProceduralSignals(obj_mission, trackSystem) {
    const tmp_totalDist = this.trackLengthMeters;

    // 1. Station Depot Exit Starter Signal (e.g. at 140m)
    this.arr_signals.push(new RailSignal({
      id: 'sig_starter',
      name: 'SIG 01',
      trackDistMeters: 140,
      state: cons_SIGNAL_STATES.GREEN,
      type: cons_SIGNAL_TYPES.MAST,
    }));

    // 2. Intermediate Automatic Block Signals (~every 750m - 900m)
    let tmp_sigIndex = 2;
    const cons_STEP = cons_SIGNAL_RULES.DEFAULT_BLOCK_LENGTH_METERS; // 850m

    for (let tmp_d = 850; tmp_d < tmp_totalDist - 600; tmp_d += cons_STEP) {
      // Determine aspect: vary between Clear, Pre-Caution, and Caution
      let tmp_aspect = cons_SIGNAL_STATES.GREEN;
      let tmp_type = cons_SIGNAL_TYPES.MAST;

      // Occasional overhead gantry near junctions or major bridges
      if (tmp_sigIndex % 3 === 0) {
        tmp_type = cons_SIGNAL_TYPES.GANTRY;
      }

      // Add a dynamic caution / yellow signal in the second half of the route
      if (tmp_d > tmp_totalDist * 0.55 && tmp_d < tmp_totalDist * 0.75 && tmp_aspect === cons_SIGNAL_STATES.GREEN) {
        tmp_aspect = cons_SIGNAL_STATES.YELLOW;
      }

      this.arr_signals.push(new RailSignal({
        id: `sig_${tmp_sigIndex}`,
        name: `SIG ${tmp_sigIndex.toString().padStart(2, '0')}`,
        trackDistMeters: tmp_d,
        state: tmp_aspect,
        type: tmp_type,
      }));

      tmp_sigIndex++;
    }

    // 3. Station Approach Distant Signal (Yellow caution ~480m before terminal)
    const tmp_distantDist = Math.max(300, tmp_totalDist - 480);
    this.arr_signals.push(new RailSignal({
      id: 'sig_distant',
      name: `SIG ${tmp_sigIndex.toString().padStart(2, '0')}`,
      trackDistMeters: tmp_distantDist,
      state: cons_SIGNAL_STATES.YELLOW,
      type: cons_SIGNAL_TYPES.MAST,
    }));
    tmp_sigIndex++;

    // 4. Terminal Buffer Stop Home Signal (RED at station throat ~80m before end)
    const tmp_homeDist = Math.max(100, tmp_totalDist - 90);
    this.arr_signals.push(new RailSignal({
      id: 'sig_home',
      name: `SIG ${tmp_sigIndex.toString().padStart(2, '0')}`,
      trackDistMeters: tmp_homeDist,
      state: cons_SIGNAL_STATES.RED,
      type: cons_SIGNAL_TYPES.MAST,
    }));
  }

  /**
   * Updates optical lamp states, evaluates block transitions, and runs the cab signal detector.
   * 
   * @param {number} deltaTime - Frame step in seconds
   * @param {number} trainDistMeters - Train locomotive position
   * @param {number} trainSpeedKmh - Train speed in km/h
   * @param {Object} [physics] - Locomotive physics object
   * @param {Object} [missionSystem] - Active mission system
   */
  update(deltaTime, trainDistMeters, trainSpeedKmh, physics, missionSystem) {
    // 1. Update each signal's internal optical lamps
    for (let tmp_i = 0; tmp_i < this.arr_signals.length; tmp_i++) {
      this.arr_signals[tmp_i].update(deltaTime);
    }

    // 2. Dynamic 3-Aspect Block Clearing Progression (Red, Yellow, Green only):
    // When the train passes a signal, the block drops to RED, clears to YELLOW, then clears to GREEN
    for (let tmp_i = 0; tmp_i < this.arr_signals.length; tmp_i++) {
      const obj_sig = this.arr_signals[tmp_i];
      if (obj_sig.isPassed && !obj_sig.isPassedAtDanger) {
        const tmp_distPassed = trainDistMeters - obj_sig.trackDistMeters;
        if (tmp_distPassed > 0 && tmp_distPassed < 850) {
          if (obj_sig.state !== cons_SIGNAL_STATES.RED) obj_sig.setAspect(cons_SIGNAL_STATES.RED);
        } else if (tmp_distPassed >= 850 && tmp_distPassed < 1700) {
          if (obj_sig.state !== cons_SIGNAL_STATES.YELLOW) obj_sig.setAspect(cons_SIGNAL_STATES.YELLOW);
        } else if (tmp_distPassed >= 1700) {
          if (obj_sig.state !== cons_SIGNAL_STATES.GREEN) obj_sig.setAspect(cons_SIGNAL_STATES.GREEN);
        }
      }
    }

    // 3. Update locomotive cab signal detector
    const obj_telemetry = this.detector.update(
      trainDistMeters,
      trainSpeedKmh,
      deltaTime,
      this.arr_signals,
      missionSystem
    );

    // 4. Update centralized GameState so HUD components can react seamlessly
    obj_CENTRAL_GAME_STATE.updateSignalTelemetry(obj_telemetry);

    return obj_telemetry;
  }

  /**
   * Retrieves signals situated within a world track meter distance range for fast culling.
   */
  getSignalsInRange(startMeters, endMeters) {
    const arr_result = [];
    for (let tmp_i = 0; tmp_i < this.arr_signals.length; tmp_i++) {
      const obj_sig = this.arr_signals[tmp_i];
      if (obj_sig.trackDistMeters >= startMeters && obj_sig.trackDistMeters <= endMeters) {
        arr_result.push(obj_sig);
      }
    }
    return arr_result;
  }

  /**
   * Renders all trackside signals currently visible in the camera viewport.
   * Signals are placed into the world based on track distance rather than screen position.
   * 
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   * @param {number} cameraWorldX - Camera center position in world pixels
   * @param {number} viewportWidth - Canvas logical width
   * @param {Object} trackSystem - Track geometry evaluator
   */
  render(ctx, cameraWorldX, viewportWidth, trackSystem, haloMultiplier = 1.0) {
    if (!trackSystem) return;

    const tmp_ppm = cons_GAME_CONFIG.PIXELS_PER_METER;
    const tmp_visibleRadiusMeters = (viewportWidth / tmp_ppm) * 0.65;
    const tmp_camDistMeters = cameraWorldX / tmp_ppm;

    const tmp_startDist = tmp_camDistMeters - tmp_visibleRadiusMeters - 20;
    const tmp_endDist = tmp_camDistMeters + tmp_visibleRadiusMeters + 20;

    const arr_visible = this.getSignalsInRange(tmp_startDist, tmp_endDist);

    for (let tmp_i = 0; tmp_i < arr_visible.length; tmp_i++) {
      const obj_sig = arr_visible[tmp_i];
      const tmp_worldX = obj_sig.trackDistMeters * tmp_ppm;
      const tmp_groundY = trackSystem.getElevationAt(obj_sig.trackDistMeters);

      obj_sig.render(ctx, tmp_worldX, tmp_groundY, haloMultiplier);
    }
  }
}

export default SignalSystem;
