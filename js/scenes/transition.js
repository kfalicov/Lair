export class Transition extends Phaser.Scene{
    constructor()
    {
        super('Transition');
    }

    preload()
    {
        this.load.image('lair_view', 'assets/images/menu/lair_view.png');
        this.load.image('wipe_mask', 'assets/images/effect/wipe_mask.png');
    }
    create(data)
    {
        let background = this.add.sprite(0, 0, 'lair_view').disableInteractive();
        background.setOrigin(0, 0);

        let wipe_mask = this.add.image(800,0,'wipe_mask').setOrigin(0,0);
        wipe_mask.setVisible(false);
        let rendermask = new Phaser.Display.Masks.BitmapMask(this, wipe_mask);
        //rendermask.invertAlpha = false;
        background.mask = rendermask;
        let tween = this.tweens.add({
            targets: wipe_mask,
            x:-473,
            duration:800,
            paused: true,
        });

        let src = this.scene.get(data.from);
        let dest = this.scene.get(data.to);

        //this callback is performed as soon as this scene is the only one showing.
        tween.setCallback('onComplete', function(){
            this.scene.stop('UI');
            this.scene.stop(data.from);
            console.log('stopped '+data.from);

            background.setInteractive();
            this.scene.launch(data.to, data.data);

            //this transitions to the next scene on click
            this.input.once('pointerdown', function(){
                background.disableInteractive();
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
                    this.scene.stop('Transition');
                    
                }, [wipe_mask], this); 
                tween.restart();
            }, this);
        }, [wipe_mask], this);
        tween.restart();        
    }
    update(){
        
    }
}