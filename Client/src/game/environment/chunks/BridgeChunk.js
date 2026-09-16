/**
 * BridgeChunk.js
 * High-span steel trestle viaduct bridge environment chunk crossing deep canyon gorges.
 */

import { BaseChunk } from './BaseChunk.js';

export class BridgeChunk extends BaseChunk {
  /**
   * Initializes bridge chunk identifier.
   */
  constructor(chunkIndex, startDistMeters, chunkLengthMeters, worldSeed = 42) {
    super(chunkIndex, startDistMeters, chunkLengthMeters, worldSeed);
    this.type = 'bridge';
  }

  /**
   * Populates layer elements for deep canyon trestle bridge deterministically.
   */
  generate(trackSystem) {
    if (this.isGenerated) return;

    const tmp_bridgeStart = this.startDist + 20;
    const tmp_bridgeLength = this.length - 40;

    // Layer 2: Distant canyon chasm walls
    this.arr_layer2Mountains.push({
      dist: this.startDist + this.length * 0.5,
      height: 90,
      width: this.length * 1.2,
      isCanyonGap: true,
      color: '#7c2d12',
    });

    // Layer 4: Background bridge steel trusses
    this.arr_layer4Infrastructure.push({
      type: 'bridge_back_truss',
      startDist: tmp_bridgeStart,
      lengthMeters: tmp_bridgeLength,
    });

    // Layer 5: Heavy steel deck girder & tall trestle piers descending into ravine
    this.arr_layer5Track.push({
      type: 'trestle_bridge_structure',
      startDist: tmp_bridgeStart,
      lengthMeters: tmp_bridgeLength,
      pierSpacingMeters: 38,
      ravineDepth: 280, // Deep drop below track
    });

    // Layer 6: Foreground bridge guardrail and pedestrian refuge safety walkway
    this.arr_layer6Foreground.push({
      type: 'bridge_foreground_guardrail',
      startDist: tmp_bridgeStart,
      lengthMeters: tmp_bridgeLength,
    });

    this.isGenerated = true;
  }
}
