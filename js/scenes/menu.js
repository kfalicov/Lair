import ClassicMode from "./classic";

class MainMenu extends Phaser.Scene {
    constructor()
    {
        super('MainMenu');
    }

    preload()
    {
        //backdrop and default buttons
        this.load.image('menu_background', 'assets/images/menu/menu_background.png');
        this.load.image('title', 'assets/images/menu/title.png');
        this.load.image('title_gloss', 'assets/images/menu/title_gloss.png');        this.load.image('title_gloss', 'assets/images/menu/title_gloss.png');
        this.load.image('title_spark', 'assets/images/menu/title_spark.png');
        this.load.image('start_button', 'assets/images/menu/start_button.png');
        this.load.image('option_button', 'assets/images/menu/option_button.png');
        this.load.image('about_button', 'assets/images/menu/about_button.png');
        this.load.image('cage', 'assets/images/menu/cage.png');
        this.load.image('menu_tint', 'assets/images/menu/menu_tint.png');
        this.load.image('cross_lasers', 'assets/images/menu/menu_lasers.png');
        this.load.image('close', 'assets/images/menu/close.png');
        this.load.image('aspect_narrower', 'assets/images/menu/aspect_narrower.png');

        //laser shard particles
        this.load.atlas('shards', 'assets/images/particle/shards.png', 'assets/images/particle/shards_atlas.json');

        //start submenu images
        this.load.image('laser_top', 'assets/images/menu/laser_top.png');
        this.load.image('classic_button', 'assets/images/menu/classic_button.png');
        this.load.image('puzzle_button', 'assets/images/menu/puzzle_button.png');
        this.load.image('defense_button', 'assets/images/menu/defense_button.png');
    
        //option submenu images
        this.load.image('laser_mid', 'assets/images/menu/laser_mid.png');

        //about submenu images
        this.load.image('laser_bottom', 'assets/images/menu/laser_bottom.png');
    }
    create()
    {   
        let background = this.add.sprite(0, 0, 'menu_background');
        background.setOrigin(0, 0);
        
        
        
        this.initMenu();
        this.showStartMenu(false);
        this.showOptionMenu(false);
        this.showAboutMenu(false);
        //this.initOptionMenu();
        //this.initAboutMenu();

        
        this.startbutton.on('pointerup', function(){this.showStartMenu(true);}, this);
        this.optionbutton.on('pointerup', function(){this.showOptionMenu(true);}, this);
        this.aboutbutton.on('pointerup', function(){this.showAboutMenu(true);}, this);

        this.classic_button.on('pointerup', function(){this.scene.start('ClassicMode')},this);
        this.menu_tint.on('pointerup', function(){
            this.showStartMenu(false);
            this.showOptionMenu(false);
            this.showAboutMenu(false);
        }, this);
    }

    initMenu(){
        this.title = this.add.sprite(170, 55, 'title').setOrigin(0);
        this.title_gloss = this.add.sprite(170, 55, 'title_gloss').setOrigin(0);
        this.title_gloss.setBlendMode(Phaser.BlendModes.SCREEN);
        
        this.startbutton = this.add.sprite(490, 250, 'start_button').setInteractive().setOrigin(0);
        this.optionbutton = this.add.sprite(490, 320, 'option_button').setInteractive().setOrigin(0);
        this.aboutbutton = this.add.sprite(490, 390, 'about_button').setInteractive().setOrigin(0);
        
        this.cage = this.add.sprite(15,157,'cage').setOrigin(0);
        
        this.menu_tint = this.add.sprite(0,0,'menu_tint').setOrigin(0).setInteractive();
        this.menu_tint.setDisplaySize(this.sys.canvas.width, this.sys.canvas.height);
        this.title_spark = this.add.sprite(153,39, 'title_spark').setOrigin(0);
        this.title_spark.setBlendMode(Phaser.BlendModes.ADD);

        this.cross_lasers = this.add.sprite(0,0,'cross_lasers').setOrigin(0).setBlendMode(Phaser.BlendModes.ADD);  
        this.initLaserParticles();

        this.laser_top = this.add.sprite(0, 180, 'laser_top').setOrigin(0);
        this.laser_top.setBlendMode(Phaser.BlendModes.ADD);
        this.laser_mid = this.add.sprite(0, 230, 'laser_mid').setOrigin(0);
        this.laser_mid.setBlendMode(Phaser.BlendModes.ADD);
        this.laser_bottom = this.add.sprite(0, 290, 'laser_bottom').setOrigin(0);
        this.laser_bottom.setBlendMode(Phaser.BlendModes.ADD);
        
        this.classic_button = this.add.sprite(100, 280, 'classic_button').setInteractive().setOrigin(0);
        this.puzzle_button = this.add.sprite(300, 270, 'puzzle_button').setInteractive().setOrigin(0);
        //this.defense_button = this.add.sprite(410, 260, 'defense_button').setInteractive().setOrigin(0);
        this.closebutton = this.add.sprite(650, 250, 'close').setOrigin(0);

        this.aspectTop = this.add.sprite(0, 0, 'aspect_narrower').setOrigin(0);
        this.aspectBottom = this.add.sprite(0, this.sys.canvas.height, 'aspect_narrower').setOrigin(0, 1);
    }

    showStartMenu(show){
        this.menu_tint.setVisible(show);
        this.laser_top.setVisible(show);
        this.classic_button.setVisible(show);
        this.puzzle_button.setVisible(show);
        //this.defense_button.setVisible(show);
        this.closebutton.setVisible(show);
        this.optionbutton.setVisible(!show);
    }

    showOptionMenu(show){
        this.menu_tint.setVisible(show);
        this.laser_mid.setVisible(show);
        this.optionbutton.setVisible(!show);
    }

    showAboutMenu(show){
        this.menu_tint.setVisible(show);
        this.laser_bottom.setVisible(show);
        this.optionbutton.setVisible(!show);
    }

    initLaserParticles(){
        let particles = this.add.particles('shards');
        let cageparticles = this.add.particles('shards');
        var triangle1 = new Phaser.Geom.Triangle(0,236, 608, 364, 0, 240);
        var triangle2 = new Phaser.Geom.Triangle(93, 381, 800, 167, 800, 156);
        var triangle3 = new Phaser.Geom.Triangle(461,0, 808, 315, 438,0);
        var emitter = particles.createEmitter(
            {
                frame: ['shard_1', 'shard_2', 'shard_3'],
                x:0, y:0,
                speed: 20,
                lifespan: 1100,
                quantity: 80,
                frequency: 100,
                angle: {min: 175, max: 205},
                scale: { start: 0.15, end: 0.0 },
                blendMode: Phaser.BlendModes.ADD,
                emitZone: {type: 'edge', source: triangle1, quantity: 80}
            }
        );
        var emitter2 = cageparticles.createEmitter(
            {
                frame: ['shard_1', 'shard_2', 'shard_3'],
                x:0, y:0,
                speed: 25,
                lifespan: 1200,
                quantity: 100,
                frequency: 100,
                angle: {min: -8, max: -30},
                scale: { start: 0.15, end: 0.0 },
                blendMode: Phaser.BlendModes.ADD,
                emitZone: {type: 'edge', source: triangle2, quantity: 100}
            }
        );
        
        var emitter3 = particles.createEmitter(
            {
                frame: ['shard_1', 'shard_2', 'shard_3'],
                x:0, y:0,
                speed: 30,
                lifespan: 600,
                quantity: 100,
                frequency: 100,
                angle: {min: -160, max: -120},
                scale: { start: 0.2, end: 0.0 },
                blendMode: Phaser.BlendModes.ADD,
                emitZone: {type: 'edge', source: triangle3, quantity: 100}
            }
        );
        var cagemask = new Phaser.Display.Masks.BitmapMask(this, this.cage);
        cagemask.invertAlpha = true;
        cageparticles.mask = cagemask;
        
        var optionmask = new Phaser.Display.Masks.BitmapMask(this, this.optionbutton);
        optionmask.invertAlpha = true;
        particles.mask = optionmask;
        this.cross_lasers.mask = optionmask;

        var line1 = new Phaser.Geom.Triangle(0,0, 800, 315);
        this.startparticles = this.add.particles('shards');
        var emitter3 = this.startparticles.createEmitter(
            {
                frame: ['shard_1', 'shard_2', 'shard_3'],
                x:0, y:0,
                speed: 30,
                lifespan: 1600,
                quantity: 100,
                frequency: 100,
               // angle: {min: -160, max: -120},
                scale: { start: 1, end: 0.2 },
                blendMode: Phaser.BlendModes.ADD,
                emitZone: {type: 'edge', source: line1, quantity: 100}
            }
        );
    }
}
export default MainMenu;

