export class Transition extends Phaser.Scene{
    constructor()
    {
        super('Transition');
    }

    preload()
    {
        this.load.image('menu_background', 'assets/images/menu/menu_background.png');
        this.load.image('wipe_mask', 'assets/images/effect/wipe_mask.png');
    }
    create(data)
    {
        let background = this.add.sprite(0, 0, 'menu_background');
        background.setOrigin(0, 0);

        let wipe_mask = this.add.image(800,0,'wipe_mask').setOrigin(0,0);
        wipe_mask.setVisible(false);
        let rendermask = new Phaser.Display.Masks.BitmapMask(this, wipe_mask);
        //rendermask.invertAlpha = false;
        background.mask = rendermask;
        let tween = this.tweens.add({
            targets: wipe_mask,
            x:-473,
            duration:1000,
            paused: true,
        });

        //this callback is performed as soon as this scene is the only one showing.
        tween.setCallback('onComplete', function(){
            console.log('stopped '+data.from);
            this.scene.stop('UI');
            this.scene.stop(data.from);
            timedEvent.paused = false;
        }, [wipe_mask], this);
        tween.restart();

        //this timed event transitions to the next screen after 1 second.
        let timedEvent = this.time.delayedCall(1000, function(){
            rendermask.invertAlpha = true;
            //and as soon as the transition is complete, do this
            tween.setCallback('onComplete', function(){
                console.log('stopped '+this.scene.key);
                //console.log(data);
                if(data.hasOwnProperty('data') && data.data.difficulty===0){
                        this.scene.launch('Dialog', {
                            text:'Hey, boss, heroes have invaded the lair. You gotta do that thing with the laser traps again. You know, the trick where you guide the invaders onto their respective targets?\nLuckily, they always wear the color that symbolizes which traps they can\'t break free from. Oh yeah, and don\'t forget that we\'re on a budget.'
                        });
                }
                this.scene.stop();
            }, [wipe_mask], this); 
            this.scene.launch(data.to, data.data);
            tween.restart();
        }, [], this);
        timedEvent.paused=true;
        
    }
    update(){
        
    }
}