import movableSpec from "./movable.json";
import commonSpec from "./common.json";
import { Direction, flipDirection, positionAfterDirection } from "./common";
import Map from "./map";
import Tile from "./tile";

export interface MovableType {
  kind: string;
  type: string;
}

export interface MovableSpec {
  speed: number;
  anims: { idle: string; move: string };
  sprite: { resource: string; origin: { x: number; y: number } };
}

export default class Movable {
  public movable: MovableType;
  public spec: MovableSpec;
  public sprite: Phaser.GameObjects.Sprite;
  public posInTile: number; // in rad/PI, so 3/2 is for 3/2*PI
  protected x: number = -1;
  protected y: number = -1;
  protected moving: boolean;

  constructor(protected scene: Phaser.Scene, protected map: Map) {}

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  setPosition(x: number, y: number): { pixelX: number; pixelY: number } {
    this.map.removeMovable(this);
    this.x = x;
    this.y = y;
    this.posInTile = this.map.getMoveableFreePosInTile(x, y);
    this.map.addMovable(x, y, this);
    const passableRadius = this.map.getTile(x, y).topGroundSpec.passable.radius ?? commonSpec.passableRadius;
    const pixelX = x * commonSpec.tileSize + commonSpec.tileSize / 2 + passableRadius * Math.sin(this.posInTile * Math.PI);
    const pixelY = y * commonSpec.tileSize + commonSpec.tileSize / 2 + passableRadius * Math.cos(this.posInTile * Math.PI);
    return { pixelX, pixelY };
  }

  spawn(movable: MovableType, x: number, y: number): Movable {
    this.movable = movable;
    this.spec = movableSpec[movable.kind].types[movable.type];
    const { pixelX, pixelY } = this.setPosition(x, y);
    this.sprite = this.scene.add.sprite(pixelX, pixelY, this.spec.sprite.resource);
    this.sprite.setDepth(pixelY);
    this.sprite.setOrigin(this.spec.sprite.origin.x, this.spec.sprite.origin.y);
    this.sprite.play({ key: this.spec.anims.idle, repeat: -1 });
    this.moving = false;
    return this;
  }

  canMove(direction: Direction): Tile | undefined {
    if (this.moving) return undefined;
    const currentGround = this.map.getTile(this.x, this.y);
    if (currentGround === undefined) return undefined;
    if (!currentGround.topGroundSpec.passable[direction]) return undefined;
    const { x, y } = positionAfterDirection(this.x, this.y, direction);
    const nextGround = this.map.getTile(x, y);
    if (nextGround === undefined) return undefined;
    if (!nextGround.topGroundSpec.passable[flipDirection(direction)]) return undefined;
    return nextGround;
  }

  move(direction: Direction): Movable {
    const nextGround = this.canMove(direction);
    if (nextGround === undefined) return this;
    const { x, y } = nextGround.getPosition();
    const { pixelX, pixelY } = this.setPosition(x, y);
    if (pixelX > this.sprite.x) this.sprite.flipX = false;
    if (pixelX < this.sprite.x) this.sprite.flipX = true;
    this.sprite.play({ key: this.spec.anims.move, repeat: -1 });
    this.moving = true;
    this.scene.tweens.add({
      targets: this.sprite,
      x: pixelX,
      y: pixelY,
      depth: pixelY,
      duration: 1000 / this.spec.speed,
      onComplete: () => {
        this.sprite.play({ key: this.spec.anims.idle, repeat: -1 });
        this.moving = false;
      },
    });
    return this;
  }
}
