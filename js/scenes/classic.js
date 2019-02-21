class ClassicMode extends Phaser.Scene {
    constructor()
    {
        super('ClassicMode');
    }

    preload()
    {
        this.load.image('room', 'assets/images/classic/room.png');
        this.load.image('laser', 'assets/images/classic/laser.png');
        this.load.image('item_box', 'assets/images/classic/item_box.png');
        this.load.image('info_button', 'assets/images/classic/info_button.png');
    }

    create()
    {   
        console.log('created classicmode');
        this.input.keyboard.on('keydown_ESC', function(event){
            this.scene.start('MainMenu');
        }, this);
        this.add.text(0,0, 'Classic Mode Scene');

        let room = this.add.image(40,60,'room').setOrigin(0).setInteractive();
        room.input.hitArea.setTo(10, 10, 700, 460);
    
        this.laserGrid = this.physics.add.staticGroup();
        room.on('pointerdown', function (pointer) {

            console.log(pointer.x, pointer.y);
            let laser = this.add.tileSprite(40, pointer.y, 720,10, 'laser').setOrigin(0,0.5);
            laser.laserSpeed = Math.random()+0.75;
            this.laserGrid.add(laser);
        }, this);
        this.add.image(720,520,'item_box').setOrigin(0).setDepth(1);
        this.add.image(40,543, 'info_button').setOrigin(0);
    }
    update()
    {
        this.laserGrid.children.each(function(laser){
            laser.tilePositionX +=laser.laserSpeed;
        }, this);
    }
}
export default ClassicMode;