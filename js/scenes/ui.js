export class UI extends Phaser.Scene{
    constructor()
    {
        super('UI');
    }

    preload()
    {
        this.load.atlas('buttons','assets/images/ui/buttons.png', 'assets/images/ui/buttons_atlas.json');
    }
    create(data)
    {
        let targetscene = this.scene.get('ClassicMode');
        let coords = {x: 46, y: 563, offset:40};
        let names = ["undo", "delete", "swap", "confuse", "slow", "info"];
        let functions = [
            function(button, scene){
                //this is the undo button
                targetscene.undo();
                setUnpressed(button);
            },
            function(button, scene){
                //this is the delete button
                if(targetscene.toggleFunction('delete')){
                    setPressed(button);
                }else{
                    setUnpressed(button);
                }
            },
            function(button, scene){
                //this is the swap button
                targetscene.swapItem();
                setUnpressed(button);
            },
            function(button, scene){
                //this is the confuse button
                if(targetscene.toggleFunction('confuse')){
                    setPressed(button);
                }else{
                    setUnpressed(button);
                }
                scene.events.once('StopConfusing', () => setUnpressed(button));
            },
            function(button, scene){
                //this is the slow button
                targetscene.slow();
                button.disableInteractive();
            },
            function(button, scene){
                //this is the info button
                setUnpressed(button);
            }
        ];

        let tooltips = [
            "Undo",
            "Delete",
            "Switch",
            "Stun",
            "Slow"
        ];

        let lastpressed = null;
        let buttons = [];
        let tooltipcam = this.cameras.add(0,0,256,128, false, 'tooltip');
        let onAButton = false;
        for(let i=0; i<names.length; i++){
            let button = this.add.sprite(coords.x+(coords.offset*i), coords.y, 'buttons', names[i]+'_unpressed').setInteractive({useHandCursor: true});
            button.name = names[i];
            button.on('pointerdown', () => {
                setPressed(button);
                lastpressed = button;
            });
            button.on('pointerup', () => {
                if(button === lastpressed){
                    functions[i](button, this);
                    lastpressed = null;
                }
            });
            button.on('pointerover', () =>{
                onAButton = true;
            });
            button.on('pointerout',()=>{
                onAButton = false;
            })
            buttons.push(button);
        }

        this.input.on('pointerup', () => {
            setUnpressed(lastpressed);
            lastpressed=null;
        });

        //undo key
        this.input.keyboard.on('keydown_Z', function (event) {
            if(lastpressed !== buttons[0]){
                functions[0](buttons[0], this);
                setPressed(buttons[0]);
                lastpressed=buttons[0];
            }
        }, this);
        this.input.keyboard.on('keyup_Z', function (event) {
            if(lastpressed === buttons[0]){
                setUnpressed(buttons[0]);
                lastpressed = null;
            }
        }, this);
        
        //delete key
        this.input.keyboard.on('keydown_X', function(){
            if(lastpressed !== buttons[1]){
                setPressed(buttons[1]);
                functions[1](buttons[1], this);
                lastpressed=buttons[1];
            }
        }, this);
        this.input.keyboard.on('keyup_X', function(){
            if(lastpressed === buttons[1]){
                lastpressed = null;
            }
        }, this);
        this.events.on('StopDeleting', () => setUnpressed(buttons[1]));

        //swap key
        this.input.keyboard.on('keydown_C', function(){
            if(lastpressed !== buttons[2]){
                functions[2](buttons[2], this);
                setPressed(buttons[2]);
                lastpressed=buttons[2];
            }
        }, this);
        this.input.keyboard.on('keyup_C', function(){
            if(lastpressed === buttons[2]){
                setUnpressed(buttons[2]);
                lastpressed = null;
            }
        }, this);

        //confuse key
        this.input.keyboard.on('keydown_V', function(){
            if(lastpressed !== buttons[3]){
                setPressed(buttons[3]);
                functions[3](buttons[3], this);
                lastpressed=buttons[3];
            }
        }, this);
        this.input.keyboard.on('keyup_V', function(){
            if(lastpressed === buttons[3]){
                lastpressed = null;
            }
        }, this);

        function setPressed(button){
            if(button !==null){
                button.setFrame(button.name+"_pressed");
            }
        }
        function setUnpressed(button){
            if(button !==null){
                button.setFrame(button.name+"_unpressed");
                lastpressed = button;
            }
            button !== null ? button.setFrame(button.name+"_unpressed") : undefined;
        }
    }
    update(){
        
    }
}