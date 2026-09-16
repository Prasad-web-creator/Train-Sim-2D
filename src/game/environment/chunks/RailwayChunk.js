/**
 * RailwayChunk.js
 * Open countryside railway corridor with telegraph lines, fences, signal masts, and wild flora.
 */

import { BaseChunk } from './BaseChunk.js';

export class RailwayChunk extends BaseChunk {
  /**
   * Initializes chunk type identifier for open railway corridor.
   */
  constructor(chunkIndex, startDistMeters, chunkLengthMeters, worldSeed = 42) {
    super(chunkIndex, startDistMeters, chunkLengthMeters, worldSeed);
    this.type = 'railway';
  }

  /**
   * Populates layer elements for open countryside deterministically.
   */
  generate(trackSystem) {
    if (this.isGenerated) return;

    // Layer 2: Distant rolling hill peaks
    for (let tmp_d = this.startDist; tmp_d < this.endDist; tmp_d += 120) {
      this.arr_layer2Mountains.push({
        dist: tmp_d,
        height: this.rng.range(90, 160),
        width: this.rng.range(220, 360),
        color: '#15803d',
      });
    }

    // Layer 3: Midground tree groves
    for (let tmp_d = this.startDist + 20; tmp_d < this.endDist - 20; tmp_d += 45) {
      if (this.rng.chance(0.7)) {
        this.arr_layer3Vegetation.push({
          type: this.rng.chance(0.6) ? 'broadleaf' : 'pine',
          dist: tmp_d + this.rng.range(-10, 10),
          scale: this.rng.range(0.7, 1.1),
          flipX: this.rng.chance(0.5),
        });
      }
    }

    // Layer 4: Infrastructure (Telegraph poles, catenary wires, fences, signals)
    // Telegraph poles every 60m
    for (let tmp_d = this.startDist + 15; tmp_d < this.endDist; tmp_d += 60) {
      this.arr_layer4Infrastructure.push({
        type: 'telegraph_pole',
        dist: tmp_d,
        height: 68,
      });
    }

    // Boundary wooden fence segments
    for (let tmp_d = this.startDist + 10; tmp_d < this.endDist - 30; tmp_d += 70) {
      if (this.rng.chance(0.65)) {
        this.arr_layer4Infrastructure.push({
          type: 'wooden_fence',
          dist: tmp_d,
          lengthMeters: 45,
        });
      }
    }

    // Trackside color-light railway block signal mast (occasional)
    if (this.rng.chance(0.5)) {
      const tmp_signalDist = this.startDist + this.length * 0.5;
      this.arr_layer4Infrastructure.push({
        type: 'railway_signal',
        dist: tmp_signalDist,
        aspect: this.rng.chance(0.85) ? 'green' : 'amber',
      });
    }

    // Milepost marker
    this.arr_layer4Infrastructure.push({
      type: 'milepost',
      dist: this.startDist + this.length * 0.25,
      labelKm: ((this.startDist + this.length * 0.25) / 1000).toFixed(1),
    });

    // Layer 6: Foreground wild grass tufts and cutaway soil
    for (let tmp_d = this.startDist + 8; tmp_d < this.endDist; tmp_d += 22) {
      this.arr_layer6Foreground.push({
        type: 'grass_tuft',
        dist: tmp_d + this.rng.range(-4, 4),
        height: this.rng.range(12, 22),
        color: this.rng.chance(0.5) ? '#22c55e' : '#16a34a',
      });
    }

    this.isGenerated = true;
  }
}
