import Shader from '../shader/pipelines.js';
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
        this.load.image('title_gloss', 'assets/images/menu/title_gloss.png');        
        this.load.image('title_gloss', 'assets/images/menu/title_gloss.png');

        this.load.image('title_spark_bg', 'assets/images/menu/title_spark_bg.png');
        this.load.image('title_spark_fg', 'assets/images/menu/title_spark_fg.png');

        this.load.image('start_button', 'assets/images/menu/start_button.png');
        this.load.image('option_button', 'assets/images/menu/option_button.png');
        this.load.image('about_button', 'assets/images/menu/about_button.png');
        this.load.image('cage', 'assets/images/menu/cage.png');

        this.load.image('menu_tint', 'assets/images/menu/menu_tint.png');
        this.load.image('menu_white', 'assets/images/menu/menu_white.png');
        this.load.image('bubble_noise', 'assets/images/menu/bubble_noise.png');

        this.load.image('cross_lasers', 'assets/images/menu/menu_lasers.png');
        this.load.image('close', 'assets/images/menu/close.png');
        this.load.image('aspect_narrower', 'assets/images/menu/aspect_narrower.png');

        //laser shard particles
        this.load.atlas('shards', 'assets/images/particle/shards.png', 'assets/images/particle/shards_atlas.json');

        //'start' submenu images
        this.load.image('laser_top_bg', 'assets/images/menu/laser_top_bg.png');
        this.load.image('laser_top_fg', 'assets/images/menu/laser_top_fg.png')
        this.load.image('classic_button', 'assets/images/menu/classic_button.png');
        this.load.image('puzzle_button', 'assets/images/menu/puzzle_button.png');
        this.load.image('defense_button', 'assets/images/menu/defense_button.png');
    
        //option submenu images
        this.load.image('laser_mid_bg', 'assets/images/menu/laser_mid_bg.png');
        this.load.image('laser_mid_fg', 'assets/images/menu/laser_mid_fg.png')

        //about submenu images
        this.load.image('laser_bot_bg', 'assets/images/menu/laser_bot_bg.png');
        this.load.image('laser_bot_fg', 'assets/images/menu/laser_bot_fg.png');
        //this.load.glsl('distort', 'js/shader/distort.glsl');
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

        let shader = new Shader(this.sys.game, this.cache.shader.get('distort'));

        //creates a new shader if it hasn't been created yet
        //this.distortPipeline = this.sys.game.renderer.pipelines['Distort'];
        //if(!this.distortPipeline){
        //    console.log('created jitter shader');
        //    this.distortPipeline = this.sys.game.renderer.addPipeline('Distort', shader); 
        //}
        //this.distortPipeline.setFloat2('resolution', this.game.config.width, this.game.config.height);
        
    }

    update()
    {
        //this.distortPipeline.setFloat1('time', this.time.now*0.2);
        this.beam_bubbles.tilePositionX -= 2;
        this.beam_bubbles.tilePositionY += 0.24;
        this.title_spark_bg.alpha = 0.15*Math.sin(this.time.now*(Math.random()*0.001)+0.001)+0.75;
        //this.title_spark.alpha += Math.random()*0.1;
    }

    initMenu(){
        this.title = this.add.sprite(210, 70, 'title').setOrigin(0);
        this.title_gloss = this.add.sprite(210, 70, 'title_gloss').setOrigin(0);
        this.title_gloss.setBlendMode(Phaser.BlendModes.SCREEN);
        
        this.startbutton = this.add.sprite(490, 250, 'start_button').setInteractive().setOrigin(0);
        this.optionbutton = this.add.sprite(490, 320, 'option_button').setInteractive().setOrigin(0);
        this.aboutbutton = this.add.sprite(490, 390, 'about_button').setInteractive().setOrigin(0);
        
        this.cage = this.add.sprite(15,157,'cage').setOrigin(0);
        
        this.menu_tint = this.add.sprite(0,0,'menu_tint').setOrigin(0).setInteractive();
        this.menu_tint.setDisplaySize(this.sys.canvas.width, this.sys.canvas.height);

        //the laser in the "A" of LAIR
        this.title_spark_bg = this.add.sprite(193,54, 'title_spark_bg').setOrigin(0);
        this.title_spark_bg.setBlendMode(Phaser.BlendModes.ADD);
        this.title_spark_fg = this.add.sprite(193,54, 'title_spark_fg').setOrigin(0);
        this.title_spark_fg.setBlendMode(Phaser.BlendModes.ADD);

        this.cross_lasers = this.add.sprite(0,0,'cross_lasers').setOrigin(0).setBlendMode(Phaser.BlendModes.ADD);  
        
        this.initLaserParticles();

        //the laser that appears when you click 'start'
        this.laser_top_bg = this.add.sprite(0, 180, 'laser_top_bg').setOrigin(0);
        this.laser_top_bg.setBlendMode(Phaser.BlendModes.ADD);
        this.laser_top_fg = this.add.sprite(0, 180, 'laser_top_fg').setOrigin(0);
        this.laser_top_fg.setBlendMode(Phaser.BlendModes.ADD);

        //the laser that appears when you click 'options'
        this.laser_mid_bg = this.add.sprite(0, 230, 'laser_mid_bg').setOrigin(0);
        this.laser_mid_bg.setBlendMode(Phaser.BlendModes.ADD);
        this.laser_mid_fg = this.add.sprite(0, 230, 'laser_mid_fg').setOrigin(0);
        this.laser_mid_fg.setBlendMode(Phaser.BlendModes.ADD);

        //the laser that appears when you click 'about'
        this.laser_bot_bg = this.add.sprite(0, 290, 'laser_bot_bg').setOrigin(0);
        this.laser_bot_bg.setBlendMode(Phaser.BlendModes.ADD);
        this.laser_bot_fg = this.add.sprite(0, 290, 'laser_bot_fg').setOrigin(0);
        this.laser_bot_fg.setBlendMode(Phaser.BlendModes.ADD);

        //the beam's imperfections
        this.beam_bubbles = this.add.tileSprite(400,300,800, 600, 'bubble_noise');
        this.beam_bubbles.scaleX = 10;
        this.beam_bubbles.scaleY = 0.5;
        let imperfectionmask = new Phaser.Display.Masks.BitmapMask(this, this.beam_bubbles);
        imperfectionmask.invertAlpha = true;
        this.laser_top_fg.mask = imperfectionmask;
        this.laser_mid_fg.mask = imperfectionmask;
        this.laser_bot_fg.mask = imperfectionmask;
        this.beam_bubbles.setVisible(false);
        this.beam_bubbles.alpha = 0.8;
        
        this.classic_button = this.add.sprite(100, 280, 'classic_button').setInteractive().setOrigin(0);
        this.puzzle_button = this.add.sprite(300, 270, 'puzzle_button').setInteractive().setOrigin(0);
        //this.defense_button = this.add.sprite(410, 260, 'defense_button').setInteractive().setOrigin(0);
        this.closebutton = this.add.sprite(650, 250, 'close').setOrigin(0);

        this.aspectTop = this.add.sprite(0, 0, 'aspect_narrower').setOrigin(0);
        this.aspectBottom = this.add.sprite(0, this.sys.canvas.height, 'aspect_narrower').setOrigin(0, 1);
    }

    showStartMenu(show){
        this.menu_tint.setVisible(show);

        //sets the angle of the imperfections
        //the same imperfections animation is used for all
        //of the menu lasers, so must be set independently for each when visible
        this.beam_bubbles.angle = -2.5;

        this.laser_top_bg.setVisible(show);
        this.laser_top_fg.setVisible(show);
        this.classic_button.setVisible(show);
        this.puzzle_button.setVisible(show);
        //this.defense_button.setVisible(show);
        this.closebutton.setVisible(show);
        this.start_mask.setVisible(show);
    }

    showOptionMenu(show){
        this.menu_tint.setVisible(show);

        this.beam_bubbles.angle = 181;
        this.laser_mid_bg.setVisible(show);
        this.laser_mid_fg.setVisible(show);
        this.optionbutton.setVisible(!show);
    }

    showAboutMenu(show){
        this.menu_tint.setVisible(show);

        this.beam_bubbles.angle = 2;
        this.laser_bot_bg.setVisible(show);
        this.laser_bot_fg.setVisible(show);
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

        //the particles for the 'start' beam
        let startparticles = this.add.particles('shards');
        this.start_mask = this.add.sprite(0,0,'menu_white').setOrigin(0);
        this.start_mask.setDisplaySize(this.sys.canvas.width, this.sys.canvas.height);
        this.start_mask.alpha = 0.7;
        this.start_mask.setBlendMode(Phaser.BlendModes.ADD);
        var line1 = new Phaser.Geom.Triangle(-460,320, 800, 231, 800, 312);
        var emitter3 = startparticles.createEmitter(
            {
                frame: ['shard_1', 'shard_2', 'shard_3'],
                x:0, y:0,
                speed: 40,
                lifespan: 1800,
                quantity: 100,
                frequency: 100,
                angle: {min: -40, max: 40},
                scale: { start: 1, end: 0.1 },
                blendMode: Phaser.BlendModes.ADD,
                emitZone: {type: 'edge', source: line1, quantity: 100}
            }
        );
        this.start_mask.mask = new Phaser.Display.Masks.BitmapMask(this, startparticles);
        startparticles.setVisible(false);
        this.start_mask.setVisible(false);
    }
}
export default MainMenu;

