import MainMenu from './scenes/menu.js';
import {ClassicMode, ClassicModeRender} from './scenes/classic.js';
import {Transition} from './scenes/transition.js'
import Dialog from './scenes/dialog.js';

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
    //scene: ClassicMode, DayNight //use this to test specific scenes directly
    scene: [MainMenu, ClassicMode, Transition, Dialog]
};

let game = new Phaser.Game(config);