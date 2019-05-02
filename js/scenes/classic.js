import  {GrayscalePipeline} from '../shader/pipelines.js'

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
        if(mirror.direction[0]===this.NONE && mirror.direction[1]===this.NONE){
            //do nothing
        }
        else if(mirror.direction[0]===laser.direction){
            outputdir = mirror.direction[1];
        }else if((mirror.direction[1]+2)%4===laser.direction){
            outputdir = (mirror.direction[0]+2)%4;
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
            
        }else if(   (mirror.direction[0] === this.WEST && mirror.direction[1] === this.SOUTH) || 
                    (mirror.direction[0] === this.EAST && mirror.direction[1] === this.NORTH)){
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
        this.load.image('laser_preview_shadow', 'assets/images/classic/laser_preview_shadow.png');

        this.load.image('shadow', 'assets/images/classic/shadow.png');
        this.load.image('noodle_noise', 'assets/images/classic/noodle_noise.png');
        this.load.image('mirror', 'assets/images/classic/mirror.png');
        this.load.image('mirror_preview', 'assets/images/classic/mirror_preview.png');
        this.load.image('mirror_preview_shadow', 'assets/images/classic/mirror_preview_shadow.png');
        this.load.image('item_box', 'assets/images/classic/item_box.png');
        this.load.image('info_button', 'assets/images/classic/info_button.png');

        this.load.image('delete_cursor', 'assets/images/classic/delete_cursor.png');
        this.load.image('confuse_cursor', 'assets/images/classic/confuse_cursor.png');

        this.load.image('target', 'assets/images/classic/target.png');
        this.load.image('targetsurround', 'assets/images/classic/targetsurround.png');
        this.load.image('smallcage', 'assets/images/classic/smallcage.png');
        this.load.image('corner', 'assets/images/classic/corner.png');

        this.load.image('laser_ui', 'assets/images/classic/laser_ui.png');
        this.load.image('mirror_ui', 'assets/images/classic/mirror_ui.png');

        this.load.atlas('hero_walk', 'assets/images/classic/hero_walk.png', 'assets/images/classic/hero_walk_atlas.json');
        this.load.atlas('hero_head', 'assets/images/classic/hero_head.png', 'assets/images/classic/hero_head_atlas.json');
        this.load.glsl('crt_fragment', 'js/shader/crt2.fs');
        //this.load.glsl('grayscale', 'js/shader/grayscale.fs');
        this.load.json('abilities', 'assets/config/abilities.json');

        this.load.audio('wasted', 'assets/sounds/classic/wasted.mp3');
        this.load.audio('trap', 'assets/sounds/classic/trap.mp3');
    }

    destroyLaser(laser){
        if(laser.child){
            this.destroyLaser(laser.child);
            //cannot do this because sometimes a laser hits a mirror without reflecting
            //i.e. on the non-diagonal side
            //delete laser.child.parentMirror.incomingLasers[laser.mirrorIndex];
        }
        if(laser.childMirror){
            delete laser.childMirror.incomingLasers[laser.mirrorIndex];
        }
        laser.bg.destroy();
        laser.fg.destroy();
        this.laserGrid.remove(laser, true, true);
        laser = null;
    }
    destroyMirror(mirror){
        let lasers = mirror.incomingLasers;
        let room = this.room;
        mirror.setName('orphan'); //this is to warn anything using it that it should have been cut off from the game
        this.mirrors.remove(mirror,true,true);
        if(lasers.length>0){
            for(let i = 0; i<lasers.length;i++){
                if(lasers[i]){
                    let laser = lasers[i];
                    //a mirror that has an incoming laser does not necessarily have an outgoing child
                    //since the laser could have stopped on a non-reflective side of the mirror
                    if(laser.child){
                        this.destroyLaser(laser.child);
                        laser.child=null;
                    }
                    if(laser.direction===directions.SOUTH){
                        laser.height=room.getBottomRight().y-laser.y;
                        laser.bg.height = laser.height;
                        laser.fg.height = laser.height;
                    }else if(laser.direction===directions.WEST){
                        laser.width=laser.x-room.getTopLeft().x;
                        laser.bg.width = laser.width;
                        laser.fg.width = laser.width;
                    }else if(laser.direction===directions.NORTH){
                        laser.height=laser.y-room.getTopLeft().y;
                        laser.bg.height = laser.height;
                        laser.fg.height = laser.height;
                    }else if(laser.direction===directions.EAST){
                        laser.width=room.getBottomRight().x-laser.x;
                        laser.bg.width = laser.width;
                        laser.fg.width = laser.width;
                    }
                    delete laser.childMirror;
                    laser.body.updateFromGameObject();
                    let data = undefined;
                    this.physics.world.overlap(laser, this.mirrors, function(_laser, _mirror){
                        _laser.childMirror=_mirror;
                        _laser.mirrorIndex=_mirror.incomingLasers.length;
                        _mirror.incomingLasers.push(_laser);
                        data = directions.reflect(_mirror, _laser);
                    }, function(_laser, _mirror){
                        return _mirror!==_laser.parentMirror;
                    }, this);
                    //after all obstacle checks are done, this ensures the laser body is at its final size
                    //and the last mirror touched is the relevant data
                    if(data && data.direction!==directions.NONE){
                        laser.child = this.makeLaserRecursive(room, data, data.direction, data.mirror);
                        laser.child.parent=laser;
                    }
                }
            }
        }
        mirror=null;
    }

    makeLaserRecursive(room, coord, direction, parentMirror){
        let laser = undefined;
        if(direction === directions.SOUTH){
            laser = this.add.tileSprite(coord.x, coord.y, 4, room.getBottomRight().y-room.y_offset-coord.y, 'noodle_noise').setOrigin(0.5, 0);
            laser.bg = this.add.tileSprite(coord.x, coord.y, 6, room.getBottomRight().y-room.y_offset-coord.y, 'laser_bg').setOrigin(0.5, 0);
            laser.fg = this.add.tileSprite(coord.x, coord.y, 2, room.getBottomRight().y-room.y_offset-coord.y, 'laser_fg').setOrigin(0.5, 0);
            laser.setTileScale(1,6);
        }else if(direction === directions.WEST){
            laser = this.add.tileSprite(coord.x, coord.y, coord.x-room.getTopLeft().x, 4, 'noodle_noise').setOrigin(1, 0.5);
            laser.bg = this.add.tileSprite(coord.x, coord.y, coord.x-room.getTopLeft().x, 6, 'laser_bg').setOrigin(1, 0.5);
            laser.fg = this.add.tileSprite(coord.x, coord.y, coord.x-room.getTopLeft().x, 2, 'laser_fg').setOrigin(1, 0.5);
            laser.setTileScale(6,1);
        }else if(direction === directions.NORTH){
            laser = this.add.tileSprite(coord.x, coord.y, 4, coord.y-room.getTopLeft().y+room.y_offset, 'noodle_noise').setOrigin(0.5, 1);
            laser.bg = this.add.tileSprite(coord.x, coord.y, 6, coord.y-room.getTopLeft().y+room.y_offset, 'laser_bg').setOrigin(0.5, 1);
            laser.fg = this.add.tileSprite(coord.x, coord.y, 2, coord.y-room.getTopLeft().y+room.y_offset, 'laser_fg').setOrigin(0.5, 1);
            laser.setTileScale(1,6);
        }else if(direction === directions.EAST){
            laser = this.add.tileSprite(coord.x, coord.y, room.getBottomRight().x-coord.x, 4, 'noodle_noise').setOrigin(0, 0.5);
            laser.bg = this.add.tileSprite(coord.x, coord.y, room.getBottomRight().x-coord.x, 6, 'laser_bg').setOrigin(0, 0.5);
            laser.fg = this.add.tileSprite(coord.x, coord.y, room.getBottomRight().x-coord.x, 2, 'laser_fg').setOrigin(0, 0.5);
            laser.setTileScale(6,1);
        }
        if(laser!==undefined){           
            laser.direction = direction;
            laser.parentMirror = parentMirror;
            laser.setBlendMode(Phaser.BlendModes.ADD);
            laser.alpha=0.7;
            laser.fg.setBlendMode(Phaser.BlendModes.ADD);
            laser.fg.alpha=0.7;
            laser.bg.setBlendMode(Phaser.BlendModes.ADD);
            //laser.animFrame = 0;
            //laser.animFrameTime = 6;
            laser.setTilePosition(Math.random()*128,Math.random()*128);
            this.laserGrid.add(laser);
            let data = undefined;
            this.physics.world.overlap(laser, this.mirrors, function(_laser, _mirror){
                data = directions.reflect(_mirror, _laser);
            }, function(_laser, _mirror){
                return _mirror!==_laser.parentMirror;
            }, this);
            //after all obstacle checks are done, this ensures the laser body is at its final size
            //and the last mirror touched is the relevant data
            if(data){
                //which index of the mirror's incoming lasers is this laser at?
                laser.childMirror=data.mirror;
                laser.mirrorIndex=data.mirror.incomingLasers.length;
                data.mirror.incomingLasers.push(laser);
                if(data.direction!==directions.NONE){
                    laser.child = this.makeLaserRecursive(room, data, data.direction, data.mirror);
                    laser.child.parent=laser;
                }
                
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
        let item = this.add.sprite(pointer.x, pointer.y, textureKey).disableInteractive();
        item.on('pointerdown', function(){
            this.destroyMirror(item);
            this.updateMoneyDisplay(this.money-=this.abilities.delete.cost);
        },this);
        item.incomingLasers = [];
        this.mirrors.add(item);
        
        //make sure directions in/out are ordered clockwise
        let tl = item.getTopLeft();
        let br = item.getBottomRight();
        item.corners = [{x: tl.x, y: tl.y},
                        {x: br.x, y: tl.y},
                        {x: br.x, y: br.y},
                        {x: tl.x, y: br.y}];
        item.body.position = {x:tl.x+3, y:tl.y+2}
        item.body.height = item.height-4;
        item.body.width = item.width-5;
        if(type===0){
            item.direction = [directions.SOUTH, directions.EAST];
            item.corners.splice(1,1);
        }else if(type===1){
            item.direction = [directions.WEST, directions.SOUTH];
            item.corners.splice(2,1);
            item.angle=90; 
        }else if(type===2){
            item.direction = [directions.NORTH, directions.WEST];
            item.corners.splice(3,1); 
            item.angle = 180;
        }else if(type===3){
            item.direction = [directions.EAST, directions.NORTH];
            item.corners.splice(0,1); 
            item.angle = 270;
        }else{
            //item has no direction
            item.direction = [directions.NONE, directions.NONE];
        }
        
        this.physics.world.overlap(this.laserGrid, item, function(mirror, laser){
            //which index of the mirror's incoming lasers is this laser at?
            if(laser.childMirror){
                delete laser.childMirror.incomingLasers[laser.mirrorIndex];
            }
            laser.childMirror=mirror;
            laser.mirrorIndex=mirror.incomingLasers.length;
            mirror.incomingLasers.push(laser);
            let data = directions.reflect(mirror, laser);
            //if the laser has been interrupted by this item, destroy it recursively
            if(laser.child){
                this.destroyLaser(laser.child);
            }
            //and construct a new child laser from this mirror instead
            if(data.direction!=directions.NONE){
                laser.child = this.makeLaserRecursive(room, data, data.direction, mirror);
                //after the laser has reflected, the new child remembers its origin mirror
                laser.child.parent=laser;
            }
        }, null, this);
        //all items are above all lasers
        item.depth = 2;
        return item;
    }
     //b is hero body, t is target
     cornerCoords(b,t){
        let bTL = {x: b.x-b.width/2, y: b.y-b.height/2};
        let bBR = {x: b.x+b.width/2, y: b.y+b.height/2};
        let tTL = t.getTopLeft();
        let tBR = t.getBottomRight();
        let minX = Math.min(bTL.x, tTL.x);
        let maxX = Math.max(bBR.x, tBR.x);
        let minY = Math.min(bTL.y, tTL.y);
        let maxY = Math.max(bBR.y, tBR.y);

        //ordered from top left, clockwise
        return [{x:minX, y:minY},
                {x:maxX, y:minY},
                {x:maxX, y:maxY},
                {x:minX, y:maxY}];
    }

    create(data)
    {       
        //this.scene.setVisible(false, 'ClassicMode');
        this.scene.run('UI',data);
        this.scene.pause();
        /**
         * UI STUFF
         */
        let background = this.add.tileSprite(0,0,this.sys.canvas.width, this.sys.canvas.height,'background').setOrigin(0).setInteractive();
        this.background = background;
        let ROOM_PADDING_L = 16;
        let ROOM_HEIGHT = 0;
        let room = this.add.tileSprite(40,60+ROOM_HEIGHT, 720, 480, 'floor').setOrigin(0);
        room.setScrollFactor(0);
        
        this.room = room;
        let vignette = this.add.image(40,60+ROOM_HEIGHT, 'vignette').setOrigin(0);
        let room_border = this.add.image(room.getTopLeft().x-3,room.getTopLeft().y-3,'room_border').setOrigin(0);
        //let rear_wall = this.add.image(room.getTopLeft().x-3, 40-3, 'rear_wall').setOrigin(0);
        //let front_wall = this.add.image(room.getTopLeft().x-3, room.getBottomRight().y+3, 'rear_wall').setOrigin(0,1).setDepth(4);
        
        room.y_offset = ROOM_HEIGHT;

        let moneydisplay = this.add.text(room.getBottomRight().x, 22, '0000000',{
            fontFamily:'"Roboto Mono", monospace',
            fontSize:32,
            color: '#ffdd00'
        }).setOrigin(1, 0.5);

        this.abilities = this.cache.json.get('abilities');

        let scene = this;
        let countdown = undefined;
        let number = undefined;

        let cam = this.cameras.main;
        let camx=0;
        let camy=0;
        let losecamera = this.tweens.add({
            targets: this.cameras.main,
            props:{
                x:{
                    value:{
                        getEnd: ()=>{return camx = Phaser.Math.Between(-80,80)},
                        getStart: ()=>{return camx}
                    },
                    duration:3000, 
                    repeat:-1, 
                    ease: 'Quad.easeInOut'
                },
                y:{
                    value:{
                        getEnd: ()=>{return camy = Phaser.Math.Between(-60,60)},
                        getStart: ()=>{return camy}
                    },
                    duration:4000, 
                    repeat:-1, 
                    ease: 'Quad.easeInOut'
                },
                rotation:{
                    value:.002,
                    repeat:-1,
                    yoyo:true,
                    duration:2000,
                    ease: 'Quad.easeInOut'
                }
            },
            onRepeat: (twee)=>{
            },
            paused:true
        });

        let updateMoneyDisplay = function(money){
            let result = '$'+String(Math.abs(money)).padStart(7,' ');
            if(money<=0){
                if(money<0){
                    result = '-'+result;
                }
                moneydisplay.setColor('#d81313');
                
                if(!countdown){
                    number = scene.add.text(400,300,'3',{
                        fontFamily:'"Roboto Mono", monospace',
                        fontSize:256,
                    }).setOrigin(0.5);
                    number.setDepth(10);
                    let numbereffect = scene.tweens.add({
                        targets: [number],
                        scaleX: 1.5,
                        scaleY: 1.5,
                        alpha:0,
                        duration:900,
                    });
                    countdown = scene.time.addEvent({
                        delay: 1000,
                        repeat: 2,
                        callback: function(){
                            numbereffect.restart();
                            if(countdown && countdown.repeatCount===0){
                                //LOSE GAME
                                this.sound.play('wasted');
                                this.cameras.main.zoom=1.10;
                                this.background.disableInteractive();
                                losecamera.play();
                                scene.room.resetPipeline();
                                //scene.room.flipY=true;
                                scene.cameras.main.setRenderToTexture('Grayscale');
                                number.destroy();
                                this.scene.stop('Dialog');
                                this.scene.get('UI').events.emit('Lose', [scene.money, data.difficulty]);
                            }else if(countdown){
                                number.setText(countdown.repeatCount);
                            }
                        },
                        callbackScope: scene
                    });
                }
            }else{
                if(countdown){
                    countdown.destroy();
                    countdown = undefined;
                    if(number){
                        number.destroy();
                        number = undefined;
                    }
                }
                moneydisplay.setColor('#ffdd00');
            }
            moneydisplay.setText(result);
        };
        this.updateMoneyDisplay = updateMoneyDisplay;

        updateMoneyDisplay(this.money=data.money);

        let beamui = this.add.image(720,520, 'laser_ui').setOrigin(0).setDepth(5);
        let mirrorui = this.add.image(720,520, 'mirror_ui').setOrigin(0).setDepth(5);
        /**
         * END UI STUFF
         */

        let placeables=[
            function(pointer, direction, scene){
                updateMoneyDisplay(scene.money-=scene.abilities.laser.cost);
                return scene.makeLaserOrigin(room, {x:pointer.x, y:pointer.y}, direction);
            },
            function(pointer, direction, scene){
                updateMoneyDisplay(scene.money-=scene.abilities.mirror.cost);
                return scene.makeItem(room, {x:pointer.x, y:pointer.y}, 'mirror', direction);
            },
            function(){

            }
        ];
        
        /**
         * PHYSICS
         */
        
        this.physics.world.setBounds(room.x, room.y, room.width, room.height);

        //groups representing placed items in the room
        this.laserGrid = this.physics.add.staticGroup();
        this.mirrors = this.physics.add.staticGroup();

        //enemies in the room
        this.enemies = this.physics.add.group();
        //LEVEL CLEAR
        this.enemies.removeCallback = function(child){
            //checks for active transition, because otherwise it might start the thing twice
            if(this.children.size===0 && !scene.scene.isActive('Transition')){
                scene.placeMode = false;
                scene.scene.get('UI').events.emit('Clear', [scene.money, data.difficulty]);
                scene.enemies.removeCallback = undefined;
            }
        };
        /**
         * ENEMY AND TARGET PLACEMENT
         */
        let requiredCaptureTime = 200;
        let num_enemies = Math.min(2+Math.max(Math.floor((data.difficulty-1)/3),0),7);
        let speedRange = [150,200];
        let speedmod=0;
        if(data.difficulty<4){
            speedmod=(data.difficulty%4)*33;
        }else if(data.difficulty<16){
            speedmod = data.difficulty*10+((data.difficulty-1)%3)*50;
        }else{
            speedmod=100+(data.difficulty-16)*33;
        }
        //let speedRange = [150,200]


        var leganim = this.anims.get('hero_legs');
        var armanim = this.anims.get('hero_arms');
        if(leganim === undefined){
            leganim = this.anims.create({
                key:'hero_legs',
                frames: this.anims.generateFrameNames('hero_walk', {prefix:'walk_legs_', start:0, end:16}),
                frameRate: 64,
                repeat:-1
            });
        }
        if(armanim === undefined){
            armanim = this.anims.create({
                key:'hero_arms',
                frames: this.anims.generateFrameNames('hero_walk', {prefix:'walk_arms_', start:0, end:16}),
                frameRate: 64,
                repeat:-1
            });
        }

        var smokeanim = this.anims.get('smoke');
        if(smokeanim === undefined){
            smokeanim = this.anims.create({
                key:'smoke',
                frames: this.anims.generateFrameNames('particles', {prefix:'particle_', start:96, end:116}),
                frameRate: 60,
                repeat:0
            });
        }

        class AnimatedParticle extends Phaser.GameObjects.Particles.Particle
        {
            constructor (emitter, anim)
            {
                super(emitter);

                this.t = 0;
                this.i = 0;
                this.anim = anim;
            }

            update (delta, step, processors)
            {
                var result = super.update(delta, step, processors);

                this.t += delta;

                if (this.t >= this.life/this.anim.frames.length)
                {
                    this.i++;

                    if (this.i > this.anim.frames.length-1)
                    {
                        this.i = 0;
                        if(this.anim.repeat != -1){
                            return true;
                        }
                    }
                    this.frame = this.anim.frames[this.i].frame;

                    this.t -= this.life/this.anim.frames.length;
                }

                return result;
            }
        }
        class smokePart extends AnimatedParticle{
            constructor(emitter){
                super(emitter, smokeanim);
            }
        }

        let particles = this.add.particles('particles');
        var smokeEmitter = particles.createEmitter({
            frame: 'particle_96',
            x:0, y:0,
            speed: {min:200, max:400},
            lifespan: { min: 200, max: 300 },
            quantity:40,
            alpha: {start: 0.6, end:0.1},
            scale: 4,
            on:false,
            particleClass: smokePart,
            //blendMode: 'MULTIPLY',
        });
        
        let trapSound = this.sound.add('trap', {volume:0.3});

        let angleRange = [20,70];
        let colors = [0xe03131, 0x31e04b, 0x498bf4, 0xe07731, 0x9431e0, 0xe0cb31, 0xffffff];
        for(var i = 0; i<num_enemies; i++){
            var legs = this.add.sprite(0,0,'hero_walk').play('hero_legs');
            var arms = this.add.sprite(0,0,'hero_walk').play('hero_arms');
            let headidx = Phaser.Math.Between(0,8);
            var head = this.add.image(0,0,'hero_head', 'hero_head_'+headidx);
            let container = this.add.container(0,0,[legs, arms, head]);
            container.setSize(32,32);
            this.enemies.add(container);
            this.physics.world.enable(container);
            container.body.setBounce(1,1).setCollideWorldBounds(true);
            container.setRandomPosition(40+container.displayOriginX+1, 60+container.displayOriginY+1, room.width-(container.width+2),room.height-(container.height+2));
            container.setDepth(1);
            let color = Phaser.Display.Color.ValueToColor(colors[i]);
            color.darken(30);
            legs.setTint(color.color);
            arms.setTint(colors[i]);
            container.setData('captureTime',0);
            let angle = Phaser.Math.Between(angleRange[0],angleRange[1]);
            angle = angle+(90*Phaser.Math.Between(0,3));
            let speed = Phaser.Math.Between(speedRange[0],speedRange[1])+speedmod;
            container.originalSpeed = speed;
            
            legs.anims.msPerFrame = (69*150)/(speed);
            arms.anims.msPerFrame = legs.anims.msPerFrame;
            this.physics.velocityFromAngle(angle,speed,container.body.velocity);
            
            //this.physics.add.existing(container);
            container.body.setSize(32,32);
            container.angle=angle;
            
            container.body.onWorldBounds = true;

            let t = this.physics.add.image(0,0,'target');
            t.setRandomPosition(40+t.displayOriginX+1, 60+t.displayOriginY+1, room.width-(t.width+2),room.height-(t.height+2));
            t.setDepth(0);
            t.setTint(colors[i]);
            this.add.image(t.x,t.y,'targetsurround').setDepth(0);
            container.data.values.target = t;
            this.physics.add.overlap(container,t,function(_b, _t){
                _b.setData('onTarget',true);
                _b.data.values.captureTime++;
                if(_b.data.values.captureTime>=50){
                    //create the bounding box display while hero is being captured
                    if(_b.corners===undefined){
                        _b.corners = [];
                        let coords = this.cornerCoords(_b,_t);
                        for(let i=0;i<coords.length;i++){
                            let cornersprite = this.add.sprite(coords[i].x,coords[i].y,'corner')
                            cornersprite.alpha=0.8;
                            cornersprite.setBlendMode(Phaser.BlendModes.ADD);
                            cornersprite.angle=i*90;
                            _b.corners.push(cornersprite);
                        }
                    }
                }
                if(_b.data.values.captureTime >= requiredCaptureTime){
                    
                    smokeEmitter.setPosition(_t.x, _t.y);
                    _b.setPosition(_t.x, _t.y);
                    _b.each((part)=>{
                        console.log(part);
                        if(part.type==="Sprite"){
                            part.anims.stop();
                        }
                        
                    });
                    smokeEmitter.explode();
                    trapSound.play();
                    _b.body.enable = false;
                    //money update has to happen before removal, because removal may
                    //go to next screen, and this means money will be incorrect
                    updateMoneyDisplay(this.money+=600);
                    this.enemies.remove(_b);
                    if(_b.corners!==undefined){
                        for(let i=0;i<_b.corners.length;i++){
                            _b.corners[i].destroy();
                        }
                        _b.corners=undefined;
                    }
                    //_b.destroy();
                    this.makeItem(this.room, {x:_t.x, y:_t.y}, 'smallcage', -1);
                    //TODO play capture animation
                }
            },null,this);
        }
        let collidecallback = function(enemybody){
            enemybody.rotation = enemybody.velocity.angle()*180/3.14;
        }

        this.physics.world.on('worldbounds', collidecallback);

        this.physics.add.collider(this.enemies, this.laserGrid, (enemy, laser)=>collidecallback(enemy.body));
        this.physics.add.collider(this.enemies, this.mirrors, (enemy, mirror)=>collidecallback(enemy.body));
        /**
         * END ENEMY PLACEMENT
         */


        let direction = 0;

        let clampX = Phaser.Math.Clamp(this.input.activePointer.x, room.getTopLeft().x+ROOM_PADDING_L, room.getBottomRight().x-ROOM_PADDING_L);
        let clampY = Phaser.Math.Clamp(this.input.activePointer.y, room.getTopLeft().y+ROOM_PADDING_L, room.getBottomRight().y-ROOM_PADDING_L-ROOM_HEIGHT);
        
        let beampreview = this.add.tileSprite(clampX, 60, 8, room.height, 'laser_preview').setOrigin(0.5, 0);
        
        //beampreview.setBlendMode(overlay);
        beampreview.setOrigin(0.5,0);
        beampreview.alpha=1;
        beampreview.setDepth(10);
        
        let beamorigin = this.add.tileSprite(clampX, 60, 16, 8, 'shadow').setOrigin(0.5,0);
        beamorigin.setBlendMode(Phaser.BlendModes.OVERLAY);

        let delete_cursor = this.add.sprite(this.input.activePointer.x, this.input.activePointer.y, 'delete_cursor').setOrigin(0);
        delete_cursor.setBlendMode(Phaser.BlendModes.ADD);
        delete_cursor.setDepth(10);
        delete_cursor.setVisible(false);
        let confuse_cursor = this.add.sprite(this.input.activePointer.x, this.input.activePointer.y, 'confuse_cursor');
        confuse_cursor.setBlendMode(Phaser.BlendModes.ADD);
        confuse_cursor.setDepth(10);
        confuse_cursor.setVisible(false);

        let mirrorpreview = this.physics.add.sprite(clampX,clampY,'mirror_preview');
        mirrorpreview.body.setSize(30,30);
        
        //mirrorpreview.setBlendMode(Phaser.BlendModes.SCREEN);
        mirrorpreview.setDepth(10);
        //the shadow effect that adds contrast to the light

        let pointer = this.input.activePointer;
        let updateDirection = function(direction){
            if(direction === directions.SOUTH){
                let clampX = Phaser.Math.Clamp(Math.floor(pointer.x), room.getTopLeft().x+ROOM_PADDING_L, room.getBottomRight().x-ROOM_PADDING_L);
                beampreview.setPosition(clampX, room.y);
                beamorigin.setPosition(clampX, room.y);
                beampreview.height=room.height;
            }else if(direction === directions.WEST){
                let clampY = Phaser.Math.Clamp(Math.floor(pointer.y), room.getTopLeft().y+ROOM_PADDING_L-ROOM_HEIGHT, room.getBottomRight().y-ROOM_PADDING_L-ROOM_HEIGHT);
                beampreview.setPosition(room.x+room.width,clampY);
                beamorigin.setPosition(room.x+room.width,clampY);
                beampreview.height=room.width;
            }else if(direction === directions.NORTH){
                let clampX = Phaser.Math.Clamp(Math.floor(pointer.x), room.getTopLeft().x+ROOM_PADDING_L, room.getBottomRight().x-ROOM_PADDING_L);
                beampreview.setPosition(clampX, room.y+room.height);
                beamorigin.setPosition(clampX, room.y+room.height);
                beampreview.height=room.height;
            }else if(direction === directions.EAST){
                let clampY = Phaser.Math.Clamp(Math.floor(pointer.y), room.getTopLeft().y+ROOM_PADDING_L-ROOM_HEIGHT, room.getBottomRight().y-ROOM_PADDING_L-ROOM_HEIGHT);
                beampreview.setPosition(room.x, clampY);
                beamorigin.setPosition(room.x, clampY);
                beampreview.height=room.width;
            }
            mirrorpreview.angle = direction*90;
            beampreview.angle = direction*90;
            beamorigin.angle=direction*90;
        }

        let previewanim = this.tweens.add({
            targets: [beampreview],
            tilePositionY:-32,
            repeat:-1,
            duration:500,
        });

        this.input.on('pointerscroll', function(event){
            direction = ((event.deltaY<0)? direction + 1 : direction + 3)%4;
            updateDirection(direction);
        }, this);

        this.input.keyboard.on('keydown_A', function (event) {
            direction = (direction+3)%4;
            updateDirection(direction);
        }, this);

        let deleteMode=false;
        let confuseMode=false;
        this.placeMode = true;
        //this.events.once('TransitionOver',()=>{this.placeMode=true; this.scene.resume()});
        let mirrorlist=this.mirrors;
        
        this.toggleFunction = function(mode){
            if(mode === 'delete'){
                deleteMode = !deleteMode;
                delete_cursor.setVisible(deleteMode);
            }else if(mode === 'confuse'){
                confuseMode = !confuseMode;
                confuse_cursor.setVisible(confuseMode);
            }
            if(deleteMode || confuseMode){
                beampreview.setVisible(false);
                beamorigin.setVisible(false);
                mirrorpreview.setVisible(false);
            }else{
                beampreview.setVisible(showBeam);
                beamorigin.setVisible(showBeam);
                mirrorpreview.setVisible(!showBeam);
            }
            mirrorlist.children.each(function(mirror){
                if(deleteMode){
                    mirror.setInteractive();
                }else{
                    mirror.disableInteractive();
                }
            });
            if(mode === 'delete'){
                return deleteMode;
            }else if(mode === 'confuse'){
                return confuseMode;
            }
            return false; //default
        }

        this.input.keyboard.on('keydown_D', function (event) {
            direction = (direction+1)%4;
            updateDirection(direction);
        }, this);

        let lastItemQueue = [];
        let nextItemQueue = [];
        
        let showBeam;

        let replenishItems = function(){
            while(nextItemQueue.length<2){
                nextItemQueue.push(Math.random()<.6? 0 : 1);
            }
        }
        let updatePreviews = function(){
            showBeam = (nextItemQueue[0]===0)? true : false;
            if(!deleteMode && !confuseMode){
                beampreview.setVisible(showBeam);
                beamorigin.setVisible(showBeam);
                mirrorpreview.setVisible(!showBeam);
            }else{
                beampreview.setVisible(false);
                beamorigin.setVisible(false);
                mirrorpreview.setVisible(false);
            }
            
            beamui.setVisible(showBeam);
            mirrorui.setVisible(!showBeam);
            if(nextItemQueue[0] === 1){
                let overlap = false;
                scene.physics.world.overlap(mirrorpreview, scene.mirrors, function(){
                    overlap = true;
                }, null, this);
                if(overlap){
                    background.disableInteractive();
                }else{
                    background.setInteractive();
                }
                if(!deleteMode && !confuseMode){
                    mirrorpreview.setVisible(!overlap);
                }else{mirrorpreview.setVisible(false)}
            }
        }
        
        replenishItems();
        //whether to show beam or mirror on start
        updatePreviews();
        

        this.undo = function(){
            if(lastItemQueue.length>0){
                let lastItemPlaced = lastItemQueue.pop();
                while(lastItemPlaced!==undefined && lastItemPlaced.item.name==='orphan'){
                    lastItemPlaced = lastItemQueue.pop();
                }
                if(lastItemPlaced){
                    nextItemQueue.unshift(lastItemPlaced.type);
                    updatePreviews();
                    if(lastItemPlaced.type===0){
                        scene.destroyLaser(lastItemPlaced.item);
                    }else if(lastItemPlaced.type===1){
                        scene.destroyMirror(lastItemPlaced.item);
                    }
                    //undo cost
                    updateMoneyDisplay(scene.money-=this.abilities.undo.cost);
                }
            }
        }
        this.swapItem = function(){
            nextItemQueue[0] = 1-nextItemQueue[0];
            updatePreviews();
            updateMoneyDisplay(scene.money-=this.abilities.swap.cost);
        }
        this.slow = function(){
            this.enemies.children.each(function(enemy){
                enemy.originalSpeed = Math.min(100,enemy.originalSpeed);
                this.physics.velocityFromRotation(enemy.body.angle, Math.min(100,enemy.originalSpeed), enemy.body.velocity);
            },this);
            updateMoneyDisplay(scene.money-=this.abilities.slow.cost);
        }

        /**
         * OBJECT PLACEMENT
         */
        background.on('pointerdown', function (pointer) {
            //this.placeObject(room, pointer);
            if(deleteMode){
                this.toggleFunction('delete');
                this.scene.get('UI').events.emit('StopDeleting');
            }else if(confuseMode){
                let hitenemy = false;
                let stuncircle = new Phaser.Geom.Circle(this.input.activePointer.x, this.input.activePointer.y, 60);
                this.enemies.children.each(function(enemy){
                    if(Phaser.Geom.Intersects.CircleToRectangle(stuncircle, enemy.body)){
                        hitenemy = true;
                        enemy.body.stop();
                        if(enemy.stun){
                            enemy.stun.remove();
                        }
                        enemy.stun = this.time.delayedCall(1000, ()=>{
                            let angle = Phaser.Math.Between(angleRange[0],angleRange[1]);
                            angle = angle+(90*Phaser.Math.Between(0,3));
                            this.physics.velocityFromAngle(angle,enemy.originalSpeed,enemy.body.velocity);
                        },this);
                    }
                }, this);
                if(hitenemy){
                    updateMoneyDisplay(this.money-=this.abilities.confuse.cost);
                }
                this.toggleFunction('confuse');
                this.scene.get('UI').events.emit('StopConfusing');
            }else if(this.placeMode){
                //places the new item
                let nextItem = nextItemQueue.shift();
                //updateMoneyDisplay(this.money-=100);
                lastItemQueue.push({
                    item:placeables[nextItem](nextItem===0? beampreview : mirrorpreview, direction, this),
                    cost:100,
                    type:nextItem
                });
                this.children.depthSort();
                updatePreviews();
                
                if(nextItemQueue.length<2){
                    replenishItems();
                }
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
        
        let shadowImage = this.add.tileSprite(room.x,room.y,room.width,room.height,'shadow').setOrigin(0);
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
        /* let shader2 = new Shader(this.sys.game, 
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
        */
        let grayscalePipeline = this.sys.game.renderer.pipelines['Grayscale'];
        if(!grayscalePipeline){
            let grayscalePipeline = this.game.renderer.addPipeline('Grayscale', new GrayscalePipeline(this.game));
        }
        
        this.input.keyboard.once('keydown_ESC', function(event){
            this.scene.stop('Dialog');
            this.scene.run('Transition', {
                from:['ClassicMode','UI'], 
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
                beampreview.x = clampX;
                if(direction===0){
                    beamorigin.setPosition(clampX, room.y-ROOM_HEIGHT);
                }else{
                    beamorigin.setPosition(clampX, room.getBottomRight().y-ROOM_HEIGHT);
                }
            }else{
               let clampY = Phaser.Math.Clamp(Math.floor(pointer.y), room.getTopLeft().y+ROOM_PADDING_L-ROOM_HEIGHT, room.getBottomRight().y-ROOM_PADDING_L-ROOM_HEIGHT);
               beampreview.y = clampY;
               if(direction===3){
                    beamorigin.setPosition(room.x, clampY);
                }else{
                    beamorigin.setPosition(room.getBottomRight().x, clampY);
                }
            }                
            mirrorpreview.x = Phaser.Math.Clamp(Math.floor(pointer.x), room.getTopLeft().x+ROOM_PADDING_L, room.getBottomRight().x-ROOM_PADDING_L);
            mirrorpreview.y = Phaser.Math.Clamp(Math.floor(pointer.y), room.getTopLeft().y+ROOM_PADDING_L-ROOM_HEIGHT, room.getBottomRight().y-ROOM_PADDING_L-ROOM_HEIGHT);
            delete_cursor.x = pointer.x;
            delete_cursor.y = pointer.y;
            confuse_cursor.x = pointer.x;
            confuse_cursor.y = pointer.y;
            if(nextItemQueue[0] === 1 && !deleteMode && !confuseMode){
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
        //this.scene.resume();
    }
    update()
    {   
        var pointer = this.input.activePointer;
        this.shadows.clear();
        this.mirrors.children.each(function(mirror){
            var corners = mirror.corners;
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
        //this.shaderPipeline.setFloat1('time', this.time.now);
        
        /**
         * for each enemy, draw an elliptical shadow.
         * This for-each also decreases the capture time when the hero is not overlapping the target.
         */
        this.enemies.children.each(function(child){
            var angle = Phaser.Math.Angle.Between(pointer.x, pointer.y, child.x, child.y);
            var ray = new Phaser.Geom.Line();
            var dist = Phaser.Math.Distance.Between(child.x, child.y, pointer.x, pointer.y);
            ray = Phaser.Geom.Line.SetToAngle(ray, child.x, child.y, angle, (dist/15));
            var ellipse = new Phaser.Curves.Ellipse(ray.getPointB().x, ray.getPointB().y, (dist/15)+20,((dist/50))+20);
            ellipse.setRotation(Phaser.Geom.Line.Angle(ray));
            
            this.shadows.fillEllipseShape(ellipse);
            //decrease capture counter
            if(child.data.values.onTarget === false){
                child.data.values.captureTime=Math.max(child.data.values.captureTime-1,0);
            }
            if(child.data.values.captureTime>=50){
                if(child.corners!==undefined){
                    let coords = this.cornerCoords(child,child.data.values.target);
                    for(let i=0;i<coords.length;i++){
                        child.corners[i].setPosition(coords[i].x,coords[i].y);
                    }
                }
            }else{
                if(child.corners!==undefined){
                    for(let i=0;i<child.corners.length;i++){
                        child.corners[i].destroy();
                    }
                    child.corners=undefined;
                }
            }
            child.data.values.onTarget = false;
        },this);

        this.laserGrid.children.each(function(laser){
            //laser.animFrameTime++;
            //if(laser.animFrameTime % 8 === 0){
            //    laser.setFrame('laser_'+laser.animFrame);
            //    laser.animFrame = (laser.animFrame + 1)%3;
            //}
            laser.tilePositionY += this.animdirs[laser.direction].y;
            laser.tilePositionX += this.animdirs[laser.direction].x;
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
    }
}
/* 
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
            console.log('stopped tween of '+data);
            this.scene.stop();
        }, [wipe_mask], this.scene.get(data));
        tween.restart();
    }
    update(){
        var gameScene = this.scene.get('ClassicMode');
        
        //this.rt.clear();
        this.rt.draw(gameScene.children,0,0);
    }
} */