#define GAMMA_OUT(color)    pow(color, vec4(1.0 / OutputGamma, 1.0 / OutputGamma, 1.0 / OutputGamma, 1.0 / OutputGamma))

#define InputGamma 2.4
#define OutputGamma 2.2
#define SHARPNESS 1.0

precision mediump float;

uniform float     time;
uniform vec2      resolution;
uniform sampler2D uMainSampler;
uniform vec2      mouse;
varying vec2 outTexCoord;

float noise(vec2 pos) {
    return fract(sin(dot(pos, vec2(12.9898 - time,78.233 + time))) * 43758.5453);
}

void main( void ) {
    vec2 normalPos = outTexCoord;
    vec2 pointer = mouse / resolution;
    float pos = (gl_FragCoord.y / resolution.y);
    float mouse_dist = length(vec2((pointer.x - normalPos.x) * (resolution.x / resolution.y), pointer.y - normalPos.y));
    float distortion = clamp(1.0 - (mouse_dist + 0.1) * 3.0, 0.0, 1.0);

    
    pos -= (distortion * distortion) * 0.1;
    normalPos.y += (distortion * distortion) * 0.06;

    //begin screen curvature effect
    float warpX = 0.031;
    float warpY = 0.041;

    vec2 uv = normalPos;
    uv = uv*2.0 -1.0;
    uv *= vec2(1.0 + (uv.y*uv.y)*warpX, 1.0 + (uv.x*uv.x)*warpY);
    uv *= 0.5;
    uv += 0.5;
    //end screen curvature effect

    float c = sin(uv.y * 400.0) + 1.6;
    c = pow(c, 0.2);
    c *= 0.4;
    c+=0.5;
    

    float band_pos = fract(time * 0.1) * 3.0 - 1.0;
    c += clamp( (0.5 - abs(band_pos - pos) * 5.0), 0.0, 1.0) * 0.1;

    //c += distortion * 0.4;
    // noise
    c += (noise(gl_FragCoord.xy) - 0.5) * (0.15);

    

    vec4 pixel = texture2D(uMainSampler, uv);

    gl_FragColor = GAMMA_OUT(pixel * vec4( c, c, c, 0.1 ));
}