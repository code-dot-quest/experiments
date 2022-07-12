import "phaser";
import { saveAs } from "file-saver";
import Editor from "./editor";
import Map, { MapJson } from "./world/map";
import Ground from "./world/ground";
import Movable from "./world/movable";
import configSpec from "./world/config.json";

const editor = new Editor();

interface LevelJson {
  map: MapJson;
}

export default class Demo extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Phaser.GameObjects.Sprite;
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
      .grid(0, 0, 10 * configSpec.tileSize, 10 * configSpec.tileSize, configSpec.tileSize, configSpec.tileSize)
      .setOrigin(0, 0)
      .setOutlineStyle(0xffffff, 0.2);

    this.player = this.add.sprite(100, 100, "knight").play({ key: "Idle", repeat: -1 });
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
    const pointerX = Math.floor(worldPoint.x / configSpec.tileSize);
    const pointerY = Math.floor(worldPoint.y / configSpec.tileSize);
    this.stamp.sprite.setPosition(pointerX * configSpec.tileSize, pointerY * configSpec.tileSize);
    this.stamp.sprite.setVisible(time - this.input.activePointer.time < 2000);
    if (this.input.manager.activePointer.isDown) {
      this.map.setGround(pointerX, pointerY, editor.selectedGround);
    }

    if (this.cursors.left.isDown) {
      this.player.play({ key: "Run" }, true);
      this.player.setX(this.player.x - 2);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.player.play({ key: "Run" }, true);
      this.player.setX(this.player.x + 2);
      this.player.flipX = false;
    } else if (this.cursors.up.isDown) {
      this.player.play({ key: "Run" }, true);
      this.player.setY(this.player.y - 2);
    } else if (this.cursors.down.isDown) {
      this.player.play({ key: "Run" }, true);
      this.player.setY(this.player.y + 2);
    } else {
      this.player.play({ key: "Idle", repeat: -1 }, true);
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
