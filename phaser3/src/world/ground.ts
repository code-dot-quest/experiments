import groundSpec from "./ground.json";

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

  constructor(protected scene: Phaser.Scene, public tileSizePx: number, protected xTiles: number, protected yTiles: number) {}

  set(ground: GroundType): Ground {
    this.ground = ground;
    this.spec = groundSpec[ground.kind].types[ground.type];
    const frame = this.spec.sprite.frame;
    const resource = this.spec.sprite.resource;
    if (!this.sprite) {
      this.sprite = this.scene.add.sprite(this.xTiles * this.tileSizePx, this.yTiles * this.tileSizePx, resource, frame).setOrigin(0, 0);
    } else {
      // TODO: support different resource here
      this.sprite.setFrame(frame);
    }
    return this;
  }
}
