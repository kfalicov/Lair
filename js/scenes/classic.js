class ClassicMode extends Phaser.Scene {
    constructor()
    {
        super('ClassicMode');
    }

    preload()
    {
        this.load.atlas('shards', 'assets/images/particle/shards.png', 'assets/images/particle/shards_atlas.json');
    }

    create()
    {   
        console.log('created classicmode');
        this.input.keyboard.on('keydown_ESC', function(event){
            this.scene.start('MainMenu');
        }, this);
        this.add.text(0,0, 'Classic Mode Scene');

        let m_particles = this.add.particles('shards');
        var line = new Phaser.Geom.Line(-100,-100, 100, 100);
        var m_emitter = m_particles.createEmitter(
            {
                frame: ['shard_2'],
                x:400, y:400,
                speed: 60,
                lifespan: 1500,
                quantity: 30,
                frequency: 200,
                scale: { start: 0.8, end: 0.0 },
                blendMode: Phaser.BlendModes.ADD,
                emitZone: {type: 'edge', source: line, quantity: 30},
                rotation: {min:0, max:180},
                emitCallback: onEmits
            }
        );
            function onEmits(particle, key){
                console.log(`${particle}`);
            }
        //changed to onEmits because I discovered Phaser has an onEmit somewhere already
       /*  function onEmits(particle, key) {
            const values = particle.emitter[key].propertyValue;
        
            // Handle a random value.
            if (typeof values.value === 'object') {
              particle[`${key}Initial`] = randomBetween(values.value.min, values.value.max);
            } else if (values.value) {
              particle[`${key}Initial`] = values.value;
            }
          } */
    }
}
export default ClassicMode;