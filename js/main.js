import MainMenu from './scenes/menu.js';
import {MusicScene} from'./scenes/sound.js';
import {ClassicMode} from './scenes/classic.js';
import {Transition, TransitionRender} from './scenes/transition.js'
import {UI} from './scenes/ui.js'
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
            fps:120,
            //debug:true
        }
    },
    //scene: ClassicMode //use this to test specific scenes directly
    scene: [MainMenu, MusicScene, ClassicMode, UI, Transition, TransitionRender, Dialog]
};

let game = new Phaser.Game(config);