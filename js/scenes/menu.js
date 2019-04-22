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

        this.load.image('close', 'assets/images/menu/close.png');
        this.load.image('aspect_narrower', 'assets/images/menu/aspect_narrower.png');

        //laser shard particles
        this.load.atlas('shards', 'assets/images/particle/shards.png', 'assets/images/particle/shards_atlas.json');

        //'start' submenu images
        this.load.image('classic_button', 'assets/images/menu/classic_button.png');
        this.load.image('puzzle_button', 'assets/images/menu/puzzle_button.png');
        this.load.image('defense_button', 'assets/images/menu/defense_button.png');
    
        //option submenu images

        //about submenu images

        //this.load.glsl('distort', 'js/shader/distort.glsl');

        this.load.image('test_image', 'assets/images/menu/test_image.png');
        
        //the imperfections in the laser beam
        this.load.image('big_laser_fg', 'assets/images/menu/big_laser_fg.png');

    }
    create()
    {   
        this.rt = this.add.renderTexture(0, 0, 800, 210).setVisible(false);
        this.rt.saveTexture('laserTexture');
        this.partrt = this.add.renderTexture(0,0,800,256);//.setBlendMode(Phaser.BlendModes.ADD).setVisible(false);
        this.partrt.alpha =1;
        this.partrt.tint=0xffaaaa;

        let background = this.add.sprite(0, 0, 'menu_background');
        background.setOrigin(0, 0);
        
        

        let bg = this.add.tileSprite(400,105,800,210, 'menu_white').setTint('0xff0000').setBlendMode(Phaser.BlendModes.ADD);
        let fg = this.add.tileSprite(400,105, 800, 128,'big_laser_fg').setBlendMode(Phaser.BlendModes.ADD);
        let fganim = this.tweens.add({
            targets: [fg],
            tilePositionX:-400,
            repeat:-1,
            duration:500,
        });
        fg.tileScaleY = 0.25;
        fg.tileScaleX = 2;
        fg.setVisible(false);
        bg.setVisible(false);
        
        let particles = this.add.particles('shards');
        var line1 = new Phaser.Geom.Line(-10,41, 800, 41);
        var line2 = new Phaser.Geom.Line(-10,169, 800, 169);
        var emitter = particles.createEmitter(
            {
                frame: ['shard_1', 'shard_2', 'shard_3'],
                x:0, y:10,
                speed: 60,
                lifespan: 900,
                quantity: 8,
                frequency: 10,
                angle: {min: -80, max: -40},
                scale: { start: .5, end: 0.01 },
                //blendMode: Phaser.BlendModes.ADD,
                emitZone: {type: 'random', source: line1}
            }
        );
        var otheremitter = particles.createEmitter(
            {
                frame: ['shard_1', 'shard_2', 'shard_3'],
                x:0, y:-10,
                speed: 60,
                lifespan: 900,
                quantity: 8,
                frequency: 10,
                angle: {min: 40, max: 80},
                scale: { start: .5, end: 0.01 },
                //blendMode: Phaser.BlendModes.ADD,
                emitZone: {type: 'random', source: line2}
            }
        );

        this.laserparts = [
            bg,
            fg,
        ];
        particles.setVisible(false);
        this.particles = particles;
        //let laserBeam = this.add.image(0,0,'laser_top_fg');
        
        this.initMenu();

        let shader = new Shader(this.sys.game, this.cache.shader.get('distort'));
        //this.scene.launch('Dialog', {
        //    text:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
        //});
        //creates a new shader if it hasn't been created yet
        //this.distortPipeline = this.sys.game.renderer.pipelines['Distort'];
        //if(!this.distortPipeline){
        //    console.log('created jitter shader');
        //    this.distortPipeline = this.sys.game.renderer.addPipeline('Distort', shader); 
        //}
        //this.distortPipeline.setFloat2('resolution', this.game.config.width, this.game.config.height);
        this.scene.resume();
    }

    update()
    {
        //this.distortPipeline.setFloat1('time', this.time.now*0.2);
        this.title_spark_bg.alpha = 0.15*Math.sin(this.time.now*(Math.random()*0.001)+0.001)+0.75;
        //this.title_spark.alpha += Math.random()*0.1;
        this.rt.clear();
        this.partrt.clear();
        this.partrt.draw(this.particles);
        this.rt.draw(this.laserparts);
        this.rt.draw(this.partrt);
    }

    initMenu(){
        this.title = this.add.sprite(210, 70, 'title').setOrigin(0);
        this.title_gloss = this.add.sprite(210, 70, 'title_gloss').setOrigin(0);
        this.title_gloss.setBlendMode(Phaser.BlendModes.SCREEN);

        //let cross_lasers = this.add.sprite(0,0,'cross_lasers').setOrigin(0).setBlendMode(Phaser.BlendModes.ADD);
        let bglaser_1 = this.add.quad(400,300,'laserTexture').setBlendMode(Phaser.BlendModes.ADD);
        bglaser_1.setTopLeft(117,281);
        bglaser_1.setBottomLeft(117, 297);
        bglaser_1.setTopRight(843, 275);
        bglaser_1.setBottomRight(843, 299);
        bglaser_1.angle=-17.5;

        let bglaser_2 = this.add.quad(621,159,'laserTexture').setBlendMode(Phaser.BlendModes.ADD);
        bglaser_2.setTopLeft(370,170);
        bglaser_2.setBottomLeft(370, 190);
        bglaser_2.setTopRight(893, 135);
        bglaser_2.setBottomRight(820, 175);
        bglaser_2.angle=-135.5;

        

        this.buttons = [];
        this.buttons.push(this.add.sprite(490, 250, 'start_button').setInteractive().setOrigin(0));
        
        this.cage = this.add.sprite(15,157,'cage').setOrigin(0);

        let bglaser_3 = this.add.quad(285,299,'laserTexture').setBlendMode(Phaser.BlendModes.ADD);
        bglaser_3.setTopLeft(-31,298);
        bglaser_3.setBottomLeft(-36, 305);
        bglaser_3.setTopRight(611, 288);
        bglaser_3.setBottomRight(611, 310);
        bglaser_3.angle=-167;
        
        this.buttons.push(this.add.sprite(490, 320, 'option_button').setInteractive().setOrigin(0));
        this.buttons.push(this.add.sprite(490, 390, 'about_button').setInteractive().setOrigin(0));
        
        
        let lastClicked = 0;
        for(let i=0;i<this.buttons.length;i++){
            this.buttons[i].on('pointerup', ()=>{
                showMenu(true, i);
                lastClicked = i;
            },this);
        }

        
        
        let menu_tint = this.add.sprite(0,0,'menu_tint').setOrigin(0).setInteractive().setVisible(false);
        menu_tint.setDisplaySize(this.sys.canvas.width, this.sys.canvas.height);

        //the laser in the "A" of LAIR
        this.title_spark_bg = this.add.sprite(193,54, 'title_spark_bg').setOrigin(0);
        this.title_spark_bg.setBlendMode(Phaser.BlendModes.ADD);
        this.title_spark_fg = this.add.sprite(193,54, 'title_spark_fg').setOrigin(0);
        this.title_spark_fg.setBlendMode(Phaser.BlendModes.ADD);
        
        let laserquad = this.add.quad(0, 0, 'laserTexture').setVisible(false);
        laserquad.setBlendMode(Phaser.BlendModes.ADD);

        menu_tint.on('pointerup', function(){
            showMenu(false,lastClicked);
        }, this);

        let submenu = [];

        let classicbutton = this.add.sprite(100, 275, 'classic_button').setInteractive().setOrigin(0).setVisible(false);
        classicbutton.on('pointerup', ()=>{
            this.input.enabled = false;
            this.scene.launch('Transition', {
                from: 'MainMenu',
                to: 'ClassicMode',
                data:{
                    money:1500,
                    difficulty:0
                }
            }
        )},this);
        let puzzlebutton = this.add.sprite(300, 270, 'puzzle_button').setInteractive().setOrigin(0).setVisible(false);
        puzzlebutton.on('pointerup', ()=>{console.log('puzzle')},this);

        submenu.push([classicbutton, puzzlebutton]); //the buttons in start
        submenu.push([]); //the buttons in options
        submenu.push([]); //the buttons in about
        let closebutton = this.add.sprite(650, 250, 'close').setOrigin(0).setVisible(false);

        this.aspectTop = this.add.sprite(0, 0, 'aspect_narrower').setOrigin(0);
        this.aspectBottom = this.add.sprite(0, this.sys.canvas.height, 'aspect_narrower').setOrigin(0, 1);
    
        let showMenu = (show, menu)=>{
            menu_tint.setVisible(show);
            for(let i=0;i<submenu[menu].length;i++){
                submenu[menu][i].setVisible(show);
            }
            if(menu===0){
                laserquad.setTopLeft(0,240);
                laserquad.setTopRight(800,200);
                laserquad.setBottomLeft(0,360);
                laserquad.setBottomRight(800,370);
                closebutton.setPosition(650,260);
            }else if(menu===1){
                laserquad.setTopLeft(800,400);
                laserquad.setTopRight(0,400);
                laserquad.setBottomLeft(800,260);
                laserquad.setBottomRight(0,270);
                closebutton.setPosition(650,300);
            }else if(menu===2){
                laserquad.setTopLeft(0,340);
                laserquad.setTopRight(800,300);
                laserquad.setBottomLeft(0,460);
                laserquad.setBottomRight(800,470);
                closebutton.setPosition(650,360);
            }
            laserquad.setVisible(show);
            closebutton.setVisible(show);
        }
    }
}
export default MainMenu;

