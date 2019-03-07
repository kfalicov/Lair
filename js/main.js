import MainMenu from './scenes/menu.js';
import ClassicMode from './scenes/classic.js';

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: gamediv,
    pixelArt: true,
    //zoom: 3,
    physics: {
        default: 'arcade',
        arcade: {
            //fps:30,
            //debug:true
        }
    },
    //scene: ClassicMode //use this to test specific scenes directly
    scene: [MainMenu, ClassicMode]
};

let game = new Phaser.Game(config);