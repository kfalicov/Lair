const wrap = (s, w) => s.replace(
    new RegExp(`([^\n]{1,${w}})(?:\\s|$)`,'g'), '$1\n'
    //new RegExp(`([^\n]{1,${w}})(\\s|$)`,'g'), '$1\n'
    //new RegExp(`(?![^\n]{1,${w}}$)([^\n]{1,${w}})\\s`, 'g'), '$1\n'
)
class Dialog extends Phaser.Scene {
    constructor()
    {
        super('Dialog');
    }
    preload()
    {
        //sounds
        this.load.audioSprite('two_tones', 'assets/sounds/speech/two_tones.json');
    }
    create(settings)
    {   
        var content = wrap(settings.text,50);
        //I wrote this regex! it matches exactly 3 lines without including the newlines before and after.
        var numLines = 4;
        let pages = content.match(
            new RegExp(`((?:[^\n])(.*\n){0,${numLines-1}}.*)`,'g')
        );
        //console.log(this.pages);
        //console.log(pages);
        let textEntry = this.add.text(150,10,'', {
            fontFamily: '"Roboto Mono", monospace',
            fixedHeight:40,
            strokeThickness:5,
            stroke:0x000000

        }).setOrigin(0);
        let currentpage = 0;
        let scene = this;
        this.sound.pauseOnBlur = false;
        var typewriter = function(repeatCount){
                let currentchar = pages[currentpage].length-repeatCount;
                textEntry.setText(pages[currentpage].substring(0, currentchar));
                let char = pages[currentpage].charAt(currentchar);
                if(/(a|e|i|o|u)/.test(char)){
                    //this.sound.playAudioSprite('two_tones','high'); 
                }else if(/[a-zA-Z]/.test(char)){
                    //this.sound.playAudioSprite('two_tones','low'); 
                }
                currentchar++;
        }

        //after a page completes, count down until automatically turning page
        let pageturner = undefined;

        var pageincrement = function(){
            typewriter(lettertyper.repeatCount);
            if(lettertyper.repeatCount===0 && pageturner===undefined){
                if(currentpage+1<pages.length){
                    pageturner = this.time.delayedCall(7000, function(){
                        currentpage++;
                        pageturner.destroy();
                        pageturner=undefined;
                        lettertyper.destroy();
                        lettertyper = this.time.addEvent({
                            delay: 20,
                            callback: pageincrement,
                            callbackScope: scene,
                            repeat: pages[currentpage].length
                        });
                        
                    }, [], this);
                }else if(currentpage+1===pages.length){
                    //console.log('got here');
                    pageturner = this.time.delayedCall(7000, function(){
                        this.scene.stop();                    
                    }, [], this);
                }
            }
        }
        //at set intervals, types a new letter of the dialog
        let lettertyper = this.time.addEvent({
            delay: 20,
            callback: pageincrement,
            callbackScope: scene,
            repeat: pages[currentpage].length
        });
        //console.log(timer);
        this.input.keyboard.on('keydown', function(event){
            
            if(lettertyper.repeatCount === 0 && currentpage+1<pages.length){
                currentpage++;
                lettertyper.destroy();
                lettertyper = this.time.addEvent({
                    delay: 20,
                    callback: pageincrement,
                    callbackScope: scene,
                    repeat: pages[currentpage].length
                });
                if(pageturner){
                    pageturner.destroy();
                    pageturner = undefined;
                }
                //console.log(timer);
            }else if(lettertyper.repeatCount>0){
                lettertyper.repeatCount=0;
            }else if(currentpage+1===pages.length){
                this.scene.stop();
            }
            //timer.paused = true;
        },this);
        this.cameras.main.setPosition(200, this.sys.canvas.height-150);
    }

    update()
    {
        
        //this.cameras.main.setPosition(this.input.activePointer.x, this.input.activePointer.y);
        //console.log(this.game.hasFocus);
    }
}
export default Dialog;

