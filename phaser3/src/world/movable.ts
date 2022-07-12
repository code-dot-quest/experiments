export default class Movable {
  protected xTiles: number;
  protected yTiles: number;

  constructor(protected scene: Phaser.Scene) {}

  spawn() {
    //    this.add.sprite(100, 100, "knight").play({ key: "Idle", repeat: -1 });
  }
}
