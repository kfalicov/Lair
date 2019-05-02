export class Transition extends Phaser.Scene{
    constructor()
    {
        super('Transition');
    }

    preload()
    {
        this.load.image('lair_view', 'assets/images/menu/lair_view.png');
        this.load.image('lair_shadow', 'assets/images/menu/lair_shadow.png');
        this.load.image('wipe_mask', 'assets/images/effect/wipe_mask.png');
        this.load.image('menu_white', 'assets/images/menu/menu_white.png');

        this.load.atlas('sunmoon', 'assets/images/menu/sunmoon.png', 'assets/images/menu/sunmoon.json');
        this.load.audio('screech', 'assets/sounds/transition/tire_screech.mp3');
        this.load.audio('drive', 'assets/sounds/transition/drive_away.mp3');
        this.load.audio('explode', 'assets/sounds/transition/explode.mp3');

        this.load.atlas('particles', 'assets/images/particle/particles.png', 'assets/images/particle/particles_atlas.json');
    
    }
    create(data)
    {
        this.scene.run('TransitionRender');
        this.scene.setVisible(false);
        
        this.sound.removeByKey('explode');
        this.sound.removeByKey('screech');
        this.sound.removeByKey('drive');

        let background = this.add.tileSprite(0, 0, 800, 450, 'menu_white').setInteractive();
        background.setOrigin(0, 0);

        let c1 = Phaser.Display.Color.HexStringToColor('#70b9ff'); // DAY
        let c2 = Phaser.Display.Color.HexStringToColor('#e01717'); // SUNDOWN
        
        let c3 = Phaser.Display.Color.HexStringToColor('#000b1e'); // NIGHT
        let c4 = Phaser.Display.Color.HexStringToColor('#ff6dd5'); // SUNUP

        let sun = this.add.sprite(200,500, 'sunmoon', 'sun');
        let moon = this.add.sprite(200,500, 'sunmoon', 'moon');

        let lair = this.add.image(0,0,'lair_view').setOrigin(0);
        let shadow = this.add.image(0,600, 'lair_shadow').setOrigin(0,1);
        shadow.setAlpha(0.7);
        shadow.setBlendMode(Phaser.BlendModes.MULTIPLY);

        let sundownHorizon = this.tweens.addCounter({
            paused:true,
            from:c1.h,
            to:1+c2.h,
            duration:900,
            ease:'Cubic.easeIn',
            onUpdate: (twen)=>{
                //let hue = Phaser.Math.Interpolation.CubicBezier(twen.progress, c1.h, .6, .7, 1+c2.h);

                let s = Phaser.Math.Interpolation.SmoothStep(twen.progress, c1.s, c2.s);
                let v = Phaser.Math.Interpolation.SmoothStep(twen.progress, c1.v, c2.v);
                let col = Phaser.Display.Color.HSVToRGB(twen.getValue(), s, v);
                let colInt = Phaser.Display.Color.GetColor(col.r, col.g, col.b);
                background.tintBottomLeft = colInt;
                background.tintBottomRight = colInt;
            },
            onComplete: ()=>{
                this.tweens.addCounter({
                    from:0,
                    to:100,
                    duration:1100,
                    ease:'Quad.easeOut',
                    onUpdate: (twen)=>{
                        let col = Phaser.Display.Color.Interpolate.ColorWithColor(c2, c3, 100, twen.getValue());
                        let colInt = Phaser.Display.Color.GetColor(col.r, col.g, col.b);
                        background.tintBottomLeft = colInt;
                        background.tintBottomRight = colInt;
                    },
                });
            }
        });
        let sundownSky = this.tweens.addCounter({
            paused:true,
            from:c1.h,
            to:c3.h,
            duration:2000,
            ease:'Cubic.easeInOut',
            onUpdate: (twen)=>{
                //let hue = Phaser.Math.Interpolation.CubicBezier(twen.progress, c1.h, .6, .7, 1+c2.h);

                let s = Phaser.Math.Interpolation.SmoothStep(twen.progress, c1.s, c3.s);
                let v = Phaser.Math.Interpolation.SmoothStep(twen.progress, c1.v, c3.v);
                let col = Phaser.Display.Color.HSVToRGB(twen.getValue(), s, v);
                let colInt = Phaser.Display.Color.GetColor(col.r, col.g, col.b);
                background.tintTopLeft = colInt;
                background.tintTopRight = colInt;
            },
        });
        let sunupHorizon = this.tweens.addCounter({
            paused:true,
            from:c3.h,
            to:c4.h,
            duration:900,
            ease:'Cubic.easeIn',
            onUpdate: (twen)=>{
                //let hue = Phaser.Math.Interpolation.CubicBezier(twen.progress, c1.h, .6, .7, 1+c2.h);
                let s = Phaser.Math.Interpolation.SmoothStep(twen.progress, c3.s, c4.s);
                let v = Phaser.Math.Interpolation.SmoothStep(twen.progress, c3.v, c4.v);
                let col = Phaser.Display.Color.HSVToRGB(twen.getValue(), s, v);
                let colInt = Phaser.Display.Color.GetColor(col.r, col.g, col.b);
                background.tintBottomLeft = colInt;
                background.tintBottomRight = colInt;
            },
            onComplete: ()=>{
                this.tweens.addCounter({
                    from:0,
                    to:100,
                    duration:1100,
                    ease:'Quad.easeOut',
                    onUpdate: (twen)=>{
                        let col = Phaser.Display.Color.Interpolate.ColorWithColor(c4, c1, 100, twen.getValue());
                        let colInt = Phaser.Display.Color.GetColor(col.r, col.g, col.b);
                        background.tintBottomLeft = colInt;
                        background.tintBottomRight = colInt;
                    },
                });
            }
        });
        let sunupSky = this.tweens.addCounter({
            paused:true,
            from:c3.h,
            to:c1.h,
            duration:2000,
            ease:'Cubic.easeInOut',
            onUpdate: (twen)=>{
                //let hue = Phaser.Math.Interpolation.CubicBezier(twen.progress, c1.h, .6, .7, 1+c2.h);

                let s = Phaser.Math.Interpolation.SmoothStep(twen.progress, c3.s, c1.s);
                let v = Phaser.Math.Interpolation.SmoothStep(twen.progress, c3.v, c1.v);
                let col = Phaser.Display.Color.HSVToRGB(twen.getValue(), s, v);
                let colInt = Phaser.Display.Color.GetColor(col.r, col.g, col.b);
                background.tintTopLeft = colInt;
                background.tintTopRight = colInt;
            },
        });
        let darken = this.tweens.add({
            targets:[shadow],
            alpha:{getStart:()=>0, getEnd:()=>0.7},
            duration:1000,
            paused:true,
        });
        let lighten = this.tweens.add({
            targets:[shadow],
            alpha:{getStart:()=>0.7, getEnd:()=>0},
            duration:1000,
            paused:true,
        });
        let daytonight = this.tweens.timeline({
            onStart: ()=>{
                sundownHorizon.play();
                sundownSky.play();
                darken.play();
            },
            paused:true,
            tweens:[{
                    targets: sun,
                    duration:700,
                    y:{getStart: () => 100, getEnd: () => 500},
                    ease: 'Back.easeIn',
                },
                {
                    offset:'+=400',
                    targets: moon,
                    duration:700,
                    y:{getStart: () => 500, getEnd: () => 100},
                    ease: 'Back.easeOut'
                }]
        });
        let nighttoday = this.tweens.timeline({
            onStart: ()=>{
                sunupHorizon.play();
                sunupSky.play();
                lighten.play();
            },
            paused:true,
            tweens:[{
                    targets: moon,
                    duration:700,
                    y:{getStart: () => 100, getEnd: () => 500},
                    ease: 'Back.easeIn'
                },
                {
                    offset:'+=400',
                    targets: sun,
                    duration:700,
                    y:{getStart: () => 500, getEnd: () => 100},
                    ease: 'Back.easeOut'
                }]
        });
        
        let activeTween = undefined;
        if(data.hasOwnProperty('data') && data.data.difficulty%2==0){
            background.setTint(0x000b1e);
            shadow.alpha=0.7;
            activeTween = nighttoday;
            moon.y=100;
        }else{
            background.setTint(0x70b9ff);
            shadow.alpha=0;
            activeTween = daytonight;
            sun.y=100;
        }

        /* let wipe_mask = this.add.image(800,0,'wipe_mask').setOrigin(0,0);
        wipe_mask.setVisible(false);
        let rendermask = new Phaser.Display.Masks.BitmapMask(this, wipe_mask);
        //rendermask.invertAlpha = false;
        background.mask = rendermask;
        let tween = this.tweens.add({
            targets: wipe_mask,
            x:-473,
            duration:800,
            paused: true,
        }); */

        //this callback is performed as soon as this scene is the only one showing.
        let pressable=false;
        this.events.once('TransitionOver',()=>{
            if(Array.isArray(data.from)){
                data.from.forEach(element => {
                    this.scene.stop(element);
                });
            }else{
                this.scene.stop(data.from);
            }
            //console.log('stopped '+data.from);
            this.scene.run(data.to, data.data);
            if(data.gameover){
                let lairArea = new Phaser.Geom.Ellipse(510, 255, 180, 230);
                this.time.addEvent({
                    delay: 500,
                    callback: ()=>{
                        let point = lairArea.getRandomPoint();
                        explode(point.x, point.y);
                        this.scene.get('TransitionRender').events.emit('Shake');
                    },
                    repeat:7
                });
                pressable = true;
            }else{
                activeTween.play();
                this.sound.play('drive');
                this.time.delayedCall(1450, ()=>this.sound.play('screech'));
                activeTween.setCallback('onComplete',()=>{pressable=true},[],this);
            }    
        });

        //when the background is clicked, the next scene is resumed,
        //and the transition out is started
        background.on('pointerdown', ()=>{
            if(pressable){
                this.scene.get('MusicScene').events.emit('PlayTheme');
                background.disableInteractive();
                //rendermask.invertAlpha = true;
                this.scene.resume(data.to);
                this.scene.get('TransitionRender').events.emit('StartTransition');
                //and as soon as the transition is complete, do this
                this.events.once('TransitionOver', ()=>{
                    //console.log('stopped '+this.scene.key);
                    //console.log(data);
                    if(data.hasOwnProperty('data') && data.data.difficulty===0){
                            //this.scene.launch('Dialog', {text:'Hey, boss, heroes have invaded the lair. You gotta do that thing with the laser traps again. You know, the trick where you guide the invaders onto their respective targets?\nLuckily, they always wear the color that symbolizes which traps they can\'t break free from. Oh yeah, and don\'t forget that we\'re on a budget.'});
                    }
                    this.scene.get(data.to).events.emit('TransitionOver');
                    this.scene.stop();
                }, [], this);
            }
        }, this); 

        var smokeanim = this.anims.get('smoke');
        var fireanim = this.anims.get('fire');
        var debrisanim = this.anims.get('debris');
        var sparkanim = this.anims.get('spark');
        if(smokeanim === undefined){
            smokeanim = this.anims.create({
                key:'smoke',
                frames: this.anims.generateFrameNames('particles', {prefix:'particle_', start:96, end:116}),
                frameRate: 60,
                repeat:0
            });
        }
        if(fireanim === undefined){
            fireanim = this.anims.create({
                key:'fire',
                frames: this.anims.generateFrameNames('particles', {prefix:'particle_', start:128, end:137}),
                frameRate: 60,
                repeat:0
            });
        }
        if(debrisanim === undefined){
            debrisanim = this.anims.create({
                key:'debris',
                frames: this.anims.generateFrameNames('particles', {prefix:'particle_', start:160, end:167}),
                frameRate: 60,
                repeat:0
            });
        }
        if(sparkanim === undefined){
            sparkanim = this.anims.create({
                key:'spark',
                frames: this.anims.generateFrameNames('particles', {prefix:'particle_', start:224, end:239}),
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
        class firePart extends AnimatedParticle{
            constructor(emitter){
                super(emitter, fireanim);
            }
        }
        class debrisPart extends AnimatedParticle{
            constructor(emitter){
                super(emitter, debrisanim);
            }
        }
        class sparkPart extends AnimatedParticle{
            constructor(emitter){
                super(emitter, sparkanim);
            }
        }

        let particles = this.add.particles('particles');
        var smokeEmitter = particles.createEmitter({
            frame: 'particle_96',
            x:0, y:0,
            speed: {min:-200, max:200},
            lifespan: { min: 200, max: 800 },
            quantity:40,
            alpha: 0.8,
            scale: 4,
            on:false,
            gravityY: -200,
            particleClass: smokePart,
            tint: 0x323232
            //blendMode: 'MULTIPLY',
        });
        var fireEmitter = particles.createEmitter({
            frame: 'particle_128',
            x:0, y:0,
            speed: {min:-100, max:120},
            lifespan: { min: 200, max: 500 },
            quantity:20,
            scale: 4,
            on:false,
            particleClass: firePart,
            //blendMode: 'ADD',
        });
        var debrisEmitter = particles.createEmitter({
            frame: 'particle_160',
            x:0, y:0,
            speed: {min:100, max:400},
            lifespan: { min: 400, max: 600 },
            quantity:10,
            scale: 3,
            gravityY: 200,
            on:false,
            particleClass: debrisPart,
            //blendMode: 'ADD',
        });
        var sparkEmitter = particles.createEmitter({
            frame: 'particle_224',
            x:0, y:0,
            speed: {min:400, max:600},
            lifespan: { min: 50, max: 300 },
            quantity:15,
            scale: 4,
            on:false,
            particleClass: sparkPart,
            //blendMode: 'ADD',
        });
        let explosionsound = this.sound.add('explode',{volume:0.7, rate:1.5});
        function explode(x, y){
            smokeEmitter.setPosition(x, y);
            fireEmitter.setPosition(x, y);
            debrisEmitter.setPosition(x, y);
            sparkEmitter.setPosition(x, y);
            //this.debrisRT.clear();
            //this.debrisRT.setPosition(pointer.x, pointer.y);
            let angle = Phaser.Math.Angle.Between(x, y, 530, 270)*180/3.14 + 90;
            smokeEmitter.setAngle({min: angle-40, max: angle+220});
            debrisEmitter.setAngle({min: angle+40, max: angle+140});
            smokeEmitter.explode();
            fireEmitter.explode();
            debrisEmitter.explode();
            sparkEmitter.explode();
            explosionsound.play();
        }
    }
    update(){

    }
}

export class TransitionRender extends Phaser.Scene{
    constructor(){
        super({key: 'TransitionRender', active: false});
        this.rt;
    }
    preload(){        
        this.load.image('wipe_mask', 'assets/images/effect/wipe_mask.png');
    }
    create(data){
        this.rt = this.add.renderTexture(-100, -100, 1000, 800).setVisible(false);

        this.rt.saveTexture('transitiontexture');

        
        let black = this.add.tileSprite(400,300,1000,800, 'menu_white').setTint(0x000000).setVisible(false);
        let rendertexture = this.add.image(0,0,'transitiontexture').setOrigin(0,0);
        
        let wipe_mask = this.add.image(800,0,'wipe_mask').setOrigin(0,0);
        wipe_mask.setVisible(false);
        let rendermask = new Phaser.Display.Masks.BitmapMask(this, wipe_mask);
        //rendermask.invertAlpha = false;
        rendertexture.mask = rendermask;
        let tween = this.tweens.add({
            targets: wipe_mask,
            x:-473,
            duration:800,
        });
        //this transitions to the next scene on click
        tween.setCallback('onComplete', ()=>{
            black.setVisible(true);
            this.scene.get('Transition').events.emit('TransitionOver');
        },[], this);
        this.events.once('StartTransition',()=>{
            black.setVisible(false);
            rendermask.invertAlpha = true;
            tween.setCallback('onComplete', ()=>{
                this.scene.get('Transition').events.emit('TransitionOver');
                this.scene.stop();
            }, [], this);
            tween.restart();
        });
        this.events.on('Shake',()=>{
            this.cameras.main.shake(100, 0.01, true);
        });
    }
    update(){
        var gameScene = this.scene.get('Transition');
        
        //this.rt.clear();
        this.rt.draw(gameScene.children,0,0);
    }
}