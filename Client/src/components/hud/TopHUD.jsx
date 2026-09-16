/**
 * TopHUD.jsx
 * Top heads-up telemetry display presenting the active driving objective,
 * target distance, speed restrictions, stop zone guidance, progress indicators,
 * route track progress, camera controls, and SPAD violation alert banners.
 */

import React from 'react';
import { useGameState, useTelemetryTick } from '../../hooks/useGameLoop.js';
import { obj_CENTRAL_GAME_STATE } from '../../game/core/GameState.js';
import { obj_SOUND_MANAGER } from '../../game/audio/SoundManager.js';
import { obj_HAPTIC } from '../../utils/HapticFeedback.js';
import { obj_TRAIN_ACTIONS } from '../../game/actions/TrainActions.js';
import { cons_GAME_STATE_MODES } from '../../constants/GameConstants.js';

import { SignalIndicator } from './controls/SignalIndicator.jsx';
import { FullscreenControl } from './controls/FullscreenControl.jsx';
import { OrientationNotice } from './OrientationNotice.jsx';


/**
 * Renders the top HUD bar with route progress, signal indicator, speed limit, fullscreen, and pause.
 * 
 * @param {Object} props
 * @param {function} [props.onOpenPause] - Callback to open pause menu
 */
export function TopHUD({ onOpenPause }) {
  const gameState = useGameState();
  useTelemetryTick(50); // Refresh telemetry smoothly

  const obj_telemetry = obj_CENTRAL_GAME_STATE.trainTelemetry || gameState.telemetry;
  const obj_mission = obj_CENTRAL_GAME_STATE.missionStatus || gameState.mission;
  const obj_signal = obj_CENTRAL_GAME_STATE.signalStatus || gameState.signal || {};
  const obj_currentMissionData = gameState.currentMission || obj_CENTRAL_GAME_STATE.currentMission || {};
  const obj_activeObj = obj_mission.activeObjective || null;

  const tmp_signalAspect = obj_signal.aspect || 'GREEN';
  const tmp_distToSignal = obj_signal.distanceMeters ?? 9999;
  const tmp_signalName = obj_signal.signalName || 'SIG 01';
  const tmp_advisorySpeed = obj_signal.advisorySpeedKmh ?? 999;

  const tmp_speedKmh = Math.max(0, Math.round(obj_telemetry.speedKmh));
  const tmp_speedLimit = obj_activeObj?.speedLimitKmh || obj_mission.speedLimitKmh || 55;
  const tmp_isSpeeding = tmp_speedKmh > tmp_speedLimit;
  // Physical route and track distance calculations
  const tmp_totalTrackLength = Math.max(
    100,
    obj_currentMissionData.trackLengthMeters || obj_mission.totalTrackLengthMeters || 4800
  );
  const tmp_currentDist = Math.max(
    0,
    obj_telemetry.distanceMeters ??
    obj_mission.currentDistanceMeters ??
    (tmp_totalTrackLength - (obj_mission.distanceToDestinationMeters ?? 0)) ??
    0
  );
  const tmp_distRem = Math.max(
    0,
    obj_mission.distanceToDestinationMeters ??
    Math.max(0, tmp_totalTrackLength - tmp_currentDist)
  );

  // Continuous distance percentage (0 to 100) along entire track
  const tmp_routeDistanceFraction = Math.min(1.0, Math.max(0, tmp_currentDist / tmp_totalTrackLength));
  const tmp_progressPercent = tmp_routeDistanceFraction * 100;

  // Format destination distance: e.g. "1.9 km", "4.8 km", or "850 m"
  const tmp_distStr = tmp_distRem > 1000
    ? `${(tmp_distRem / 1000).toFixed(1)} km`
    : `${Math.round(tmp_distRem)} m`;

  function fn_getShortName(fullName, fallback) {
    if (!fullName) return fallback;
    const cleaned = fullName.replace(/\b(Junction|Jn|Halt|Station|Terminus|Central)\b/gi, '').trim();
    return cleaned || fullName;
  }

  function fn_getCode(fullName, fallback) {
    if (!fullName) return fallback;
    const words = fullName.replace(/\b(Junction|Jn|Halt|Station|Terminus|Central)\b/gi, '').trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1].slice(0, 2)).toUpperCase();
    }
    return fullName.slice(0, 3).toUpperCase();
  }

  const tmp_stn0 = obj_currentMissionData.startStation || 'Tirunelveli Junction';
  const tmp_stn1 = obj_currentMissionData.intermediateStations?.[0] || 'Palayamkottai Halt';
  const tmp_stn2 = obj_currentMissionData.intermediateStations?.[1] || 'Vanchi Maniyachchi';
  const tmp_stn3 = obj_currentMissionData.endStation || 'Thoothukudi Station';

  const arr_stations = [
    { name: tmp_stn0, shortName: fn_getShortName(tmp_stn0, 'Tirunelveli'), code: fn_getCode(tmp_stn0, 'TEN'), pct: 0 },
    { name: tmp_stn1, shortName: fn_getShortName(tmp_stn1, 'Palayamkottai'), code: fn_getCode(tmp_stn1, 'PLM'), pct: 33.33 },
    { name: tmp_stn2, shortName: fn_getShortName(tmp_stn2, 'Vanchi'), code: fn_getCode(tmp_stn2, 'MEJ'), pct: 66.67 },
    { name: tmp_stn3, shortName: fn_getShortName(tmp_stn3, 'Thoothukudi'), code: fn_getCode(tmp_stn3, 'TN'), pct: 100 },
  ];

  // Determine active/approaching station index
  let tmp_activeStationIdx = 0;
  if (tmp_progressPercent >= 83.33) {
    tmp_activeStationIdx = 3;
  } else if (tmp_progressPercent >= 50) {
    tmp_activeStationIdx = 2;
  } else if (tmp_progressPercent >= 16.67) {
    tmp_activeStationIdx = 1;
  } else {
    tmp_activeStationIdx = 0;
  }

  // Format objective target distance if active
  let tmp_objDistStr = null;
  if (obj_activeObj && obj_activeObj.distanceMeters !== null && obj_activeObj.distanceMeters !== undefined) {
    tmp_objDistStr = obj_activeObj.distanceMeters > 1000
      ? `${(obj_activeObj.distanceMeters / 1000).toFixed(1)} km`
      : `${Math.round(obj_activeObj.distanceMeters)} m`;
  }

  /**
   * Opens the pause menu, triggers haptic tap, and initializes sound manager.
   */
  function handlePauseClick(e) {
    if (e && e.cancelable && e.type.startsWith('touch')) {
      e.preventDefault();
    }
    if (onOpenPause) {
      onOpenPause();
    } else {
      obj_TRAIN_ACTIONS.togglePause();
    }
  }

  return (
    <>
      {/* Floating Orientation Notice (Mobile Portrait Guidance) */}
      <OrientationNotice />

      {/* Floating Signal SPAD / Caution Overspeed Violation Banner */}
      {obj_signal?.isViolationActive && (
        <div
          className={`top-hud__violation-banner ${
            obj_signal.violationType === 'SPAD'
              ? 'top-hud__violation-banner--spad'
              : 'top-hud__violation-banner--caution'
          }`}
          role="alert"
        >
          <span className="top-hud__violation-icon">
            {obj_signal.violationType === 'SPAD' ? '🚨' : '⚠️'}
          </span>
          <span className="top-hud__violation-msg">{obj_signal.violationMessage}</span>
        </div>
      )}

      {/* Floating Milestone Celebration Toast */}
      {obj_activeObj?.recentlyCompletedTitle && (
        <div className="top-hud__milestone-toast">
          <span className="top-hud__milestone-icon">✓</span>
          <span className="top-hud__milestone-text">
            OBJECTIVE COMPLETED: {obj_activeObj.recentlyCompletedTitle}
          </span>
        </div>
      )}

      <header className="top-hud" aria-label="Flight Deck Heads-Up Display">
        {/* Left: Spacer to maintain balanced flex layout */}
        <div className="top-hud__left" />

        {/* Center: 4-Station Milestone Route Bar & Secondary Train Telemetry Capsule */}
        {/* Center: Route Distance Track & Telemetry Capsule (100% Reference Match) */}
        <div className="top-hud__center">
          {/* Continuous Route Distance Track Bar */}
          <div className="top-hud__route-track">
            {/* The Track Line with Railway Sleepers Pattern & Cyan Traversed Fill */}
            <div className="top-hud__track-line">
              <div className="top-hud__track-unreached" />
              <div
                className="top-hud__track-completed"
                style={{ width: `${tmp_progressPercent}%` }}
              />

              {/* Cyan Downward Arrow Pointer (▼) Marking Train Position with Floating Distance Readout */}
              <div
                className="top-hud__track-train-pointer"
                style={{ left: `${tmp_progressPercent}%` }}
              >
                <div className="top-hud__track-pointer-dist">{tmp_distStr}</div>
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  className="top-hud__track-pointer-arrow"
                >
                  <path d="M5 6L0.5 0H9.5L5 6Z" fill="#00d2ff" />
                </svg>
              </div>

              {/* Station Milestone Discs Along Track Line */}
              {arr_stations.map((stn, idx) => {
                const isPassed = tmp_progressPercent > stn.pct + 1.2;
                const isActive = idx === tmp_activeStationIdx;
                let nodeClass = 'top-hud__station-node--upcoming';
                if (isActive) {
                  nodeClass = 'top-hud__station-node--active';
                } else if (isPassed) {
                  nodeClass = 'top-hud__station-node--passed';
                }
                return (
                  <div
                    key={stn.name + idx}
                    className={`top-hud__station-node ${nodeClass}`}
                    style={{ left: `${stn.pct}%` }}
                  >
                    <span className="top-hud__station-node-dot" />
                  </div>
                );
              })}
            </div>

            {/* Station Labels Row Positioned Under Each Milestone */}
            <div className="top-hud__station-labels">
              {arr_stations.map((stn, idx) => {
                const isActive = idx === tmp_activeStationIdx;
                let alignClass = 'top-hud__station-label--center';
                if (idx === 0) alignClass = 'top-hud__station-label--left';
                if (idx === arr_stations.length - 1) alignClass = 'top-hud__station-label--right';

                return (
                  <span
                    key={stn.name + idx}
                    className={`top-hud__station-label ${alignClass} ${isActive ? 'top-hud__station-label--active' : 'top-hud__station-label--inactive'}`}
                    style={{ left: `${stn.pct}%` }}
                    title={stn.name}
                  >
                    <span className="top-hud__station-name-desktop">{stn.name}</span>
                    <span className="top-hud__station-name-mobile">
                      {isActive ? (stn.shortName || stn.name) : stn.code}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Next Signal Chip, Speed Limit Sign, Speed Box, Fullscreen & Pause */}
        <div className="top-hud__right">
          {/* Next Signal Aspect Repeater Chip */}
          <SignalIndicator
            aspect={tmp_signalAspect}
            distanceMeters={tmp_distToSignal}
            signalName={tmp_signalName}
            advisorySpeedKmh={tmp_advisorySpeed}
          />

          {/* Circular Speed Limit Sign (White Disc with Red Ring, bold 45, KM/H) */}
          <div className="top-hud__speed-sign" title={`Speed limit: ${tmp_speedLimit} km/h`}>
            <span className="top-hud__speed-sign-val">{tmp_speedLimit}</span>
            <span className="top-hud__speed-sign-unit">KM/H</span>
          </div>

          {/* Digital Speed Indicator Box */}
          <div className={`top-hud__speed-box ${tmp_isSpeeding ? 'top-hud__speed-box--overspeed' : ''}`}>
            <span className="top-hud__speed-box-val">{tmp_speedKmh}</span>
            <span className="top-hud__speed-box-unit">km/h</span>
            <div className="top-hud__speed-box-bar" />
          </div>

          {/* Browser Fullscreen Gameplay Control */}
          <FullscreenControl />

          {/* Large Touch-Friendly Pause Button */}
          <button
            type="button"
            className="top-hud__pause-btn"
            onClick={handlePauseClick}
            onTouchStart={handlePauseClick}
            title="Pause Game (Key P / Esc)"
            aria-label="Pause Game"
          >
            <span className="top-hud__pause-icon">❚❚</span>
          </button>
        </div>
      </header>
    </>
  );
}

export default TopHUD;
