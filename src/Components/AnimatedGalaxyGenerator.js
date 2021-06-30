import * as THREE from 'three';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import * as dat from 'dat.gui';
import { vertexShaders } from '../Shaders/VertexShaders';
import { fragmentShaders } from '../Shaders/FragmentShaders';

const GalaxyGenerator = () => {

    const scene = new THREE.Scene();

    const gui = new dat.GUI({ closed: true });

    const size = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    const cursor = {
        x: 0,
        y: 0
    };

    window.addEventListener('mousemove', (event) => {
        cursor.x = event.clientX / size.width - 0.5;
        cursor.y = event.clientY / size.height - 0.5;
    });

    /*
    * Galaxy
    */
    const parameters = {};
    parameters.count = 300000;
    parameters.size = 0.01;
    parameters.radius = 7;
    parameters.branches = 5;
    // parameters.spin = 1;
    parameters.spin = 0;
    // parameters.randomness = 0.02;
    parameters.randomnessPower = 3;
    parameters.insideColor = '#ff6030';
    parameters.outsideColor = '#1b3984';

    let geometry = null;
    let material = null;
    let points = null;



    const generateGalaxy = () => {

        /*
        * Destroy old galaxy
        **/
        if(points !== null){
            geometry.dispose();
            material.dispose();
            scene.remove(points);
        }
         geometry = new THREE.BufferGeometry();

        const positions = new Float32Array(parameters.count * 3);
        const colors = new Float32Array(parameters.count * 3) // we need 3 colors for RGB
        const scales = new Float32Array(parameters.count * 1);
        const randomNess = new Float32Array(parameters.count * 3);
        
        const colorInside = new THREE.Color(parameters.insideColor)
        const colorOutside = new THREE.Color(parameters.outsideColor)

        for (let i = 0; i < parameters.count; i++) {
            const i3 = i * 3;

            /* Positions */
            const radius = parameters.radius * Math.random();
            // const spinAngle = radius * parameters.spin
            const branchAngle = ((i % parameters.branches) / parameters.branches ) * 2 * Math.PI;

            
            positions[i3    ] = Math.cos(branchAngle) * radius; // x - axis
            positions[i3 + 1] = 0; // y - axis
            positions[i3 + 2] = Math.sin(branchAngle) * radius;  // z - axis

            const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
            const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
            const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
            
            randomNess[i3 + 0] = randomX;
            randomNess[i3 + 1] = randomY;
            randomNess[i3 + 2] = randomZ;
            
            /* Colors*/
            const mixedColor = colorInside.clone();
            mixedColor.lerp(colorOutside, radius / parameters.radius);
            colors[i3    ] = mixedColor.r;  // R
            colors[i3 + 1] = mixedColor.g;  // G
            colors[i3 + 2] = mixedColor.b;  // B

            /* Scale */
            scales[i] = Math.random();
        }

        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        );
        geometry.setAttribute(
            'color',
            new THREE.BufferAttribute(colors, 3)
        );
        geometry.setAttribute(
            'aScale',
            new THREE.BufferAttribute(scales, 1)
        );
        geometry.setAttribute(
            'aRandomNess',
            new THREE.BufferAttribute(randomNess, 3)
        );

        /*
        * Material
        **/
        material = new THREE.ShaderMaterial({
            // size: parameters.size,
            // sizeAttenuation: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            vertexShader: vertexShaders,
            fragmentShader: fragmentShaders,
            uniforms:{
                uTime: { value: 0 },
                uSize: { value: 30 * renderer.getPixelRatio() }
            }
        });

        /*
        * Particles
        */
        points = new THREE.Points(geometry, material);
        scene.add(points);

    };


    /* debug GUI
    */
    gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
    gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
    gui.add(parameters, 'radius').min(1).max(20).step(0.1).onFinishChange(generateGalaxy);
    gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
    // gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy);
    // gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
    gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
    gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy);
    gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy);


    const camera = new THREE.PerspectiveCamera(70, size.width / size.height, 0.1, 100)
    camera.position.set(3, 4, 3);
    scene.add(camera);

    window.addEventListener('resize', () => {

        size.width = window.innerWidth;
        size.height = window.innerHeight;

        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();

        renderer.setSize(size.width, size.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    const canvas = document.querySelector('.webgl');

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas
    });

    renderer.setSize(size.width, size.height);

    const clock = new THREE.Clock();

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        // animate galaxy
        material.uniforms.uTime.value = elapsedTime;

        // points.rotation.y = elapsedTime * 0.05 * parameters.spin;
        controls.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    /* Generate galaxy */
    generateGalaxy();

    /* Animate */
    tick();

    return (
        <>
        </>
    );
};

export default GalaxyGenerator;