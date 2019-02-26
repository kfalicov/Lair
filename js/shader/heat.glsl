precision mediump float;
uniform float     time;
uniform vec2      resolution;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
void main( void ) {
    vec2 uv = outTexCoord;
    //uv.y *= -1.0;
    uv.x += (sin((uv.y + (time * 0.1)) * 20.0) * 0.001) + (sin((uv.x + (time * 0.2)) * 15.0) * 0.002) + (sin((uv.y + (time * 0.05)) * 32.0) * 0.002) + (sin((uv.y + (time * 0.05)) * 131.0) * 0.001);
    uv.y += (sin((uv.x + (time * 0.5)) * 12.0) * 0.002) + (sin((uv.x + (time * 0.01)) * 64.0) * 0.003) + (sin((uv.x - (time * 0.05)) * 170.0) * 0.001);;
    vec4 texColor = texture2D(uMainSampler, uv);
    gl_FragColor = texColor;
}