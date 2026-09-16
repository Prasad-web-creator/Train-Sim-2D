/**
 * ForestChunk.js
 * Dense woodland environment chunk featuring multi-tier pine groves, logging timber stacks, and undergrowth.
 */

import { BaseChunk } from './BaseChunk.js';

export class ForestChunk extends BaseChunk {
  /**
   * Initializes forest chunk identifier.
   */
  constructor(chunkIndex, startDistMeters, chunkLengthMeters, worldSeed = 42) {
    super(chunkIndex, startDistMeters, chunkLengthMeters, worldSeed);
    this.type = 'forest';
  }

  /**
   * Populates layer elements for dense forest deterministically.
   */
  generate(trackSystem) {
    if (this.isGenerated) return;

    // Layer 2: Distant pine forest hills
    for (let tmp_d = this.startDist; tmp_d < this.endDist; tmp_d += 100) {
      this.arr_layer2Mountains.push({
        dist: tmp_d,
        height: this.rng.range(110, 180),
        width: this.rng.range(200, 320),
        color: '#064e3b',
      });
    }

    // Layer 3: High-density pine & oak trees
    for (let tmp_d = this.startDist + 10; tmp_d < this.endDist - 10; tmp_d += 16) {
      this.arr_layer3Vegetation.push({
        type: this.rng.chance(0.75) ? 'pine' : 'broadleaf',
        dist: tmp_d + this.rng.range(-6, 6),
        scale: this.rng.range(0.85, 1.35),
        flipX: this.rng.chance(0.5),
      });
    }

    // Layer 4: Infrastructure - Timber log stacks & telegraph poles
    for (let tmp_d = this.startDist + 25; tmp_d < this.endDist; tmp_d += 65) {
      this.arr_layer4Infrastructure.push({
        type: 'telegraph_pole',
        dist: tmp_d,
        height: 68,
      });
    }

    // Stacked harvested lumber piles along trackside
    for (let tmp_d = this.startDist + 40; tmp_d < this.endDist - 40; tmp_d += 120) {
      if (this.rng.chance(0.7)) {
        this.arr_layer4Infrastructure.push({
          type: 'log_stack',
          dist: tmp_d,
          logCount: this.rng.rangeInt(6, 12),
        });
      }
    }

    // Layer 6: Forest floor undergrowth, ferns, mossy rocks
    for (let tmp_d = this.startDist + 5; tmp_d < this.endDist; tmp_d += 18) {
      this.arr_layer6Foreground.push({
        type: this.rng.chance(0.4) ? 'mossy_rock' : 'fern_bush',
        dist: tmp_d + this.rng.range(-4, 4),
        scale: this.rng.range(0.8, 1.2),
      });
    }

    this.isGenerated = true;
  }
}
