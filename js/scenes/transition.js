export class Transition extends Phaser.Scene{
    constructor()
    {
        super('Transition');
    }

    preload()
    {
        this.load.image('lair_view', 'assets/images/menu/lair_view.png');
        this.load.image('wipe_mask', 'assets/images/effect/wipe_mask.png');
        this.load.image('menu_white', 'assets/images/menu/menu_white.png');

        this.load.atlas('sunmoon', 'assets/images/menu/sunmoon.png', 'assets/images/menu/sunmoon.json');
        this.load.audio('screech', 'assets/sounds/transition/tire_screech.mp3');
        this.load.audio('drive', 'assets/sounds/transition/drive_away.mp3');
    }
    create(data)
    {
        this.scene.launch('TransitionRender');
        this.scene.setVisible(false);
        let background = this.add.tileSprite(0, 0, 800, 450, 'menu_white').setInteractive();
        background.setOrigin(0, 0);

        let c1 = Phaser.Display.Color.HexStringToColor('#70b9ff'); // DAY
        let c2 = Phaser.Display.Color.HexStringToColor('#e01717'); // SUNDOWN
        
        let c3 = Phaser.Display.Color.HexStringToColor('#000b1e'); // NIGHT
        let c4 = Phaser.Display.Color.HexStringToColor('#ff6dd5'); // SUNUP

        let sun = this.add.sprite(200,500, 'sunmoon', 'sun');
        let moon = this.add.sprite(200,500, 'sunmoon', 'moon');

        let lair = this.add.image(0,0,'lair_view').setOrigin(0);

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
        let daytonight = this.tweens.timeline({
            onStart: ()=>{
                sundownHorizon.play();
                sundownSky.play();
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
            activeTween = nighttoday;
            moon.y=100;
        }else{
            background.setTint(0x70b9ff);
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

            this.scene.launch(data.to, data.data);
            activeTween.play();
            this.sound.play('drive');
            this.time.delayedCall(1450, ()=>this.sound.play('screech'));
            activeTween.setCallback('onComplete',()=>{pressable=true},[],this);    
        });

        //when the background is clicked, the next scene is resumed,
        //and the transition out is started
        background.on('pointerdown', function(){
            if(pressable){
                background.disableInteractive();
                //rendermask.invertAlpha = true;
                this.scene.resume(data.to);
                this.scene.get('TransitionRender').events.emit('StartTransition');
                //and as soon as the transition is complete, do this
                this.events.once('TransitionOver', ()=>{
                    //console.log('stopped '+this.scene.key);
                    //console.log(data);
                    if(data.hasOwnProperty('data') && data.data.difficulty===0){
                            this.scene.launch('Dialog', {
                                text:'Hey, boss, heroes have invaded the lair. You gotta do that thing with the laser traps again. You know, the trick where you guide the invaders onto their respective targets?\nLuckily, they always wear the color that symbolizes which traps they can\'t break free from. Oh yeah, and don\'t forget that we\'re on a budget.'
                            });
                    }
                    this.scene.get(data.to).events.emit('TransitionOver');
                    this.scene.stop();
                }, [], this);
            }
        }, this); 
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
        this.rt = this.add.renderTexture(0, 0, 800, 600).setVisible(false);

        this.rt.saveTexture('transitiontexture');

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
            this.scene.get('Transition').events.emit('TransitionOver');
        },[], this);
        this.events.once('StartTransition',()=>{
            rendermask.invertAlpha = true;
            tween.setCallback('onComplete', ()=>{
                this.scene.get('Transition').events.emit('TransitionOver');
                this.scene.stop();
            }, [], this);
            tween.restart();
        });
    }
    update(){
        var gameScene = this.scene.get('Transition');
        
        //this.rt.clear();
        this.rt.draw(gameScene.children,0,0);
    }
}