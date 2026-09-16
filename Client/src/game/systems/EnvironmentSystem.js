/**
 * EnvironmentSystem.js
 * Manages procedural terrain generation, scenery features (trees, telegraph poles, rocks, stations), and biomes.
 */

export class EnvironmentSystem {
  /**
   * Initializes scenery generation seeds and features array for the given mission biome.
   */
  constructor(obj_mission) {
    this.mission = obj_mission;
    this.biome = obj_mission.biome || 'forest';
    this.arr_sceneryElements = [];
    this.arr_stations = [];

    this.generateSceneryFeatures();
    this.setupStations();
  }

  /**
   * Generates procedural scenery landmarks, vegetation, and telegraph poles along the track.
   */
  generateSceneryFeatures() {
    const tmp_length = this.mission.trackLengthMeters;

    // Place telegraph poles every 65 meters along track
    for (let tmp_d = 40; tmp_d < tmp_length - 40; tmp_d += 65) {
      this.arr_sceneryElements.push({
        type: 'telegraph_pole',
        distMeters: tmp_d,
        height: 68,
      });
    }

    // Place trees and vegetation based on biome
    const tmp_step = this.biome === 'forest' ? 22 : (this.biome === 'desert' ? 75 : 35);
    for (let tmp_d = 20; tmp_d < tmp_length - 20; tmp_d += tmp_step) {
      const tmp_rnd = Math.sin(tmp_d * 12.9898);
      const tmp_treeType = this.biome === 'desert'
        ? (tmp_rnd > 0 ? 'cactus' : 'desert_bush')
        : (this.biome === 'mountain' ? 'pine' : (tmp_rnd > 0 ? 'pine' : 'broadleaf'));

      this.arr_sceneryElements.push({
        type: tmp_treeType,
        distMeters: tmp_d + tmp_rnd * 8,
        scale: 0.75 + Math.abs(tmp_rnd) * 0.5,
        flipX: tmp_rnd < 0,
      });
    }

    // Place distance mileposts every 500 meters
    for (let tmp_d = 500; tmp_d < tmp_length; tmp_d += 500) {
      this.arr_sceneryElements.push({
        type: 'milepost',
        distMeters: tmp_d,
        labelKm: (tmp_d / 1000).toFixed(1),
      });
    }
  }

  /**
   * Sets up start and destination station coordinates and structures.
   */
  setupStations() {
    this.arr_stations = [
      {
        id: 'start',
        name: this.mission.startStation,
        distMeters: 0,
        platformLengthMeters: 140,
      },
      {
        id: 'destination',
        name: this.mission.endStation,
        distMeters: this.mission.trackLengthMeters,
        platformLengthMeters: 160,
      },
    ];
  }
}
