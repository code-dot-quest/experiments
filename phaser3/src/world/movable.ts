import movableSpec from "./movable.json";
import commonSpec from "./common.json";
import { Direction } from "./common";
import Map from "./map";

export interface MovableType {
  kind: string;
  type: string;
}

export interface MovableSpec {
  anims: { idle: string };
  sprite: { resource: string; origin: { x: number; y: number } };
}

export default class Movable {
  public movable: MovableType;
  public spec: MovableSpec;
  public sprite: Phaser.GameObjects.Sprite;
  public posInTile: number; // in rad/PI, so 3/2 is for 3/2*PI
  protected x: number;
  protected y: number;

  constructor(protected scene: Phaser.Scene, protected map: Map) {}

  spawn(movable: MovableType, x: number, y: number): Movable {
    this.movable = movable;
    this.spec = movableSpec[movable.kind].types[movable.type];
    this.x = x;
    this.y = y;
    this.posInTile = this.map.getMoveableFreePosInTile(x, y);
    const pixelX = x * commonSpec.tileSize + commonSpec.tileSize / 2 + commonSpec.posInTileRadius * Math.sin(this.posInTile * Math.PI);
    const pixelY = y * commonSpec.tileSize + commonSpec.tileSize / 2 + commonSpec.posInTileRadius * Math.cos(this.posInTile * Math.PI);
    this.sprite = this.scene.add.sprite(pixelX, pixelY, this.spec.sprite.resource);
    this.sprite.setOrigin(this.spec.sprite.origin.x, this.spec.sprite.origin.y);
    this.sprite.play({ key: this.spec.anims.idle, repeat: -1 });
    this.map.addMovable(x, y, this);
    return this;
  }

  move(direction: Direction): Movable {
    return this;
  }
}

// if (this.cursors.left.isDown) {
//   this.player.play({ key: "Run" }, true);
//   this.player.setX(this.player.x - 2);
//   this.player.flipX = true;
// } else if (this.cursors.right.isDown) {
//   this.player.play({ key: "Run" }, true);
//   this.player.setX(this.player.x + 2);
//   this.player.flipX = false;
// } else if (this.cursors.up.isDown) {
//   this.player.play({ key: "Run" }, true);
//   this.player.setY(this.player.y - 2);
// } else if (this.cursors.down.isDown) {
//   this.player.play({ key: "Run" }, true);
//   this.player.setY(this.player.y + 2);
// } else {
//   this.player.play({ key: "Idle", repeat: -1 }, true);
// }
