/**
 * Station.js
 * Master reusable railway station environment system coordinating:
 * - Thematic styling (Indian, Mountain, Urban, Rural, Industrial)
 * - Platform infrastructure, canopies, benches, fences, and cultural equipment
 * - Architectural station building depot
 * - Dual bilingual/themed station signs
 * - Period platform lighting with light halos and optional station clocks
 * - Overhead catenary wires & starter signal poles
 * - Procedural passenger silhouettes with luggage and boarding walk animations
 * - Arrival and departure animation state machines with procedural audio chimes
 */

import { Platform } from './Platform.js';
import { StationBuilding } from './StationBuilding.js';
import { StationSign } from './StationSign.js';
import { PlatformLamp } from './PlatformLamp.js';
import { PassengerGroup } from './PassengerGroup.js';
import { getStationThemeProfile, cons_STATION_THEMES } from './StationTheme.js';

export const cons_STATION_STATES = Object.freeze({
  IDLE: 'IDLE',
  APPROACHING: 'APPROACHING',
  BERTHED: 'BERTHED',
  DEPARTING: 'DEPARTING',
});

export class Station {
  /**
   * Initializes master station entity with track distance and thematic profile.
   */
  constructor(
    themeKey = cons_STATION_THEMES.INDIAN,
    trackDistMeters = 2400,
    name = 'THOOTHUKUDI STATION',
    platformLengthMeters = 160,
    targetZoneRadiusMeters = 25
  ) {
    this.themeKey = themeKey;
    this.theme = getStationThemeProfile(themeKey);
    this.trackDistMeters = trackDistMeters;
    this.name = name;
    this.platformLengthMeters = platformLengthMeters;
    this.targetZoneRadiusMeters = targetZoneRadiusMeters;

    const tmp_platformStart = trackDistMeters - platformLengthMeters * 0.5;

    // Core modular components
    this.platform = new Platform(themeKey, tmp_platformStart, platformLengthMeters, name);
    this.building = new StationBuilding(themeKey, name);

    // Dual station nameboard signs (at start and end of platform)
    this.signStart = new StationSign(themeKey, name, null, null, 14);
    this.signEnd = new StationSign(themeKey, name, null, null, 14);

    // Platform lamps with station clock on central lamp
    this.arr_lamps = [];
    const tmp_lampSpacing = 32;
    for (let tmp_d = tmp_platformStart + 12; tmp_d < tmp_platformStart + platformLengthMeters - 8; tmp_d += tmp_lampSpacing) {
      const tmp_isCenter = Math.abs(tmp_d - trackDistMeters) < 18;
      this.arr_lamps.push({
        dist: tmp_d,
        lamp: new PlatformLamp(themeKey, tmp_isCenter),
      });
    }

    // Procedural passenger group with luggage and boarding animations
    this.passengerGroup = new PassengerGroup(themeKey, tmp_platformStart, platformLengthMeters, 16);

    // Flanking background trees (Layer 3)
    this.arr_trees = [
      { dist: tmp_platformStart - 20, scale: 0.95 },
      { dist: tmp_platformStart - 8, scale: 0.85 },
      { dist: tmp_platformStart + platformLengthMeters + 8, scale: 0.85 },
      { dist: tmp_platformStart + platformLengthMeters + 20, scale: 0.95 },
    ];

    // Animation & sound state machine
    this.state = cons_STATION_STATES.IDLE;
    this.hasPlayedArrivalChime = false;
    this.hasPlayedDoorChime = false;
    this.hasPlayedDepartureWhistle = false;
  }

  /**
   * Checks if a world coordinate or train position falls within the station platform target zone.
   */
  isInsideTargetZone(trainDistMeters) {
    return Math.abs(trainDistMeters - this.trackDistMeters) <= this.targetZoneRadiusMeters;
  }

  /**
   * Advances station arrival/departure animation state machines and audio triggers.
   */
  update(deltaTime, trainDistMeters, trainSpeedKmh, dwellProgress = 0, soundManager = null, stationLightsIntensity = 1.0) {
    const tmp_distToStation = this.trackDistMeters - trainDistMeters;
    const tmp_absSpeed = Math.abs(trainSpeedKmh);
    const tmp_inTargetZone = this.isInsideTargetZone(trainDistMeters);

    // State Machine Transitions:
    // 1. APPROACHING: Train is within 280m and closing in
    if (tmp_distToStation > 0 && tmp_distToStation <= 280 && tmp_absSpeed < 65 && this.state === cons_STATION_STATES.IDLE) {
      this.state = cons_STATION_STATES.APPROACHING;
      if (!this.hasPlayedArrivalChime && soundManager && soundManager.playStationChime) {
        soundManager.playStationChime();
        this.hasPlayedArrivalChime = true;
      }
    }

    // 2. BERTHED: Train is stopped (< 1.5 km/h) inside platform target zone
    if (tmp_inTargetZone && tmp_absSpeed < 1.5) {
      if (this.state !== cons_STATION_STATES.BERTHED) {
        this.state = cons_STATION_STATES.BERTHED;
        if (!this.hasPlayedDoorChime && soundManager && soundManager.playDoorChime) {
          soundManager.playDoorChime();
          this.hasPlayedDoorChime = true;
        }
      }
    }

    // 3. DEPARTING: Dwell complete or train accelerating out of station
    if (this.state === cons_STATION_STATES.BERTHED && (dwellProgress >= 0.98 || (tmp_absSpeed > 5.0 && tmp_distToStation < -10))) {
      this.state = cons_STATION_STATES.DEPARTING;
      if (!this.hasPlayedDepartureWhistle && soundManager && soundManager.playGuardWhistle) {
        soundManager.playGuardWhistle();
        this.hasPlayedDepartureWhistle = true;
      }
    }

    // 4. Reset to IDLE after train has passed beyond the station
    if (tmp_distToStation < -(this.platformLengthMeters * 0.7) && tmp_absSpeed > 10) {
      this.state = cons_STATION_STATES.IDLE;
      this.hasPlayedArrivalChime = false;
      this.hasPlayedDoorChime = false;
      this.hasPlayedDepartureWhistle = false;
    }

    // Update lamps (warm up when train approaches, modulate by day/night intensity)
    const tmp_isApproaching = this.state === cons_STATION_STATES.APPROACHING || this.state === cons_STATION_STATES.BERTHED;
    for (let tmp_i = 0; tmp_i < this.arr_lamps.length; tmp_i++) {
      this.arr_lamps[tmp_i].lamp.update(deltaTime, tmp_isApproaching, stationLightsIntensity);
    }

    // Update passenger animations (facing, walking, boarding)
    this.passengerGroup.update(deltaTime, this.state, dwellProgress);
  }

  /**
   * Layer 3: Flanking background trees framing the station.
   */
  renderLayer3(ctx, ppm, trackElevationFn) {
    ctx.save();
    for (let tmp_i = 0; tmp_i < this.arr_trees.length; tmp_i++) {
      const obj_t = this.arr_trees[tmp_i];
      const tmp_x = obj_t.dist * ppm;
      const tmp_y = trackElevationFn(obj_t.dist);

      ctx.save();
      ctx.translate(tmp_x, tmp_y);
      ctx.scale(obj_t.scale, obj_t.scale);

      if (this.themeKey === cons_STATION_THEMES.MOUNTAIN) {
        // Alpine pine tree
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-3, -20, 6, 20);
        ctx.fillStyle = '#14532d';
        ctx.beginPath();
        ctx.moveTo(0, -75);
        ctx.lineTo(24, -20);
        ctx.lineTo(-24, -20);
        ctx.closePath();
        ctx.fill();
      } else {
        // Broadleaf tree / banyan
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-4, -24, 8, 24);
        ctx.fillStyle = this.theme.foliage.canopyColor || '#15803d';
        ctx.beginPath();
        ctx.arc(0, -42, 28, 0, Math.PI * 2);
        ctx.arc(-16, -34, 20, 0, Math.PI * 2);
        ctx.arc(16, -34, 20, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Layer 4: Infrastructure - Depot building, platform canopies, lamps, signs, fences, overhead catenary.
   */
  renderLayer4(ctx, ppm, trackElevationFn) {
    ctx.save();
    const tmp_platformYOffset = this.platform.heightPixels;

    // 1. Boundary fence along rear of platform
    this.platform.renderFence(ctx, ppm, trackElevationFn);

    // 2. Station depot building (centered behind platform)
    const tmp_buildingX = this.trackDistMeters * ppm;
    const tmp_buildingGroundY = trackElevationFn(this.trackDistMeters) - tmp_platformYOffset;
    this.building.render(ctx, tmp_buildingX, tmp_buildingGroundY);

    // 3. Platform roof canopies
    this.platform.renderCanopies(ctx, ppm, trackElevationFn);

    // 4. Platform lamps with illuminated halos
    for (let tmp_i = 0; tmp_i < this.arr_lamps.length; tmp_i++) {
      const obj_l = this.arr_lamps[tmp_i];
      const tmp_lx = obj_l.dist * ppm;
      const tmp_ly = trackElevationFn(obj_l.dist) - tmp_platformYOffset;
      obj_l.lamp.render(ctx, tmp_lx, tmp_ly);
    }

    // 5. Overhead catenary wires & tensioned cross-span over station tracks
    this.renderOverheadCatenary(ctx, ppm, trackElevationFn);

    // 6. Starter / departure color-light signal at platform departure end
    this.renderStarterSignal(ctx, ppm, trackElevationFn);

    ctx.restore();
  }

  /**
   * Layer 5: Trackbed features, platform base, coping, tactile edge, benches, equipment, signs, passengers, luggage.
   */
  renderLayer5(ctx, ppm, trackElevationFn) {
    ctx.save();
    const tmp_platformYOffset = this.platform.heightPixels;

    // 1. Platform raised slab, coping, yellow tactile strip, and ramps
    this.platform.renderBase(ctx, ppm, trackElevationFn);

    // 2. Platform benches
    this.platform.renderBenches(ctx, ppm, trackElevationFn);

    // 3. Station equipment (chai stall, water cooler, hand-pump well, fire buckets)
    this.platform.renderEquipment(ctx, ppm, trackElevationFn);

    // 4. Dual station signs (rendered cleanly on platform slab, unobstructed by catenary wires or fences)
    const tmp_sign1X = (this.platform.startDistMeters + 15) * ppm;
    const tmp_sign1Y = trackElevationFn(this.platform.startDistMeters + 15) - tmp_platformYOffset;
    this.signStart.render(ctx, tmp_sign1X, tmp_sign1Y);

    const tmp_sign2X = (this.platform.endDistMeters - 15) * ppm;
    const tmp_sign2Y = trackElevationFn(this.platform.endDistMeters - 15) - tmp_platformYOffset;
    this.signEnd.render(ctx, tmp_sign2X, tmp_sign2Y);

    // 5. Passenger silhouettes and luggage with boarding walk cycle
    this.passengerGroup.render(ctx, ppm, trackElevationFn, this.platform.heightPixels);

    ctx.restore();
  }

  /**
   * Layer 6: Foreground platform edge markers, safety lights, and floral planters.
   */
  renderLayer6(ctx, ppm, trackElevationFn) {
    ctx.save();
    const arr_edges = [this.platform.startDistMeters, this.platform.endDistMeters];
    for (let tmp_i = 0; tmp_i < arr_edges.length; tmp_i++) {
      const tmp_d = arr_edges[tmp_i];
      const tmp_x = tmp_d * ppm;
      const tmp_y = trackElevationFn(tmp_d) + 2;

      // Red/white striped platform edge post
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(tmp_x - 2, tmp_y - 20, 4, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(tmp_x - 2, tmp_y - 14, 4, 4);
    }
    ctx.restore();
  }

  /**
   * Renders overhead catenary gantry wires with droppers spanning across the station.
   */
  renderOverheadCatenary(ctx, ppm, trackElevationFn) {
    ctx.save();
    const tmp_startDist = this.platform.startDistMeters - 15;
    const tmp_endDist = this.platform.endDistMeters + 15;
    const tmp_wireH = 68; // Height above track

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.4;

    // Contact wire
    ctx.beginPath();
    let tmp_first = true;
    for (let tmp_d = tmp_startDist; tmp_d <= tmp_endDist; tmp_d += 5) {
      const tmp_x = tmp_d * ppm;
      const tmp_y = trackElevationFn(tmp_d) - tmp_wireH;
      if (tmp_first) {
        ctx.moveTo(tmp_x, tmp_y);
        tmp_first = false;
      } else {
        ctx.lineTo(tmp_x, tmp_y);
      }
    }
    ctx.stroke();

    // Sagging catenary messenger wire above contact wire
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.0;
    const tmp_poleStep = 45; // Pole every 45m
    for (let tmp_pd = tmp_startDist; tmp_pd < tmp_endDist; tmp_pd += tmp_poleStep) {
      const tmp_x1 = tmp_pd * ppm;
      const tmp_y1 = trackElevationFn(tmp_pd) - (tmp_wireH + 16);
      const tmp_x2 = (tmp_pd + tmp_poleStep) * ppm;
      const tmp_y2 = trackElevationFn(tmp_pd + tmp_poleStep) - (tmp_wireH + 16);
      const tmp_midX = (tmp_x1 + tmp_x2) * 0.5;
      const tmp_midY = (tmp_y1 + tmp_y2) * 0.5 + 8; // Sag

      ctx.beginPath();
      ctx.moveTo(tmp_x1, tmp_y1);
      ctx.quadraticCurveTo(tmp_midX, tmp_midY, tmp_x2, tmp_y2);
      ctx.stroke();

      // Vertical droppers
      for (let tmp_k = 1; tmp_k <= 3; tmp_k++) {
        const tmp_dx = tmp_x1 + (tmp_x2 - tmp_x1) * (tmp_k / 4);
        const tmp_topY = tmp_y1 + 4;
        const tmp_botY = tmp_y1 + 16;
        ctx.beginPath();
        ctx.moveTo(tmp_dx, tmp_topY);
        ctx.lineTo(tmp_dx, tmp_botY);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /**
   * Renders station departure / starter color-light signal at platform departure end.
   */
  renderStarterSignal(ctx, ppm, trackElevationFn) {
    ctx.save();
    const tmp_sigDist = this.platform.endDistMeters + 8;
    const tmp_x = tmp_sigDist * ppm;
    const tmp_groundY = trackElevationFn(tmp_sigDist);

    // Steel mast
    ctx.fillStyle = '#475569';
    ctx.fillRect(tmp_x - 2.5, tmp_groundY - 65, 5, 65);

    // Target plate
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(tmp_x, tmp_groundY - 55, 10, 0, Math.PI * 2);
    ctx.fill();

    // Signal aspect: GREEN if departed/idle, RED if berthed for dwell
    const tmp_isRed = this.state === cons_STATION_STATES.BERTHED;
    const tmp_color = tmp_isRed ? '#ef4444' : '#22c55e';

    ctx.beginPath();
    ctx.arc(tmp_x, tmp_groundY - 55, 4, 0, Math.PI * 2);
    ctx.fillStyle = tmp_color;
    ctx.fill();

    ctx.restore();
  }
}
