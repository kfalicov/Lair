class Shader extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline{
    /**
     * 
     * @param {*} game the game this shader belongs to.
     * @param {*} vertShader optional vertex shader
     * @param {*} fragShader optional fragment shader
     */
    constructor(game, vertShader, fragShader){
        super(
            {
                game: game,
                renderer: game.renderer,
                vertShader: vertShader,
                fragShader: fragShader
            });
    }
}
export default Shader;