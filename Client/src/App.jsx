/**
 * App.jsx
 * Root application component switching between loading, main menu, and game simulation screens.
 */

import React, { useState } from 'react';
import { useGameState } from './hooks/useGameLoop.js';
import { LoadingScreen } from './screens/LoadingScreen.jsx';
import { MainMenu } from './screens/MainMenu.jsx';
import { GameScreen } from './screens/GameScreen.jsx';
import { SettingsScreen } from './screens/SettingsScreen.jsx';
import { cons_GAME_STATE_MODES } from './constants/GameConstants.js';
import { obj_CENTRAL_GAME_STATE } from './game/core/GameState.js';
import { obj_TRAIN_ACTIONS } from './game/actions/TrainActions.js';

import './styles/index.css';
import './styles/game.css';
import './styles/hud.css';
import './styles/cab.css';
import './styles/dashboard.css';
import './styles/menu.css';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[IronRail Engine] Uncaught UI error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      window.localStorage?.clear();
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #060a12 0%, #03050a 100%)',
            color: '#f8fafc',
            fontFamily: "'Rajdhani', sans-serif",
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '2px solid #ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '16px',
            }}
          >
            ⚠️
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>
            SIMULATION RECOVERY
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '440px', fontSize: '15px', marginBottom: '24px', lineHeight: 1.5 }}>
            {this.state.error?.message || 'A transient rendering glitch was intercepted.'}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={this.handleReload}
              style={{
                padding: '10px 22px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '14px',
                fontFamily: 'inherit',
                letterSpacing: '0.5px',
              }}
            >
              RELOAD GAME
            </button>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 22px',
                background: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #475569',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            >
              RESET TO DEFAULTS
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppInner() {
  const gameState = useGameState();
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const tmp_mode = gameState.currentMode;

  // Automatically request browser fullscreen on any user gesture across all menu tabs and gameplay
  React.useEffect(() => {
    const handleGlobalInteraction = () => {
      obj_TRAIN_ACTIONS.requestFullscreen();
    };

    window.addEventListener('click', handleGlobalInteraction, { passive: true });
    window.addEventListener('touchstart', handleGlobalInteraction, { passive: true });
    window.addEventListener('pointerdown', handleGlobalInteraction, { passive: true });
    window.addEventListener('keydown', handleGlobalInteraction, { passive: true });

    return () => {
      window.removeEventListener('click', handleGlobalInteraction);
      window.removeEventListener('touchstart', handleGlobalInteraction);
      window.removeEventListener('pointerdown', handleGlobalInteraction);
      window.removeEventListener('keydown', handleGlobalInteraction);
    };
  }, []);

  // Request fullscreen whenever entering gameplay
  React.useEffect(() => {
    if (tmp_mode === cons_GAME_STATE_MODES.PLAYING) {
      obj_TRAIN_ACTIONS.requestFullscreen();
    }
  }, [tmp_mode]);

  function handleLoaded() {
    setIsLoading(false);
  }

  const isDevLoading = typeof window !== 'undefined' && window.location.search.includes('loading');
  if (isLoading || isDevLoading) {
    return (
      <LoadingScreen
        onLoaded={isDevLoading ? undefined : handleLoaded}
        durationMs={isDevLoading ? 60000 : 1200}
      />
    );
  }

  return (
    <div className="app-root">
      {tmp_mode === cons_GAME_STATE_MODES.MENU ? (
        <MainMenu onOpenSettings={() => setIsSettingsOpen(true)} />
      ) : (
        <GameScreen />
      )}

      <SettingsScreen
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}

export default App;
