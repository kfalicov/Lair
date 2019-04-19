export class Shader extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline{
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

export class GrayscalePipeline extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
    constructor(game)
    {
        super({
            game: game,
            renderer: game.renderer,
            fragShader:`
                precision mediump float;
                uniform sampler2D uMainSampler;
                varying vec2 outTexCoord;
                void main(void) {
                vec4 color = texture2D(uMainSampler, outTexCoord);
                float gray = dot(color.rgb, vec3(0.499, 0.787, 0.114));
                gl_FragColor = vec4(vec3(gray), 1.0);
                }`
        });
    } 
}
export default GrayscalePipeline;