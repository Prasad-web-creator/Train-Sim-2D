/**
 * RandomGenerator.js
 * Fast deterministic 32-bit PRNG (Mulberry32) for reproducible procedural environment generation.
 */

export class RandomGenerator {
  /**
   * Initializes PRNG with a numeric 32-bit integer seed.
   */
  constructor(seed = 1337) {
    this.seed = seed >>> 0;
  }

  /**
   * Generates next pseudo-random floating point number in range [0, 1).
   */
  nextFloat() {
    let tmp_t = (this.seed += 0x6d2b79f5);
    tmp_t = Math.imul(tmp_t ^ (tmp_t >>> 15), tmp_t | 1);
    tmp_t ^= tmp_t + Math.imul(tmp_t ^ (tmp_t >>> 7), tmp_t | 61);
    return ((tmp_t ^ (tmp_t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates next pseudo-random number within given min and max range.
   */
  range(min, max) {
    return min + this.nextFloat() * (max - min);
  }

  /**
   * Generates next pseudo-random integer between min and max inclusive.
   */
  rangeInt(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Randomly returns true or false with given probability.
   */
  chance(probability = 0.5) {
    return this.nextFloat() < probability;
  }

  /**
   * Picks a random element from a given array deterministically.
   */
  pick(arr_items) {
    if (!arr_items || arr_items.length === 0) return null;
    const tmp_idx = this.rangeInt(0, arr_items.length - 1);
    return arr_items[tmp_idx];
  }
}

/**
 * Creates a unique deterministic 32-bit integer hash from chunk index and world seed.
 */
export function hashChunkSeed(chunkIndex, worldSeed = 42) {
  let tmp_h = (chunkIndex * 374761393) ^ (worldSeed * 668265263);
  tmp_h = (tmp_h ^ (tmp_h >>> 13)) * 1274126177;
  return (tmp_h ^ (tmp_h >>> 16)) >>> 0;
}
