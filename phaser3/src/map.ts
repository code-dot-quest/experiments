export default class Map {
  protected groundSprites: Phaser.GameObjects.Sprite[][];

  constructor(protected scene: Phaser.Scene, public widthTiles: number, public heightTiles: number, public tileSizePx: number) {}

  initializeGround(frameId: string) {
    this.groundSprites = [];
    for (let yTiles = 0; yTiles < this.heightTiles; yTiles++) {
      this.groundSprites[yTiles] = [];
      for (let xTiles = 0; xTiles < this.widthTiles; xTiles++) {
        this.groundSprites[yTiles][xTiles] = this.scene.add.sprite(xTiles * this.tileSizePx, yTiles * this.tileSizePx, "tiles", frameId).setOrigin(0, 0);
      }
    }
  }

  setGround(xTiles: number, yTiles: number, frameId: string) {
    this.groundSprites[yTiles][xTiles]?.setFrame(frameId);
  }
}
