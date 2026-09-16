/**
 * BaseChunk.js
 * Abstract foundation class for deterministic railway environment chunks with layer segregation.
 */

import { RandomGenerator, hashChunkSeed } from '../RandomGenerator.js';
import { cons_GAME_CONFIG } from '../../../constants/GameConstants.js';

export class BaseChunk {
  /**
   * Initializes chunk bounds, deterministic seed, and layer element buckets.
   */
  constructor(chunkIndex, startDistMeters, chunkLengthMeters, worldSeed = 42) {
    this.index = chunkIndex;
    this.type = 'base';
    this.startDist = startDistMeters;
    this.length = chunkLengthMeters;
    this.endDist = startDistMeters + chunkLengthMeters;
    this.seed = hashChunkSeed(chunkIndex, worldSeed);
    this.rng = new RandomGenerator(this.seed);

    // Layer element buckets
    this.arr_layer2Mountains = [];      // Layer 2: Distant mountain peaks
    this.arr_layer3Vegetation = [];     // Layer 3: Midground trees & hills
    this.arr_layer4Infrastructure = []; // Layer 4: Buildings, poles, wires, fences, signals
    this.arr_layer5Track = [];          // Layer 5: Track features (bridges, tunnel interior, platforms)
    this.arr_layer6Foreground = [];     // Layer 6: Foreground vegetation, cutaway soil, portal arches

    this.isGenerated = false;
  }

  /**
   * Abstract generator method to populate chunk layers deterministically.
   */
  generate(trackSystem) {
    this.isGenerated = true;
  }

  /**
   * Clears all layer buckets when chunk is recycled or removed.
   */
  clear() {
    this.arr_layer2Mountains = [];
    this.arr_layer3Vegetation = [];
    this.arr_layer4Infrastructure = [];
    this.arr_layer5Track = [];
    this.arr_layer6Foreground = [];
    this.isGenerated = false;
  }

  /**
   * Checks if this chunk overlaps the given distance range in meters.
   */
  overlaps(minDist, maxDist) {
    return this.endDist >= minDist && this.startDist <= maxDist;
  }
}
