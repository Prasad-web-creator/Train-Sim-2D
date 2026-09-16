/**
 * SignalDetector.js
 * Locomotive cab signalling receiver (AWS / ATC / TPWS).
 * Scans upcoming trackside signals, detects crossing events, enforces speed compliance,
 * sounds cab alerts, and triggers SPAD penalty emergency stops.
 */

import {
  cons_SIGNAL_STATES,
  cons_SIGNAL_RULES,
  cons_SIGNAL_ADVISORY_SPEEDS,
} from './SignalConstants.js';
import { obj_SOUND_MANAGER } from '../audio/SoundManager.js';
import { obj_TRAIN_ACTIONS } from '../actions/TrainActions.js';
import { obj_HAPTIC } from '../../utils/HapticFeedback.js';

export class SignalDetector {
  /**
   * Initializes the cab signal detector receiver.
   */
  constructor() {
    this.approachingSignal = null;
    this.distanceToSignalMeters = 9999;
    this.previousTrainDistMeters = 0;

    // Violation state registers
    this.isViolationActive = false;
    this.violationType = null;
    this.violationMessage = '';
    this.violationTimer = 0.0;

    // AWS audio warning latch (prevents repeated buzzing on same signal approach)
    this.warnedSignalId = null;
  }

  /**
   * Evaluates train position relative to trackside signals, checks crossing events,
   * and enforces railway safety rules.
   * 
   * @param {number} trainDistMeters - Current track distance of locomotive
   * @param {number} trainSpeedKmh - Current locomotive speed in km/h
   * @param {number} deltaTime - Frame step in seconds
   * @param {Array<RailSignal>} arr_signals - List of all route signals
   * @param {Object} [missionSystem] - Active mission system for penalties
   */
  update(trainDistMeters, trainSpeedKmh, deltaTime, arr_signals, missionSystem) {
    // 1. Manage violation display timer
    if (this.isViolationActive) {
      this.violationTimer -= deltaTime;
      if (this.violationTimer <= 0) {
        this.isViolationActive = false;
        this.violationType = null;
        this.violationMessage = '';
      }
    }

    // 2. Find closest upcoming signal ahead of train
    let obj_closestAhead = null;
    let tmp_minDist = Infinity;

    for (let tmp_i = 0; tmp_i < arr_signals.length; tmp_i++) {
      const obj_sig = arr_signals[tmp_i];
      const tmp_distAhead = obj_sig.trackDistMeters - trainDistMeters;

      if (tmp_distAhead >= 0 && tmp_distAhead <= cons_SIGNAL_RULES.DETECTION_RANGE_METERS) {
        if (tmp_distAhead < tmp_minDist) {
          tmp_minDist = tmp_distAhead;
          obj_closestAhead = obj_sig;
        }
      }
    }

    this.approachingSignal = obj_closestAhead;
    this.distanceToSignalMeters = obj_closestAhead ? tmp_minDist : 9999;

    // 3. AWS Audible Warning when approaching restrictive aspect (< 350m)
    if (obj_closestAhead && tmp_minDist <= cons_SIGNAL_RULES.AWS_WARNING_DISTANCE_METERS) {
      if (this.warnedSignalId !== obj_closestAhead.id) {
        this.warnedSignalId = obj_closestAhead.id;
        if (obj_closestAhead.state !== cons_SIGNAL_STATES.GREEN && obj_closestAhead.state !== cons_SIGNAL_STATES.OFF) {
          obj_SOUND_MANAGER.playSignalWarning();
          obj_HAPTIC.medium();
        }
      }
    }

    // 4. Detect signal crossings in this frame step
    const tmp_prev = this.previousTrainDistMeters;
    const tmp_cur = trainDistMeters;

    if (tmp_prev > 0) {
      for (let tmp_i = 0; tmp_i < arr_signals.length; tmp_i++) {
        const obj_sig = arr_signals[tmp_i];

        // Check if train crossed the signal boundary this frame
        if (tmp_prev < obj_sig.trackDistMeters && tmp_cur >= obj_sig.trackDistMeters) {
          this.handleSignalCrossing(obj_sig, trainSpeedKmh, missionSystem);
        }
      }
    }

    this.previousTrainDistMeters = trainDistMeters;

    // 5. Produce telemetry snapshot
    return {
      approachingSignalId: obj_closestAhead ? obj_closestAhead.id : null,
      signalName: obj_closestAhead ? obj_closestAhead.name : 'LINE CLEAR',
      aspect: obj_closestAhead ? obj_closestAhead.state : cons_SIGNAL_STATES.GREEN,
      distanceMeters: this.distanceToSignalMeters,
      advisorySpeedKmh: obj_closestAhead ? obj_closestAhead.speedLimitKmh : 999,
      isViolationActive: this.isViolationActive,
      violationType: this.violationType,
      violationMessage: this.violationMessage,
    };
  }

  /**
   * Evaluates safety rules when the locomotive crosses past a physical signal head.
   */
  handleSignalCrossing(signal, trainSpeedKmh, missionSystem) {
    signal.isPassed = true;
    signal.passedSpeedKmh = trainSpeedKmh;

    const tmp_absSpeed = Math.abs(trainSpeedKmh);

    // ====================================================
    // RED SIGNAL: SPAD (Signal Passed At Danger) VIOLATION
    // ====================================================
    if (signal.state === cons_SIGNAL_STATES.RED) {
      signal.isPassedAtDanger = true;
      this.isViolationActive = true;
      this.violationType = 'SPAD';
      this.violationMessage = `🚨 SPAD VIOLATION! PASSED RED SIGNAL ${signal.name}! EMERGENCY BRAKES ENGAGED! (-500 PTS)`;
      this.violationTimer = cons_SIGNAL_RULES.SPAD_VIOLATION_DURATION_SEC;

      // 1. Trigger mission score penalty
      if (missionSystem && missionSystem.applySignalPenalty) {
        missionSystem.applySignalPenalty('SPAD', cons_SIGNAL_RULES.SPAD_PENALTY_POINTS, signal.name);
      }

      // 2. Enforce automatic emergency braking to a full stop
      obj_TRAIN_ACTIONS.triggerEmergencyBrake();

      // 3. Play emergency klaxon alarm & heavy haptic buzz
      obj_SOUND_MANAGER.playSpadAlarm();
      obj_HAPTIC.heavy();
      return;
    }

    // ====================================================
    // YELLOW SIGNAL: Caution aspect (Speed limit 45 km/h)
    // ====================================================
    if (signal.state === cons_SIGNAL_STATES.YELLOW) {
      const cons_CAUTION_LIMIT = cons_SIGNAL_RULES.CAUTION_SPEED_LIMIT_KMH; // 45 km/h
      if (tmp_absSpeed > cons_CAUTION_LIMIT + 3.0) {
        this.isViolationActive = true;
        this.violationType = 'OVERSPEED_YELLOW';
        this.violationMessage = `⚠️ CAUTION SPEED EXCEEDED: Passed ${signal.name} at ${Math.round(tmp_absSpeed)} km/h! (Limit: ${cons_CAUTION_LIMIT} km/h) -50 PTS`;
        this.violationTimer = 4.5;

        if (missionSystem && missionSystem.applySignalPenalty) {
          missionSystem.applySignalPenalty('CAUTION_OVERSPEED', cons_SIGNAL_RULES.OVERSPEED_PENALTY_POINTS, signal.name);
        }
        obj_SOUND_MANAGER.playSignalWarning();
        obj_HAPTIC.medium();
      }
      return;
    }

    // ====================================================
    // DOUBLE YELLOW: Preliminary caution (75 km/h advisory)
    // ====================================================
    if (signal.state === cons_SIGNAL_STATES.DOUBLE_YELLOW) {
      const cons_PRE_LIMIT = cons_SIGNAL_RULES.PRE_CAUTION_SPEED_LIMIT_KMH; // 75 km/h
      if (tmp_absSpeed > cons_PRE_LIMIT + 5.0) {
        this.isViolationActive = true;
        this.violationType = 'OVERSPEED_DOUBLE_YELLOW';
        this.violationMessage = `⚠️ PRELIMINARY CAUTION: Passed ${signal.name} at ${Math.round(tmp_absSpeed)} km/h. Prepare to reduce speed for next signal.`;
        this.violationTimer = 3.5;
        obj_SOUND_MANAGER.playSignalWarning();
      }
      return;
    }

    // ====================================================
    // GREEN SIGNAL: Line Clear
    // ====================================================
    if (signal.state === cons_SIGNAL_STATES.GREEN) {
      // Audible AWS bell confirmation chime
      obj_SOUND_MANAGER.playSignalClear();
      obj_HAPTIC.light();
    }
  }

  /**
   * Resets the detector state for a new mission.
   */
  reset() {
    this.approachingSignal = null;
    this.distanceToSignalMeters = 9999;
    this.previousTrainDistMeters = 0;
    this.isViolationActive = false;
    this.violationType = null;
    this.violationMessage = '';
    this.violationTimer = 0;
    this.warnedSignalId = null;
  }
}

export default SignalDetector;
