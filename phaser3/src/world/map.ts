import Tile, { GroundType } from "./tile";
import Movable from "./movable";

export interface MapJson {
  ground: GroundType[][][];
}

export default class Map {
  protected tiles: Tile[][];
  protected movables: Set<Movable>[][];

  constructor(protected scene: Phaser.Scene, public width: number, public height: number) {}

  initialize(defaultBackground: GroundType) {
    this.tiles = [];
    this.movables = [];
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      this.movables[y] = [];
      for (let x = 0; x < this.width; x++) {
        const ground = new Tile(this.scene, x, y).addGroundOnTop(defaultBackground, 1);
        this.tiles[y][x] = ground;
        this.movables[y][x] = new Set<Movable>();
      }
    }
  }

  addTile(x: number, y: number, ground: GroundType, elevation: number): boolean {
    if (x >= this.width || x < 0) return false;
    if (y >= this.height || y < 0) return false;
    if (this.getTile(x, y + 1)?.getElevationOnTop() < elevation - 1) return false;
    if (this.getTile(x, y + 1)?.getElevationOnTop() > elevation) return false;
    if (this.getTile(x, y)?.getElevationOnTop() == elevation && this.getTile(x, y)?.getGroundOnTop()?.kind == ground.kind) return false;
    if (this.getTile(x, y)?.getElevationOnTop() <= elevation - 1) {
      this.tiles[y][x].addGroundOnTop({ kind: "cliff", type: "middle" }, elevation - 0.5);
    }
    if (this.getTile(x, y + 1)?.getElevationOnTop() <= elevation - 1) {
      this.tiles[y + 1][x].addGroundOnTop({ kind: "cliff", type: "middle" }, elevation - 0.5);
    }
    this.tiles[y][x].addGroundOnTop(ground, elevation);
    this.fixAutotile(x, y, ground.kind, elevation);
    return true;
  }

  deleteTile(x: number, y: number, elevation: number): boolean {
    if (x >= this.width || x < 0) return false;
    if (y >= this.height || y < 0) return false;
    if (this.getTile(x, y)?.getNumGrounds() <= 1) return false;
    if (this.getTile(x, y)?.getElevationOnTop() != elevation) return false;
    const ground = this.getTile(x, y)?.getGroundOnTop();
    if (elevation % 1 == 0.5) return false;
    this.tiles[y][x].deleteGroundOnTop();
    this.fixAutotile(x, y, ground.kind, elevation);
    if (this.getTile(x, y)?.getElevationOnTop() == elevation - 0.5 && this.getTile(x, y - 1)?.getElevationOnTop() != elevation) {
      this.tiles[y][x].deleteGroundOnTop();
    }
    if (this.getTile(x, y)?.getElevationOnTop() != elevation && this.getTile(x, y + 1)?.getElevationOnTop() == elevation - 0.5) {
      this.tiles[y + 1][x].deleteGroundOnTop();
    }
    return true;
  }

  fixAutotile(x: number, y: number, groundKind: string, elevation: number) {
    const selfFound = this.getTile(x, y)?.doesKindExist(groundKind, elevation);
    const upFound = this.getTile(x, y - 1)?.doesKindExist(groundKind, elevation);
    const downFound = this.getTile(x, y + 1)?.doesKindExist(groundKind, elevation);
    const leftFound = this.getTile(x - 1, y)?.doesKindExist(groundKind, elevation);
    const rightFound = this.getTile(x + 1, y)?.doesKindExist(groundKind, elevation);
    if (upFound && selfFound) {
      this.getTile(x, y)?.removeEdgeOnTopKind("up", groundKind, elevation);
      this.getTile(x, y - 1)?.removeEdgeOnTopKind("down", groundKind, elevation);
    } else {
      this.getTile(x, y)?.addEdgeOnTopKind("up", groundKind, elevation);
      this.getTile(x, y - 1)?.addEdgeOnTopKind("down", groundKind, elevation);
    }
    if (downFound && selfFound) {
      this.getTile(x, y)?.removeEdgeOnTopKind("down", groundKind, elevation);
      this.getTile(x, y + 1)?.removeEdgeOnTopKind("up", groundKind, elevation);
    } else {
      this.getTile(x, y)?.addEdgeOnTopKind("down", groundKind, elevation);
      this.getTile(x, y + 1)?.addEdgeOnTopKind("up", groundKind, elevation);
    }
    if (leftFound && selfFound) {
      this.getTile(x, y)?.removeEdgeOnTopKind("left", groundKind, elevation);
      this.getTile(x - 1, y)?.removeEdgeOnTopKind("right", groundKind, elevation);
    } else {
      this.getTile(x, y)?.addEdgeOnTopKind("left", groundKind, elevation);
      this.getTile(x - 1, y)?.addEdgeOnTopKind("right", groundKind, elevation);
    }
    if (rightFound && selfFound) {
      this.getTile(x, y)?.removeEdgeOnTopKind("right", groundKind, elevation);
      this.getTile(x + 1, y)?.removeEdgeOnTopKind("left", groundKind, elevation);
    } else {
      this.getTile(x, y)?.addEdgeOnTopKind("right", groundKind, elevation);
      this.getTile(x + 1, y)?.addEdgeOnTopKind("left", groundKind, elevation);
    }
  }

  getTile(x: number, y: number): Tile {
    if (x >= this.width || x < 0) return undefined;
    if (y >= this.height || y < 0) return undefined;
    return this.tiles[y][x];
  }

  addMovable(x: number, y: number, movable: Movable) {
    if (x >= this.width || x < 0) return;
    if (y >= this.height || y < 0) return;
    this.movables[y][x].add(movable);
  }

  removeMovable(movable: Movable) {
    const { x, y } = movable.getPosition();
    if (x >= this.width || x < 0) return;
    if (y >= this.height || y < 0) return;
    this.movables[y][x].delete(movable);
  }

  getMoveableFreePosInTile(x: number, y: number) {
    const movablesOnTile = this.movables[y][x];
    let numerator = 0;
    let denominator = 0.5;
    while (denominator <= 16) {
      while (numerator < 2 * denominator) {
        let alreadyUsed = false;
        for (const other of Array.from(movablesOnTile)) {
          if (numerator / denominator == other.posInTile) {
            alreadyUsed = true;
            break;
          }
        }
        if (!alreadyUsed) return numerator / denominator;
        numerator += 2;
      }
      numerator = 1;
      denominator *= 2;
    }
    return numerator / denominator;
  }

  saveToJson(): MapJson {
    return {
      ground: this.tiles.map((value) => value.map((value) => value.getGroundArray())),
    };
  }

  loadFromJson(json: MapJson) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        for (let zorder = 0; zorder < json.ground[y][x].length; zorder++) {
          this.addTile(x, y, json.ground[y][x][zorder], 1); // TODO: fix elevation
        }
      }
    }
  }
}
