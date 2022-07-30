import tileSpec from "./tile.json";
import commonSpec from "./common.json";
import { Direction } from "./common";

export interface GroundType {
  kind: string;
  type: string;
}

export interface TilePassable {
  up?: boolean;
  down?: boolean;
  left?: boolean;
  right?: boolean;
  radius?: number;
}

export interface TileSpec {
  passable: TilePassable;
  sprite: { resource: string; frame: string };
}

interface SingleTile {
  elevation: number;
  ground: GroundType;
  groundSpec: TileSpec;
  groundSprite: Phaser.GameObjects.Sprite;
}

export default class Tile {
  protected zorder: SingleTile[];

  constructor(protected scene: Phaser.Scene, protected x: number, protected y: number) {
    this.zorder = [];
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getGroundOnTop(): GroundType {
    return this.getGround(this.zorder.length - 1);
  }

  getGround(zorder: number): GroundType {
    return this.zorder[zorder]?.ground;
  }

  getElevationOnTop(): number {
    return this.getElevation(this.zorder.length - 1);
  }

  getElevationOnSecondTop(): number {
    return this.getElevation(this.zorder.length - 2);
  }

  getElevation(zorder: number): number {
    return this.zorder[zorder]?.elevation;
  }

  getTopZorderOfKind(groundKind: string, elevation: number): { zorder: number; cliff: boolean } {
    const res = { zorder: NaN, cliff: groundKind == "rock" };
    for (let zorder = this.zorder.length - 1; zorder >= 0; zorder--) {
      if (Math.ceil(elevation) != Math.ceil(this.zorder[zorder].elevation)) continue; // rock in 1.5 and grass in 2 are both similar
      if (groundKind == "rock" && this.zorder[zorder].ground.kind != "rock") res.cliff = false;
      if (groundKind == this.zorder[zorder].ground.kind) return { zorder, cliff: res.cliff };
    }
    return res;
  }

  getGroundArray(): GroundType[] {
    return this.zorder.map((singleTile) => singleTile.ground);
  }

  getNumGrounds(): number {
    return this.zorder.length;
  }

  addGroundOnTop(ground: GroundType, elevation: number): Tile {
    if (this.getGroundOnTop()?.kind == ground.kind) return this;
    const groundSpec = tileSpec[ground.kind].types[ground.type];
    const frame = groundSpec.sprite.frame;
    const resource = groundSpec.sprite.resource;
    const groundSprite = this.scene.add.sprite(this.x * commonSpec.tileSize, this.y * commonSpec.tileSize, resource, frame);
    groundSprite.setOrigin(0, 0).setDepth(this.y - 10000 + elevation);
    this.zorder.push({
      elevation,
      ground: { kind: ground.kind, type: ground.type },
      groundSpec,
      groundSprite,
    });
    return this;
  }

  replaceGroundOnTop(ground: GroundType): Tile {
    return this.replaceGround(ground, this.zorder.length - 1);
  }

  replaceGround(ground: GroundType, zorder: number): Tile {
    // console.log(`replaceGround (${this.x},${this.y}) ${ground.kind} ${ground.type}`);
    if (zorder < 0 || zorder >= this.zorder.length) return this;
    const groundSpec = tileSpec[ground.kind].types[ground.type];
    const frame = groundSpec.sprite.frame;
    const resource = groundSpec.sprite.resource; // TODO: handle different resource
    this.zorder[zorder].ground = { kind: ground.kind, type: ground.type };
    this.zorder[zorder].groundSpec = groundSpec;
    this.zorder[zorder].groundSprite.setFrame(frame);
    return this;
  }

  deleteGroundOnTop(): Tile {
    if (this.zorder.length == 0) return this;
    const deleted = this.zorder.pop();
    deleted.groundSprite.destroy();
    return this;
  }

  doesKindExist(groundKind: string, elevation: number): { found: boolean; cliff: boolean } {
    const { zorder, cliff } = this.getTopZorderOfKind(groundKind, elevation);
    return { found: !isNaN(zorder), cliff };
  }

  addEdgeOnTopKind(edge: Direction, groundKind: string, elevation: number): Tile {
    const { zorder, cliff } = this.getTopZorderOfKind(groundKind, elevation);
    if (isNaN(zorder)) return this;
    const ground = this.getGround(zorder);
    if (!ground) return this;
    // if (ground.type.includes(edge)) return this;
    const newGround = addEdgeToGround(edge, ground);
    if (cliff) newGround.type = "cliff-" + newGround.type;
    this.replaceGround(newGround, zorder);
    return this;
  }

  removeEdgeOnTopKind(edge: Direction, groundKind: string, elevation: number): Tile {
    const { zorder, cliff } = this.getTopZorderOfKind(groundKind, elevation);
    if (isNaN(zorder)) return this;
    const ground = this.getGround(zorder);
    if (!ground) return this;
    // if (!ground.type.includes(edge)) return this;
    const newGround = removeEdgeFromGround(edge, ground);
    if (cliff) newGround.type = "cliff-" + newGround.type;
    this.replaceGround(newGround, zorder);
    return this;
  }

  getTopPassable(): TilePassable {
    let passable = { up: false, down: false, left: false, right: false, radius: Number.MAX_VALUE };
    for (let zorder = 0; zorder < this.zorder.length; zorder++) {
      const groundSpec = this.zorder[zorder].groundSpec;
      passable.radius = Math.min(passable.radius, groundSpec.passable.radius);
      passable.up ||= !!groundSpec.passable.up;
      passable.down ||= !!groundSpec.passable.down;
      passable.left ||= !!groundSpec.passable.left;
      passable.right ||= !!groundSpec.passable.right;
    }
    if (passable.radius == Number.MAX_VALUE) passable.radius = undefined;
    return passable;
  }
}

function addEdgeToGround(edge: Direction, ground: GroundType): GroundType {
  const sides = [];
  if (ground.type.includes("up") || edge == "up") sides.push("up");
  if (ground.type.includes("down") || edge == "down") sides.push("down");
  if (ground.type.includes("left") || edge == "left") sides.push("left");
  if (ground.type.includes("right") || edge == "right") sides.push("right");
  return { kind: ground.kind, type: sides.join("-") || "middle" };
}

function removeEdgeFromGround(edge: Direction, ground: GroundType): GroundType {
  const sides = [];
  if (ground.type.includes("up") && edge != "up") sides.push("up");
  if (ground.type.includes("down") && edge != "down") sides.push("down");
  if (ground.type.includes("left") && edge != "left") sides.push("left");
  if (ground.type.includes("right") && edge != "right") sides.push("right");
  return { kind: ground.kind, type: sides.join("-") || "middle" };
}
