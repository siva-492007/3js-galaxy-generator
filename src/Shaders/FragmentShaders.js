export const fragmentShaders = `

varying vec3 vColor;

void main(){

    /* Disc pattern */
    // float strength = distance(gl_PointCoord, vec2(0.5));
    // strength = step(0.5, strength);
    // strength = 1.0 - strength;

    /* Diffuse Point pattern*/
    // float strength = distance(gl_PointCoord, vec2(0.5));
    // strength *= 2.0 ;
    // strength = 1.0 - strength;

    /* Light Point pattern*/
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 10.0);


    /* Final Color */
    vec3 color = mix(vec3(0.0), vColor, strength);

    // we cannot send uv as a varying because each vertex is a particle but we can use gl_PointCoord
    gl_FragColor = vec4(color, 1.0);

}

`