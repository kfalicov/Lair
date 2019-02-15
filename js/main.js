import MainMenu from './scenes/menu.js';
import ClassicMode from './scenes/classic.js';

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: gamediv,
    scene: [new MainMenu(), new ClassicMode()]
};

let game = new Phaser.Game(config);

console.log(game.scene.keys);