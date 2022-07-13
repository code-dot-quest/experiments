import "phaser";
import { saveAs } from "file-saver";
import Editor from "./editor";
import Map, { MapJson } from "./world/map";
import Ground from "./world/ground";
import Movable from "./world/movable";
import commonSpec from "./world/common.json";

const editor = new Editor();

interface LevelJson {
  map: MapJson;
}

export default class Demo extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Movable;
  stamp: Ground;
  map: Map;

  constructor() {
    super("demo");
  }

  preload() {
    this.load.aseprite("tiles", "assets/tiles.png", "assets/tiles.json");
    this.load.aseprite("knight", "assets/knight.png", "assets/knight.json");
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.anims.createFromAseprite("knight");

    this.map = new Map(this, 10, 10);
    this.map.initialize(editor.getDefaultGround());

    this.stamp = new Ground(this, 0, 0).set(editor.selectedGround);
    this.stamp.sprite.setAlpha(0.8);

    //this.add.grid(0, 0, 1280, 1280, configSpec.tileSize, configSpec.tileSize).setOrigin(0, 0).setOutlineStyle(0x101010, 0.15);
    this.add
      .grid(0, 0, 10 * commonSpec.tileSize, 10 * commonSpec.tileSize, commonSpec.tileSize, commonSpec.tileSize)
      .setOrigin(0, 0)
      .setOutlineStyle(0xffffff, 0.2);

    this.player = new Movable(this, this.map).spawn({ kind: "knight", type: "blue" }, 4, 4);
    this.add.sprite(200, 200, "knight").play({ key: "Attack_1", repeat: -1 });

    editor.onGroundSelected((ground) => {
      this.stamp.set(ground);
    });
    editor.onSave(() => {
      const levelJson = { map: this.map.saveToJson() };
      const blob = new Blob([JSON.stringify(levelJson)], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "level.json");
    });
    editor.onLoad((json: any) => {
      const levelJson = json as LevelJson;
      this.map.loadFromJson(levelJson.map);
    });
  }

  update(time) {
    const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    const pointerX = Math.floor(worldPoint.x / commonSpec.tileSize);
    const pointerY = Math.floor(worldPoint.y / commonSpec.tileSize);
    this.stamp.sprite.setPosition(pointerX * commonSpec.tileSize, pointerY * commonSpec.tileSize);
    this.stamp.sprite.setVisible(time - this.input.activePointer.time < 2000);
    if (this.input.manager.activePointer.isDown) {
      this.map.setGround(pointerX, pointerY, editor.selectedGround);
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
  width: 1280,
  height: 1280,
  scene: Demo,
  zoom: 0.5,
  parent: "canvas-parent",
};

const game = new Phaser.Game(config);
