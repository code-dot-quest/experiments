import "phaser";
import { saveAs } from "file-saver";
import MapEditor from "./editor/map";
import Map, { MapJson } from "./world/map";
import { GroundType } from "./world/tile";
import Movable from "./world/movable";
import commonSpec from "./world/common.json";
import { initializeEditor } from "./editor/common";
import BlocksEditor from "./editor/blocks";

const CANVAS_SIZE = 1280;

initializeEditor();
const mapEditor = new MapEditor();
const blocksEditor = new BlocksEditor();

interface LevelJson {
  map: MapJson;
}

interface TilePreview {
  x: number;
  y: number;
  ground: GroundType;
  deleted: GroundType;
}

export default class Demo extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Movable;
  lastTimeAction;
  map: Map;
  preview: TilePreview;
  grid: Phaser.GameObjects.Grid;
  clickAlreadyHandled: boolean;
  lastClickX: number;
  lastClickY: number;

  constructor() {
    super("demo");
  }

  preload() {
    this.load.aseprite("grass", "assets/grass.png", "assets/grass.json");
    this.load.aseprite("sand", "assets/sand.png", "assets/sand.json");
    this.load.aseprite("rock", "assets/rock.png", "assets/rock.json");
    this.load.aseprite("tiles", "assets/tiles.png", "assets/tiles.json");
    this.load.aseprite("knight", "assets/knight.png", "assets/knight.json");
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.anims.createFromAseprite("knight");

    this.map = new Map(this, CANVAS_SIZE / commonSpec.tileSize, CANVAS_SIZE / commonSpec.tileSize);
    this.map.initialize(mapEditor.getDefaultBackground());

    this.grid = this.add.grid(0, 0, CANVAS_SIZE, CANVAS_SIZE, commonSpec.tileSize, commonSpec.tileSize).setOrigin(0, 0).setOutlineStyle(0xffffff, 0.2);
    //this.add.grid(0, 0, 1280, 1280, configSpec.tileSize, configSpec.tileSize).setOrigin(0, 0).setOutlineStyle(0x101010, 0.15);

    this.player = new Movable(this, this.map).spawn({ kind: "knight", type: "blue" }, 4, 4);
    this.add.sprite(200, 200, "knight").play({ key: "Attack_1", repeat: -1 }).setOrigin(0.5, 0.7).setDepth(200);

    mapEditor.onTileSelected((ground) => {});
    mapEditor.onSave(() => {
      const levelJson = { map: this.map.saveToJson() };
      const blob = new Blob([JSON.stringify(levelJson)], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "level.json");
    });
    mapEditor.onLoad((json: any) => {
      const levelJson = json as LevelJson;
      this.map.loadFromJson(levelJson.map);
    });
    mapEditor.onGridToggled((enabled: boolean) => {
      this.grid.visible = enabled;
    });
  }

  update(time) {
    const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const pointerX = Math.floor(worldPoint.x / commonSpec.tileSize);
    const pointerY = Math.floor(worldPoint.y / commonSpec.tileSize);

    if (!this.clickAlreadyHandled) {
      // display preview
      if (this.preview?.x != pointerX || this.preview?.y != pointerY || time - this.input.activePointer.time > 1000) {
        if (this.preview) {
          // remove the preview
          if (this.preview.ground.kind == "erase") this.map.addTile(this.preview.x, this.preview.y, this.preview.deleted);
          else this.map.deleteTile(this.preview.x, this.preview.y);
          this.preview = undefined;
        }
        if (time - this.input.activePointer.time < 1000) {
          // create new preview
          const ground = this.map.getTile(pointerX, pointerY)?.getGroundOnTop();
          let success = false;
          if (mapEditor.selectedTile.kind == "erase") success = this.map.deleteTile(pointerX, pointerY);
          else success = this.map.addTile(pointerX, pointerY, mapEditor.selectedTile);
          if (success) {
            this.preview = { x: pointerX, y: pointerY, ground: mapEditor.selectedTile, deleted: ground };
          }
        }
      }
    }

    if (this.input.manager.activePointer.isDown && !this.clickAlreadyHandled) {
      this.preview = undefined; // this will leave the preview in place
      this.clickAlreadyHandled = true;
      this.lastClickX = pointerX;
      this.lastClickY = pointerY;
    }

    if (this.lastClickX != pointerX || this.lastClickY != pointerY || time - this.input.activePointer.time > 1000) {
      this.clickAlreadyHandled = false;
    }

    if (this.cursors.left.isDown) {
      this.player.move("left");
    } else if (this.cursors.right.isDown) {
      this.player.move("right");
    } else if (this.cursors.up.isDown) {
      this.player.move("up");
    } else if (this.cursors.down.isDown) {
      this.player.move("down");
    }
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#125555",
  width: CANVAS_SIZE,
  height: CANVAS_SIZE,
  scene: Demo,
  zoom: 0.5,
  parent: "canvas-parent",
};

const game = new Phaser.Game(config);
