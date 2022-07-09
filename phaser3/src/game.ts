import 'phaser';

export default class Demo extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Phaser.GameObjects.Sprite;

  constructor() {
    super('demo');
  }

  preload() {
    this.load.aseprite('knight', 'assets/knight.png', 'assets/knight.json');
  }

  create() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.anims.createFromAseprite('knight');
    this.player = this.add.sprite(100, 100, 'knight').play({ key: 'Idle', repeat: -1 });
    this.add.sprite(200, 200, 'knight').play({ key: 'Attack_1', repeat: -1 });
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.play({ key: "Run" }, true);
      this.player.setX(this.player.x - 2);
      this.player.flipX = true;
    }
    else if (this.cursors.right.isDown) {
      this.player.play({ key: "Run" }, true);
      this.player.setX(this.player.x + 2);
      this.player.flipX = false;
    }
    else if (this.cursors.up.isDown) {
      this.player.play({ key: "Run" }, true);
      this.player.setY(this.player.y - 2);
    }
    else if (this.cursors.down.isDown) {
      this.player.play({ key: "Run" }, true);
      this.player.setY(this.player.y + 2);
    }
    else {
      this.player.play({ key: 'Idle', repeat: -1 }, true);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#125555',
  width: 1280,
  height: 1280,
  scene: Demo,
  zoom: 0.5,
};

const game = new Phaser.Game(config);
