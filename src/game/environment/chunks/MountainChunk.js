/**
 * MountainChunk.js
 * Rugged alpine / canyon mountain pass chunk with rocky cliff cuts, retaining walls, and boulders.
 */

import { BaseChunk } from './BaseChunk.js';

export class MountainChunk extends BaseChunk {
  /**
   * Initializes mountain chunk identifier.
   */
  constructor(chunkIndex, startDistMeters, chunkLengthMeters, worldSeed = 42) {
    super(chunkIndex, startDistMeters, chunkLengthMeters, worldSeed);
    this.type = 'mountain';
  }

  /**
   * Populates layer elements for rocky mountain pass deterministically.
   */
  generate(trackSystem) {
    if (this.isGenerated) return;

    // Layer 2: High jagged mountain peaks with snowcaps
    for (let tmp_d = this.startDist; tmp_d < this.endDist; tmp_d += 140) {
      this.arr_layer2Mountains.push({
        dist: tmp_d,
        height: this.rng.range(180, 260),
        width: this.rng.range(260, 420),
        hasSnow: true,
        color: '#334155',
      });
    }

    // Layer 3: Mountain pines clinging to slopes
    for (let tmp_d = this.startDist + 15; tmp_d < this.endDist - 15; tmp_d += 38) {
      if (this.rng.chance(0.6)) {
        this.arr_layer3Vegetation.push({
          type: 'pine',
          dist: tmp_d,
          scale: this.rng.range(0.7, 1.1),
        });
      }
    }

    // Layer 4: Stone masonry retaining wall & rock cliff face
    const tmp_wallStart = this.startDist + 30;
    const tmp_wallLen = this.length - 60;
    this.arr_layer4Infrastructure.push({
      type: 'rock_cliff_face',
      dist: tmp_wallStart,
      lengthMeters: tmp_wallLen,
      heightMeters: 85,
    });

    this.arr_layer4Infrastructure.push({
      type: 'stone_retaining_wall',
      dist: tmp_wallStart,
      lengthMeters: tmp_wallLen,
      heightMeters: 28,
    });

    // Rockfall hazard warning sign
    this.arr_layer4Infrastructure.push({
      type: 'rockfall_sign',
      dist: this.startDist + 20,
    });

    // Layer 6: Large boulders and loose rock scree along track
    for (let tmp_d = this.startDist + 12; tmp_d < this.endDist; tmp_d += 26) {
      if (this.rng.chance(0.55)) {
        this.arr_layer6Foreground.push({
          type: 'boulder',
          dist: tmp_d + this.rng.range(-4, 4),
          radius: this.rng.range(10, 18),
        });
      }
    }

    this.isGenerated = true;
  }
}
