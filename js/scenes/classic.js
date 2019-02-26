import Shader from '../shader/pipelines.js';
var directions = {
    SOUTH: 0,
    WEST: 1,
    NORTH: 2,
    EAST: 3
}

class ClassicMode extends Phaser.Scene {
    constructor()
    {
        super('ClassicMode');
    }

    preload()
    {
        this.load.image('room', 'assets/images/classic/room.png');
        this.load.image('laser', 'assets/images/classic/laser.png');
        this.load.image('item_box', 'assets/images/classic/item_box.png');
        this.load.image('info_button', 'assets/images/classic/info_button.png');

        this.load.glsl('crt_fragment', 'js/shader/crt2.fs');

        console.log('clasic created');
    }

    makeLaser(room, pointer, textureKey, direction){
        let laser = undefined;
        if(direction === directions.SOUTH){
            laser = this.add.tileSprite(pointer.x, room.getTopLeft().y, 10, room.height, textureKey).setOrigin(0.5, 0);
        }else if(direction === directions.WEST){
            laser = this.add.tileSprite(room.getBottomRight().x,    pointer.y, room.width, 10, textureKey).setOrigin(1, 0.5);
        }else if(direction === directions.NORTH){
            laser = this.add.tileSprite(pointer.x,                  room.getBottomRight().y, 10, room.height, textureKey).setOrigin(0.5, 1);
        }else if(direction === directions.EAST){
            laser = this.add.tileSprite(room.getTopLeft().x,        pointer.y, room.width, 10, textureKey).setOrigin(0, 0.5);
        }
        if(laser!==undefined){
            laser.direction = direction;
            this.laserGrid.add(laser);
            this.physics.world.overlap(laser, this.mirrors, function(laser, mirror){
                if(laser.direction===0){
                    laser.height=mirror.y-laser.y;
                }
                laser.body.updateFromGameObject();
            }, null, this);
            //all lasers are below all items
            laser.depth = 0;
        }
        return laser;
    }

    makeItem(room, pointer, textureKey, type){
        //room.scene.add.sprite(pointer.x, pointer.y, textureKey);
        let item = this.add.sprite(pointer.x, pointer.y, textureKey);
        this.mirrors.add(item);
        this.physics.world.overlap(this.laserGrid, item, function(mirror, laser){
            if(laser.direction===0){
                laser.height=mirror.y-laser.y;
            }else if(laser.direction===1){
                laser.width=laser.x-mirror.x;
            }else if(laser.direction===2){
                laser.height=laser.y-mirror.y;
            }else if(laser.direction===3){
                laser.width=mirror.x-laser.x;
            }
            laser.body.updateFromGameObject();
        }, null, this);
        //all items are above all lasers
        item.depth = 1;
        return item;
    }

    create()
    {   
        console.log('created classicmode');
        this.input.keyboard.on('keydown_ESC', function(event){
            this.scene.start('MainMenu');
        }, this);

        let room = this.add.image(40,60,'room').setOrigin(0).setInteractive();
        //console.log(room.getTopLeft().x);
        room.input.hitArea.setTo(10, 10, 700, 460);
        
    
        this.laserGrid = this.physics.add.staticGroup();
        this.mirrors = this.physics.add.staticGroup();
        let i=0;
        room.on('pointerdown', function (pointer) {
            if(i<4){
                let laser = this.makeLaser(room, {x:pointer.x, y:pointer.y}, 'laser', i);
            }else{
                let item = this.makeItem(room, {x:pointer.x, y:pointer.y}, 'tex', i);
            }
            i=(i+1)%5;
            
        }, this);
        
        
        this.add.image(720,520,'item_box').setOrigin(0).setDepth(1);
        this.add.image(40,543, 'info_button').setOrigin(0);

        /**
         * SHADER STUFF
         */
        let shader = new Shader(this.sys.game, 
                                undefined, 
                                this.cache.shader.get('crt_fragment'));

        //creates a new shader if it hasn't been created yet
        this.shaderPipeline = this.sys.game.renderer.pipelines['CRT'];
        if(!this.shaderPipeline){
            console.log('created CRT shader');
            this.shaderPipeline = this.sys.game.renderer.addPipeline('CRT', shader);
        }
        this.shaderPipeline.setFloat2('inputResolution', this.game.config.width, this.game.config.height);
        this.shaderPipeline.setFloat2('outputResolution', this.game.config.width, this.game.config.height);
        this.shaderPipeline.setFloat2('TextureSize', 400.0, 300.0);
        this.shaderPipeline.setFloat2('mouse', this.input.activePointer.x, this.input.activePointer.y);
        
        /**
         * END SHADER STUFF
         */

        //toggles between visible shader and disabled shader
        this.input.on('pointerdown', function(pointer){
            if(this.cameras.main.pipeline === this.shaderPipeline){
                //this.cameras.main.clearRenderToTexture();
            }
            else{
                //this.cameras.main.setRenderToTexture(this.shaderPipeline);
            }
        }, this);
        
        //pipelines can be used on individual images or sprites
        //room.setPipeline('Scanline');

        this.input.on('pointermove', function (pointer) {

            //this.shaderPipeline.setFloat2('mouse', pointer.x, pointer.y);
    
        }, this);
    }
    update()
    {       
        this.shaderPipeline.setFloat1('time', this.time.now);
        this.laserGrid.children.each(function(laser){
            //laser.tilePositionX -= laser.laserSpeed.x;
            //laser.tilePositionY -= laser.laserSpeed.y;
        }, this);
    }
}
export default ClassicMode;