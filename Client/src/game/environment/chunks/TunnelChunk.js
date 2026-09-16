/**
 * TunnelChunk.js
 * Mountain tunnel environment chunk with heavy stone-masonry arched portals and dark interior shading.
 */

import { BaseChunk } from './BaseChunk.js';

export class TunnelChunk extends BaseChunk {
  /**
   * Initializes tunnel chunk identifier.
   */
  constructor(chunkIndex, startDistMeters, chunkLengthMeters, worldSeed = 42) {
    super(chunkIndex, startDistMeters, chunkLengthMeters, worldSeed);
    this.type = 'tunnel';
  }

  /**
   * Populates layer elements for stone tunnel portals and dark cavern passage.
   */
  generate(trackSystem) {
    if (this.isGenerated) return;

    const tmp_portalEntranceDist = this.startDist + 40;
    const tmp_portalExitDist = this.endDist - 40;
    const tmp_tunnelLength = tmp_portalExitDist - tmp_portalEntranceDist;

    // Layer 2: Mountain massif towering above tunnel
    this.arr_layer2Mountains.push({
      dist: this.startDist + this.length * 0.5,
      height: 280,
      width: this.length * 1.4,
      color: '#1e293b',
    });

    // Layer 4: Mountain rock face and dark interior cavern backdrop
    this.arr_layer4Infrastructure.push({
      type: 'tunnel_interior_backdrop',
      startDist: tmp_portalEntranceDist,
      lengthMeters: tmp_tunnelLength,
    });

    // Tunnel wall lamps inside
    for (let tmp_d = tmp_portalEntranceDist + 25; tmp_d < tmp_portalExitDist; tmp_d += 40) {
      this.arr_layer4Infrastructure.push({
        type: 'tunnel_wall_lamp',
        dist: tmp_d,
      });
    }

    // Layer 5: Tunnel track bed
    this.arr_layer5Track.push({
      type: 'tunnel_track_section',
      startDist: tmp_portalEntranceDist,
      lengthMeters: tmp_tunnelLength,
    });

    // Layer 6: Heavy stone masonry entrance & exit arches in foreground
    this.arr_layer6Foreground.push({
      type: 'tunnel_portal_arch',
      dist: tmp_portalEntranceDist,
      isEntrance: true,
    });

    this.arr_layer6Foreground.push({
      type: 'tunnel_portal_arch',
      dist: tmp_portalExitDist,
      isEntrance: false,
    });

    // Mountain rock overhang above portal
    this.arr_layer6Foreground.push({
      type: 'tunnel_rock_overhang',
      startDist: tmp_portalEntranceDist,
      lengthMeters: tmp_tunnelLength,
    });

    this.isGenerated = true;
  }
}
