import Ground, { GroundType } from "./ground";
import Movable from "./movable";

export interface MapJson {
  ground: GroundType[][];
}

export default class Map {
  protected ground: Ground[][];
  protected movables: Set<Movable>[][];

  constructor(protected scene: Phaser.Scene, public widthTiles: number, public heightTiles: number, public tileSizePx: number) {}

  initialize(defaultGround: GroundType) {
    this.ground = [];
    for (let yTiles = 0; yTiles < this.heightTiles; yTiles++) {
      this.ground[yTiles] = [];
      for (let xTiles = 0; xTiles < this.widthTiles; xTiles++) {
        const ground = new Ground(this.scene, this.tileSizePx, xTiles, yTiles).set(defaultGround);
        this.ground[yTiles][xTiles] = ground;
      }
    }
  }

  setGround(xTiles: number, yTiles: number, ground: GroundType) {
    if (xTiles >= this.widthTiles || xTiles < 0) return;
    if (yTiles >= this.heightTiles || yTiles < 0) return;
    this.ground[yTiles][xTiles].set(ground);
  }

  saveToJson(): MapJson {
    return {
      ground: this.ground.map((value) => value.map((value) => value.ground)),
    };
  }

  loadFromJson(json: MapJson) {
    for (let yTiles = 0; yTiles < this.heightTiles; yTiles++) {
      for (let xTiles = 0; xTiles < this.widthTiles; xTiles++) {
        this.setGround(xTiles, yTiles, json.ground[yTiles][xTiles]);
      }
    }
  }
}
