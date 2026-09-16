/**
 * SettingsSection.jsx
 * In-place settings panel for the Main Menu:
 * multi-channel procedural audio volume sliders, mute toggle, synthesizer sound tests,
 * and camera zoom settings.
 */

import React, { useState } from 'react';
import { obj_CENTRAL_GAME_STATE } from '../../game/core/GameState.js';
import { obj_AUDIO_MANAGER } from '../../game/audio/index.js';
import { obj_PROGRESSION_SYSTEM } from '../../game/progression/index.js';
import { Button } from '../../ui/Button.jsx';

export function SettingsSection({ onOpenControls }) {
  const obj_progSettings = obj_PROGRESSION_SYSTEM.getSettings();
  const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();
  const obj_settings = { ...obj_state.settings, ...obj_progSettings };

  const [isMuted, setIsMuted] = useState(obj_AUDIO_MANAGER.isMuted);
  const [masterVol, setMasterVol] = useState(Math.round((obj_settings.masterVolume ?? 0.8) * 100));
  const [engineVol, setEngineVol] = useState(Math.round((obj_settings.engineVolume ?? 0.75) * 100));
  const [envVol, setEnvVol] = useState(Math.round((obj_settings.environmentVolume ?? 0.7) * 100));
  const [weatherVol, setWeatherVol] = useState(Math.round((obj_settings.weatherVolume ?? 0.7) * 100));
  const [sfxVol, setSfxVol] = useState(Math.round((obj_settings.sfxVolume ?? 0.85) * 100));
  const [cameraZoom, setCameraZoom] = useState(obj_settings.cameraZoom || 1.0);

  function handleToggleMute() {
    obj_AUDIO_MANAGER.init();
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    obj_AUDIO_MANAGER.setMute(nextMute);
  }

  function handleMasterVolChange(e) {
    const val = parseInt(e.target.value, 10);
    setMasterVol(val);
    const ratio = val / 100;
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.setMasterVolume(ratio);
    obj_CENTRAL_GAME_STATE.setMasterVolume(ratio);
    obj_PROGRESSION_SYSTEM.updateSettings({ masterVolume: ratio });
  }

  function handleEngineVolChange(e) {
    const val = parseInt(e.target.value, 10);
    setEngineVol(val);
    const ratio = val / 100;
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.setTrainVolume(ratio);
    obj_CENTRAL_GAME_STATE.setEngineVolume(ratio);
    obj_PROGRESSION_SYSTEM.updateSettings({ engineVolume: ratio });
  }

  function handleEnvVolChange(e) {
    const val = parseInt(e.target.value, 10);
    setEnvVol(val);
    const ratio = val / 100;
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.setEnvironmentVolume(ratio);
    obj_CENTRAL_GAME_STATE.setEnvironmentVolume(ratio);
    obj_PROGRESSION_SYSTEM.updateSettings({ environmentVolume: ratio });
  }

  function handleWeatherVolChange(e) {
    const val = parseInt(e.target.value, 10);
    setWeatherVol(val);
    const ratio = val / 100;
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.setWeatherVolume(ratio);
    obj_CENTRAL_GAME_STATE.setWeatherVolume(ratio);
    obj_PROGRESSION_SYSTEM.updateSettings({ weatherVolume: ratio });
  }

  function handleSfxVolChange(e) {
    const val = parseInt(e.target.value, 10);
    setSfxVol(val);
    const ratio = val / 100;
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.setUIVolume(ratio);
    obj_CENTRAL_GAME_STATE.setSfxVolume(ratio);
    obj_PROGRESSION_SYSTEM.updateSettings({ sfxVolume: ratio });
  }

  function handleSetZoom(zoomVal) {
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.playButtonClick();
    setCameraZoom(zoomVal);
    obj_CENTRAL_GAME_STATE.updateSettings({ cameraZoom: zoomVal });
    obj_PROGRESSION_SYSTEM.updateSettings({ cameraZoom: zoomVal });
  }

  function handleTestHorn() {
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.setHorn(true);
    setTimeout(() => {
      obj_AUDIO_MANAGER.setHorn(false);
    }, 450);
  }

  function handleTestBell() {
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.playSignalClear();
  }

  function handleTestRails() {
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.playRailClickClack(65);
  }

  return (
    <div className="menu-settings">
      <div className="menu-settings__grid">
        {/* Audio Configuration Column */}
        <div className="menu-panel">
          <div className="menu-panel__header">
            <span className="menu-panel__tag">AUDIO SYSTEM CHANNELS</span>
            <h2 className="menu-panel__title">Synthesizer Volumes</h2>
          </div>

          <div className="menu-settings__row-mute">
            <span>MASTER SOUND OUTPUT:</span>
            <Button
              variant={isMuted ? 'danger' : 'primary'}
              onClick={handleToggleMute}
            >
              {isMuted ? '🔇 MUTED' : '🔊 ACTIVE'}
            </Button>
          </div>

          {/* Sliders */}
          <div className="menu-slider-group">
            <label className="menu-slider-label" htmlFor="menu-master-vol">
              <span>Master Volume</span>
              <strong>{masterVol}%</strong>
            </label>
            <input
              id="menu-master-vol"
              type="range"
              min="0"
              max="100"
              value={masterVol}
              onChange={handleMasterVolChange}
              className="menu-slider"
            />
          </div>

          <div className="menu-slider-group">
            <label className="menu-slider-label" htmlFor="menu-engine-vol">
              <span>Train & Engine Volume</span>
              <strong>{engineVol}%</strong>
            </label>
            <input
              id="menu-engine-vol"
              type="range"
              min="0"
              max="100"
              value={engineVol}
              onChange={handleEngineVolChange}
              className="menu-slider"
            />
          </div>

          <div className="menu-slider-group">
            <label className="menu-slider-label" htmlFor="menu-env-vol">
              <span>Environment Ambience</span>
              <strong>{envVol}%</strong>
            </label>
            <input
              id="menu-env-vol"
              type="range"
              min="0"
              max="100"
              value={envVol}
              onChange={handleEnvVolChange}
              className="menu-slider"
            />
          </div>

          <div className="menu-slider-group">
            <label className="menu-slider-label" htmlFor="menu-weather-vol">
              <span>Weather & Precipitation</span>
              <strong>{weatherVol}%</strong>
            </label>
            <input
              id="menu-weather-vol"
              type="range"
              min="0"
              max="100"
              value={weatherVol}
              onChange={handleWeatherVolChange}
              className="menu-slider"
            />
          </div>

          <div className="menu-slider-group">
            <label className="menu-slider-label" htmlFor="menu-sfx-vol">
              <span>UI & Tactile SFX</span>
              <strong>{sfxVol}%</strong>
            </label>
            <input
              id="menu-sfx-vol"
              type="range"
              min="0"
              max="100"
              value={sfxVol}
              onChange={handleSfxVolChange}
              className="menu-slider"
            />
          </div>

          {/* Test Sound Bar */}
          <div className="menu-settings__test-bar">
            <small className="text-gray">PREVIEW AUDIO SYNTHESIZERS:</small>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <Button variant="secondary" onClick={handleTestHorn}>🎺 Horn</Button>
              <Button variant="secondary" onClick={handleTestBell}>🔔 Bell</Button>
              <Button variant="secondary" onClick={handleTestRails}>🛤️ Rails</Button>
            </div>
          </div>
        </div>

        {/* Display & Gameplay Controls Column */}
        <div className="menu-panel">
          <div className="menu-panel__header">
            <span className="menu-panel__tag">CAMERA & CONTROLS</span>
            <h2 className="menu-panel__title">Display & Input Preferences</h2>
          </div>

          {/* Camera Zoom Selection */}
          <div className="menu-settings__zoom-section">
            <span className="menu-section-label">DEFAULT CAMERA VIEWPORT ZOOM:</span>
            <div className="menu-zoom-chips">
              <button
                type="button"
                className={`menu-tab-btn ${Math.abs(cameraZoom - 0.85) < 0.05 ? 'menu-tab-btn--active' : ''}`}
                onClick={() => handleSetZoom(0.85)}
              >
                0.85x Overview
              </button>
              <button
                type="button"
                className={`menu-tab-btn ${Math.abs(cameraZoom - 1.0) < 0.05 ? 'menu-tab-btn--active' : ''}`}
                onClick={() => handleSetZoom(1.0)}
              >
                1.0x Gameplay
              </button>
              <button
                type="button"
                className={`menu-tab-btn ${Math.abs(cameraZoom - 1.15) < 0.05 ? 'menu-tab-btn--active' : ''}`}
                onClick={() => handleSetZoom(1.15)}
              >
                1.15x Cinematic
              </button>
            </div>
          </div>

          {/* Keybindings guide */}
          <div className="menu-settings__controls-box">
            <span className="menu-section-label">KEYBOARD & TOUCH CONTROLS:</span>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
              IronRail 2D supports both desktop keyboard navigation and mobile touch levers with drag/press mechanics.
            </p>
            {onOpenControls && (
              <Button variant="secondary" onClick={onOpenControls} style={{ marginTop: '8px' }}>
                🕹 Open Keybindings Configuration
              </Button>
            )}
          </div>

          <div className="menu-settings__info-card">
            <p><strong>100% Procedural Synthesis:</strong> Engine rumble, brake friction, wheel flanges, birdsong, and thunder are procedurally generated in real time with Web Audio API oscillators and filters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
