/**
 * TrainsSection.jsx
 * Locomotive Fleet Roster with interactive vehicle specs, visual livery cards,
 * side-profile thumbnail previews, and active locomotive assignment.
 */

import React, { useRef, useEffect } from 'react';
import { arr_LOCOMOTIVE_MODELS } from '../../data/locomotives.js';
import { obj_AUDIO_MANAGER } from '../../game/audio/index.js';

export function TrainsSection({
  selectedLocoId,
  onSelectLoco,
}) {
  const obj_activeLoco = arr_LOCOMOTIVE_MODELS.find((l) => l.id === selectedLocoId) || arr_LOCOMOTIVE_MODELS[0];

  return (
    <div className="menu-trains">
      <div className="menu-trains__grid">
        {/* Locomotive Selector Cards */}
        <div className="menu-trains__list">
          <div className="loco-inventory-header">
            <span>LOCOMOTIVE INVENTORY</span>
          </div>
          {arr_LOCOMOTIVE_MODELS.map((loco) => {
            const isSelected = loco.id === obj_activeLoco.id;

            const capsuleColor = loco.stripeColor || '#dc2626';

            return (
              <div
                key={loco.id}
                className={`menu-loco-card ${isSelected ? 'menu-loco-card--selected' : ''}`}
                onClick={() => {
                  obj_AUDIO_MANAGER.init();
                  obj_AUDIO_MANAGER.playButtonClick();
                  onSelectLoco(loco);
                }}
              >
                <div className="menu-loco-card__slot">
                  <div
                    className="menu-loco-card__capsule"
                    style={{
                      background: `linear-gradient(180deg, #ffffff 0%, ${capsuleColor} 45%, ${capsuleColor} 100%)`,
                      boxShadow: `0 0 8px ${capsuleColor}`,
                    }}
                  />
                </div>
                <div className="menu-loco-card__thumb">
                  <LocomotiveThumbnail loco={loco} />
                </div>
                <div className="menu-loco-card__body">
                  <h4 className="menu-loco-card__name">{loco.name}</h4>
                  {loco.hasPantograph ? (
                    <div className="menu-loco-chip menu-loco-chip--electric">
                      <svg width="11" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      <span>25KV AC</span>
                    </div>
                  ) : (
                    <div className="menu-loco-chip menu-loco-chip--diesel">
                      <svg width="12" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 3h9a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 3v5h5V6H6zm10 2.5l2-2a1 1 0 0 1 1.4 0l.6.6a1 1 0 0 1 0 1.4L18 10v7a2 2 0 0 1-2 2h-1" />
                      </svg>
                      <span>DIESEL</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Locomotive Detailed Specs & Livery Preview */}
        <div className="menu-trains__preview">
          <div className="dossier-card">
            {/* High-Tech Dossier Header */}
            <div className="dossier-card__header">
              <div className="dossier-card__status-row">
                <div className="dossier-card__tag-wrap">
                  <span className="dossier-card__pulse-dot" />
                  <span className="dossier-card__tag">LOCOMOTIVE TECHNICAL DOSSIER</span>
                </div>
                <div className="dossier-card__badges">
                  {obj_activeLoco.hasPantograph ? (
                    <span className="dossier-badge dossier-badge--electric">⚡ 25kV AC ELECTRIC</span>
                  ) : (
                    <span className="dossier-badge dossier-badge--diesel">🛢️ DIESEL-ELECTRIC</span>
                  )}
                  <span className="dossier-badge dossier-badge--ready">● FLEET READY</span>
                </div>
              </div>
              <div className="dossier-card__title-row">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <h2 className="dossier-card__title">{obj_activeLoco.name}</h2>
                  <span className="dossier-card__type-desc">{obj_activeLoco.type || 'Superfast Express'}</span>
                </div>
                <div className="dossier-card__model-tag">
                  <span>CLASS //</span>
                  <strong>{obj_activeLoco.shortName || obj_activeLoco.name.split(' ')[0]}</strong>
                </div>
              </div>
            </div>

            {/* Visual Livery Image or Canvas with High-Tech Viewport Framing */}
            <div className="dossier-viewport">
              <div className="dossier-viewport__hud-corner dossier-viewport__hud-corner--tl">
                <span>VIEWPORT // 01</span>
                <span>LATERAL PROFILE</span>
              </div>
              <div className="dossier-viewport__hud-corner dossier-viewport__hud-corner--tr">
                <span>SCALE 1:45</span>
                <span>{obj_activeLoco.lengthMeters ? `${obj_activeLoco.lengthMeters}m` : 'BROAD GAUGE'}</span>
              </div>
              <div className="dossier-viewport__hud-corner dossier-viewport__hud-corner--bl">
                <span>1676mm IR BROAD GAUGE</span>
              </div>
              <div className="dossier-viewport__hud-corner dossier-viewport__hud-corner--br">
                <span>TELEMETRY: SYNCD</span>
              </div>

              {/* Corner Sci-Fi bracket accents */}
              <div className="dossier-viewport__bracket dossier-viewport__bracket--tl" />
              <div className="dossier-viewport__bracket dossier-viewport__bracket--tr" />
              <div className="dossier-viewport__bracket dossier-viewport__bracket--bl" />
              <div className="dossier-viewport__bracket dossier-viewport__bracket--br" />

              {obj_activeLoco.image ? (
                <div className="dossier-viewport__image-wrap">
                  <img
                    src={obj_activeLoco.image}
                    alt={obj_activeLoco.name}
                    className="dossier-viewport__image"
                  />
                  <div className="dossier-viewport__scanline" />
                  <div className="dossier-viewport__glow-overlay" />
                </div>
              ) : (
                <LocomotiveLiveryCanvas loco={obj_activeLoco} />
              )}
            </div>

            {/* Technical Specification Telemetry Metrics */}
            <div className="dossier-metrics">
              {/* 1. Prime Mover Power */}
              <div className="dossier-metric-tile">
                <div className="dossier-metric-header">
                  <span className="dossier-metric-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </span>
                  <span className="dossier-metric-label">PRIME MOVER POWER</span>
                </div>
                <strong className="dossier-metric-val">{Math.round(obj_activeLoco.maxPowerWatts / 746).toLocaleString()} HP</strong>
                <span className="dossier-metric-sub">{(obj_activeLoco.maxPowerWatts / 1000000).toFixed(2)} MW Output</span>
                <div className="dossier-metric-bar">
                  <div
                    className="dossier-metric-bar__fill"
                    style={{ width: `${Math.min(100, Math.round((obj_activeLoco.maxPowerWatts / 5000000) * 100))}%` }}
                  />
                </div>
              </div>

              {/* 2. Starting Tractive Effort */}
              <div className="dossier-metric-tile">
                <div className="dossier-metric-header">
                  <span className="dossier-metric-icon" style={{ color: '#fbbf24' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </span>
                  <span className="dossier-metric-label">TRACTIVE EFFORT</span>
                </div>
                <strong className="dossier-metric-val">{Math.round(obj_activeLoco.maxTractiveEffortN / 1000)} kN</strong>
                <span className="dossier-metric-sub">Dynamic Adhesion</span>
                <div className="dossier-metric-bar">
                  <div
                    className="dossier-metric-bar__fill"
                    style={{
                      width: `${Math.min(100, Math.round((obj_activeLoco.maxTractiveEffortN / 450000) * 100))}%`,
                      background: 'linear-gradient(90deg, #d97706, #fbbf24)',
                      boxShadow: '0 0 8px rgba(251, 191, 36, 0.7)',
                    }}
                  />
                </div>
              </div>

              {/* 3. Maximum Design Speed */}
              <div className="dossier-metric-tile">
                <div className="dossier-metric-header">
                  <span className="dossier-metric-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                  <span className="dossier-metric-label">DESIGN TOP SPEED</span>
                </div>
                <strong className="dossier-metric-val">{obj_activeLoco.topSpeedKmh} km/h</strong>
                <span className="dossier-metric-sub">Gear Ratio 62:15</span>
                <div className="dossier-metric-bar">
                  <div
                    className="dossier-metric-bar__fill"
                    style={{ width: `${Math.min(100, Math.round((obj_activeLoco.topSpeedKmh / 160) * 100))}%` }}
                  />
                </div>
              </div>

              {/* 4. Total Operating Mass */}
              <div className="dossier-metric-tile">
                <div className="dossier-metric-header">
                  <span className="dossier-metric-icon" style={{ color: '#a78bfa' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </span>
                  <span className="dossier-metric-label">OPERATING MASS</span>
                </div>
                <strong className="dossier-metric-val">{Math.round(obj_activeLoco.massKg / 1000)} Tonnes</strong>
                <span className="dossier-metric-sub">Axle Load: {(obj_activeLoco.massKg / (obj_activeLoco.bogieWheelCount * 2000)).toFixed(1)} t/axle</span>
                <div className="dossier-metric-bar">
                  <div
                    className="dossier-metric-bar__fill"
                    style={{
                      width: `${Math.min(100, Math.round((obj_activeLoco.massKg / 200000) * 100))}%`,
                      background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                      boxShadow: '0 0 8px rgba(168, 85, 247, 0.7)',
                    }}
                  />
                </div>
              </div>

              {/* 5. Energy Capacity */}
              <div className="dossier-metric-tile">
                <div className="dossier-metric-header">
                  <span className="dossier-metric-icon" style={{ color: '#34d399' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="6" width="18" height="12" rx="2" />
                      <path d="M23 13v-2" />
                      <path d="M7 10v4" />
                      <path d="M11 10v4" />
                    </svg>
                  </span>
                  <span className="dossier-metric-label">ENERGY CAPACITY</span>
                </div>
                <strong className="dossier-metric-val">{obj_activeLoco.fuelCapacityDisplay || 'Standard'}</strong>
                <span className="dossier-metric-sub">{obj_activeLoco.hasPantograph ? 'Overhead 25kV Catenary' : 'Diesel Fuel Cell'}</span>
                <div className="dossier-metric-bar">
                  <div
                    className="dossier-metric-bar__fill"
                    style={{
                      width: `${obj_activeLoco.hasPantograph ? 100 : Math.min(100, Math.round(((obj_activeLoco.fuelTankLitres || 0) / 16000) * 100))}%`,
                      background: 'linear-gradient(90deg, #059669, #10b981)',
                      boxShadow: '0 0 8px rgba(16, 185, 129, 0.7)',
                    }}
                  />
                </div>
              </div>

              {/* 6. Bogie Configuration */}
              <div className="dossier-metric-tile">
                <div className="dossier-metric-header">
                  <span className="dossier-metric-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="6" cy="15" r="4" />
                      <circle cx="18" cy="15" r="4" />
                      <path d="M10 15h4" />
                      <path d="M4 11h16" />
                    </svg>
                  </span>
                  <span className="dossier-metric-label">BOGIE CONFIG</span>
                </div>
                <strong className="dossier-metric-val">{obj_activeLoco.bogieWheelCount === 3 ? 'Co-Co 6-Wheel' : 'Bo-Bo 4-Wheel'}</strong>
                <span className="dossier-metric-sub">Heavy Cast Steel Frame</span>
                <div className="dossier-metric-bar">
                  <div className="dossier-metric-bar__fill" style={{ width: obj_activeLoco.bogieWheelCount === 3 ? '100%' : '70%' }} />
                </div>
              </div>
            </div>

            {/* High-Tech Action Button */}
            <div className="dossier-actions">
              <button
                type="button"
                className="dossier-btn-assign"
                onClick={() => {
                  obj_AUDIO_MANAGER.init();
                  obj_AUDIO_MANAGER.playLeverNotch();
                  onSelectLoco(obj_activeLoco);
                }}
              >
                <span className="dossier-btn-assign__shimmer" />
                <span className="dossier-btn-assign__icon">★</span>
                <span className="dossier-btn-assign__text">ASSIGN AS LEAD LOCOMOTIVE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Thumbnail preview canvas or realistic image for each train in the left fleet roster list.
 */
export function LocomotiveThumbnail({ loco }) {
  if (loco.image) {
    return (
      <img
        src={loco.image}
        alt={loco.name}
        className="menu-loco-card__thumb-img"
      />
    );
  }

  const ref_canvas = useRef(null);

  useEffect(() => {
    const canvas = ref_canvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 192;
    const h = 96;
    canvas.width = w;
    canvas.height = h;

    drawLocomotiveScene(ctx, loco, w, h, true);
  }, [loco]);

  return <canvas ref={ref_canvas} className="menu-loco-card__thumb-canvas" />;
}

/**
 * Procedurally draws high-fidelity 2D side-profile locomotive artwork in an illuminated depot.
 */
export function LocomotiveLiveryCanvas({ loco }) {
  const ref_canvas = useRef(null);

  useEffect(() => {
    const canvas = ref_canvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 560;
    const h = 150;
    canvas.width = w;
    canvas.height = h;

    drawLocomotiveScene(ctx, loco, w, h, false);
  }, [loco]);

  return <canvas ref={ref_canvas} className="menu-trains__canvas" />;
}

/**
 * Master renderer for both showcase dossier canvas and miniature card thumbnails.
 */
export function drawLocomotiveScene(ctx, loco, w, h, isThumbnail) {
  ctx.clearRect(0, 0, w, h);

  // 1. High-Tech Maintenance Bay / Inspection Depot Environment
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#10192a');
  bgGrad.addColorStop(0.5, '#16233b');
  bgGrad.addColorStop(0.85, '#0e1626');
  bgGrad.addColorStop(1, '#080d16');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const trackY = isThumbnail ? h - 20 : h - 24;

  // Overhead industrial depot beams & blueprint tech grid (showcase canvas only)
  if (!isThumbnail) {
    // Blueprint tech grid points
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    for (let gx = 25; gx < w - 20; gx += 32) {
      for (let gy = 15; gy < trackY - 12; gy += 24) {
        ctx.fillRect(gx, gy, 1.5, 1.5);
      }
    }

    // Overhead subtle diagonal structural truss lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
    ctx.lineWidth = 1;
    for (let bx = 30; bx < w; bx += 80) {
      ctx.beginPath();
      ctx.moveTo(bx, 0);
      ctx.lineTo(bx - 40, 36);
      ctx.lineTo(bx + 40, 36);
      ctx.stroke();
    }

    // Overhead inspection spotlights casting soft light cones onto the locomotive
    drawSpotlightCone(ctx, 150, 0, 260, 60);
    drawSpotlightCone(ctx, 380, 0, 280, 70);

    // Soft ambient highlight pool behind the locomotive
    const ambientGrad = ctx.createRadialGradient(280, trackY - 45, 30, 280, trackY - 45, 260);
    ambientGrad.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
    ambientGrad.addColorStop(0.6, 'rgba(30, 64, 175, 0.08)');
    ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = ambientGrad;
    ctx.fillRect(0, 0, w, trackY);

    // Cyan glowing ground guideline beneath track
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.fillRect(10, trackY + 5, w - 20, 1);
  }

  // 2. Concrete Maintenance Floor & Track Ballast
  const floorGrad = ctx.createLinearGradient(0, trackY - 8, 0, h);
  floorGrad.addColorStop(0, '#232f45');
  floorGrad.addColorStop(0.3, '#192233');
  floorGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, trackY - 6, w, h - trackY + 6);

  // Concrete inspection pit depression line
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, trackY + 2, w, 2);

  // Concrete & Wood Sleepers (Ties)
  const tieStep = isThumbnail ? 16 : 22;
  const tieWidth = isThumbnail ? 8 : 12;
  ctx.fillStyle = '#334155';
  for (let tieX = 6; tieX < w - 6; tieX += tieStep) {
    ctx.fillRect(tieX, trackY - 4, tieWidth, isThumbnail ? 7 : 9);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(tieX + 1, trackY + 3, tieWidth, 2);
    ctx.fillStyle = '#334155';
  }

  // Polished Steel Rail (Foot, Web, and Shiny Specular Head)
  ctx.fillStyle = '#475569';
  ctx.fillRect(2, trackY - 2, w - 4, isThumbnail ? 3 : 5); // Rail web
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(2, trackY - (isThumbnail ? 3 : 4), w - 4, isThumbnail ? 2 : 2); // Rail head
  // Brilliant Chrome Specular Sheen line on top of rail
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(2, trackY - (isThumbnail ? 3 : 4), w - 4, 1);

  // 3. Proportions & Coordinates
  const x = isThumbnail ? 10 : 28;
  const locoLen = isThumbnail ? 172 : 424;
  const locoH = isThumbnail ? 38 : 68;
  const bodyY = trackY - (isThumbnail ? 12 : 22) - locoH;

  // Contact shadow on ground under train
  const shadowGrad = ctx.createRadialGradient(x + locoLen / 2, trackY - 3, 20, x + locoLen / 2, trackY - 3, locoLen * 0.55);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  shadowGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.35)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(x - 15, trackY - 10, locoLen + 30, 12);

  // 4. Forward Headlight Volumetric Beam (showcase canvas)
  if (!isThumbnail) {
    const headX = x + locoLen;
    const headY = bodyY + locoH * 0.55;
    const beamGrad = ctx.createLinearGradient(headX, headY, headX + 90, headY);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
    beamGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.3)');
    beamGrad.addColorStop(0.7, 'rgba(254, 240, 138, 0.08)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(headX, headY - 4);
    ctx.lineTo(headX + 95, headY - 26);
    ctx.lineTo(headX + 95, trackY + 2);
    ctx.lineTo(headX, headY + 12);
    ctx.closePath();
    ctx.fill();
  }

  // 5. Undercarriage (Diesel Fuel Tank or Electric Traction Transformer)
  const tankW = locoLen * 0.38;
  const tankX = x + (locoLen - tankW) / 2;
  const tankH = isThumbnail ? 9 : 17;
  const tankY = bodyY + locoH - 2;

  const tankGrad = ctx.createLinearGradient(0, tankY, 0, tankY + tankH);
  tankGrad.addColorStop(0, '#334155');
  tankGrad.addColorStop(0.5, '#1e293b');
  tankGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = tankGrad;
  ctx.beginPath();
  ctx.roundRect(tankX, tankY, tankW, tankH, [0, 0, isThumbnail ? 3 : 6, isThumbnail ? 3 : 6]);
  ctx.fill();

  // Brass sight glass / fuel gauge
  if (!isThumbnail) {
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(tankX + 24, tankY + 5, 16, 4);
    ctx.fillStyle = '#475569';
    ctx.fillRect(tankX + 12, tankY + 2, tankW - 24, 2);

    // Air Reservoir Tanks flanking the main tank
    ctx.fillStyle = '#475569';
    ctx.roundRect(tankX - 26, tankY + 2, 20, 9, 3);
    ctx.roundRect(tankX + tankW + 6, tankY + 2, 20, 9, 3);
    ctx.fill();
  }

  // 6. Heavy Frame Sill (Full Length Main Chassis Beam)
  const sillH = isThumbnail ? 4 : 7;
  const sillY = bodyY + locoH - sillH / 2;
  const sillGrad = ctx.createLinearGradient(0, sillY, 0, sillY + sillH);
  sillGrad.addColorStop(0, '#475569');
  sillGrad.addColorStop(0.4, '#334155');
  sillGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = sillGrad;
  ctx.fillRect(x - (isThumbnail ? 4 : 8), sillY, locoLen + (isThumbnail ? 8 : 16), sillH);

  // Front / Rear Couplers
  ctx.fillStyle = '#64748b';
  ctx.fillRect(x - (isThumbnail ? 8 : 15), sillY + 1, isThumbnail ? 4 : 7, sillH - 1);
  ctx.fillRect(x + locoLen + (isThumbnail ? 4 : 8), sillY + 1, isThumbnail ? 4 : 7, sillH - 1);

  // 7. Bogies and Steel Wheels
  const bogieWheels = loco.bogieWheelCount || 3;
  const bogieOffset = isThumbnail ? 36 : 76;
  const frontBogieX = x + locoLen - bogieOffset;
  const rearBogieX = x + bogieOffset;
  drawDetailedBogie(ctx, frontBogieX, trackY - (isThumbnail ? 6 : 11), bogieWheels, isThumbnail);
  drawDetailedBogie(ctx, rearBogieX, trackY - (isThumbnail ? 6 : 11), bogieWheels, isThumbnail);

  // 8. Model-Specific Locomotive Body & Authentic Livery
  drawLocomotiveBody(ctx, loco, x, bodyY, locoLen, locoH, isThumbnail);

  // 9. Roof High-Voltage Equipment & Pantographs (Electric Locomotives)
  if (loco.hasPantograph) {
    const pantoColor = '#ef4444';
    drawRoofPantograph(ctx, x + (isThumbnail ? 32 : 72), bodyY + (isThumbnail ? 2 : 0), pantoColor, isThumbnail);
    drawRoofPantograph(ctx, x + locoLen - (isThumbnail ? 36 : 82), bodyY + (isThumbnail ? 2 : 0), pantoColor, isThumbnail);

    // High-voltage copper busbar & ceramic insulator bushings
    if (!isThumbnail) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 110, bodyY - 7);
      ctx.lineTo(x + locoLen - 120, bodyY - 7);
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      for (let ix = x + 120; ix < x + locoLen - 120; ix += 35) {
        ctx.fillRect(ix, bodyY - 11, 5, 7);
      }
    }
  }

  // 10. Dual Sealed-Beam Headlights
  const hlX = x + locoLen - 1;
  const hlY = bodyY + (isThumbnail ? locoH * 0.52 : locoH * 0.55);
  const hlR = isThumbnail ? 3 : 5;

  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(hlX, hlY, hlR + 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(hlX, hlY, hlR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(hlX, hlY, hlR * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // 11. Locomotive Road Identification Plate (showcase canvas)
  if (!isThumbnail) {
    const plateX = x + 38;
    const plateY = bodyY + locoH - 16;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(plateX, plateY, 48, 10);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.strokeRect(plateX, plateY, 48, 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText(loco.shortName || loco.name.split(' ')[0], plateX + 4, plateY + 8);
  }
}

/**
 * Draws the specific geometry, authentic livery textures, and metallic highlights for each model.
 */
function drawLocomotiveBody(ctx, loco, x, bodyY, locoLen, locoH, isThumbnail) {
  // Base vibrant color values for Indian Railways WAP-7
  const bodyBase = loco.bodyColor || '#f8fafc';
  const cabBase = loco.cabColor || '#e2e8f0';
  const stripeBase = loco.stripeColor || '#dc2626';

  // Indian Railways WAP-7 Dual-Cab Electric Locomotive
  const hoodGrad = ctx.createLinearGradient(0, bodyY - 4, 0, bodyY + locoH);
  hoodGrad.addColorStop(0, '#ffffff');
  hoodGrad.addColorStop(0.25, bodyBase);
  hoodGrad.addColorStop(0.8, '#e2e8f0');
  hoodGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = hoodGrad;

  // Main Aerodynamic Continuous Carbody with Raked Noses
  ctx.beginPath();
  ctx.roundRect(x, bodyY + 4, locoLen, locoH - 4, [isThumbnail ? 4 : 8, isThumbnail ? 4 : 8, 0, 0]);
  ctx.fill();

  const cabW = isThumbnail ? 42 : 92;

  // Dual Aerodynamic Cab Roof Caps
  const cabRoofGrad = ctx.createLinearGradient(0, bodyY - (isThumbnail ? 3 : 5), 0, bodyY + 6);
  cabRoofGrad.addColorStop(0, '#ffffff');
  cabRoofGrad.addColorStop(1, cabBase);
  ctx.fillStyle = cabRoofGrad;

  // Cab 1 Roof Cap (Left)
  ctx.beginPath();
  ctx.roundRect(x + (isThumbnail ? 4 : 10), bodyY - (isThumbnail ? 2 : 4), cabW, isThumbnail ? 7 : 12, [isThumbnail ? 4 : 8, isThumbnail ? 4 : 8, 0, 0]);
  ctx.fill();

  // Cab 2 Roof Cap (Right)
  ctx.beginPath();
  ctx.roundRect(x + locoLen - cabW - (isThumbnail ? 4 : 10), bodyY - (isThumbnail ? 2 : 4), cabW, isThumbnail ? 7 : 12, [isThumbnail ? 4 : 8, isThumbnail ? 4 : 8, 0, 0]);
  ctx.fill();

  // Fine panel division lines for Cab Doors
  if (!isThumbnail) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1;
    // Cab 1 rear door line
    ctx.beginPath();
    ctx.moveTo(x + cabW + 10, bodyY + 4);
    ctx.lineTo(x + cabW + 10, bodyY + locoH);
    ctx.stroke();

    // Cab 2 door line
    ctx.beginPath();
    ctx.moveTo(x + locoLen - cabW - 10, bodyY + 4);
    ctx.lineTo(x + locoLen - cabW - 10, bodyY + locoH);
    ctx.stroke();
  }

  // Metallic Roof Specular Highlight Sheen
  const roofSheen = ctx.createLinearGradient(0, bodyY + 4, 0, bodyY + 12);
  roofSheen.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  roofSheen.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
  ctx.fillStyle = roofSheen;
  ctx.fillRect(x + cabW + 15, bodyY + 4, locoLen - (cabW * 2) - 30, 8);

  // Bold Crimson Red Center Cheatline (Continuous across cabs and carbody)
  const stripeY = bodyY + (isThumbnail ? 22 : 42);
  const stripeH = isThumbnail ? 5 : 9;
  ctx.fillStyle = stripeBase;
  ctx.fillRect(x, stripeY, locoLen, stripeH);

  // Deep Crimson border pinstripes
  ctx.fillStyle = '#7f1d1d';
  ctx.fillRect(x, stripeY, locoLen, 1);
  ctx.fillRect(x, stripeY + stripeH - 1, locoLen, 1);

  // Thin White Livery Pinstripe
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(x, stripeY - (isThumbnail ? 1 : 1.5), locoLen, isThumbnail ? 1 : 1.5);

  // Bold "INDIAN RAILWAYS" branding & road number on carbody
  if (!isThumbnail) {
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.font = "900 13px 'Rajdhani', sans-serif";
    ctx.fillText('INDIAN RAILWAYS', x + locoLen / 2, bodyY + 24);

    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 8px 'Rajdhani', sans-serif";
    ctx.fillText('WAP-7 • 30541', x + locoLen / 2, stripeY + stripeH / 2 + 3);

    // 4 machine room ventilation louvers
    ctx.fillStyle = '#0f172a';
    const midX = x + locoLen / 2;
    for (const vx of [midX - 110, midX - 70, midX + 70, midX + 110]) {
      ctx.fillRect(vx - 10, bodyY + 14, 20, 14);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(vx - 10, bodyY + 14, 20, 14);
    }
    ctx.restore();

    // Full Exterior Walkway Running Board with Handrails & Vertical Stanchions
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    const railY = bodyY + locoH - 10;
    // Horizontal handrail bar
    ctx.beginPath();
    ctx.moveTo(x + 10, railY);
    ctx.lineTo(x + locoLen - 10, railY);
    ctx.stroke();
    // Vertical stanchion posts
    for (let sx = x + 25; sx < x + locoLen - 20; sx += 32) {
      ctx.beginPath();
      ctx.moveTo(sx, railY);
      ctx.lineTo(sx, bodyY + locoH);
      ctx.stroke();
    }
  }

  // Cab Windows for Dual-Cab WAP-7
  drawCabWindow(ctx, x + (isThumbnail ? 8 : 18), bodyY + (isThumbnail ? 4 : 8), isThumbnail ? 14 : 26, isThumbnail ? 8 : 15);
  drawCabWindow(ctx, x + locoLen - (isThumbnail ? 22 : 44), bodyY + (isThumbnail ? 4 : 8), isThumbnail ? 14 : 26, isThumbnail ? 8 : 15);

  // Front Cowcatcher / Pilot with Black & Yellow Warning Chevrons
  drawPilotHazard(ctx, x + locoLen, bodyY + locoH, isThumbnail);
}

/**
 * Draws realistic 2D bogie side frames, equalizer beams, coil springs, and steel wheels.
 */
function drawDetailedBogie(ctx, cx, by, wheelCount, isThumbnail) {
  const wheelR = isThumbnail ? 6 : 12;
  const spacing = isThumbnail ? (wheelCount === 3 ? 14 : 18) : (wheelCount === 3 ? 28 : 36);
  const halfSpan = ((wheelCount - 1) * spacing) / 2;

  // Main Cast Steel Side Frame
  const frameW = (wheelCount - 1) * spacing + (isThumbnail ? 14 : 30);
  const frameH = isThumbnail ? 5 : 10;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(cx - frameW / 2, by - (isThumbnail ? 3 : 6), frameW, frameH);

  // Steel Wheels and Axles
  for (let i = 0; i < wheelCount; i++) {
    const wx = cx - halfSpan + i * spacing;

    // Suspension coil spring over axle (showcase canvas)
    if (!isThumbnail) {
      ctx.fillStyle = '#64748b';
      ctx.fillRect(wx - 4, by - 11, 8, 5);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(wx - 3, by - 9, 6, 2);
    }

    // Outer Polished Steel Wheel Tyre
    const wheelGrad = ctx.createRadialGradient(wx, by, isThumbnail ? 2 : 4, wx, by, wheelR);
    wheelGrad.addColorStop(0, '#1e293b');
    wheelGrad.addColorStop(0.5, '#475569');
    wheelGrad.addColorStop(0.85, '#94a3b8');
    wheelGrad.addColorStop(1, '#e2e8f0');

    ctx.fillStyle = wheelGrad;
    ctx.beginPath();
    ctx.arc(wx, by, wheelR, 0, Math.PI * 2);
    ctx.fill();

    // Wheel Counterweight / Hub
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(wx, by, wheelR * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Axle Journal Box & Brass Cap
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(wx, by, isThumbnail ? 1.5 : 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draws cab window glass with reflection gradient and warm cockpit instrument glow.
 */
function drawCabWindow(ctx, wx, wy, ww, wh) {
  const winGrad = ctx.createLinearGradient(0, wy, 0, wy + wh);
  winGrad.addColorStop(0, '#38bdf8');
  winGrad.addColorStop(0.45, '#0284c7');
  winGrad.addColorStop(1, '#082f49');

  ctx.fillStyle = winGrad;
  ctx.beginPath();
  ctx.roundRect(wx, wy, ww, wh, 2);
  ctx.fill();

  // Glass Frame
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.strokeRect(wx, wy, ww, wh);

  // Diagonal Specular Reflection
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.moveTo(wx + 3, wy + 1);
  ctx.lineTo(wx + ww * 0.5, wy + 1);
  ctx.lineTo(wx + ww * 0.35, wy + wh - 1);
  ctx.lineTo(wx + 1, wy + wh - 1);
  ctx.closePath();
  ctx.fill();

  // Warm Cockpit Instrument Glow
  ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
  ctx.fillRect(wx + 2, wy + wh - 3, ww - 4, 2);
}

/**
 * Draws cowcatcher with yellow & black warning hazard chevrons.
 */
function drawPilotHazard(ctx, px, py, isThumbnail) {
  const w = isThumbnail ? 6 : 14;
  const h = isThumbnail ? 5 : 12;

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(px - 2, py);
  ctx.lineTo(px + w, py + h);
  ctx.lineTo(px - (isThumbnail ? 3 : 6), py + h);
  ctx.closePath();
  ctx.fill();

  // Hazard stripe
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = isThumbnail ? 1 : 2;
  ctx.beginPath();
  ctx.moveTo(px, py + 2);
  ctx.lineTo(px + (isThumbnail ? 4 : 8), py + h - 1);
  ctx.stroke();
}

/**
 * Procedurally draws high-speed diamond or single-arm roof pantograph.
 */
function drawRoofPantograph(ctx, px, py, color, isThumbnail) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = isThumbnail ? 1.5 : 2;
  ctx.lineCap = 'round';

  const baseW = isThumbnail ? 12 : 24;
  const pantoH = isThumbnail ? 12 : 24;

  // Base mount
  ctx.strokeRect(px - baseW / 2, py - 2, baseW, 2);

  // Lower articulation arm
  ctx.beginPath();
  ctx.moveTo(px - baseW * 0.3, py - 2);
  ctx.lineTo(px + 2, py - pantoH * 0.55);
  ctx.stroke();

  // Upper diamond arm
  ctx.beginPath();
  ctx.moveTo(px + 2, py - pantoH * 0.55);
  ctx.lineTo(px + (isThumbnail ? 5 : 10), py - pantoH);
  ctx.lineTo(px - (isThumbnail ? 4 : 8), py - pantoH);
  ctx.stroke();

  // Contact Pan / Carbon Horn
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = isThumbnail ? 2 : 2.5;
  ctx.beginPath();
  ctx.moveTo(px - (isThumbnail ? 8 : 16), py - pantoH);
  ctx.lineTo(px + (isThumbnail ? 9 : 18), py - pantoH);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws downward radiating spotlight beam cone from depot ceiling.
 */
function drawSpotlightCone(ctx, sx, sy, radius, angleSpan) {
  const coneGrad = ctx.createRadialGradient(sx, sy, 5, sx, sy + 80, radius);
  coneGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
  coneGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.05)');
  coneGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

  ctx.fillStyle = coneGrad;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx - angleSpan, 120);
  ctx.lineTo(sx + angleSpan, 120);
  ctx.closePath();
  ctx.fill();
}

function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}
