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
        let coords = {x: 46, y: 563, offset:40};
        let names = ["undo", "delete", "swap", "confuse", "slow", "info"];
        let functions = [
            function(button, scene){
                //this is the undo button
                scene.scene.get('ClassicMode').undo();
                setUnpressed(button);
            },
            function(button, scene){
                //this is the delete button
                if(scene.scene.get('ClassicMode').toggleDelete()){
                    setPressed(button);
                }else{
                    setUnpressed(button);
                }
                scene.events.once('StopDeleting', () => setUnpressed(button));
            },
            function(button, scene){
                //this is the swap button
                setUnpressed(button);
            },
            function(button, scene){
                //this is the confuse button
                setUnpressed(button);
            },
            function(button, scene){
                //this is the slow button
                button.disableInteractive();
            },
            function(button, scene){
                //this is the info button
                setUnpressed(button);
            }
        ];

        let lastpressed = null;
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
        }

        this.input.on('pointerup', () => {
            setUnpressed(lastpressed);
            lastpressed=null;
        });

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