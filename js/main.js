import MainMenu from './scenes/menu.js';
import {ClassicMode, ClassicModeRender} from './scenes/classic.js';
import {DayNight} from './scenes/daynight.js'

let config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    parent: gamediv,
    pixelArt: true,
    //zoom: 3,
    physics: {
        default: 'arcade',
        arcade: {
            //fps:60,
            //debug:true
        }
    },
    //scene: ClassicMode //use this to test specific scenes directly
    scene: [MainMenu, ClassicMode, DayNight]
};

let game = new Phaser.Game(config);