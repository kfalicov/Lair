import Shader from '../shader/pipelines.js';
var directions = {
    NONE: -1, //not reflected at all
    SOUTH: 0,   //(north+2)%4
    WEST: 1,    //(east+2)%4
    NORTH: 2,   //(south+2)%4
    EAST: 3,    //(west+2)%4
    reflect: function(mirror, laser){
        //mirror.direction is of the format [in,out]. if a laser comes in from the -out direction
        //it must be redirected back in the -in direction (accomplished using modulo)
        let outputdir = this.NONE;
        if(mirror.direction[0]===laser.direction){
            //console.log(mirror.direction[1]);
            outputdir = mirror.direction[1];
        }else if((mirror.direction[1]+2)%4===laser.direction){
            //console.log((mirror.direction[0]+2)%4);
            outputdir = (mirror.direction[0]+2)%4;
        }else{
            //console.log('laser is blocked by this');
            //leave outputdir as none
        }
        //point is originally the center
        let point = {x:mirror.x, y:mirror.y};
        if( (mirror.direction[0] === this.SOUTH && mirror.direction[1] === this.EAST) || 
            (mirror.direction[0] === this.NORTH && mirror.direction[1] === this.WEST)){
            if(laser.direction %2 === 0){
                point.x=laser.x;
                point.y-=mirror.x-laser.x; 
            }else{
                point.x-=mirror.y-laser.y;
                point.y=laser.y;
            }
            
        }else{
            if(laser.direction %2 === 0){
                point.x=laser.x;
                point.y+=mirror.x-laser.x; 
            }else{
                point.x+=mirror.y-laser.y;
                point.y=laser.y;
            }
        }
        //console.log(point);
        if(laser.direction===0){
            laser.height=point.y-laser.y;
        }else if(laser.direction===1){
            laser.width=laser.x-point.x;
        }else if(laser.direction===2){
            laser.height=laser.y-point.y;
        }else if(laser.direction===3){
            laser.width=point.x-laser.x;
        }
        laser.body.updateFromGameObject();
        return {x: point.x, y: point.y, direction: outputdir, mirror:mirror};
    }
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
        this.load.image('mirror', 'assets/images/classic/mirror.png');
        this.load.image('item_box', 'assets/images/classic/item_box.png');
        this.load.image('info_button', 'assets/images/classic/info_button.png');

        this.load.glsl('crt_fragment', 'js/shader/crt2.fs');

        console.log('clasic created');
    }

    destroyLaser(laser){
        if(laser.child){
            this.destroyLaser(laser.child);
        }
        laser.destroy();
    }

    makeLaserRecursive(room, coord, textureKey, direction, parentMirror){
        let laser = undefined;
        if(direction === directions.SOUTH){
            laser = this.add.tileSprite(coord.x, coord.y, 8, room.getBottomRight().y-coord.y, textureKey).setOrigin(0.5, 0);
        }else if(direction === directions.WEST){
            laser = this.add.tileSprite(coord.x, coord.y, coord.x-room.getTopLeft().x, 8, textureKey).setOrigin(1, 0.5);
        }else if(direction === directions.NORTH){
            laser = this.add.tileSprite(coord.x, coord.y, 8, coord.y-room.getTopLeft().y, textureKey).setOrigin(0.5, 1);
        }else if(direction === directions.EAST){
            laser = this.add.tileSprite(coord.x, coord.y, room.getBottomRight().x-coord.x, 8, textureKey).setOrigin(0, 0.5);
        }
        
        if(laser!==undefined){
            laser.direction = direction;
            this.laserGrid.add(laser);
            let data = undefined;
            this.physics.world.overlap(laser, this.mirrors, function(laser, mirror){
                data = directions.reflect(mirror, laser);
            }, function(laser, mirror){
                return mirror!==parentMirror;
            }, this);
            //after all obstacle checks are done, this ensures the laser body is at its final size
            //and the last mirror touched is the relevant data
            if(data && data.direction!=directions.NONE){
                //console.log('reflected');
                laser.child = this.makeLaserRecursive(room, data, textureKey, data.direction, data.mirror);
            }
            //all lasers are below all items
            laser.depth = 0;
        }
        return laser;
    }

    makeLaserOrigin(room, pointer, textureKey, direction){
        let laser = undefined;
        let coord = {x:undefined, y:undefined};
        if(direction === directions.SOUTH){
            coord.x = pointer.x;
            coord.y = room.getTopLeft().y;
        }else if(direction === directions.WEST){
            coord.x = room.getBottomRight().x;
            coord.y = pointer.y;
        }else if(direction === directions.NORTH){
            coord.x = pointer.x;
            coord.y = room.getBottomRight().y;
        }else if(direction === directions.EAST){
            coord.x = room.getTopLeft().x;
            coord.y = pointer.y;
        }
        laser = this.makeLaserRecursive(room, coord, textureKey, direction, undefined);
        if(laser===undefined){
            console.log('laser creation failed');
        }
        return laser;
    }

    makeItem(room, pointer, textureKey, type){
        //room.scene.add.sprite(pointer.x, pointer.y, textureKey);
        let item = this.add.sprite(pointer.x, pointer.y, textureKey).setInteractive();
        item.input.hitArea.setTo(-5, -5, item.width+10, item.height+10);
        item.on('pointerdown', function(){console.log('mirror click')},this);
        this.mirrors.add(item);
        item.body.position = {x:item.x-9, y:item.y-9}
        item.body.height = 18;
        item.body.width = 18;
        
        //make sure directions in/out are ordered clockwise
        if(type===0){
            item.direction = [directions.SOUTH, directions.EAST]; 
        }else if(type===1){
            item.direction = [directions.WEST, directions.SOUTH];
            item.angle=90; 
        }else if(type===2){
            item.direction = [directions.NORTH, directions.WEST]; 
            item.angle = 180;
        }else if(type===3){
            item.direction = [directions.EAST, directions.NORTH]; 
            item.angle = 270;
        }
        let data = undefined;
        this.physics.world.overlap(this.laserGrid, item, function(mirror, laser){
            data = directions.reflect(mirror, laser);
            //if the laser has been interrupted by this item, destroy it recursively
            if(laser.child){
                this.destroyLaser(laser.child);
            }
            if(data && data.direction!=directions.NONE){
                //console.log('reflected');
                laser.child = this.makeLaserRecursive(room, data, laser.displayTexture.key, data.direction, item);
            }
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
        
        function getNext(percent, dir){
            let incoming=["from north", "from east", "from south", "from west"];
            let outgoing=[" to south", " to west", " to north", " to east"];
            let output;
            if(percent<=0.6){
                output = "laser " + incoming[dir] + outgoing[dir];
            }else{
                output = "mirror " + incoming[dir] + outgoing[(dir+3)%4];
            }
            return output;
        }

        this.laserGrid = this.physics.add.staticGroup();
        this.mirrors = this.physics.add.staticGroup();
        let percent=Math.random();
        let dir=Phaser.Math.Between(0,3);
        
        room.on('pointerdown', function (pointer) {
            if(percent<=0.6){
                let laser = this.makeLaserOrigin(room, {x:pointer.x, y:pointer.y}, 'laser', dir);
                //console.log(laser);
            }else{
                let item = this.makeItem(room, {x:pointer.x, y:pointer.y}, 'mirror', dir);
            }

            percent=Math.random();
            dir=Phaser.Math.Between(0,3);
            console.log(getNext(percent,dir));
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
        console.log(getNext(percent,dir));
        this.animdirs=[
            {x:0,y:-0.5},
            {x:0.5,y:0},
            {x:0,y:0.5},
            {x:-0.5,y:0}
        ];
    }
    update()
    {       
        this.shaderPipeline.setFloat1('time', this.time.now);
        this.laserGrid.children.each(function(laser){
            laser.tilePositionY += this.animdirs[laser.direction].y;
            laser.tilePositionX += this.animdirs[laser.direction].x;
        }, this);
    }
}
export default ClassicMode;