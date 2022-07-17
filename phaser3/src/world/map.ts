import Ground, { GroundLayer, GroundType } from "./ground";
import Movable from "./movable";

export interface MapJson {
  background: GroundType[][];
  ground: GroundType[][];
}

export default class Map {
  protected ground: Ground[][];
  protected movables: Set<Movable>[][];

  constructor(protected scene: Phaser.Scene, public width: number, public height: number) {}

  initialize(defaultGround: GroundType, defaultBackground: GroundType) {
    this.ground = [];
    this.movables = [];
    for (let y = 0; y < this.height; y++) {
      this.ground[y] = [];
      this.movables[y] = [];
      for (let x = 0; x < this.width; x++) {
        const ground = new Ground(this.scene, x, y).setGround(defaultGround).setBackground(defaultBackground);
        this.ground[y][x] = ground;
        this.movables[y][x] = new Set<Movable>();
      }
    }
  }

  setGround(x: number, y: number, ground: GroundType, layer: GroundLayer) {
    if (x >= this.width || x < 0) return;
    if (y >= this.height || y < 0) return;
    if (layer == "ground") this.ground[y][x].setGround(ground);
    if (layer == "background") this.ground[y][x].setBackground(ground);
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
      background: this.ground.map((value) => value.map((value) => value.background)),
      ground: this.ground.map((value) => value.map((value) => value.ground)),
    };
  }

  loadFromJson(json: MapJson) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setGround(x, y, json.background[y][x], "background");
        this.setGround(x, y, json.ground[y][x], "ground");
      }
    }
  }
}
