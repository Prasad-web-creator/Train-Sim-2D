/**
 * StationChunk.js
 * Passenger and freight station environment chunk featuring the reusable Station environment system.
 * Configures the 5 visual themes (Indian, Mountain, Urban, Rural, Industrial) based on route and mission.
 */

import { BaseChunk } from './BaseChunk.js';
import { Station, cons_STATION_THEMES } from '../station/index.js';

export class StationChunk extends BaseChunk {
  /**
   * Initializes station chunk with station naming, thematic profile, and master Station entity.
   */
  constructor(chunkIndex, startDistMeters, chunkLengthMeters, worldSeed = 42, stationName = 'Central Depot', themeKey = null) {
    super(chunkIndex, startDistMeters, chunkLengthMeters, worldSeed);
    this.type = 'station';
    this.stationName = stationName;
    this.themeKey = themeKey || this.resolveTheme(stationName);

    const tmp_platformStartDist = this.startDist + 35;
    const tmp_platformLengthMeters = Math.min(220, this.length - 70);
    const tmp_midDist = tmp_platformStartDist + tmp_platformLengthMeters * 0.5;

    // Instantiate master Station instance
    this.station = new Station(
      this.themeKey,
      tmp_midDist,
      this.stationName,
      tmp_platformLengthMeters,
      25
    );
  }

  /**
   * Resolves visual station theme according to station name conventions.
   */
  resolveTheme(stationName) {
    const tmp_lower = (stationName || '').toLowerCase();
    if (
      tmp_lower.includes('thoothukudi') ||
      tmp_lower.includes('tirunelveli') ||
      tmp_lower.includes('madurai') ||
      tmp_lower.includes('chennai') ||
      tmp_lower.includes('coastal') ||
      tmp_lower.includes('junction')
    ) {
      return cons_STATION_THEMES.INDIAN;
    }
    if (
      tmp_lower.includes('alpine') ||
      tmp_lower.includes('glacier') ||
      tmp_lower.includes('peak') ||
      tmp_lower.includes('summit') ||
      tmp_lower.includes('pass')
    ) {
      return cons_STATION_THEMES.MOUNTAIN;
    }
    if (
      tmp_lower.includes('metro') ||
      tmp_lower.includes('urban') ||
      tmp_lower.includes('city') ||
      tmp_lower.includes('transit')
    ) {
      return cons_STATION_THEMES.URBAN;
    }
    if (
      tmp_lower.includes('milltown') ||
      tmp_lower.includes('yard') ||
      tmp_lower.includes('canyon') ||
      tmp_lower.includes('mesa') ||
      tmp_lower.includes('freight') ||
      tmp_lower.includes('industrial')
    ) {
      return cons_STATION_THEMES.INDUSTRIAL;
    }
    return cons_STATION_THEMES.RURAL;
  }

  /**
   * Populates layer elements for station infrastructure across layers 3 to 6.
   */
  generate(trackSystem) {
    if (this.isGenerated) return;

    // Register station entity across active parallax layers
    this.arr_layer3Vegetation.push({
      type: 'station_instance',
      dist: this.station.trackDistMeters,
      station: this.station,
    });

    this.arr_layer4Infrastructure.push({
      type: 'station_instance',
      dist: this.station.trackDistMeters,
      station: this.station,
    });

    this.arr_layer5Track.push({
      type: 'station_instance',
      dist: this.station.trackDistMeters,
      station: this.station,
    });

    this.arr_layer6Foreground.push({
      type: 'station_instance',
      dist: this.station.trackDistMeters,
      station: this.station,
    });

    this.isGenerated = true;
  }
}
