/**
 * TrainDashboard.jsx
 * Master physical mechanical locomotive control console combining dark metallic plates,
 * circular analog gauges with glass covers, mechanical needles, screws, tactile levers,
 * pushbuttons, annunciator warning lamps, and track signal repeaters.
 */

import React from 'react';
import { useGameState, useTelemetryTick } from '../../hooks/useGameLoop.js';
import { obj_CENTRAL_GAME_STATE } from '../../game/core/GameState.js';
import { obj_SOUND_MANAGER } from '../../game/audio/SoundManager.js';
import { obj_TRAIN_ACTIONS } from '../../game/actions/TrainActions.js';


// Gauges
import { PressureGauge } from './gauges/PressureGauge.jsx';
import { Speedometer } from './gauges/Speedometer.jsx';
import { RPMGauge } from './gauges/RPMGauge.jsx';
import { TemperatureGauge } from './gauges/TemperatureGauge.jsx';
import { BrakeGauge } from './gauges/BrakeGauge.jsx';

// Controls & Annunciators
import { ThrottleControl } from './controls/ThrottleControl.jsx';
import { BrakeControl } from './controls/BrakeControl.jsx';
import { DirectionControl } from './controls/DirectionControl.jsx';
import { HornButton } from './controls/HornButton.jsx';
import { HeadlightButton } from './controls/HeadlightButton.jsx';
import { WarningLights } from './controls/WarningLights.jsx';


// Vector SVG Icons matching exact reference dashboard switches
function HeadlightIcon() {
  return (
    <svg width="24" height="17" viewBox="0 0 24 17" fill="none" className="dashboard-action-btn__svg">
      <line x1="2" y1="4.5" x2="8.5" y2="4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="1" y1="8.5" x2="7.5" y2="8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="2" y1="12.5" x2="8.5" y2="12.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M11 2H14C17.866 2 21 5.134 21 8.5C21 11.866 17.866 15 14 15H11V2Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

function HornIcon() {
  return (
    <svg width="26" height="17" viewBox="0 0 26 17" fill="none" className="dashboard-action-btn__svg">
      <rect x="2" y="6.5" width="3" height="4" rx="1" fill="currentColor" />
      <path d="M5 7.5L19 3V14L5 9.5V7.5Z" fill="currentColor" />
      <ellipse cx="19" cy="8.5" rx="2.5" ry="5.5" fill="currentColor" />
      <ellipse cx="19" cy="8.5" rx="1.2" ry="3.8" fill="#d97706" />
    </svg>
  );
}

function ReleaseChevronIcon() {
  return (
    <svg width="18" height="13" viewBox="0 0 18 13" fill="none" className="dashboard-action-btn__svg">
      <polygon points="9,1 17,11.5 1,11.5" fill="currentColor" />
    </svg>
  );
}

function BrakeSymbolIcon() {
  return (
    <svg width="24" height="20" viewBox="0 0 24 20" fill="none" className="dashboard-action-btn__svg">
      <circle cx="12" cy="10" r="6.8" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="12" y1="5.5" x2="12" y2="14.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M4 5.5C2.5 7.8 2.5 12.2 4 14.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 5.5C21.5 7.8 21.5 12.2 20 14.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function EmergencySymbolIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="dashboard-action-btn__svg">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="10" y1="5.5" x2="10" y2="11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="10" cy="14.2" r="1.3" fill="currentColor" />
    </svg>
  );
}

function SandFunnelIcon() {
  return (
    <svg width="18" height="15" viewBox="0 0 18 18" fill="none" className="dashboard-action-btn__svg">
      <path d="M4 3H14L10.5 8H7.5L4 3Z" fill="#f59e0b" />
      <line x1="9" y1="8" x2="9" y2="10" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7.5 10.5H10.5L15 15.5H3L7.5 10.5Z" fill="#f59e0b" />
    </svg>
  );
}

function CoolantFanIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 24 20" fill="none" className="dashboard-action-btn__svg">
      <circle cx="12" cy="10" r="3" fill="currentColor" />
      <path d="M12 7V2C9.5 2 8 3.8 9.5 7H12Z" fill="currentColor" />
      <path d="M12 13V18C14.5 18 16 16.2 14.5 13H12Z" fill="currentColor" />
      <path d="M9 10H4C4 12.5 5.8 14 9 12.5V10Z" fill="currentColor" />
      <path d="M15 10H20C20 7.5 18.2 6 15 7.5V10Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Master mechanical train dashboard console component.
 */
export function TrainDashboard() {
  const gameState = useGameState();
  useTelemetryTick(50); // High-frequency smooth needle animation

  const obj_telemetry = gameState.telemetry;
  const obj_mission = gameState.mission;

  const tmp_speedKmh = Math.max(0, obj_telemetry.speedKmh);
  const tmp_speedLimit = obj_mission.speedLimitKmh || 55;
  const tmp_engineRpm = obj_telemetry.engineRpm || 320;
  const tmp_engineTempC = obj_telemetry.engineTempC || 82;
  const tmp_brakePressure = obj_telemetry.trainBrakePressureBar || 5.0;
  const tmp_brakeRatio = obj_telemetry.brakeAppliedRatio || 0;
  const tmp_throttleNotch = obj_telemetry.throttleNotch || 0;
  const tmp_reverser = obj_telemetry.reverser;
  const tmp_isWheelSlipping = obj_telemetry.isWheelSlipping;
  const tmp_isSanderActive = obj_telemetry.isSanderActive;
  const tmp_isCoolantActive = obj_telemetry.isCoolantActive;
  const tmp_isHeadlightOn = obj_telemetry.isHeadlightOn;
  const tmp_isHornActive = obj_telemetry.isHornActive;
  const tmp_trackGrade = obj_telemetry.trackGradePercent || 0;

  // Calculate fuel percentage (default 12000L of 14000L max tank)
  const tmp_fuelRemaining = obj_telemetry.fuelRemainingLitres || 12000;
  const tmp_fuelPercent = Math.min(100, Math.max(0, (tmp_fuelRemaining / 14000) * 100));

  // Calculate day/night dashboard backlighting
  const tmp_timePhase = gameState.environment?.timePhase || 'NOON';
  const tmp_backlightLevel = gameState.environment?.dashboardBacklight ?? 0.0;
  const tmp_isNightOrDusk = tmp_timePhase === 'NIGHT' || tmp_timePhase === 'EVENING' || tmp_backlightLevel > 0.25;

  /**
   * Updates throttle notch via unified TrainActions.
   */
  function handleThrottleChange(newNotch) {
    obj_TRAIN_ACTIONS.setThrottleNotch(newNotch);
  }

  /**
   * Updates locomotive reverser direction via unified TrainActions.
   */
  function handleDirectionChange(newDir) {
    obj_TRAIN_ACTIONS.setReverser(newDir);
  }

  /**
   * Updates train pneumatic brake ratio via unified TrainActions.
   */
  function handleBrakeChange(newRatio) {
    obj_TRAIN_ACTIONS.setBrakeRatio(newRatio);
  }

  /**
   * Applies service train brake incrementally.
   */
  function handleServiceBrakeApply() {
    obj_TRAIN_ACTIONS.applyBrake(0.3);
  }

  /**
   * Releases train service brake.
   */
  function handleServiceBrakeRelease() {
    obj_TRAIN_ACTIONS.releaseBrake();
  }

  /**
   * Momentary press for wheel sander.
   */
  function handleSanderDown() {
    obj_TRAIN_ACTIONS.setSander(true);
  }

  /**
   * Momentary release for wheel sander.
   */
  function handleSanderUp() {
    obj_TRAIN_ACTIONS.setSander(false);
  }

  /**
   * Toggles engine radiator coolant fan.
   */
  function handleCoolantToggle() {
    obj_TRAIN_ACTIONS.toggleCoolant();
  }

  // Calculate 0-2400 RPM from prime-mover physics spool-up
  const tmp_displayedRpm = Math.round((tmp_engineRpm / 1050) * 2400);

  // Dynamic pneumatic pressures: Brake pipe (98 PSI released, drops on apply) and Main Reservoir (108 PSI)
  const tmp_brakePipePsi = Math.round(98 - (tmp_brakeRatio * 45));
  const tmp_mainResPsi = 108;
  return (
    <section
      className={`train-dashboard ${tmp_isNightOrDusk ? 'train-dashboard--night' : ''}`}
      aria-label="Locomotive Mechanical Control Console"
    >
      {/* Heavy Beveled Top Header Bar with Industrial Screws */}
      <header className="train-dashboard__header">
        <div className="train-dashboard__screws-group">
          <span className="dashboard-screw" />
          <span className="dashboard-screw" />
        </div>

        <div className="train-dashboard__model-tag">
          TITAN-4400 DIESEL-ELECTRIC LOCOMOTIVE CONTROLLER & INSTRUMENT CLUSTER
        </div>

        <div className="train-dashboard__screws-group">
          <span className="dashboard-screw" />
          <span className="dashboard-screw" />
        </div>
      </header>

      {/* Main Console Panel Body */}
      <div className="train-dashboard__body">
        {/* Left Wing: Reverser & Brake Levers + Sander Button */}
        <div className="train-dashboard__wing-left">
          <div className="train-dashboard__wing-levers">
            <DirectionControl
              direction={tmp_reverser}
              speedKmh={tmp_speedKmh}
              onChange={handleDirectionChange}
            />
            <BrakeControl
              brakeRatio={tmp_brakeRatio}
              onChange={handleBrakeChange}
            />
          </div>
        </div>

        {/* Center Cluster: Warning Annunciator Strip, Gauges, Controls Bar */}
        <div className="train-dashboard__center-cluster">
          {/* Micro Telemetry Bar Above Gauges (Guarantees Live Main Res, Temp, and Fuel Readouts On All Screens) */}
          <div className="train-dashboard__telemetry-bar">
            <div className="train-dashboard__telemetry-chip" title="Main Air Reservoir Pressure">
              <span className="train-dashboard__telemetry-chip-lbl">MAIN RES</span>
              <span className="train-dashboard__telemetry-chip-val">{tmp_mainResPsi} PSI</span>
            </div>
            <div className="train-dashboard__telemetry-chip" title="Engine Coolant Temperature">
              <span className="train-dashboard__telemetry-chip-lbl">COOLANT</span>
              <span className="train-dashboard__telemetry-chip-val">{tmp_engineTempC}°C</span>
            </div>
            <div className="train-dashboard__telemetry-chip" title="Locomotive Diesel Fuel Level">
              <span className="train-dashboard__telemetry-chip-lbl">FUEL</span>
              <span className="train-dashboard__telemetry-chip-val">{Math.round(tmp_fuelPercent)}%</span>
            </div>
          </div>

          {/* Center Cluster Main Content: Left Brake Switchbank + Center Gauges Row + Right Aux Switchbank */}
          <div className="train-dashboard__cluster-content">
            {/* Left Driving & Brake Switch Bank (RELEASE, BRAKE, EMERGENCY) */}
            <div className="train-dashboard__switchbank train-dashboard__switchbank--left">
              {/* 1. Service Brake Release Button */}
              <button
                type="button"
                className="dashboard-action-btn dashboard-action-btn--release"
                onClick={handleServiceBrakeRelease}
                title="Release Train Brakes (Key W / Notch Up)"
                aria-label="Release Brakes"
              >
                <ReleaseChevronIcon />
                <span className="dashboard-action-btn__label dashboard-action-btn__label--bold">RELEASE</span>
              </button>

              {/* 2. Service Brake Apply Button */}
              <button
                type="button"
                className="dashboard-action-btn dashboard-action-btn--brake"
                onClick={handleServiceBrakeApply}
                title="Apply Service Air Brakes (Key S / Down)"
                aria-label="Apply Brakes"
              >
                <BrakeSymbolIcon />
                <span className="dashboard-action-btn__label">BRAKE</span>
              </button>

              {/* 3. Emergency Brake Slam Button */}
              <button
                type="button"
                className="dashboard-action-btn dashboard-action-btn--emergency"
                onClick={() => obj_TRAIN_ACTIONS.triggerEmergencyBrake()}
                title="Emergency Brake (Key B / Spacebar)"
                aria-label="Emergency Brake"
              >
                <EmergencySymbolIcon />
                <span className="dashboard-action-btn__label">EMERGENCY</span>
              </button>
            </div>

            {/* Center Instruments Row: 3 Core Gauges on Mobile, 5 on Desktop */}
            <div className="train-dashboard__gauges-row">
              {/* Gauge 1: Brake Pipe PSI (0-150, 98 PSI) */}
              <div className="train-dashboard__gauge-pod">
                <span className="train-dashboard__gauge-title">BRAKE PIPE</span>
                <PressureGauge
                  psi={tmp_brakePipePsi}
                  title=""
                  size={120}
                  isBacklit={tmp_isNightOrDusk}
                />
              </div>

              {/* Gauge 2: Main Reservoir PSI (0-150, 108 PSI) - Secondary dial, hidden on mobile */}
              <div className="train-dashboard__gauge-pod train-dashboard__gauge-pod--secondary">
                <span className="train-dashboard__gauge-title">MAIN RES</span>
                <PressureGauge
                  psi={tmp_mainResPsi}
                  title=""
                  size={120}
                  isBacklit={tmp_isNightOrDusk}
                />
              </div>

              {/* Gauge 3: Speedometer 0-120 km/h (Center Primary) */}
              <div className="train-dashboard__gauge-pod train-dashboard__gauge-pod--primary">
                <span className="train-dashboard__gauge-title train-dashboard__gauge-title--primary">SPEEDOMETER</span>
                <Speedometer
                  speedKmh={tmp_speedKmh}
                  speedLimitKmh={tmp_speedLimit}
                  size={144}
                  title=""
                  isBacklit={tmp_isNightOrDusk}
                />
              </div>

              {/* Gauge 4: Tachometer RPM 0-2400 with Lime Green Needle */}
              <div className="train-dashboard__gauge-pod">
                <span className="train-dashboard__gauge-title">ENGINE RPM</span>
                <RPMGauge
                  rpm={tmp_displayedRpm}
                  size={120}
                  title=""
                  isBacklit={tmp_isNightOrDusk}
                />
              </div>

              {/* Gauge 5: Engine Coolant Temperature 0-150 °C - Secondary dial, hidden on mobile */}
              <div className="train-dashboard__gauge-pod train-dashboard__gauge-pod--secondary">
                <span className="train-dashboard__gauge-title">COOLANT TEMP</span>
                <TemperatureGauge
                  temperatureC={tmp_engineTempC}
                  threshold={115}
                  size={120}
                  title=""
                  isBacklit={tmp_isNightOrDusk}
                />
              </div>
            </div>

            {/* Right Auxiliary Switch Bank (LIGHTS, HORN) */}
            <div className="train-dashboard__switchbank train-dashboard__switchbank--right">
              {/* 1. Headlights Button */}
              <button
                type="button"
                className={`dashboard-action-btn dashboard-action-btn--lights ${tmp_isHeadlightOn ? 'dashboard-action-btn--active' : ''}`}
                onClick={() => obj_TRAIN_ACTIONS.toggleHeadlights()}
                title="Toggle Locomotive Headlights (Key L)"
                aria-label="Toggle Headlights"
              >
                <HeadlightIcon />
                <span className="dashboard-action-btn__label">LIGHTS</span>
              </button>

              {/* 2. Tactile Air Horn Button */}
              <button
                type="button"
                className={`dashboard-action-btn dashboard-action-btn--horn ${tmp_isHornActive ? 'dashboard-action-btn--active' : ''}`}
                onMouseDown={() => obj_TRAIN_ACTIONS.setHorn(true)}
                onMouseUp={() => obj_TRAIN_ACTIONS.setHorn(false)}
                onMouseLeave={() => obj_TRAIN_ACTIONS.setHorn(false)}
                onTouchStart={(e) => { if (e.cancelable) e.preventDefault(); obj_TRAIN_ACTIONS.setHorn(true); }}
                onTouchEnd={(e) => { if (e.cancelable) e.preventDefault(); obj_TRAIN_ACTIONS.setHorn(false); }}
                title="Sound Nathan Air Horn (Spacebar / Key H)"
                aria-label="Air Horn"
              >
                <HornIcon />
                <span className="dashboard-action-btn__label">HORN</span>
              </button>

              {/* 3. Wheel Traction Sander Button */}
              <button
                type="button"
                className={`dashboard-action-btn dashboard-action-btn--sand ${tmp_isSanderActive ? 'dashboard-action-btn--active' : ''}`}
                onMouseDown={handleSanderDown}
                onMouseUp={handleSanderUp}
                onMouseLeave={handleSanderUp}
                onTouchStart={handleSanderDown}
                onTouchEnd={handleSanderUp}
                onClick={() => obj_TRAIN_ACTIONS.setSander(!tmp_isSanderActive)}
                title="Dispense Traction Sand (Key X)"
                aria-label="Dispense Sand"
              >
                <SandFunnelIcon />
                <span className="dashboard-action-btn__label">SAND</span>
              </button>

              {/* 4. Engine Coolant / Radiator Fan Button */}
              <button
                type="button"
                className={`dashboard-action-btn dashboard-action-btn--coolant ${tmp_isCoolantActive ? 'dashboard-action-btn--active' : ''}`}
                onClick={handleCoolantToggle}
                title="Toggle Radiator Coolant Fan"
                aria-label="Toggle Coolant Fan"
              >
                <CoolantFanIcon />
                <span className="dashboard-action-btn__label">COOLANT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Wing: Throttle Controller */}
        <div className="train-dashboard__wing-right">
          <ThrottleControl
            notch={tmp_throttleNotch}
            onChange={handleThrottleChange}
          />
        </div>
      </div>
    </section>
  );
}

export default TrainDashboard;
