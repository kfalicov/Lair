class ClassicMode extends Phaser.Scene {
    constructor()
    {
        super('ClassicMode');
    }

    preload()
    {
    }

    create()
    {   
        console.log('created classicmode');
        this.input.keyboard.on('keydown_ESC', function(event){
            this.scene.start('MainMenu');
        }, this);
        this.add.text(0,0, 'Classic Mode Scene');
    }
}
export default ClassicMode;