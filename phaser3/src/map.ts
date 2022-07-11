export interface MapJson {
  ground: string[][];
}

export default class Map {
  protected groundSprites: Phaser.GameObjects.Sprite[][];
  protected groundFrameIds: string[][];

  constructor(protected scene: Phaser.Scene, public widthTiles: number, public heightTiles: number, public tileSizePx: number) {}

  initializeGround(frameId: string) {
    this.groundSprites = [];
    this.groundFrameIds = [];
    for (let yTiles = 0; yTiles < this.heightTiles; yTiles++) {
      this.groundSprites[yTiles] = [];
      this.groundFrameIds[yTiles] = [];
      for (let xTiles = 0; xTiles < this.widthTiles; xTiles++) {
        this.groundSprites[yTiles][xTiles] = this.scene.add.sprite(xTiles * this.tileSizePx, yTiles * this.tileSizePx, "tiles", frameId).setOrigin(0, 0);
        this.groundFrameIds[yTiles][xTiles] = frameId;
      }
    }
  }

  setGround(xTiles: number, yTiles: number, frameId: string) {
    if (xTiles >= this.widthTiles || xTiles < 0) return;
    if (yTiles >= this.heightTiles || yTiles < 0) return;
    this.groundSprites[yTiles][xTiles].setFrame(frameId);
    this.groundFrameIds[yTiles][xTiles] = frameId;
  }

  saveToJson(): MapJson {
    return {
      ground: this.groundFrameIds,
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
