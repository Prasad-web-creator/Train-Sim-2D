/**
 * MainMenu.jsx
 * Exact Iron Rail 2.0 UI Menu:
 * Featuring panoramic coastal railway background, metallic logo badge,
 * Level 1 shield badge, XP capsule, Currency container with green add button,
 * Settings and Controls Guide pills, and the tactile 6-section navigation bar.
 */

import React, { useState } from 'react';
import { arr_LOCOMOTIVE_MODELS, getLocomotiveById } from '../data/locomotives.js';
import { obj_CENTRAL_GAME_STATE } from '../game/core/GameState.js';
import { obj_AUDIO_MANAGER } from '../game/audio/index.js';
import { obj_TRAIN_ACTIONS } from '../game/actions/TrainActions.js';
import { ControlsScreen } from './ControlsScreen.jsx';
import { SettingsScreen } from './SettingsScreen.jsx';
import { MenuRailwayBackground } from '../components/menu/MenuRailwayBackground.jsx';
import { TrainsSection } from '../components/menu/TrainsSection.jsx';

export function MainMenu({ onOpenSettings }) {
  // Navigation State
  const [activeSection, setActiveSection] = useState('PLAY');
  const [selectedLocoId, setSelectedLocoId] = useState('loco_wap7_red');
  const [selectedWagonIds, setSelectedWagonIds] = useState(['passenger_coach', 'passenger_coach']);

  // Modals
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Active items
  const obj_loco = getLocomotiveById(selectedLocoId) || arr_LOCOMOTIVE_MODELS[0];

  // Calculate consist mass
  const tmp_locoMass = obj_loco.massKg || 117000;
  const tmp_wagonsMass = selectedWagonIds.length * 52000;
  const tmp_totalMassKg = tmp_locoMass + tmp_wagonsMass;

  /**
   * Dispatches player directly into the driving simulation with active consist and locomotive.
   */
  function handleStartRun(overrideRun) {
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.playButtonClick();
    obj_TRAIN_ACTIONS.requestFullscreen();

    const baseRun = overrideRun || obj_CENTRAL_GAME_STATE.defaultTrackRun || {};
    const runConfig = {
      ...baseRun,
      locomotiveId: selectedLocoId,
      wagonIds: selectedWagonIds,
      speedLimits: baseRun.speedLimits || [
        { startDist: 0, endDist: baseRun.trackLengthMeters || 5000, limitKmh: baseRun.maxSpeedLimitKmh || 80 },
      ],
      objectives: [],
    };

    obj_CENTRAL_GAME_STATE.startMission(runConfig);
  }

  /**
   * Handles navigation tab clicks with audio feedback.
   * Clicking PLAY directly launches the driving simulation.
   * Clicking an active tab toggles back to the clean panoramic view.
   */
  function handleNavClick(section) {
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.playButtonClick();
    obj_TRAIN_ACTIONS.requestFullscreen();

    if (section === 'PLAY') {
      handleStartRun();
      return;
    }

    if (section === 'SETTINGS') {
      if (onOpenSettings) onOpenSettings();
      else setShowSettingsModal(true);
      return;
    }

    if (section === 'CONTROLS' || section === 'CONTROLS GUIDE') {
      setShowControlsModal(true);
      return;
    }

    if (activeSection === section) {
      setActiveSection('PLAY');
    } else {
      setActiveSection(section);
    }
  }

  // Definition of the main buttons
  const arr_sections = [
    { id: 'PLAY', label: 'PLAY' },
    { id: 'TRAINS', label: 'TRAINS' },
    { id: 'SETTINGS', label: 'SETTINGS' },
    { id: 'CONTROLS', label: 'CONTROLS' },
  ];

  return (
    <div className="main-menu-root">
      {/* 1. Panoramic Coastal Vista Background */}
      <MenuRailwayBackground />

      {/* 2. Top-tier UI Terminal Overlay */}
      <div className="main-menu__overlay-container">
        {/* Top Header Bar */}
        <header className="main-menu__top-header">
          {/* Brand Logo with Metallic Crest */}
          <div className="main-menu__brand">
            <div className="main-menu__crest-wrap">
              <img
                src="/assets/menu/iron_rail_crest.png"
                alt="Iron Rail Emblem"
                className="main-menu__crest-img"
              />
            </div>
            <div className="main-menu__brand-text">
              <div className="main-menu__logo-row">
                <span className="main-menu__logo-title">IRON RAIL</span>
                <span className="main-menu__version-badge">2.0</span>
              </div>
              <span className="main-menu__subtitle">HEAVY HAUL TRAIN DRIVING SIMULATOR</span>
            </div>
          </div>
        </header>

        {/* Main Menu Body: Content Area (left/center) + Vertical Action Stack (right) */}
        <div className="main-menu__body-layout">
          {/* Central Content Container */}
          <main className="main-menu__content-area">
            {activeSection === 'TRAINS' && (
              <TrainsSection
                selectedLocoId={selectedLocoId}
                onSelectLoco={(l) => setSelectedLocoId(l.id)}
              />
            )}
          </main>

          {/* Right Vertical Navigation & Action Buttons (Exact Reference Image Stack) */}
          <aside className="main-menu__nav-vertical">
            {arr_sections.map((sec) => {
              const isSelected = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  className={`menu-nav-btn ${isSelected ? 'menu-nav-btn--active' : ''}`}
                  onClick={() => handleNavClick(sec.id)}
                >
                  <span className="menu-nav-btn__label">{sec.label}</span>
                </button>
              );
            })}
          </aside>
        </div>

        {/* Modal Overlays */}
        <ControlsScreen
          isOpen={showControlsModal}
          onClose={() => setShowControlsModal(false)}
        />

        <SettingsScreen
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      </div>
    </div>
  );
}

export default MainMenu;
