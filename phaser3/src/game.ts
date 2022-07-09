import 'phaser';

export default class Demo extends Phaser.Scene
{
    constructor ()
    {
        super('demo');
    }

    preload ()
    {
        this.load.aseprite('knight', 'assets/knight.png', 'assets/knight.json');
    }

    create ()
    {
        this.anims.createFromAseprite('knight');
        this.add.sprite(100, 100, 'knight').play({ key: 'Run', repeat: -1 });
        this.add.sprite(200, 200, 'knight').play({ key: 'Attack_1', repeat: -1 });
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 800,
    height: 600,
    scene: Demo
};

const game = new Phaser.Game(config);
