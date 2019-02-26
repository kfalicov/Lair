#define GAMMA_IN(color)     pow(color, vec4(InputGamma, InputGamma, InputGamma, InputGamma))
#define GAMMA_OUT(color)    pow(color, vec4(1.0 / OutputGamma, 1.0 / OutputGamma, 1.0 / OutputGamma, 1.0 / OutputGamma))

#define PHOSPHOR 1.0
#define VSCANLINES 0.0
#define InputGamma 2.4
#define OutputGamma 2.2
#define SHARPNESS 1.5
#define COLOR_BOOST 1.5
#define RED_BOOST 1.0
#define GREEN_BOOST 1.0
#define BLUE_BOOST 1.0
#define SCANLINES_STRENGTH 0.72
#define BEAM_MIN_WIDTH 0.86
#define BEAM_MAX_WIDTH 1.0
#define CRT_ANTI_RINGING 0.8 

precision mediump float;

uniform float     time;
uniform vec2      inputResolution;
uniform vec2      outputResolution;
uniform vec2      TextureSize;
uniform sampler2D uMainSampler;
uniform vec2      mouse;
varying vec2 outTexCoord;

// Change these params to configure the horizontal filter.
const float  B =  0.36; 
const float  C =  0.28;  

const  mat4 invX = mat4(                          (-B - 6.0*C)/6.0,   (12.0 - 9.0*B - 6.0*C)/6.0,  -(12.0 - 9.0*B - 6.0*C)/6.0,   (B + 6.0*C)/6.0,
                                              (3.0*B + 12.0*C)/6.0, (-18.0 + 12.0*B + 6.0*C)/6.0, (18.0 - 15.0*B - 12.0*C)/6.0,                -C,
                                              (-3.0*B - 6.0*C)/6.0,                          0.0,          (3.0*B + 6.0*C)/6.0,               0.0,
                                                             B/6.0,            (6.0 - 2.0*B)/6.0,                        B/6.0,               0.0);

void main( void ) {
    vec2 texture_size = vec2(SHARPNESS*TextureSize.x, TextureSize.y);

    vec4 color;
    vec2 dx = mix(vec2(1.0/texture_size.x, 0.0), vec2(0.0, 1.0/texture_size.y), VSCANLINES);
    vec2 dy = mix(vec2(0.0, 1.0/texture_size.y), vec2(1.0/texture_size.x, 0.0), VSCANLINES);

    vec2 pix_coord = outTexCoord*texture_size+vec2(-0.5,0.5);

    vec2 tc = mix((floor(pix_coord) + vec2(0.5, 0.5))/texture_size, (floor(pix_coord) + vec2(1.0, -0.5))/texture_size, VSCANLINES);

    vec2 fp = mix(fract(pix_coord), fract(pix_coord.xy), VSCANLINES);

    vec4 c00 = GAMMA_IN(texture2D(uMainSampler, tc     - dx - dy).xyzw);
    vec4 c01 = GAMMA_IN(texture2D(uMainSampler, tc          - dy).xyzw);
    vec4 c02 = GAMMA_IN(texture2D(uMainSampler, tc     + dx - dy).xyzw);
    vec4 c03 = GAMMA_IN(texture2D(uMainSampler, tc + 2.0*dx - dy).xyzw);
    vec4 c10 = GAMMA_IN(texture2D(uMainSampler, tc     - dx).xyzw);
    vec4 c11 = GAMMA_IN(texture2D(uMainSampler, tc         ).xyzw);
    vec4 c12 = GAMMA_IN(texture2D(uMainSampler, tc     + dx).xyzw);
    vec4 c13 = GAMMA_IN(texture2D(uMainSampler, tc + 2.0*dx).xyzw);

    //  Get min/max samples
    vec4 min_sample = min(min(c01,c11), min(c02,c12));
    vec4 max_sample = max(max(c01,c11), max(c02,c12));

    mat4 color_matrix0 = mat4(c00, c01, c02, c03);
    mat4 color_matrix1 = mat4(c10, c11, c12, c13);

    vec4 lobes = vec4(fp.x*fp.x*fp.x, fp.x*fp.x, fp.x, 1.0);

    vec4 invX_Px  = invX * lobes;
    vec4 color0   = color_matrix0 * invX_Px;
    vec4 color1   = color_matrix1 * invX_Px;

    // Anti-ringing
    vec4 aux = color0;
    color0 = clamp(color0, min_sample, max_sample);
    color0 = mix(aux, color0, CRT_ANTI_RINGING);
    aux = color1;
    color1 = clamp(color1, min_sample, max_sample);
    color1 = mix(aux, color1, CRT_ANTI_RINGING);

    float pos0 = fp.y;
    float pos1 = 1.0 - fp.y;

    vec4 lum0 = mix(vec4(BEAM_MIN_WIDTH, BEAM_MIN_WIDTH, BEAM_MIN_WIDTH, BEAM_MIN_WIDTH), vec4(BEAM_MAX_WIDTH, BEAM_MAX_WIDTH, BEAM_MAX_WIDTH, BEAM_MAX_WIDTH), color0);
    vec4 lum1 = mix(vec4(BEAM_MIN_WIDTH, BEAM_MIN_WIDTH, BEAM_MIN_WIDTH, BEAM_MIN_WIDTH), vec4(BEAM_MAX_WIDTH, BEAM_MAX_WIDTH, BEAM_MAX_WIDTH, BEAM_MAX_WIDTH), color1);

    vec4 d0 = clamp(pos0/(lum0+0.0000001), 0.0, 1.0)*2.0;
    vec4 d1 = clamp(pos1/(lum1+0.0000001), 0.0, 1.0);

    d0 = exp(-10.0*SCANLINES_STRENGTH*d0*d0);
    d1 = exp(-10.0*SCANLINES_STRENGTH*d1*d1);

    color = clamp(color0*d0+color1*d1, 0.0, 1.0);    
    
    color *= COLOR_BOOST*vec4(RED_BOOST, GREEN_BOOST, BLUE_BOOST, 1.0);

    float mod_factor = outTexCoord.x * outputResolution.x * TextureSize.x / inputResolution.x;

    vec4 dotMaskWeights = mix(
                                 vec4(1.0, 0.7, 1.0, 1.),
                                 vec4(0.7, 1.0, 0.7, 1.),
                                 floor(mod(mod_factor, 2.0))
                                  );

    color.rgba *= mix(vec4(1.0,1.0,1.0,1.0), dotMaskWeights, PHOSPHOR);

    color  = GAMMA_OUT(color);

    //begin screen curvature effect
    float warpX = 0.031;
    float warpY = 0.041;

    vec2 uv = outTexCoord;
    uv = uv*2.0 -1.0;
    uv *= vec2(1.0 + (uv.y*uv.y)*warpX, 1.0 + (uv.x*uv.x)*warpY);
    uv *= 0.5;
    uv += 0.5;
    //end screen curvature effect

    gl_FragColor = color;
}