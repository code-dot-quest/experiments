import tileSpec from "./tile.json";
import commonSpec from "./common.json";

export interface GroundType {
  kind: string;
  type: string;
}

export interface GroundSpec {
  passable: { up?: boolean; down?: boolean; left?: boolean; right?: boolean; radius?: number };
  sprite: { resource: string; frame: string };
}

export default class Tile {
  // ground layer
  public ground: GroundType;
  public groundSpec: GroundSpec;
  public groundSprite: Phaser.GameObjects.Sprite;
  // background layer
  public background: GroundType;
  public backgroundSpec: GroundSpec;
  public backgroundSprite: Phaser.GameObjects.Sprite;

  constructor(protected scene: Phaser.Scene, protected x: number, protected y: number) {}

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  setGround(ground: GroundType): Tile {
    this.ground = ground;
    this.groundSpec = tileSpec[ground.kind].types[ground.type];
    const frame = this.groundSpec.sprite.frame;
    const resource = this.groundSpec.sprite.resource;
    if (!this.groundSprite) {
      this.groundSprite = this.scene.add.sprite(this.x * commonSpec.tileSize, this.y * commonSpec.tileSize, resource, frame);
      this.groundSprite.setOrigin(0, 0).setDepth(this.y - 10000);
    } else {
      // TODO: support different resource here
      this.groundSprite.setFrame(frame);
    }
    return this;
  }

  setBackground(background: GroundType): Tile {
    this.background = background;
    this.backgroundSpec = tileSpec[background.kind].types[background.type];
    const frame = this.backgroundSpec.sprite.frame;
    const resource = this.backgroundSpec.sprite.resource;
    if (!this.backgroundSprite) {
      this.backgroundSprite = this.scene.add.sprite(this.x * commonSpec.tileSize, this.y * commonSpec.tileSize, resource, frame);
      this.backgroundSprite.setOrigin(0, 0).setDepth(this.y - 20000);
    } else {
      // TODO: support different resource here
      this.backgroundSprite.setFrame(frame);
    }
    return this;
  }
}
