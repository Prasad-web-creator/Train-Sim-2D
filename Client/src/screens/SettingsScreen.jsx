/**
 * SettingsScreen.jsx
 * Multi-channel audio volume controls (Master, Train, Environment, Weather, UI),
 * mute toggling, audio diagnostics/sound testing, and options modal.
 */

import React, { useState } from 'react';
import { obj_CENTRAL_GAME_STATE } from '../game/core/GameState.js';
import { obj_AUDIO_MANAGER, obj_SOUND_MANAGER } from '../game/audio/index.js';
import { Button } from '../ui/Button.jsx';
import { Modal } from '../ui/Modal.jsx';

/**
 * Renders multi-channel audio configuration sliders and test triggers in a modal dialog.
 */
export function SettingsScreen({ isOpen, onClose }) {
  const obj_state = obj_CENTRAL_GAME_STATE.getSnapshot();
  const obj_settings = obj_state.settings || {};

  const [masterVol, setMasterVol] = useState(Math.round((obj_settings.masterVolume ?? 0.8) * 100));
  const [engineVol, setEngineVol] = useState(Math.round((obj_settings.engineVolume ?? 0.75) * 100));
  const [envVol, setEnvVol] = useState(Math.round((obj_settings.environmentVolume ?? 0.7) * 100));
  const [weatherVol, setWeatherVol] = useState(Math.round((obj_settings.weatherVolume ?? 0.7) * 100));
  const [sfxVol, setSfxVol] = useState(Math.round((obj_settings.sfxVolume ?? 0.85) * 100));

  /**
   * Updates master bus volume.
   */
  function handleMasterVolChange(e) {
    const tmp_val = parseInt(e.target.value, 10);
    setMasterVol(tmp_val);
    const tmp_ratio = tmp_val / 100;
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.setMasterVolume(tmp_ratio);
    obj_CENTRAL_GAME_STATE.setMasterVolume(tmp_ratio);
  }

  /**
   * Updates train propulsion and dynamic volume.
   */
  function handleEngineVolChange(e) {
    const tmp_val = parseInt(e.target.value, 10);
    setEngineVol(tmp_val);
    const tmp_ratio = tmp_val / 100;
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.setTrainVolume(tmp_ratio);
    obj_CENTRAL_GAME_STATE.setEngineVolume(tmp_ratio);
  }

  /**
   * Updates environment ambience volume.
   */
  function handleEnvVolChange(e) {
    const tmp_val = parseInt(e.target.value, 10);
    setEnvVol(tmp_val);
    const tmp_ratio = tmp_val / 100;
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.setEnvironmentVolume(tmp_ratio);
    obj_CENTRAL_GAME_STATE.setEnvironmentVolume(tmp_ratio);
  }

  /**
   * Updates weather phenomenon volume.
   */
  function handleWeatherVolChange(e) {
    const tmp_val = parseInt(e.target.value, 10);
    setWeatherVol(tmp_val);
    const tmp_ratio = tmp_val / 100;
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.setWeatherVolume(tmp_ratio);
    obj_CENTRAL_GAME_STATE.setWeatherVolume(tmp_ratio);
  }

  /**
   * Updates UI tactile sound volume.
   */
  function handleSfxVolChange(e) {
    const tmp_val = parseInt(e.target.value, 10);
    setSfxVol(tmp_val);
    const tmp_ratio = tmp_val / 100;
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.setUIVolume(tmp_ratio);
    obj_CENTRAL_GAME_STATE.setSfxVolume(tmp_ratio);
  }

  /**
   * Resets all volume channels to default presets.
   */
  function handleResetDefault() {
    const dMaster = 80;
    const dEngine = 75;
    const dEnv = 70;
    const dWeather = 70;
    const dSfx = 85;

    setMasterVol(dMaster);
    setEngineVol(dEngine);
    setEnvVol(dEnv);
    setWeatherVol(dWeather);
    setSfxVol(dSfx);

    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.setMasterVolume(dMaster / 100);
    obj_AUDIO_MANAGER.setTrainVolume(dEngine / 100);
    obj_AUDIO_MANAGER.setEnvironmentVolume(dEnv / 100);
    obj_AUDIO_MANAGER.setWeatherVolume(dWeather / 100);
    obj_AUDIO_MANAGER.setUIVolume(dSfx / 100);

    obj_CENTRAL_GAME_STATE.setMasterVolume(dMaster / 100);
    obj_CENTRAL_GAME_STATE.setEngineVolume(dEngine / 100);
    obj_CENTRAL_GAME_STATE.setEnvironmentVolume(dEnv / 100);
    obj_CENTRAL_GAME_STATE.setWeatherVolume(dWeather / 100);
    obj_CENTRAL_GAME_STATE.setSfxVolume(dSfx / 100);
  }

  /**
   * Saves volume settings and closes modal.
   */
  function handleSave() {
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.setMasterVolume(masterVol / 100);
    obj_AUDIO_MANAGER.setTrainVolume(engineVol / 100);
    obj_AUDIO_MANAGER.setEnvironmentVolume(envVol / 100);
    obj_AUDIO_MANAGER.setWeatherVolume(weatherVol / 100);
    obj_AUDIO_MANAGER.setUIVolume(sfxVol / 100);

    obj_CENTRAL_GAME_STATE.setMasterVolume(masterVol / 100);
    obj_CENTRAL_GAME_STATE.setEngineVolume(engineVol / 100);
    obj_CENTRAL_GAME_STATE.setEnvironmentVolume(envVol / 100);
    obj_CENTRAL_GAME_STATE.setWeatherVolume(weatherVol / 100);
    obj_CENTRAL_GAME_STATE.setSfxVolume(sfxVol / 100);

    if (onClose) {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AUDIO & SYSTEM SETTINGS" maxWidth={480}>
      <div className="settings-screen">

        {/* Master Volume Slider */}
        <div className="settings-screen__group">
          <label className="settings-screen__label" htmlFor="master-volume">
            <span>MASTER VOLUME</span>
            <strong>{masterVol}%</strong>
          </label>
          <input
            id="master-volume"
            type="range"
            min="0"
            max="100"
            value={masterVol}
            onChange={handleMasterVolChange}
            className="settings-screen__slider"
          />
        </div>

        {/* Train & Engine Volume Slider */}
        <div className="settings-screen__group">
          <label className="settings-screen__label" htmlFor="engine-volume">
            <span>TRAIN & ENGINE VOLUME</span>
            <strong>{engineVol}%</strong>
          </label>
          <input
            id="engine-volume"
            type="range"
            min="0"
            max="100"
            value={engineVol}
            onChange={handleEngineVolChange}
            className="settings-screen__slider"
          />
        </div>

        {/* Environment Ambience Volume Slider */}
        <div className="settings-screen__group">
          <label className="settings-screen__label" htmlFor="env-volume">
            <span>ENVIRONMENT AMBIENCE</span>
            <strong>{envVol}%</strong>
          </label>
          <input
            id="env-volume"
            type="range"
            min="0"
            max="100"
            value={envVol}
            onChange={handleEnvVolChange}
            className="settings-screen__slider"
          />
        </div>

        {/* Weather Volume Slider */}
        <div className="settings-screen__group">
          <label className="settings-screen__label" htmlFor="weather-volume">
            <span>WEATHER & PRECIPITATION</span>
            <strong>{weatherVol}%</strong>
          </label>
          <input
            id="weather-volume"
            type="range"
            min="0"
            max="100"
            value={weatherVol}
            onChange={handleWeatherVolChange}
            className="settings-screen__slider"
          />
        </div>

        {/* UI & SFX Volume Slider */}
        <div className="settings-screen__group">
          <label className="settings-screen__label" htmlFor="sfx-volume">
            <span>UI & INTERFACE SFX</span>
            <strong>{sfxVol}%</strong>
          </label>
          <input
            id="sfx-volume"
            type="range"
            min="0"
            max="100"
            value={sfxVol}
            onChange={handleSfxVolChange}
            className="settings-screen__slider"
          />
        </div>

        <div className="settings-screen__actions">
          <Button variant="secondary" onClick={handleResetDefault}>
            Reset to Default
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
