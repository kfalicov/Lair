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
        point.x = Math.floor(point.x);
        point.y = Math.floor(point.y);
        //console.log(point);
        if(laser.direction===0){
            laser.height=point.y-laser.y;
            laser.bg.height = laser.height;
            laser.fg.height = laser.height;
        }else if(laser.direction===1){
            laser.width=laser.x-point.x;
            laser.bg.width = laser.width;
            laser.fg.width = laser.width;
        }else if(laser.direction===2){
            laser.height=laser.y-point.y;
            laser.bg.height = laser.height;
            laser.fg.height = laser.height;
        }else if(laser.direction===3){
            laser.width=point.x-laser.x;
            laser.bg.width = laser.width;
            laser.fg.width = laser.width;
        }
        laser.body.updateFromGameObject();
        return {x: point.x, y: point.y, direction: outputdir, mirror:mirror};
    }
}

export class ClassicMode extends Phaser.Scene {
    constructor()
    {
        super({key:'ClassicMode', active:false});
    }

    preload()
    {
        this.load.image('background', 'assets/images/classic/background.png');
        this.load.image('floor', ['assets/images/classic/floor.png', 'assets/images/classic/floor_normal.png']);
        this.load.image('room_border', 'assets/images/classic/room_border.png');
        this.load.image('rear_wall', 'assets/images/classic/rear_wall.png');
        this.load.image('vignette', 'assets/images/classic/vignette.png');
        this.load.image('laser_fg', 'assets/images/classic/laser_foreground.png');
        this.load.image('laser_bg', 'assets/images/classic/laser_background.png');
        this.load.image('laser_preview', 'assets/images/classic/laser_preview.png');
        this.load.image('noodle_noise', 'assets/images/classic/noodle_noise.png');
        this.load.image('mirror', 'assets/images/classic/mirror.png');
        this.load.image('mirror_preview', 'assets/images/classic/mirror_preview.png');
        this.load.image('item_box', 'assets/images/classic/item_box.png');
        this.load.image('info_button', 'assets/images/classic/info_button.png');

        this.load.image('target', 'assets/images/classic/target.png');

        this.load.image('laser_ui', 'assets/images/classic/laser_ui.png');
        this.load.image('mirror_ui', 'assets/images/classic/mirror_ui.png');

        this.load.glsl('crt_fragment', 'js/shader/crt2.fs');

        console.log('classic created');
    }

    destroyLaser(laser){
        if(laser.child){
            this.destroyLaser(laser.child);
        }
        laser.bg.destroy();
        laser.fg.destroy();
        laser.destroy();
    }

    makeLaserRecursive(room, coord, direction, parentMirror){
        let laser = undefined;
        if(direction === directions.SOUTH){
            laser = this.add.tileSprite(coord.x, coord.y, 4, room.getBottomRight().y-room.y_offset-coord.y, 'noodle_noise').setOrigin(0.5, 0);
            laser.bg = this.add.tileSprite(coord.x, coord.y, 6, room.getBottomRight().y-room.y_offset-coord.y, 'laser_bg').setOrigin(0.5, 0);
            laser.fg = this.add.tileSprite(coord.x, coord.y, 2, room.getBottomRight().y-room.y_offset-coord.y, 'laser_fg').setOrigin(0.5, 0);
            laser.setTileScale(1,5);
        }else if(direction === directions.WEST){
            laser = this.add.tileSprite(coord.x, coord.y, coord.x-room.getTopLeft().x, 4, 'noodle_noise').setOrigin(1, 0.5);
            laser.bg = this.add.tileSprite(coord.x, coord.y, coord.x-room.getTopLeft().x, 6, 'laser_bg').setOrigin(1, 0.5);
            laser.fg = this.add.tileSprite(coord.x, coord.y, coord.x-room.getTopLeft().x, 2, 'laser_fg').setOrigin(1, 0.5);
            laser.setTileScale(5,1);
        }else if(direction === directions.NORTH){
            laser = this.add.tileSprite(coord.x, coord.y, 4, coord.y-room.getTopLeft().y+room.y_offset, 'noodle_noise').setOrigin(0.5, 1);
            laser.bg = this.add.tileSprite(coord.x, coord.y, 6, coord.y-room.getTopLeft().y+room.y_offset, 'laser_bg').setOrigin(0.5, 1);
            laser.fg = this.add.tileSprite(coord.x, coord.y, 2, coord.y-room.getTopLeft().y+room.y_offset, 'laser_fg').setOrigin(0.5, 1);
            laser.setTileScale(1,5);
        }else if(direction === directions.EAST){
            laser = this.add.tileSprite(coord.x, coord.y, room.getBottomRight().x-coord.x, 4, 'noodle_noise').setOrigin(0, 0.5);
            laser.bg = this.add.tileSprite(coord.x, coord.y, room.getBottomRight().x-coord.x, 6, 'laser_bg').setOrigin(0, 0.5);
            laser.fg = this.add.tileSprite(coord.x, coord.y, room.getBottomRight().x-coord.x, 2, 'laser_fg').setOrigin(0, 0.5);
            laser.setTileScale(5,1);
        }
        if(laser!==undefined){            
            laser.direction = direction;
            laser.setBlendMode(Phaser.BlendModes.ADD);
            laser.alpha=0.7;
            laser.fg.setBlendMode(Phaser.BlendModes.ADD);
            laser.bg.setBlendMode(Phaser.BlendModes.ADD);
            //laser.animFrame = 0;
            //laser.animFrameTime = 6;
            laser.setTilePosition(Math.random()*100,Math.random()*100);
            this.laserGrid.add(laser);
            let data = undefined;
            this.physics.world.overlap(laser, this.mirrors, function(laser, mirror){
                data = directions.reflect(mirror, laser);
            }, function(laser, mirror){
                return mirror!==parentMirror;
            }, this);
            //after all obstacle checks are done, this ensures the laser body is at its final size
            //and the last mirror touched is the relevant data
            if(data && data.direction!==directions.NONE){
                //console.log('reflected');
                laser.child = this.makeLaserRecursive(room, data, data.direction, data.mirror);
            }
            //all lasers are below all items
            laser.depth = 1;
            laser.bg.depth = 1;
            laser.fg.depth = 1;
        }
        return laser;
    }

    makeLaserOrigin(room, pointer, direction){
        let laser = undefined;
        let coord = {x:undefined, y:undefined};
        if(direction === directions.SOUTH){
            coord.x = pointer.x;
            coord.y = room.getTopLeft().y-room.y_offset;
        }else if(direction === directions.WEST){
            coord.x = room.getBottomRight().x;
            coord.y = pointer.y;
        }else if(direction === directions.NORTH){
            coord.x = pointer.x;
            coord.y = room.getBottomRight().y-room.y_offset;
        }else if(direction === directions.EAST){
            coord.x = room.getTopLeft().x;
            coord.y = pointer.y;
        }
        laser = this.makeLaserRecursive(room, coord, direction, undefined);
        if(laser===undefined){
            console.log('laser creation failed');
        }
        return laser;
    }

    makeItem(room, pointer, textureKey, type){
        //room.scene.add.sprite(pointer.x, pointer.y, textureKey);
        let item = this.add.sprite(pointer.x, pointer.y, textureKey);
        this.mirrors.add(item);
        item.body.position = {x:item.x-13, y:item.y-14}
        item.body.height = 27;
        item.body.width = 27;
        
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
                laser.child = this.makeLaserRecursive(room, data, data.direction, item);
            }
        }, null, this);
        //all items are above all lasers
        item.depth = 2;
        return item;
    }

    create(data)
    {       
        //this.scene.setVisible(false, 'ClassicMode');
        //this.scene.launch('ClassicModeRender',data);
        /**
         * UI STUFF
         */
        let background = this.add.image(0,0,'background').setOrigin(0).setInteractive();

        let ROOM_PADDING_L = 16;
        let ROOM_HEIGHT = 0;
        let room = this.add.tileSprite(40,60+ROOM_HEIGHT, 720, 480, 'floor').setOrigin(0);
        let vignette = this.add.image(40,60+ROOM_HEIGHT, 'vignette').setOrigin(0);
        let room_border = this.add.image(room.getTopLeft().x-3,room.getTopLeft().y-3,'room_border').setOrigin(0);
        //let rear_wall = this.add.image(room.getTopLeft().x-3, 40-3, 'rear_wall').setOrigin(0);
        //let front_wall = this.add.image(room.getTopLeft().x-3, room.getBottomRight().y+3, 'rear_wall').setOrigin(0,1).setDepth(4);
        
        this.money=data.money;
        //console.log(data);

        room.y_offset = ROOM_HEIGHT;

        let moneydisplay = this.add.text(room.getBottomRight().x, 22, '0000000',{
            fontFamily:'"Roboto Mono", monospace',
            fontSize:32,
            color: '#ffdd00'
        }).setOrigin(1, 0.5);

        let scene = this;
        let countdown = undefined;

        let updateMoneyDisplay = function(money){
            let result = '$'+String(Math.abs(money)).padStart(7,' ');
            if(money<0){
                result = '-'+result;
            }else if(money<=0){
                moneydisplay.setColor('#d81313');
                console.log('3');
                countdown = scene.time.addEvent({
                    delay: 1000,
                    repeat: 2,
                    callback: function(){
                        console.log(countdown.repeatCount);
                        if(countdown.repeatCount===0){
                            //console.log(this);
                            this.scene.stop('Dialog')
                            this.scene.launch('Transition', {
                                from:this.scene.key, 
                                to:'MainMenu'
                            });
                        }
                    },
                    callbackScope: scene
                });
            }else{
                if(countdown){
                    countdown.destroy();
                    countdown = undefined;
                }
                moneydisplay.setColor('#ffdd00');
            }
            moneydisplay.setText(result);
        };
        
        updateMoneyDisplay(this.money);

        this.add.image(720,520,'item_box').setOrigin(0).setDepth(4);
        this.add.image(40,543, 'info_button').setOrigin(0).setDepth(4);
        let beamui = this.add.image(720,520, 'laser_ui').setOrigin(0).setDepth(5);
        let mirrorui = this.add.image(720,520, 'mirror_ui').setOrigin(0).setDepth(5);
        /**
         * END UI STUFF
         */


        let placeables=[
            function(pointer, direction, scene){
                scene.makeLaserOrigin(room, {x:pointer.x, y:pointer.y}, direction);
            },
            function(pointer, direction, scene){
                scene.makeItem(room, {x:pointer.x, y:pointer.y}, 'mirror', direction);
            },
            function(){

            }
        ];

        //console.log(room.getTopLeft().x);
        //room.input.hitArea.setTo(10, 10, 700, 460);
        
        /**
         * PHYSICS
         */
        
         //boundaries of the room for enemies to bounce off
        let walls = this.physics.add.staticGroup();
        let wall_top = this.add.zone(0,0,800,60).setOrigin(0);
        let wall_bottom = this.add.zone(800,600,800,61).setOrigin(1);
        let wall_left = this.add.zone(0,0,40,600).setOrigin(0);
        let wall_right = this.add.zone(800,600,40,600).setOrigin(1);
        walls.addMultiple([wall_top, wall_bottom, wall_left, wall_right]);

        //groups representing placed items in the room
        this.laserGrid = this.physics.add.staticGroup();
        this.mirrors = this.physics.add.staticGroup();
        this.queueEnd = false;

        //enemies in the room
        this.enemies = this.physics.add.group();
        this.enemies.removeCallback = function(child){
            if(this.children.size===0){
                this.scene.queueEnd = true;
            }
        };
        /**
         * ENEMY AND TARGET PLACEMENT
         */
        
        let num_enemies = Math.min(2+Math.floor(data.difficulty/2),6);
        let speedRange = [150,200];
        let angleRange = [20,70];
        let colors = [0xe03131, 0x31e04b, 0x498bf4, 0xe07731, 0x9431e0, 0xe0cb31];
        for(var i = 0; i<num_enemies; i++){
            var b = this.enemies.create(0,0,'info_button');
            b.setBounce(1,1).setCollideWorldBounds(true);
            b.setRandomPosition(40+b.displayOriginX+1, 60+b.displayOriginY+1, room.width-(b.width+2),room.height-(b.height+2));
            b.setDepth(1);
            b.setTint(colors[i]);
            b.setData('captureTime',0);
            let angle = Phaser.Math.Between(angleRange[0],angleRange[1]);
            angle = angle+(90*Phaser.Math.Between(0,3));
            let speed = Phaser.Math.Between(speedRange[0],speedRange[1])+(20*data.difficulty);
            this.physics.velocityFromAngle(angle,speed,b.body.velocity);
            this.physics.add.existing(b);

            let t = this.physics.add.sprite(0,0,'target');
            t.setRandomPosition(40+t.displayOriginX+1, 60+t.displayOriginY+1, room.width-(t.width+2),room.height-(t.height+2));
            t.setDepth(0);
            t.setTint(colors[i]);
            //this.physics.add.existing(t);
            b.on('overlapend',function(){
                console.log('overlapend');
            });
            b.body.onOverlap = false;
            this.physics.add.overlap(b,t,function(_b, _t){
                _b.setData('onTarget',true);
                _b.data.values.captureTime++;
                if(_b.data.values.captureTime >= 200){
                    _b.body.enable = false;
                    this.enemies.remove(_b);
                    this.money+=1500;
                    updateMoneyDisplay(this.money);
                    //TODO play capture animation
                }
            },null,this);
        }
        this.physics.add.collider(this.enemies, this.laserGrid);
        this.physics.add.collider(this.enemies, walls);
        this.physics.add.collider(this.enemies, this.mirrors);
        /**
         * END ENEMY PLACEMENT
         */


        //randomly selects laser or item with a higher chance of laser (60% - 40%)
        let nextItem = Math.random()<.6? 0 : 1;
        //let nextItem = 1;
        let direction = 0;

        let clampX = Phaser.Math.Clamp(this.input.activePointer.x, room.getTopLeft().x+ROOM_PADDING_L, room.getBottomRight().x-ROOM_PADDING_L);
        let clampY = Phaser.Math.Clamp(this.input.activePointer.y, room.getTopLeft().y+ROOM_PADDING_L, room.getBottomRight().y-ROOM_PADDING_L-ROOM_HEIGHT);
        let beampreview = this.add.tileSprite(clampX, 60, 4, room.height, 'laser_preview').setOrigin(0.5, 0);
        beampreview.alpha = 0.8;
        beampreview.setBlendMode(Phaser.BlendModes.ADD);
        
        let beamorigin = this.add.tileSprite(clampX, 60, 16, 8, 'laser_preview').setOrigin(0.5,0);
        beamorigin.alpha = 0.8;
        beamorigin.setBlendMode(Phaser.BlendModes.ADD);

        let mirrorpreview = this.physics.add.sprite(clampX,clampY,'mirror_preview');
        mirrorpreview.alpha = 0.8;
        mirrorpreview.setBlendMode(Phaser.BlendModes.ADD);

        //whether to show beam or mirror on start
        let showBeam = (nextItem===0)? true : false;
        beampreview.setVisible(showBeam);
        beamorigin.setVisible(showBeam);
        mirrorpreview.setVisible(!showBeam);
        beamui.setVisible(showBeam);
        mirrorui.setVisible(!showBeam);

        let pointer = this.input.activePointer;
        let updateDirection = function(direction){
            if(direction === 0 || direction === 2){
                let clampX = Phaser.Math.Clamp(Math.floor(pointer.x), room.getTopLeft().x+ROOM_PADDING_L, room.getBottomRight().x-ROOM_PADDING_L);
                beampreview.setPosition(clampX, room.y-ROOM_HEIGHT);
                beamorigin.setOrigin(0.5,0);
                beamorigin.width = 16;
                beamorigin.height = 8;
                if(direction===0){
                    beamorigin.setPosition(clampX, room.y-ROOM_HEIGHT);
                }else{
                    beamorigin.setPosition(clampX, room.getBottomRight().y-8-ROOM_HEIGHT);
                }
                beampreview.width = 4;
                beampreview.height = room.height;
                beampreview.setOrigin(0.5,0);
            }else{
                let clampY = Phaser.Math.Clamp(Math.floor(pointer.y), room.getTopLeft().y+ROOM_PADDING_L-ROOM_HEIGHT, room.getBottomRight().y-ROOM_PADDING_L-ROOM_HEIGHT);
                beampreview.setPosition(room.x, clampY);
                beamorigin.setOrigin(0,0.5);
                beamorigin.width = 8;
                beamorigin.height = 16;
                if(direction===3){
                    beamorigin.setPosition(room.x, clampY);
                }else{
                    beamorigin.setPosition(room.getBottomRight().x-8, clampY);
                }
                beampreview.width = room.width;
                beampreview.height = 4;
                beampreview.setOrigin(0,0.5);
            }
            mirrorpreview.angle = direction*90;
        }

        this.input.on('pointerscroll', function(event){
            direction = ((event.deltaY<0)? direction + 1 : direction + 3)%4;
            updateDirection(direction);
        }, this);

        this.input.keyboard.on('keydown_A', function (event) {
            direction = (direction+3)%4;
            updateDirection(direction);
        }, this);

        this.input.keyboard.on('keydown_D', function (event) {
            direction = (direction+1)%4;
            updateDirection(direction);
        }, this);

        this.input.keyboard.on('keydown_R', function(event){
            this.scene.start('ClassicMode', this.scene.settings.data);
        },this);

        this.input.keyboard.on('keydown_N', function(event){
            this.scene.launch('Transition', {
                from:this.scene.key,
                to: 'ClassicMode',
                data: {
                    money: this.money,
                    difficulty: this.scene.settings.data.difficulty+1
                }
            });
        }, this);
        

        /**
         * OBJECT PLACEMENT
         */
        background.on('pointerdown', function (pointer) {
            //this.placeObject(room, pointer);
            this.money-=100;
            updateMoneyDisplay(this.money);
            //places the new item
            placeables[nextItem](nextItem===0? beampreview : mirrorpreview, direction, this);
            
            this.children.depthSort();
            nextItem = Math.random()<.6? 0 : 1;
            let showBeam = (nextItem===0)? true : false;
            beampreview.setVisible(showBeam);
            beamorigin.setVisible(showBeam);
            mirrorpreview.setVisible(!showBeam);
            
            beamui.setVisible(showBeam);
            mirrorui.setVisible(!showBeam);
            if(nextItem === 1){
                let overlap = false;
                this.physics.world.overlap(mirrorpreview, this.mirrors, function(){
                    overlap = true;
                }, null, this);
                if(overlap){
                    background.disableInteractive();
                }else{
                    background.setInteractive();
                }
                mirrorpreview.setVisible(!overlap);
            }
        }, this);  
        /**
         * END OBJECT PLACEMENT
         */
        
        /**
         * LIGHTING STUFF
         */
        room.setPipeline('Light2D');
        this.cursorspotlight  = this.lights.addLight(this.input.activePointer.x, this.input.activePointer.y, 250).setScrollFactor(0.0).setIntensity(0.8);

        this.lights.enable().setAmbientColor(0xbbbbbb);
        
        let shadowImage = this.add.tileSprite(room.x,room.y,room.width,room.height,'laser_preview').setOrigin(0);
        shadowImage.setBlendMode(Phaser.BlendModes.MULTIPLY);

        let orange = this.lights.addLight(0, 100, 300).setColor(0xeaac00).setIntensity(0.8);
        orange.delay=3.14;
        let teal = this.lights.addLight(0, 100, 300).setColor(0x26afff).setIntensity(1.0);
        teal.delay=0;
        /**
         * END LIGHTING STUFF
         */

        /**
         * SHADER STUFF
         */
        let shader2 = new Shader(this.sys.game, 
                                undefined, 
                                this.cache.shader.get('crt_fragment'));
        let shader = new Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline({
            game: this.sys.game, 
            renderer: this.sys.game.renderer,
            fragShader: this.cache.shader.get('crt_fragment')
        });
        //creates a new shader if it hasn't been created yet
        let shaderPipeline = this.sys.game.renderer.pipelines['CRT'];
        if(!shaderPipeline){
            console.log('created CRT shader');
            shaderPipeline = this.sys.game.renderer.addPipeline('CRT', shader);
        }
        shaderPipeline.setFloat2('inputResolution', this.game.config.width, this.game.config.height);
        shaderPipeline.setFloat2('outputResolution', this.game.config.width, this.game.config.height);
        shaderPipeline.setFloat2('TextureSize', 400.0, 300.0);
        shaderPipeline.setFloat2('mouse', this.input.activePointer.x, this.input.activePointer.y);
        

        //toggles between visible shader and disabled shader
        this.input.on('pointerdown', function(pointer){
            //this.cameras.main.shake(150, 0.01);
            if(this.cameras.main.pipeline === shaderPipeline){
                //this.cameras.main.clearRenderToTexture();
            }
            else{
                //this.cameras.main.setRenderToTexture('CRT');
            }
        }, this);
        this.input.keyboard.once('keydown_ESC', function(event){
            this.scene.launch('Transition', {
                from:this.scene.key, 
                to:'MainMenu'
            });
        }, this);
        //pipelines can be used on individual images or sprites
        //room.setPipeline('CRT');
        //this.cameras.main.setRenderToTexture();
        /**
         * END SHADER STUFF
         */

        this.input.on('pointermove', function (pointer) {
            this.cursorspotlight.x = pointer.x;
            if(this.cameras.main.pipeline !== null){
                this.cursorspotlight.y = 600-pointer.y; //y is inverted when camera has setrendertotexture;
            }else{
                this.cursorspotlight.y = pointer.y;
            }
            //this.shaderPipeline.setFloat2('mouse', pointer.x, pointer.y);
            if(direction===0 || direction===2){
                let clampX = Phaser.Math.Clamp(Math.floor(pointer.x), room.getTopLeft().x+ROOM_PADDING_L, room.getBottomRight().x-ROOM_PADDING_L);
                beampreview.x = clampX
                if(direction===0){
                    beamorigin.setPosition(clampX, room.y-ROOM_HEIGHT);
                }else{
                    beamorigin.setPosition(clampX, room.getBottomRight().y-8-ROOM_HEIGHT);
                }
            }else{
               let clampY = Phaser.Math.Clamp(Math.floor(pointer.y), room.getTopLeft().y+ROOM_PADDING_L-ROOM_HEIGHT, room.getBottomRight().y-ROOM_PADDING_L-ROOM_HEIGHT);
               beampreview.y = clampY;
               if(direction===3){
                    beamorigin.setPosition(room.x, clampY);
                }else{
                    beamorigin.setPosition(room.getBottomRight().x-8, clampY);
                }
            }                
            mirrorpreview.x = Phaser.Math.Clamp(Math.floor(pointer.x), room.getTopLeft().x+ROOM_PADDING_L, room.getBottomRight().x-ROOM_PADDING_L);
            mirrorpreview.y = Phaser.Math.Clamp(Math.floor(pointer.y), room.getTopLeft().y+ROOM_PADDING_L-ROOM_HEIGHT, room.getBottomRight().y-ROOM_PADDING_L-ROOM_HEIGHT);
            if(nextItem === 1){
                let overlap = false;
                this.physics.world.overlap(mirrorpreview, this.mirrors, function(){
                    overlap = true;
                }, null, this);
                if(overlap){
                    background.disableInteractive();
                }else{
                    background.setInteractive();
                }
                mirrorpreview.setVisible(!overlap);
            }
            
        }, this);
        this.animdirs=[
            {x:0,y:-0.5},
            {x:0.5,y:0},
            {x:0,y:0.5},
            {x:-0.5,y:0}
        ];
        this.shadows = this.add.graphics();
        this.shadows.fillStyle(0x000000,1);
        shadowImage.setMask(new Phaser.Display.Masks.GeometryMask(this, this.shadows));
        this.shadows.setVisible(false);
    }
    update()
    {   
        var pointer = this.input.activePointer;
        this.shadows.clear();
        this.mirrors.children.each(function(mirror){
            //console.log(pointer);
            var corners = [
                new Phaser.Geom.Point(mirror.getBottomRight().x, mirror.getTopLeft().y),
                new Phaser.Geom.Point(mirror.getBottomRight().x, mirror.getBottomRight().y),
                new Phaser.Geom.Point(mirror.getTopLeft().x, mirror.getBottomRight().y),
                new Phaser.Geom.Point(mirror.getTopLeft().x, mirror.getTopLeft().y)
            ];
            let mod = mirror.direction[0]%2==0? 1 : -1;
            corners.splice((mirror.direction[0]-mirror.direction[1]-mod),1);
            let rays = [];
            for(let i=0;i<corners.length;i++){
                let c = corners[i];
                var angle = Phaser.Math.Angle.Between(pointer.x, pointer.y, c.x, c.y);
                var ray = new Phaser.Geom.Line();
                var dist = Phaser.Math.Distance.Between(c.x, c.y, pointer.x, pointer.y);
                ray = Phaser.Geom.Line.SetToAngle(ray, c.x, c.y, angle, dist/4);
                rays.push(ray);
            }
            for(let i=0;i<rays.length;i++){
                let r1 = rays[i];
                let r2 = rays[(i+1)%rays.length];
                
                this.shadows.fillPoints([r1.getPointA(), r2.getPointA(),r2.getPointB(), r1.getPointB()],true);
            }
        },this);
        if(this.queueEnd === true){
            //console.log(this);
            this.scene.launch('Transition', {
                from:this.scene.key,
                to: 'ClassicMode',
                data: {
                    money: this.money,
                    difficulty: this.scene.settings.data.difficulty+1
                }
            });
            this.queueEnd = false;
        }
        //this.shaderPipeline.setFloat1('time', this.time.now);
        this.enemies.children.each(function(child){
            var angle = Phaser.Math.Angle.Between(pointer.x, pointer.y, child.x, child.y);
            var ray = new Phaser.Geom.Line();
            var dist = Phaser.Math.Distance.Between(child.x, child.y, pointer.x, pointer.y);
            ray = Phaser.Geom.Line.SetToAngle(ray, child.x, child.y, angle, (dist/15));
            var ellipse = new Phaser.Curves.Ellipse(ray.getPointB().x, ray.getPointB().y, (dist/15)+20,((dist/50))+20);
            ellipse.setRotation(Phaser.Geom.Line.Angle(ray));
            //console.log(ray.angle);
            
            //this.shadows.strokeLineShape(ray);
            this.shadows.fillEllipseShape(ellipse);
            //ellipse.draw(this.shadows);
            if(child.data.values.onTarget === false){
                child.data.values.captureTime=Math.max(child.data.values.captureTime-1,0);
            }
            child.data.values.onTarget = false;
            //console.log(child.data.values.captureTime);
        },this);
        this.laserGrid.children.each(function(laser){
            //laser.animFrameTime++;
            //if(laser.animFrameTime % 8 === 0){
            //    laser.setFrame('laser_'+laser.animFrame);
            //    laser.animFrame = (laser.animFrame + 1)%3;
            //}
            laser.tilePositionY += this.animdirs[laser.direction].y;
            laser.tilePositionX += this.animdirs[laser.direction].x;
            
            //console.log(laser.frame);
        }, this);
        let scene = this.scene.get('ClassicMode');
        this.lights.forEachLight(function(currLight){
            if(currLight!==scene.cursorspotlight){
                currLight.x = 400+Math.sin(scene.time.now/1000+currLight.delay) * 250;
                currLight.y = 300+Math.sin(scene.time.now/500+currLight.delay) * 130;
                if(scene.cameras.main.pipeline !== null){
                    currLight.y = 600-currLight.y; //y is inverted when camera has setrendertotexture;
                }
            }
        });
        
        //console.log(this.children);
    }
}

export class ClassicModeRender extends Phaser.Scene{
    constructor(){
        super({key: 'ClassicModeRender', active: false});
        this.rt;
    }
    preload(){        
        this.load.image('wipe_mask', 'assets/images/effect/wipe_mask.png');
    }
    create(data){
        this.rt = this.add.renderTexture(0, 0, 800, 600).setVisible(false);

        this.rt.saveTexture('classictexture');

        let rendertexture = this.add.image(0,0,'classictexture').setOrigin(0,0);
        
        
        let wipe_mask = this.add.image(800,0,'wipe_mask').setOrigin(0,0);
        wipe_mask.setVisible(false);
        let rendermask = new Phaser.Display.Masks.BitmapMask(this, wipe_mask);
        //rendermask.invertAlpha = false;
        rendertexture.mask = rendermask;
        let tween = this.tweens.add({
            targets: wipe_mask,
            x:-473,
            duration:1000,
            paused: true,
        });
        this.input.keyboard.once('keydown_ESC', function(event){
            rendermask.invertAlpha = true;
            tween.setCallback('onComplete', function(){
                console.log('stopped '+this.scene.key);
                this.scene.stop();
                this.scene.stop('ClassicMode');
            }, [wipe_mask], this); 
            this.scene.launch('Transition', this.scene.key);
            tween.restart();
        }, this);
        tween.setCallback('onComplete', function(){
            console.log('stopped '+data);
            this.scene.stop();
        }, [wipe_mask], this.scene.get(data));
        tween.restart();
    }
    update(){
        var gameScene = this.scene.get('ClassicMode');
        
        //this.rt.clear();
        this.rt.draw(gameScene.children,0,0);
    }
}