export class MusicScene extends Phaser.Scene {
    constructor()
    {
        super({key:'MusicScene', active:true});
    }

    preload()
    {
        this.load.audio('music_loop', ['assets/sounds/music/main_loop.ogg', 'assets/sounds/music/main_loop.mp3']);
        this.load.audio('music_intro', ['assets/sounds/music/main_intro.ogg', 'assets/sounds/music/main_intro.mp3']);
    }
    create(){
        var music_intro = this.sound.add('music_intro');
        var music_loop = this.sound.add('music_loop', {loop:true});
        let loopdelay = undefined;
        music_intro.on('play', ()=> {
            //console.log('intro');
            loopdelay = this.time.delayedCall(5852, ()=>{
                //console.log('loop');
                music_loop.play();
            });
        }
        );
        
        if(this.sound.context.state==='running'){
            music_intro.play();
        }

        this.sound.once('unlocked',()=>{
            if(loopdelay===undefined){
                music_intro.play();
            }
        });
        this.sound.context.onstatechange = (event)=>{
            //console.log(event.currentTarget.state);
            if(event.currentTarget.state === 'running'){
                if(loopdelay===undefined){
                    music_intro.play();
                }else if(loopdelay.paused){
                    loopdelay.paused = false;
                    //music_intro.resume();
                    //music_loop.resume();
                }
            }else if(event.currentTarget.state === 'suspended'){
                if(loopdelay===undefined){
                    //do nothing
                }else if(!loopdelay.paused){
                    loopdelay.paused = true;
                }
            }
        };
        this.events.on('PlayTheme',()=>{
            loopdelay.destroy();
            music_loop.stop();
            music_intro.stop();
            music_intro.play();
        });
        this.events.on('StopTheme', ()=>{
            loopdelay.destroy();
            music_loop.stop();
            music_intro.stop();
        });
        //let mute = false;
        this.input.keyboard.on('keydown_M', function(event){
            this.sound.mute = !this.sound.mute;
        }, this);
    }
    update()
    {

    }
}