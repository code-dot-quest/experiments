import Tile, { GroundType, OnEachSprite, TileJson } from "./tile";
import Movable from "./movable";

export interface MapJson {
  ground: TileJson[][];
}

export default class Map {
  protected tiles: Tile[][];
  protected movables: Set<Movable>[][];

  constructor(protected scene: Phaser.Scene, public width: number, public height: number) {}

  initialize(defaultBackground: GroundType) {
    this.tiles = [];
    this.movables = [];
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      this.movables[y] = [];
      for (let x = 0; x < this.width; x++) {
        const ground = new Tile(this.scene, x, y).addGroundOnTopAtElevation(defaultBackground, 1);
        this.tiles[y][x] = ground;
        this.movables[y][x] = new Set<Movable>();
      }
    }
  }

  addTile(x: number, y: number, ground: GroundType, elevation: number): boolean {
    // make sure we are in range
    if (x >= this.width || x < 0) return false;
    if (y >= this.height || y < 0) return false;
    // make sure we have what to add (and we didn't already add this one)
    if (this.getTile(x, y)?.getGroundOnTopAtElevation(elevation)?.kind == ground.kind) return false;
    // constrains on when we can add different elevations
    if (elevation > 1 && this.getTile(x, y + 1)?.getNumGroundsAtElevation(elevation - 1) == 0) return false;
    // handle cliffs on self and below
    if (this.getTile(x, y)?.getElevationOnTop() <= elevation - 1) {
      this.tiles[y][x].addGroundOnTopAtElevation({ kind: "rock", type: "middle" }, elevation - 0.5);
    }
    if (this.getTile(x, y + 1)?.getElevationOnTop() <= elevation - 1) {
      this.tiles[y + 1][x].addGroundOnTopAtElevation({ kind: "rock", type: "middle" }, elevation - 0.5);
    }
    // do the main job
    this.tiles[y][x].addGroundOnTopAtElevation(ground, elevation);
    // autotile
    this.fixAutotile(x, y, ground.kind, elevation);
    this.fixAutotile(x, y, "rock", elevation - 0.5);
    this.fixAutotile(x, y + 1, "rock", elevation - 0.5);
    // effects
    this.fixEffects(x, y);
    this.fixEffects(x, y + 1);
    this.fixEffects(x + 1, y);
    this.fixEffects(x - 1, y);
    this.fixEffects(x + 1, y + 1);
    this.fixEffects(x - 1, y + 1);
    return true;
  }

  deleteTile(x: number, y: number, elevation: number): boolean {
    // make sure we are in range
    if (x >= this.width || x < 0) return false;
    if (y >= this.height || y < 0) return false;
    // make sure we have what to delete
    if (this.getTile(x, y)?.getNumGrounds() <= 1) return false;
    const ground = this.getTile(x, y)?.getGroundOnTopAtElevation(elevation);
    if (!ground) return false;
    // constrains on when we can delete different elevations
    if (elevation % 1 == 0.5) return false;
    if (this.getTile(x, y)?.getElevationOnTop() > elevation && this.getTile(x, y)?.getNumGroundsAtElevation(elevation) <= 1) return false;
    // do the main job
    this.tiles[y][x].deleteGroundOnTopAtElevation(elevation);
    // handle cliffs on self and below
    if (this.getTile(x, y)?.getElevationOnTop() == elevation - 0.5 && (this.getTile(x, y - 1)?.getElevationOnTop() ?? 0) < elevation) {
      this.tiles[y][x].deleteGroundOnTopAtElevation(elevation - 0.5);
    }
    if (this.getTile(x, y + 1)?.getElevationOnTop() == elevation - 0.5 && this.getTile(x, y)?.getElevationOnTop() != elevation) {
      this.tiles[y + 1][x].deleteGroundOnTopAtElevation(elevation - 0.5);
    }
    // autotile
    this.fixAutotile(x, y, ground.kind, elevation);
    this.fixAutotile(x, y, "rock", elevation - 0.5);
    this.fixAutotile(x, y + 1, "rock", elevation - 0.5);
    // effects
    this.fixEffects(x, y);
    this.fixEffects(x, y + 1);
    this.fixEffects(x + 1, y);
    this.fixEffects(x - 1, y);
    this.fixEffects(x + 1, y + 1);
    this.fixEffects(x - 1, y + 1);
    return true;
  }

  fixAutotile(x: number, y: number, groundKind: string, elevation: number) {
    const { found: selfFound, cliff: selfCliff } = this.getTile(x, y)?.doesKindExistAtElevation(groundKind, elevation) ?? { found: false, cliff: false };
    const { found: upFound, cliff: upCliff } = this.getTile(x, y - 1)?.doesKindExistAtElevation(groundKind, elevation) ?? { found: false, cliff: false };
    const { found: downFound, cliff: downCliff } = this.getTile(x, y + 1)?.doesKindExistAtElevation(groundKind, elevation) ?? { found: false, cliff: false };
    const { found: leftFound, cliff: leftCliff } = this.getTile(x - 1, y)?.doesKindExistAtElevation(groundKind, elevation) ?? { found: false, cliff: false };
    const { found: rightFound, cliff: rightCliff } = this.getTile(x + 1, y)?.doesKindExistAtElevation(groundKind, elevation) ?? { found: false, cliff: false };
    if (upFound && selfFound && upCliff == selfCliff) {
      this.getTile(x, y)?.removeEdgeOnTopKindAtElevation("up", groundKind, elevation);
      this.getTile(x, y - 1)?.removeEdgeOnTopKindAtElevation("down", groundKind, elevation);
    } else {
      this.getTile(x, y)?.addEdgeOnTopKindAtElevation("up", groundKind, elevation);
      this.getTile(x, y - 1)?.addEdgeOnTopKindAtElevation("down", groundKind, elevation);
    }
    if (downFound && selfFound && downCliff == selfCliff) {
      this.getTile(x, y)?.removeEdgeOnTopKindAtElevation("down", groundKind, elevation);
      this.getTile(x, y + 1)?.removeEdgeOnTopKindAtElevation("up", groundKind, elevation);
    } else {
      this.getTile(x, y)?.addEdgeOnTopKindAtElevation("down", groundKind, elevation);
      this.getTile(x, y + 1)?.addEdgeOnTopKindAtElevation("up", groundKind, elevation);
    }
    if (leftFound && selfFound && leftCliff == selfCliff) {
      this.getTile(x, y)?.removeEdgeOnTopKindAtElevation("left", groundKind, elevation);
      this.getTile(x - 1, y)?.removeEdgeOnTopKindAtElevation("right", groundKind, elevation);
    } else {
      this.getTile(x, y)?.addEdgeOnTopKindAtElevation("left", groundKind, elevation);
      this.getTile(x - 1, y)?.addEdgeOnTopKindAtElevation("right", groundKind, elevation);
    }
    if (rightFound && selfFound && rightCliff == selfCliff) {
      this.getTile(x, y)?.removeEdgeOnTopKindAtElevation("right", groundKind, elevation);
      this.getTile(x + 1, y)?.removeEdgeOnTopKindAtElevation("left", groundKind, elevation);
    } else {
      this.getTile(x, y)?.addEdgeOnTopKindAtElevation("right", groundKind, elevation);
      this.getTile(x + 1, y)?.addEdgeOnTopKindAtElevation("left", groundKind, elevation);
    }
  }

  fixEffects(x: number, y: number) {
    const selfElevation = this.getTile(x, y)?.getElevationOnTop();
    const selfGroundOnTop = this.getTile(x, y)?.getGroundOnTop();
    const selfGroundCliff = this.getTile(x, y)?.getGroundOnTopAtElevation(Math.ceil(selfElevation) - 0.5);
    const selfGroundBase = this.getTile(x, y)?.getGroundOnTopAtElevation(Math.ceil(selfElevation) - 1);
    const upElevation = this.getTile(x, y - 1)?.getElevationOnTop();
    const downElevation = this.getTile(x, y + 1)?.getElevationOnTop();
    // transitions
    this.getTile(x, y)?.setEffect("cliff-transition-grass", selfGroundOnTop?.kind == "rock" && selfGroundOnTop?.type.includes("cliff") && selfGroundBase?.kind == "grass", selfElevation);
    this.getTile(x, y)?.setEffect("cliff-transition-sand", selfGroundOnTop?.kind == "rock" && selfGroundOnTop?.type.includes("cliff") && selfGroundBase?.kind == "sand", selfElevation);
    // cliff shadows
    const cliffShadowUp = selfGroundCliff?.type.includes("down") && upElevation >= selfElevation && Math.floor(selfElevation) == Math.floor(downElevation);
    const cliffShadowRight = selfGroundCliff?.type.includes("left") && !selfGroundBase?.type.includes("left") && upElevation >= selfElevation && selfElevation - downElevation <= 1;
    const cliffShadowLeft = selfGroundCliff?.type.includes("right") && !selfGroundBase?.type.includes("right") && upElevation >= selfElevation && selfElevation - downElevation <= 1;
    this.getTile(x, y + 1)?.setEffect("cliff-shadow-up", cliffShadowUp, selfElevation);
    this.getTile(x - 1, y)?.setEffect("cliff-shadow-right", cliffShadowRight, selfElevation);
    this.getTile(x + 1, y)?.setEffect("cliff-shadow-left", cliffShadowLeft, selfElevation);
    this.getTile(x, y)?.setEffect("cliff-shadow-full", cliffShadowUp || cliffShadowRight || cliffShadowLeft, selfElevation);
  }

  getTile(x: number, y: number): Tile {
    if (x >= this.width || x < 0) return undefined;
    if (y >= this.height || y < 0) return undefined;
    return this.tiles[y][x];
  }

  addMovable(x: number, y: number, movable: Movable) {
    if (x >= this.width || x < 0) return;
    if (y >= this.height || y < 0) return;
    this.movables[y][x].add(movable);
  }

  removeMovable(movable: Movable) {
    const { x, y } = movable.getPosition();
    if (x >= this.width || x < 0) return;
    if (y >= this.height || y < 0) return;
    this.movables[y][x].delete(movable);
  }

  getMoveableFreePosInTile(x: number, y: number) {
    const movablesOnTile = this.movables[y][x];
    let numerator = 0;
    let denominator = 0.5;
    while (denominator <= 16) {
      while (numerator < 2 * denominator) {
        let alreadyUsed = false;
        for (const other of Array.from(movablesOnTile)) {
          if (numerator / denominator == other.posInTile) {
            alreadyUsed = true;
            break;
          }
        }
        if (!alreadyUsed) return numerator / denominator;
        numerator += 2;
      }
      numerator = 1;
      denominator *= 2;
    }
    return numerator / denominator;
  }

  forEachSprite(handler: OnEachSprite) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x].forEachSprite(handler);
      }
    }
  }

  // json

  saveToJson(): MapJson {
    return {
      ground: this.tiles.map((value) => value.map((value) => value.saveToJson())),
    };
  }

  loadFromJson(json: MapJson) {
    for (let elevation = 1; elevation <= 5; elevation++) {
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const tile = json.ground[y][x];
          for (let zorder = 0; zorder < tile.zorder.length; zorder++) {
            if (tile.zorder[zorder].elevation == elevation) this.addTile(x, y, tile.zorder[zorder], elevation);
          }
        }
      }
    }
  }
}
