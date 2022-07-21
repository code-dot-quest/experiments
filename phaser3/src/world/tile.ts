import tileSpec from "./tile.json";
import commonSpec from "./common.json";

export interface GroundType {
  kind: string;
  type: string;
}

export interface TileSpec {
  passable: { up?: boolean; down?: boolean; left?: boolean; right?: boolean; radius?: number };
  sprite: { resource: string; frame: string };
}

export default class Tile {
  public ground: GroundType[];
  public groundSpec: TileSpec[];
  public groundSprite: Phaser.GameObjects.Sprite[];
  public topGroundSpec: TileSpec;

  constructor(protected scene: Phaser.Scene, protected x: number, protected y: number) {
    this.ground = [];
    this.groundSpec = [];
    this.groundSprite = [];
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  setGround(ground: GroundType, elevation: number): Tile {
    if (this.ground.length >= elevation + 1) {
      // set
      this.ground[elevation] = ground;
      this.groundSpec[elevation] = tileSpec[ground.kind].types[ground.type];
      const frame = this.groundSpec[elevation].sprite.frame;
      this.groundSprite[elevation].setFrame(frame);
    } else if (this.ground.length == elevation) {
      // add
      this.ground[elevation] = ground;
      this.groundSpec[elevation] = tileSpec[ground.kind].types[ground.type];
      const frame = this.groundSpec[elevation].sprite.frame;
      const resource = this.groundSpec[elevation].sprite.resource;
      this.groundSprite[elevation] = this.scene.add.sprite(this.x * commonSpec.tileSize, this.y * commonSpec.tileSize, resource, frame);
      this.groundSprite[elevation].setOrigin(0, 0).setDepth(this.y - 10000 + elevation);
      this.topGroundSpec = this.groundSpec[elevation];
    }
    return this;
  }

  deleteGround(elevation: number): Tile {
    if (this.ground.length == elevation + 1 && elevation > 0) {
      this.groundSprite[elevation].destroy();
      this.ground.pop();
      this.groundSpec.pop();
      this.groundSprite.pop();
      this.topGroundSpec = this.groundSpec[elevation - 1];
    }
    return this;
  }
}
