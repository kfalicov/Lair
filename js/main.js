import MainMenu from './scenes/menu.js';

let menuScene = new MainMenu();

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: gamediv,
    scene: menuScene
};

let game = new Phaser.Game(config);