import groundSpec from "./ground.json";
import commonSpec from "./common.json";

export interface GroundType {
  kind: string;
  type: string;
}

export interface GroundSpec {
  passable: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };
  sprite: { resource: string; frame: string };
}

export default class Ground {
  public ground: GroundType;
  public spec: GroundSpec;
  public sprite: Phaser.GameObjects.Sprite;

  constructor(protected scene: Phaser.Scene, protected x: number, protected y: number) {}

  set(ground: GroundType): Ground {
    this.ground = ground;
    this.spec = groundSpec[ground.kind].types[ground.type];
    const frame = this.spec.sprite.frame;
    const resource = this.spec.sprite.resource;
    if (!this.sprite) {
      this.sprite = this.scene.add.sprite(this.x * commonSpec.tileSize, this.y * commonSpec.tileSize, resource, frame);
      this.sprite.setOrigin(0, 0);
    } else {
      // TODO: support different resource here
      this.sprite.setFrame(frame);
    }
    return this;
  }
}
