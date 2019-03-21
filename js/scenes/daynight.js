export class DayNight extends Phaser.Scene{
    constructor()
    {
        super('DayNight');
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

        //after 1 second on this screen, continue to the next screen
        let timedEvent = this.time.delayedCall(1000, function(){
            rendermask.invertAlpha = true;
            tween.setCallback('onComplete', function(){
                console.log('stopped '+this.scene.key);
                this.scene.stop();
            }, [wipe_mask], this); 
            this.scene.launch(data.to, data.data);
            tween.restart();
        }, [], this);
        timedEvent.paused=true;

        //wait for the transition effect to be complete
        tween.setCallback('onComplete', function(){
            console.log('stopped '+data.from);
            this.scene.stop();
            timedEvent.paused = false;
        }, [wipe_mask], this.scene.get(data.from));
        tween.restart();

        
    }
    update(){
        
    }
}