/**
 * LoadingScreen.jsx
 * Cinematic loading screen replicating Image 2:
 * Dusk railway corridor backdrop, streamlined bullet train crest emblem,
 * chrome italic IRONRAIL 2D title, skewed glowing progress bar with railway tracks,
 * and skewed glassmorphic Engineer Tip HUD card.
 */

import React, { useState, useEffect } from 'react';
import { obj_ASSET_MANAGER } from '../game/assets/AssetManager.js';

export function LoadingScreen({ onLoaded, durationMs = 1200 }) {
  const [progress, setProgress] = useState(0);

  const arr_tips = [
    'Pull the Horn (Key H) when approaching road crossings and station yards.',
    'Apply the Sander (Key X) on steep uphill grades to prevent wheel slip.',
    'Observe posted speed limits. Heavy freight consists require longer braking distances.',
    'Shift the Reverser only when the locomotive is completely stopped.',
  ];
  const [tipIndex] = useState(() => Math.floor(Math.random() * arr_tips.length));

  useEffect(() => {
    let isCancelled = false;
    let timerProgress = 0;

    // 1. Kick off real eager asset preloading in parallel
    obj_ASSET_MANAGER.preloadEager((loaded, total) => {
      if (isCancelled) return;
      const assetFraction = total > 0 ? (loaded / total) * 100 : 100;
      setProgress((prev) => Math.max(prev, Math.round(assetFraction * 0.7)));
    }).catch(() => {});

    // 2. Minimum display timer to present a smooth authentic progress sequence
    const tmp_interval = 30;
    const tmp_step = 100 / (durationMs / tmp_interval);

    const tmp_timer = setInterval(() => {
      timerProgress += tmp_step;
      setProgress((prev) => {
        const tmp_next = Math.max(prev + 1, Math.min(100, Math.round(timerProgress)));
        if (tmp_next >= 100) {
          clearInterval(tmp_timer);
          setTimeout(() => {
            if (!isCancelled && onLoaded) onLoaded();
          }, 180);
          return 100;
        }
        return tmp_next;
      });
    }, tmp_interval);

    return () => {
      isCancelled = true;
      clearInterval(tmp_timer);
    };
  }, [durationMs, onLoaded]);

  return (
    <div className="loading-screen" role="status" aria-live="polite">
      {/* Cinematic dusk railway corridor backdrop */}
      <div className="loading-screen__backdrop" />
      <div className="loading-screen__vignette" />

      {/* Main HUD container */}
      <div className="loading-screen__card">
        {/* Streamlined futuristic bullet train crest emblem */}
        <div className="loading-screen__crest-wrap">
          <img
            src="/assets/loading/loading_train_crest.png?v=2"
            alt="IronRail Emblem"
            className="loading-screen__crest-img"
          />
        </div>

        {/* Brand Title: 3D Chrome Italic IRONRAIL 2D */}
        <h1 className="loading-screen__title">IRONRAIL 2D</h1>

        {/* Subtitle flanked by thin cyan horizontal rules */}
        <div className="loading-screen__subtitle-row">
          <span className="loading-screen__sub-line loading-screen__sub-line--left" />
          <span className="loading-screen__subtitle">PRECISION TRAIN SIMULATOR</span>
          <span className="loading-screen__sub-line loading-screen__sub-line--right" />
        </div>

        {/* Skewed Progress Bar Container */}
        <div className="loading-screen__bar-outer">
          {/* Railroad Track Icon on Left */}
          <div className="loading-screen__track-icon-wrap">
            <svg
              className="loading-screen__track-icon"
              viewBox="0 0 28 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="3" y1="19" x2="9" y2="1" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round" />
              <line x1="19" y1="19" x2="25" y2="1" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round" />
              <line x1="4.5" y1="15" x2="20.5" y2="15" stroke="#38bdf8" strokeWidth="1.8" />
              <line x1="6.5" y1="10.5" x2="22.5" y2="10.5" stroke="#38bdf8" strokeWidth="1.8" />
              <line x1="8.5" y1="6" x2="24.5" y2="6" stroke="#38bdf8" strokeWidth="1.8" />
            </svg>
          </div>

          {/* Progress fill track */}
          <div className="loading-screen__bar-track">
            <div
              className="loading-screen__fill"
              style={{ width: `${Math.round(progress)}%` }}
            />
          </div>

          {/* Bold White Percentage on the Right */}
          <div className="loading-screen__pct">{Math.round(progress)}%</div>
        </div>

        {/* Skewed Glassmorphic Engineer Tip HUD Card */}
        <div className="loading-screen__tip-card">
          <div className="loading-screen__tip-inner">
            {/* Glowing Lightbulb Icon */}
            <div className="loading-screen__bulb-wrap">
              <svg
                className="loading-screen__bulb-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18h6" />
                <path d="M10 22h4" />
                <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
                <line x1="12" y1="2" x2="12" y2="0" stroke="#fef08a" strokeWidth="2" />
                <line x1="4.2" y1="4.2" x2="2.8" y2="2.8" stroke="#fef08a" strokeWidth="1.8" />
                <line x1="19.8" y1="4.2" x2="21.2" y2="2.8" stroke="#fef08a" strokeWidth="1.8" />
              </svg>
            </div>

            {/* Vertical Divider */}
            <div className="loading-screen__tip-divider" />

            {/* Tip Header & Body */}
            <div className="loading-screen__tip-content">
              <span className="loading-screen__tip-tag">ENGINEER TIP:</span>
              <p className="loading-screen__tip-text">{arr_tips[tipIndex]}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;

