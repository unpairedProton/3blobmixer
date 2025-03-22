import './style.css'
import * as THREE from 'three';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { GUI } from 'lil-gui';
import { Text } from 'troika-three-text';
import { LoadingManager } from 'three';
import textVertex from "../src/shaders/textVertex.glsl"
import gsap from 'gsap';


const manager = new LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};

manager.onLoad = function () {
    console.log('Loading complete!');
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
};

manager.onError = function (url) {
    console.log('There was an error loading ' + url);
};


const blobs = [
    {
        name: 'Color Fusion',
        background: '#9D73F7',
        config: { "uPositionFrequency": 1, "uPositionStrength": 0.3, "uSmallWavePositionFrequency": 0.5, "uSmallWavePositionStrength": 0.7, "roughness": 1, "metalness": 0, "envMapIntensity": 0.5, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "cosmic-fusion" },
    },
    {
        name: 'Purple Mirror',
        background: '#5300B1',
        config: { "uPositionFrequency": 0.584, "uPositionStrength": 0.276, "uSmallWavePositionFrequency": 0.899, "uSmallWavePositionStrength": 1.266, "roughness": 0, "metalness": 1, "envMapIntensity": 2, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "purple-rain" },
    },
    {
        name: 'Alien Goo',
        background: '#45ACD8',
        config: { "uPositionFrequency": 1.022, "uPositionStrength": 0.99, "uSmallWavePositionFrequency": 0.378, "uSmallWavePositionStrength": 0.341, "roughness": 0.292, "metalness": 0.73, "envMapIntensity": 0.86, "clearcoat": 0, "clearcoatRoughness": 0, "transmission": 0, "flatShading": false, "wireframe": false, "map": "lucky-day" },
    },



]

let isAnimating = false;
let currentIndex = 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#338');
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


const geometry = new THREE.IcosahedronGeometry(1, 30);
const textureLoader = new THREE.TextureLoader(manager);
const texture = textureLoader.load(`./gradients/${blobs[currentIndex].config.map}.png`);
const material = new CustomShaderMaterial({
    baseMaterial: THREE.MeshPhysicalMaterial,
    map: texture,
    vertexShader: vertex,
    fragmentShader: fragment,
    metalness: 0.8,
    roughness: 0.4,

    // Your Uniforms
    uniforms: {
        uTime: { value: 0 },
        uPositionFrequency: { value: blobs[currentIndex].config.uPositionFrequency },
        uPositionStrength: { value: blobs[currentIndex].config.uPositionStrength },
        uTimeFrequency: { value: .3 },
        uSmallWavePositionFrequency: { value: blobs[currentIndex].config.uSmallWavePositionFrequency },
        uSmallWavePositionStrength: { value: blobs[currentIndex].config.uSmallWavePositionStrength },
        uSmallWaveTimeFrequency: { value: .3 },
    },
    // Base material properties
    // flatShading: true,
    color: 0xff00ff,

});

//tangent pass krne k liye
const mergedGeometry = mergeVertices(geometry);
//   console.log(mergedGeometry);

mergedGeometry.computeTangents();

const sphere = new THREE.Mesh(mergedGeometry, material);
scene.add(sphere);

camera.position.z = 4;




const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));



// Add RGBE environment lighting
const rgbeLoader = new RGBELoader(manager);
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/brown_photostudio_02_1k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    // scene.background = texture;
    renderer.outputEncoding = THREE.sRGBEncoding;
});

// const controls = new OrbitControls( camera, renderer.domElement );


const gui = new GUI();
const uniforms = material.uniforms;

gui.add(uniforms.uTime, 'value', 0, 10).name('Time');
gui.add(uniforms.uPositionFrequency, 'value', 0, 5, .1).name('Position Frequency');
gui.add(uniforms.uPositionStrength, 'value', 0, 2, .1).name('Position Strength');
gui.add(uniforms.uTimeFrequency, 'value', 0, 10, .1).name('Time Frequency');
gui.add(uniforms.uSmallWavePositionFrequency, 'value', 0, 5, .1).name('Small Wave Position Frequency');
gui.add(uniforms.uSmallWavePositionStrength, 'value', 0, 2, .1).name('Small Wave Position Strength');
gui.add(uniforms.uSmallWaveTimeFrequency, 'value', 0, 5, .1).name('Small Wave Time Frequency');

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})


const textMaterial = new THREE.ShaderMaterial({
    vertexShader: textVertex,
    fragmentShader: `void main(){
    gl_FragColor = vec4(1.);
    }`,
    side: THREE.DoubleSide,
    uniforms: {
        progress: {
            value: 0.,
        },
        direction: {
            value: 1
        }
    }
})

const textFolder = gui.addFolder('Text');
textFolder.add(textMaterial.uniforms.progress, 'value', 0, 1, 0.01).name('Progress');
textFolder.add(textMaterial.uniforms.direction, 'value', 0, 1, 0.01).name('Direction');



var myText;
const texts = blobs.map((blob, index) => {
    myText = new Text();
    myText.text = blob.name;
    myText.font = './aften_screen.woff';
    myText.anchorX = 'center';
    myText.anchorY = 'middle';
    myText.material = textMaterial;
    myText.position.set(0, 0, 2);
    if (index !== 0) {
        myText.scale.set(0, 0, 0); // sirf firts wala dikhana hai abhi
    }
    myText.letterSpacing = -0.08;
    myText.fontSize = window.innerWidth / 2000;
    myText.glyphGeometryDetail = .5;
    myText.sync();
    scene.add(myText);
    return myText;
});

//stopping   to happen before 2 seconds even you are scrolling


window.addEventListener('wheel', (e) => {
    if (isAnimating) return;
    isAnimating = true;
    let direction = Math.sign(e.deltaY);
    console.log(`direction: ${direction}`);
    let next = (currentIndex + direction + blobs.length) % blobs.length;
    console.log(next);

    texts[next].scale.set(1, 1, 1);
    texts[next].position.x = direction * 4.5;

    gsap.to(textMaterial.uniforms.progress, {
        value: .5,
        duration: 1,
        ease: 'linear',
        onComplete: () => {
            currentIndex = next;
            textMaterial.uniforms.progress.value = 0;
        }
    });

    gsap.to(texts[currentIndex].position, {
        x: -direction * 5,
        duration: 1,
        ease: 'power2.inOut',
        // delay: 0.5,
    })

    gsap.to(sphere.rotation, {
        y: sphere.rotation.y + Math.PI * 4 * -direction,
        duration: 1,
        ease: 'power2.inOut',
    })


    gsap.to(texts[next].position, {
        x: 0,
        duration: 1,
        ease: 'power2.inOut',
        // delay: 0.5,
    })

    //     const bg = new THREE.Color(blobs[next].background);
    //   gsap.to(scene.background, {
    //     r: bg.r,
    //     g: bg.g,
    //     b: bg.b,
    //     duration: 1,
    //     ease: 'none',
    //   })

    updateBlob(blobs[next].config);

    setTimeout(() => {
        isAnimating = false;
    }, 2000);
});


function updateBlob(config) {
    if (config.uPositionFrequency !== undefined) 
         gsap.to(material.uniforms.uPositionFrequency, 
        { value: config.uPositionFrequency, 
            duration: 1, 
            ease: 'power2.inOut' 
        });
    if (config.uPositionStrength !== undefined) 
        gsap.to(material.uniforms.uPositionStrength, { value: config.uPositionStrength, duration: 1, ease: 'power2.inOut' });
    if (config.uSmallWavePositionFrequency !== undefined) gsap.to(material.uniforms.uSmallWavePositionFrequency, { value: config.uSmallWavePositionFrequency, duration: 1, ease: 'power2.inOut' });
    if (config.uSmallWavePositionStrength !== undefined) gsap.to(material.uniforms.uSmallWavePositionStrength, { value: config.uSmallWavePositionStrength, duration: 1, ease: 'power2.inOut' });
    if (config.uSmallWaveTimeFrequency !== undefined) gsap.to(material.uniforms.uSmallWaveTimeFrequency, { value: config.uSmallWaveTimeFrequency, duration: 1, ease: 'power2.inOut' });
    if (config.map !== undefined) {
        setTimeout(() => {
            material.map = textureLoader.load(`./gradients/${config.map}.png`);
        }, 400);
    }
    if (config.roughness !== undefined) gsap.to(material, { roughness: config.roughness, duration: 1, ease: 'power2.inOut' });
    if (config.metalness !== undefined) gsap.to(material, { metalness: config.metalness, duration: 1, ease: 'power2.inOut' });
    if (config.envMapIntensity !== undefined) gsap.to(material, { envMapIntensity: config.envMapIntensity, duration: 1, ease: 'power2.inOut' });
    if (config.clearcoat !== undefined) gsap.to(material, { clearcoat: config.clearcoat, duration: 1, ease: 'power2.inOut' });
    if (config.clearcoatRoughness !== undefined) gsap.to(material, { clearcoatRoughness: config.clearcoatRoughness, duration: 1, ease: 'power2.inOut' });
    if (config.transmission !== undefined) gsap.to(material, { transmission: config.transmission, duration: 1, ease: 'power2.inOut' });
    if (config.flatShading !== undefined) gsap.to(material, { flatShading: config.flatShading, duration: 1, ease: 'power2.inOut' });
    if (config.wireframe !== undefined) gsap.to(material, { wireframe: config.wireframe, duration: 1, ease: 'power2.inOut' });
}



const clock = new THREE.Clock();
manager.onLoad = () => {
    function animate() {
        uniforms.uTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);

        // controls.update();
        const bg = new THREE.Color(blobs[currentIndex].background);
        gsap.to(scene.background,
            {
                r: bg.r,
                g: bg.g,
                b: bg.b,
                duration: 1,
                ease: "none"
            });
    }
    renderer.setAnimationLoop(animate);
}