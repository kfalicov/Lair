class LaserA extends Phaser.Scene {
    constructor(){
        super({key: 'LaserA'});
    }
    preload(){
        this.load.image('laser_top', 'assets/images/menu/laser_top.png');
        this.load.image('classic_button', 'assets/images/menu/classic_button.png');
        this.load.image('puzzle_button', 'assets/images/menu/puzzle_button.png');
        this.load.image('defense_button', 'assets/images/menu/defense_button.png');
    }
    create(){
        let menu_tint = this.add.sprite(0,0,'menu_tint').setInteractive().setOrigin(0);
        menu_tint.setDisplaySize(this.sys.canvas.width, this.sys.canvas.height);   
        let laser_top = this.add.sprite(0, 180, 'laser_top').setOrigin(0);
        
        let classic_button = this.add.sprite(30, 280, 'classic_button').setInteractive().setOrigin(0);
        let puzzle_button = this.add.sprite(200, 270, 'puzzle_button').setInteractive().setOrigin(0);
        let defense_button = this.add.sprite(410, 260, 'defense_button').setInteractive().setOrigin(0);
        let closebutton = this.add.sprite(650, 250, 'close').setOrigin(0);
        

        classic_button.on('pointerup', function(pointer){
            console.log("clicked classic");
        }, this);
        puzzle_button.on('pointerup', function(pointer){
            console.log("clicked puzzle");
        }, this);
        defense_button.on('pointerup', function(pointer){
            console.log("clicked defense");
        }, this);
        menu_tint.on('pointerup', function(pointer){
            this.scene.stop();
        }, this);
    }
}

class MainMenu extends Phaser.Scene {
    constructor()
    {
        super({key: 'MainMenu'});
    }

    preload()
    {
        this.load.image('menu_background', 'assets/images/menu/menu_background.png');
        this.load.image('start_button', 'assets/images/menu/start_button.png');
        this.load.image('menu_tint', 'assets/images/menu/menu_tint.png');
        this.load.image('close', 'assets/images/menu/close.png');
    }

    create()
    {   this.scene.add('LaserA', new LaserA());
        
        let background = this.add.sprite(0, 0, 'menu_background');
        background.setOrigin(0, 0);
    
        let startbutton = this.add.sprite(500, 250, 'start_button').setInteractive().setOrigin(0,0);
        startbutton.on('pointerup', function(pointer){
            this.scene.launch('LaserA');
        }, this);
    }
}
export default MainMenu;

