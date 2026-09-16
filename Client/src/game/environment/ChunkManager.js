/**
 * ChunkManager.js
 * Manages deterministic chunk sequencing, active window streaming, object pooling,
 * and multi-layer element filtering across the railway corridor.
 */

import { cons_GAME_CONFIG } from '../../constants/GameConstants.js';
import { ObjectPool } from './ObjectPool.js';
import { RailwayChunk } from './chunks/RailwayChunk.js';
import { StationChunk } from './chunks/StationChunk.js';
import { ForestChunk } from './chunks/ForestChunk.js';
import { MountainChunk } from './chunks/MountainChunk.js';
import { BridgeChunk } from './chunks/BridgeChunk.js';
import { TunnelChunk } from './chunks/TunnelChunk.js';
import { UrbanChunk } from './chunks/UrbanChunk.js';

export class ChunkManager {
  /**
   * Initializes chunk manager with mission route definition and default chunk size.
   */
  constructor(obj_mission, worldSeed = 42) {
    this.mission = obj_mission;
    this.worldSeed = worldSeed;
    this.chunkLengthMeters = 400; // 400m per chunk
    this.totalTrackLength = obj_mission.trackLengthMeters;

    this.arr_allChunks = [];
    this.arr_activeChunks = [];
    this.arr_stations = [];

    // Object pool for lightweight render items
    this.renderPool = new ObjectPool(
      () => ({ type: '', dist: 0, x: 0, y: 0, scale: 1 }),
      (obj_item) => {
        obj_item.type = '';
        obj_item.dist = 0;
        obj_item.scale = 1;
      },
      80
    );

    this.buildChunkSequence();
  }

  /**
   * Constructs the deterministic layout sequence of environment chunks along the journey route.
   */
  buildChunkSequence() {
    const tmp_totalChunks = Math.max(8, Math.ceil(this.totalTrackLength / this.chunkLengthMeters));
    this.arr_allChunks = [];

    // Sequence pattern: Station -> Countryside -> Forest -> Mountain -> Tunnel -> Bridge -> Urban -> Station
    const arr_sequenceTypes = [
      'station_start',
      'railway',
      'forest',
      'mountain',
      'tunnel',
      'bridge',
      'forest',
      'urban',
      'mountain',
      'tunnel',
      'railway',
      'station_end',
    ];

    for (let tmp_i = 0; tmp_i < tmp_totalChunks; tmp_i++) {
      const tmp_startDist = tmp_i * this.chunkLengthMeters;
      let tmp_type;

      if (tmp_i === 0) {
        tmp_type = 'station_start';
      } else if (tmp_i === tmp_totalChunks - 1) {
        tmp_type = 'station_end';
      } else {
        const tmp_seqIdx = (tmp_i - 1) % (arr_sequenceTypes.length - 2) + 1;
        tmp_type = arr_sequenceTypes[tmp_seqIdx] || 'railway';
      }

      let obj_chunk;
      if (tmp_type === 'station_start') {
        obj_chunk = new StationChunk(tmp_i, tmp_startDist, this.chunkLengthMeters, this.worldSeed, this.mission.startStation);
      } else if (tmp_type === 'station_end') {
        obj_chunk = new StationChunk(tmp_i, tmp_startDist, this.chunkLengthMeters, this.worldSeed, this.mission.endStation);
      } else if (tmp_type === 'forest') {
        obj_chunk = new ForestChunk(tmp_i, tmp_startDist, this.chunkLengthMeters, this.worldSeed);
      } else if (tmp_type === 'mountain') {
        obj_chunk = new MountainChunk(tmp_i, tmp_startDist, this.chunkLengthMeters, this.worldSeed);
      } else if (tmp_type === 'bridge') {
        obj_chunk = new BridgeChunk(tmp_i, tmp_startDist, this.chunkLengthMeters, this.worldSeed);
      } else if (tmp_type === 'tunnel') {
        obj_chunk = new TunnelChunk(tmp_i, tmp_startDist, this.chunkLengthMeters, this.worldSeed);
      } else if (tmp_type === 'urban') {
        obj_chunk = new UrbanChunk(tmp_i, tmp_startDist, this.chunkLengthMeters, this.worldSeed);
      } else {
        obj_chunk = new RailwayChunk(tmp_i, tmp_startDist, this.chunkLengthMeters, this.worldSeed);
      }

      if (obj_chunk.station) {
        this.arr_stations.push(obj_chunk.station);
      }

      this.arr_allChunks.push(obj_chunk);
    }
  }

  /**
   * Advances animation state machines, passenger walking, and audio cues for all route stations.
   */
  updateStations(deltaTime, trainDistMeters, trainSpeedKmh, dwellProgress = 0, soundManager = null, stationLightsIntensity = 1.0) {
    for (let tmp_i = 0; tmp_i < this.arr_stations.length; tmp_i++) {
      this.arr_stations[tmp_i].update(deltaTime, trainDistMeters, trainSpeedKmh, dwellProgress, soundManager, stationLightsIntensity);
    }
  }

  /**
   * Finds the nearest railway station within the specified detection radius.
   */
  getNearbyStation(trainDistMeters, radiusMeters = 250) {
    for (let tmp_i = 0; tmp_i < this.arr_stations.length; tmp_i++) {
      const obj_stn = this.arr_stations[tmp_i];
      if (Math.abs(obj_stn.trackDistMeters - trainDistMeters) <= radiusMeters) {
        return obj_stn;
      }
    }
    return null;
  }

  /**
   * Updates active streaming window of chunks based on current camera world coordinate.
   */
  update(cameraX, viewportWidth, trackSystem) {
    const tmp_ppm = cons_GAME_CONFIG.PIXELS_PER_METER;
    // Visible world distance bounds with generous buffer margins (+/- 1 chunk)
    const tmp_minDist = (cameraX - viewportWidth * 0.9) / tmp_ppm;
    const tmp_maxDist = (cameraX + viewportWidth * 1.3) / tmp_ppm;

    this.arr_activeChunks = [];

    for (let tmp_i = 0; tmp_i < this.arr_allChunks.length; tmp_i++) {
      const obj_chunk = this.arr_allChunks[tmp_i];
      if (obj_chunk.overlaps(tmp_minDist, tmp_maxDist)) {
        if (!obj_chunk.isGenerated) {
          obj_chunk.generate(trackSystem);
        }
        this.arr_activeChunks.push(obj_chunk);
      }
    }
  }

  /**
   * Collects all active elements belonging to a specific parallax layer across visible chunks.
   */
  getElementsForLayer(layerNumber) {
    const arr_result = [];
    for (let tmp_i = 0; tmp_i < this.arr_activeChunks.length; tmp_i++) {
      const obj_chunk = this.arr_activeChunks[tmp_i];
      if (layerNumber === 2) arr_result.push(...obj_chunk.arr_layer2Mountains);
      else if (layerNumber === 3) arr_result.push(...obj_chunk.arr_layer3Vegetation);
      else if (layerNumber === 4) arr_result.push(...obj_chunk.arr_layer4Infrastructure);
      else if (layerNumber === 5) arr_result.push(...obj_chunk.arr_layer5Track);
      else if (layerNumber === 6) arr_result.push(...obj_chunk.arr_layer6Foreground);
    }
    return arr_result;
  }

  /**
   * Checks if train is currently inside a mountain tunnel section.
   */
  isInsideTunnel(distanceMeters) {
    for (let tmp_i = 0; tmp_i < this.arr_allChunks.length; tmp_i++) {
      const obj_chunk = this.arr_allChunks[tmp_i];
      if (obj_chunk.type === 'tunnel' && distanceMeters >= (obj_chunk.startDist + 40) && distanceMeters <= (obj_chunk.endDist - 40)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if train is currently on an elevated trestle bridge.
   */
  isOnBridge(distanceMeters) {
    for (let tmp_i = 0; tmp_i < this.arr_allChunks.length; tmp_i++) {
      const obj_chunk = this.arr_allChunks[tmp_i];
      if (obj_chunk.type === 'bridge' && distanceMeters >= (obj_chunk.startDist + 20) && distanceMeters <= (obj_chunk.endDist - 20)) {
        return true;
      }
    }
    return false;
  }
}
