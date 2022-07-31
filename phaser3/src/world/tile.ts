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

export interface SingleTileJson extends GroundType {
  elevation: number;
}

export interface TileJson {
  zorder: SingleTileJson[];
}

export default class Tile {
  protected zorder: SingleTile[];

  constructor(protected scene: Phaser.Scene, protected x: number, protected y: number) {
    this.zorder = [];
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  getNumGrounds(): number {
    return this.zorder.length;
  }

  getGroundOnTop(): GroundType {
    return this.getGround(this.zorder.length - 1);
  }

  getElevationOnTop(): number {
    return this.getElevation(this.zorder.length - 1);
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

  // zorder specific

  getGround(zorder: number): GroundType {
    return this.zorder[zorder]?.ground;
  }

  getElevation(zorder: number): number {
    return this.zorder[zorder]?.elevation;
  }

  replaceGround(ground: GroundType, zorder: number): Tile {
    if (zorder < 0 || zorder >= this.zorder.length) return this;
    const groundSpec = tileSpec[ground.kind].types[ground.type];
    const frame = groundSpec.sprite.frame;
    const resource = groundSpec.sprite.resource; // TODO: handle different resource
    this.zorder[zorder].ground = { kind: ground.kind, type: ground.type };
    this.zorder[zorder].groundSpec = groundSpec;
    this.zorder[zorder].groundSprite.setFrame(frame);
    return this;
  }

  // elevation specific

  getNumGroundsAtElevation(elevation: number): number {
    let res = 0;
    for (let zorder = this.zorder.length - 1; zorder >= 0; zorder--) {
      if (this.zorder[zorder].elevation == elevation) res++;
    }
    return res;
  }

  getGroundOnTopAtElevation(elevation: number): GroundType {
    for (let zorder = this.zorder.length - 1; zorder >= 0; zorder--) {
      if (this.zorder[zorder].elevation == elevation) return this.zorder[zorder].ground;
    }
    return undefined;
  }

  getTopZorderOfKindAtElevation(groundKind: string, elevation: number): { zorder: number; cliff: boolean } {
    const res = { zorder: NaN, cliff: groundKind == "rock" };
    for (let zorder = this.zorder.length - 1; zorder >= 0; zorder--) {
      if (Math.ceil(elevation) != Math.ceil(this.zorder[zorder].elevation)) continue; // rock in 1.5 and grass in 2 are both similar
      if (groundKind == "rock" && this.zorder[zorder].ground.kind != "rock") res.cliff = false;
      if (groundKind == this.zorder[zorder].ground.kind) return { zorder, cliff: res.cliff };
    }
    return res;
  }

  addGroundOnTopAtElevation(ground: GroundType, elevation: number): Tile {
    if (this.getGroundOnTopAtElevation(elevation)?.kind == ground.kind) return this;
    const groundSpec = tileSpec[ground.kind].types[ground.type];
    const frame = groundSpec.sprite.frame;
    const resource = groundSpec.sprite.resource;
    const groundSprite = this.scene.add.sprite(this.x * commonSpec.tileSize, this.y * commonSpec.tileSize, resource, frame);
    groundSprite.setOrigin(0, 0).setDepth(this.y - 10000 + (ground.kind != "water" ? elevation : 0));
    let zorder;
    for (zorder = 0; zorder < this.zorder.length; zorder++) {
      if (this.zorder[zorder].elevation > elevation) break;
    }
    this.zorder.splice(zorder, 0, {
      elevation,
      ground: { kind: ground.kind, type: ground.type },
      groundSpec,
      groundSprite,
    });
    return this;
  }

  deleteGroundOnTopAtElevation(elevation: number): Tile {
    for (let zorder = this.zorder.length - 1; zorder >= 0; zorder--) {
      if (this.zorder[zorder].elevation == elevation) {
        this.zorder[zorder].groundSprite.destroy();
        this.zorder.splice(zorder, 1);
        return this;
      }
    }
    return this;
  }

  doesKindExistAtElevation(groundKind: string, elevation: number): { found: boolean; cliff: boolean } {
    const { zorder, cliff } = this.getTopZorderOfKindAtElevation(groundKind, elevation);
    return { found: !isNaN(zorder), cliff };
  }

  addEdgeOnTopKindAtElevation(edge: Direction, groundKind: string, elevation: number): Tile {
    const { zorder, cliff } = this.getTopZorderOfKindAtElevation(groundKind, elevation);
    if (isNaN(zorder)) return this;
    const ground = this.getGround(zorder);
    if (!ground) return this;
    const newGround = _addEdgeToGround(edge, ground);
    if (cliff) newGround.type = "cliff-" + newGround.type;
    this.replaceGround(newGround, zorder);
    return this;
  }

  removeEdgeOnTopKindAtElevation(edge: Direction, groundKind: string, elevation: number): Tile {
    const { zorder, cliff } = this.getTopZorderOfKindAtElevation(groundKind, elevation);
    if (isNaN(zorder)) return this;
    const ground = this.getGround(zorder);
    if (!ground) return this;
    const newGround = _removeEdgeFromGround(edge, ground);
    if (cliff) newGround.type = "cliff-" + newGround.type;
    this.replaceGround(newGround, zorder);
    return this;
  }

  // json

  saveToJson(): TileJson {
    return {
      zorder: this.zorder.map(
        (singleTile) =>
          <SingleTileJson>{
            kind: singleTile.ground.kind,
            type: singleTile.ground.type,
            elevation: singleTile.elevation,
          }
      ),
    };
  }
}

// helpers

function _addEdgeToGround(edge: Direction, ground: GroundType): GroundType {
  const sides = [];
  if (ground.type.includes("up") || edge == "up") sides.push("up");
  if (ground.type.includes("down") || edge == "down") sides.push("down");
  if (ground.type.includes("left") || edge == "left") sides.push("left");
  if (ground.type.includes("right") || edge == "right") sides.push("right");
  return { kind: ground.kind, type: sides.join("-") || "middle" };
}

function _removeEdgeFromGround(edge: Direction, ground: GroundType): GroundType {
  const sides = [];
  if (ground.type.includes("up") && edge != "up") sides.push("up");
  if (ground.type.includes("down") && edge != "down") sides.push("down");
  if (ground.type.includes("left") && edge != "left") sides.push("left");
  if (ground.type.includes("right") && edge != "right") sides.push("right");
  return { kind: ground.kind, type: sides.join("-") || "middle" };
}
