import Ground, { GroundType } from "./ground";
import Movable from "./movable";

export interface MapJson {
  ground: GroundType[][];
}

export default class Map {
  protected ground: Ground[][];
  protected movables: Set<Movable>[][];

  constructor(protected scene: Phaser.Scene, public width: number, public height: number) {}

  initialize(defaultGround: GroundType) {
    this.ground = [];
    this.movables = [];
    for (let y = 0; y < this.height; y++) {
      this.ground[y] = [];
      this.movables[y] = [];
      for (let x = 0; x < this.width; x++) {
        const ground = new Ground(this.scene, x, y).set(defaultGround);
        this.ground[y][x] = ground;
        this.movables[y][x] = new Set<Movable>();
      }
    }
  }

  setGround(x: number, y: number, ground: GroundType) {
    if (x >= this.width || x < 0) return;
    if (y >= this.height || y < 0) return;
    this.ground[y][x].set(ground);
  }

  getGround(x: number, y: number): Ground | undefined {
    if (x >= this.width || x < 0) return undefined;
    if (y >= this.height || y < 0) return undefined;
    return this.ground[y][x];
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
      ground: this.ground.map((value) => value.map((value) => value.ground)),
    };
  }

  loadFromJson(json: MapJson) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setGround(x, y, json.ground[y][x]);
      }
    }
  }
}
