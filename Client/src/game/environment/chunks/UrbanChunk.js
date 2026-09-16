/**
 * UrbanChunk.js
 * Industrial rail yard and urban warehouse corridor with brick buildings, water towers, and signal gantries.
 */

import { BaseChunk } from './BaseChunk.js';

export class UrbanChunk extends BaseChunk {
  /**
   * Initializes urban chunk identifier.
   */
  constructor(chunkIndex, startDistMeters, chunkLengthMeters, worldSeed = 42) {
    super(chunkIndex, startDistMeters, chunkLengthMeters, worldSeed);
    this.type = 'urban';
  }

  /**
   * Populates layer elements for industrial rail yard and warehouses deterministically.
   */
  generate(trackSystem) {
    if (this.isGenerated) return;

    // Layer 2: Distant industrial skyline silhouettes
    for (let tmp_d = this.startDist; tmp_d < this.endDist; tmp_d += 120) {
      this.arr_layer2Mountains.push({
        dist: tmp_d,
        height: this.rng.range(120, 160),
        width: this.rng.range(180, 260),
        isUrbanSkyline: true,
        color: '#1e293b',
      });
    }

    // Layer 4: Multi-story brick warehouses, freight sheds, water tower, signals
    // 1. Brick warehouse building
    this.arr_layer4Infrastructure.push({
      type: 'brick_warehouse',
      dist: this.startDist + 35,
      widthMeters: 65,
      heightMeters: 52,
    });

    // 2. Vintage wooden/steel railway water tower
    this.arr_layer4Infrastructure.push({
      type: 'water_tower',
      dist: this.startDist + 135,
    });

    // 3. Corrugated metal freight shed
    this.arr_layer4Infrastructure.push({
      type: 'freight_shed',
      dist: this.startDist + 210,
      widthMeters: 75,
      heightMeters: 40,
    });

    // 4. Cantilever rail signal gantry
    this.arr_layer4Infrastructure.push({
      type: 'signal_gantry',
      dist: this.startDist + 310,
      aspect: this.rng.chance(0.8) ? 'green' : 'amber',
    });

    // Floodlight tower
    this.arr_layer4Infrastructure.push({
      type: 'floodlight_tower',
      dist: this.startDist + 360,
    });

    // Chainlink fence segments along rail corridor
    for (let tmp_d = this.startDist + 10; tmp_d < this.endDist - 30; tmp_d += 90) {
      this.arr_layer4Infrastructure.push({
        type: 'chainlink_fence',
        dist: tmp_d,
        lengthMeters: 75,
      });
    }

    // Layer 6: Industrial foreground details (drainage grate, scrap palettes)
    for (let tmp_d = this.startDist + 20; tmp_d < this.endDist; tmp_d += 55) {
      this.arr_layer6Foreground.push({
        type: 'urban_foreground_prop',
        dist: tmp_d,
      });
    }

    this.isGenerated = true;
  }
}
