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
        this.load.image('vignette', 'assets/images/classic/vignette.png');
        this.load.image('laser_fg', 'assets/images/classic/laser_foreground.png');
        this.load.image('laser_bg', 'assets/images/classic/laser_background.png');
        this.load.image('laser_preview', 'assets/images/classic/laser_preview.png');
        this.load.image('noodle_noise', 'assets/images/classic/noodle_noise.png');
        this.load.image('mirror', 'assets/images/classic/mirror.png');
        this.load.image('mirror_preview', 'assets/images/classic/mirror_preview.png');
        this.load.image('item_box', 'assets/images/classic/item_box.png');
        this.load.image('info_button', 'assets/images/classic/info_button.png');

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
            laser = this.add.tileSprite(coord.x, coord.y, 4, room.getBottomRight().y-coord.y, 'noodle_noise').setOrigin(0.5, 0);
            laser.bg = this.add.tileSprite(coord.x, coord.y, 6, room.getBottomRight().y-coord.y, 'laser_bg').setOrigin(0.5, 0);
            laser.fg = this.add.tileSprite(coord.x, coord.y, 2, room.getBottomRight().y-coord.y, 'laser_fg').setOrigin(0.5, 0);
            laser.setTileScale(1,5);
        }else if(direction === directions.WEST){
            laser = this.add.tileSprite(coord.x, coord.y, coord.x-room.getTopLeft().x, 4, 'noodle_noise').setOrigin(1, 0.5);
            laser.bg = this.add.tileSprite(coord.x, coord.y, coord.x-room.getTopLeft().x, 6, 'laser_bg').setOrigin(1, 0.5);
            laser.fg = this.add.tileSprite(coord.x, coord.y, coord.x-room.getTopLeft().x, 2, 'laser_fg').setOrigin(1, 0.5);
            laser.setTileScale(5,1);
        }else if(direction === directions.NORTH){
            laser = this.add.tileSprite(coord.x, coord.y, 4, coord.y-room.getTopLeft().y, 'noodle_noise').setOrigin(0.5, 1);
            laser.bg = this.add.tileSprite(coord.x, coord.y, 6, coord.y-room.getTopLeft().y, 'laser_bg').setOrigin(0.5, 1);
            laser.fg = this.add.tileSprite(coord.x, coord.y, 2, coord.y-room.getTopLeft().y, 'laser_fg').setOrigin(0.5, 1);
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

    create()
    {       
        /**
         * UI STUFF
         */
        let background = this.add.image(0,0,'background').setOrigin(0).setInteractive();

        let room = this.add.tileSprite(40,60, 720, 480, 'floor').setOrigin(0);
        let vignette = this.add.image(40,60, 'vignette').setOrigin(0);
        let room_border = this.add.image(room.getTopLeft().x-3,room.getTopLeft().y-3,'room_border').setOrigin(0);

        this.score=1000;

        let getScoreString = function(score){
            let result = String(Math.abs(score)).padStart(7,'0');
            if(score<0){
                result = '-'+result;
            }
            return result;
        };

        let scoredisplay = this.add.text(room.getBottomRight().x, 30, '0000000').setOrigin(1, 0.5);
        scoredisplay.setFontSize(24);
        scoredisplay.setFontFamily('"Roboto Mono", monospace');
        
        scoredisplay.setText(getScoreString(this.score));
        this.add.image(720,520,'item_box').setOrigin(0).setDepth(4);
        this.add.image(40,543, 'info_button').setOrigin(0);
        let beamui = this.add.image(720,520, 'laser_ui').setOrigin(0).setDepth(5);
        let mirrorui = this.add.image(720,520, 'mirror_ui').setOrigin(0).setDepth(5);
        /**
         * END UI STUFF
         */


        let ROOM_PADDING_L = 16;
        let ROOM_PADDING_M = 17;
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
        this.laserGrid = this.physics.add.staticGroup();
        this.mirrors = this.physics.add.staticGroup();
        this.enemies = this.physics.add.group();

        //randomly selects laser or item with a higher chance of laser (60% - 40%)
        let nextItem = Math.random()<.6? 0 : 1;
        //let nextItem = 1;
        let direction = 0;

        let clampX = Phaser.Math.Clamp(this.input.activePointer.x, room.getTopLeft().x+ROOM_PADDING_L, room.getBottomRight().x-ROOM_PADDING_L);
        let clampY = Phaser.Math.Clamp(this.input.activePointer.y, room.getTopLeft().y+ROOM_PADDING_L, room.getBottomRight().y-ROOM_PADDING_L);
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

        this.input.on('pointerscroll', function(event){
            direction = ((event.deltaY<0)? direction + 1 : direction + 3)%4;
            if(direction === 0 || direction === 2){
                let clampX = Phaser.Math.Clamp(Math.floor(this.input.activePointer.x), room.getTopLeft().x+ROOM_PADDING_L, room.getBottomRight().x-ROOM_PADDING_L);
                beampreview.setPosition(clampX, room.y);
                beamorigin.setOrigin(0.5,0);
                beamorigin.width = 16;
                beamorigin.height = 8;
                if(direction===0){
                    beamorigin.setPosition(clampX, room.y);
                }else{
                    beamorigin.setPosition(clampX, room.getBottomRight().y-8);
                }
                beampreview.width = 4;
                beampreview.height = room.height;
                beampreview.setOrigin(0.5,0);
            }else{
                let clampY = Phaser.Math.Clamp(Math.floor(this.input.activePointer.y), room.getTopLeft().y+ROOM_PADDING_L, room.getBottomRight().y-ROOM_PADDING_L);
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
        }, this);

        /**
         * ENEMY PLACEMENT
         */
        var rect = new Phaser.Geom.Rectangle(room.getTopLeft().x, room.getTopLeft().y, room.width, room.height);
        var p = Phaser.Geom.Rectangle.Random(rect);
        var b = this.enemies.create(p.x,p.y,'info_button');
        b.setBounce(1,1).setCollideWorldBounds(true);
        b.setVelocity(100,100);
        this.physics.add.existing(b);
        this.physics.add.collider(b, this.laserGrid);
        /**
         * END ENEMY PLACEMENT
         */

        /**
         * OBJECT PLACEMENT
         */
        background.on('pointerdown', function (pointer) {
            //this.placeObject(room, pointer);
            this.score-=100;
            scoredisplay.setText(getScoreString(this.score));
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
        //room.setPipeline('Light2D');
        this.cursorspotlight  = this.lights.addLight(this.input.activePointer.x, this.input.activePointer.y, 250).setScrollFactor(0.0).setIntensity(0.8);

        this.lights.enable().setAmbientColor(0xbbbbbb);


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
                    beamorigin.setPosition(clampX, room.y);
                }else{
                    beamorigin.setPosition(clampX, room.getBottomRight().y-8);
                }
            }else{
               let clampY = Phaser.Math.Clamp(Math.floor(pointer.y), room.getTopLeft().y+ROOM_PADDING_L, room.getBottomRight().y-ROOM_PADDING_L);
               beampreview.y = clampY;
               if(direction===3){
                    beamorigin.setPosition(room.x, clampY);
                }else{
                    beamorigin.setPosition(room.getBottomRight().x-8, clampY);
                }
            }                
            mirrorpreview.x = Phaser.Math.Clamp(Math.floor(pointer.x), room.getTopLeft().x+ROOM_PADDING_L, room.getBottomRight().x-ROOM_PADDING_L);
            mirrorpreview.y = Phaser.Math.Clamp(Math.floor(pointer.y), room.getTopLeft().y+ROOM_PADDING_L, room.getBottomRight().y-ROOM_PADDING_L);
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
        this.scene.launch('ClassicModeRender');
    }
    update()
    {       
        //this.shaderPipeline.setFloat1('time', this.time.now);
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
    create(){
        this.rt = this.add.renderTexture(0, 0, 800, 600).setVisible(false);
        this.scene.setVisible(false, 'ClassicMode');

        this.rt.saveTexture('classictexture');

        let rendertexture = this.add.image(0,0,'classictexture').setOrigin(0,0);
        
        let wipe_mask = this.add.image(800,0,'wipe_mask').setOrigin(0,0);
        wipe_mask.setVisible(false);
        let rendermask = new Phaser.Display.Masks.BitmapMask(this, wipe_mask);
        rendermask.invertAlpha = true;
        rendertexture.mask = rendermask;
        let tween = this.tweens.add({
            targets: wipe_mask,
            x:-473,
            duration:1000,
            paused: true,
        });
        
        this.input.keyboard.once('keydown_ESC', function(event){
           
            tween.setCallback('onComplete', function(){
                //console.log(this.scene);
                this.scene.stop();
                this.scene.get('ClassicMode').scene.stop();
            }, [wipe_mask], this); 
            this.scene.launch('MainMenu');
            tween.restart();
        }, this);
    }
    update(){
        var gameScene = this.scene.get('ClassicMode');
        
        //this.rt.clear();
        this.rt.draw(gameScene.children,0,0);
    }
}