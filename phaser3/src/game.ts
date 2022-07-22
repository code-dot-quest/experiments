import "phaser";
import { saveAs } from "file-saver";
import MapEditor from "./editor/map";
import Map, { MapJson } from "./world/map";
import Tile from "./world/tile";
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

export default class Demo extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Movable;
  stamp: Tile;
  map: Map;

  constructor() {
    super("demo");
  }

  preload() {
    this.load.aseprite("ground", "assets/ground.png", "assets/ground.json");
    this.load.aseprite("tiles", "assets/tiles.png", "assets/tiles.json");
    this.load.aseprite("knight", "assets/knight.png", "assets/knight.json");
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.anims.createFromAseprite("knight");

    this.map = new Map(this, CANVAS_SIZE / commonSpec.tileSize, CANVAS_SIZE / commonSpec.tileSize);
    this.map.initialize(mapEditor.getDefaultBackground());

    this.stamp = new Tile(this, 0, 0).setGround(mapEditor.getDefaultBackground(), 0);
    this.stamp.setGround(mapEditor.selectedGround, 1);
    this.stamp.groundSprite[0].setDepth(0).setAlpha(0);
    this.stamp.groundSprite[1].setDepth(1).setAlpha(0.8);

    //this.add.grid(0, 0, 1280, 1280, configSpec.tileSize, configSpec.tileSize).setOrigin(0, 0).setOutlineStyle(0x101010, 0.15);
    this.add.grid(0, 0, CANVAS_SIZE, CANVAS_SIZE, commonSpec.tileSize, commonSpec.tileSize).setOrigin(0, 0).setOutlineStyle(0xffffff, 0.2);

    this.player = new Movable(this, this.map).spawn({ kind: "knight", type: "blue" }, 4, 4);
    this.add.sprite(200, 200, "knight").play({ key: "Attack_1", repeat: -1 }).setOrigin(0.5, 0.7).setDepth(200);

    mapEditor.onTileSelected((ground) => {
      if (ground.kind == "water") this.stamp.deleteGround(1).groundSprite[0].setDepth(0).setAlpha(0.8);
      else {
        this.stamp.setGround(ground, 1).groundSprite[1].setDepth(1).setAlpha(0.8);
        this.stamp.groundSprite[0].setDepth(0).setAlpha(0);
      }
    });
    mapEditor.onSave(() => {
      const levelJson = { map: this.map.saveToJson() };
      const blob = new Blob([JSON.stringify(levelJson)], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "level.json");
    });
    mapEditor.onLoad((json: any) => {
      const levelJson = json as LevelJson;
      this.map.loadFromJson(levelJson.map);
    });
  }

  update(time) {
    const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const pointerX = Math.floor(worldPoint.x / commonSpec.tileSize);
    const pointerY = Math.floor(worldPoint.y / commonSpec.tileSize);
    this.stamp.groundSprite[0].setPosition(pointerX * commonSpec.tileSize, pointerY * commonSpec.tileSize);
    this.stamp.groundSprite[0].setVisible(time - this.input.activePointer.time < 2000);
    if (this.stamp.groundSprite.length == 2) {
      this.stamp.groundSprite[1].setPosition(pointerX * commonSpec.tileSize, pointerY * commonSpec.tileSize);
      this.stamp.groundSprite[1].setVisible(time - this.input.activePointer.time < 2000);
    }
    if (this.input.manager.activePointer.isDown) {
      if (mapEditor.selectedGround.kind == "water") this.map.deleteTile(pointerX, pointerY, 1);
      else this.map.setTile(pointerX, pointerY, mapEditor.selectedGround, 1);
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
