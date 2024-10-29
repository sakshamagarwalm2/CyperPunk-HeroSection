// Import the Three.js library
import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import gsap from 'gsap';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = window.innerHeight / window.innerWidth+3.5;

// Create a renderer
const renderer = new THREE.WebGLRenderer({ 
  canvas: document.querySelector('#canvas'),
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure =1;
renderer.outputEncoding = THREE.sRGBEncoding;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene , camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.003;
composer.addPass(rgbShiftPass);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileCubemapShader();

let model;

// Load an HDRI environment map
const rgbLoader = new RGBELoader();
rgbLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function ( texture ) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap;
    texture.dispose();
    pmremGenerator.dispose();

    const loader = new GLTFLoader();
    loader.load( './HelmetModel/DamagedHelmet.gltf', function ( gltf ) {
      model = gltf.scene;
      scene.add( model);
    }, undefined, function ( error ) {
      console.error( error );
    });
});


window.addEventListener("mousemove", (e)=>{
  if(model){
    const rotationX = (e.clientX/window.innerWidth- .5)* (Math.PI* 0.3);
    const rotationY = (e.clientY/window.innerHeight- .5)* (Math.PI* 0.3);
    model.rotation.y = rotationX;
    model.rotation.x = rotationY;

  }
})

window.addEventListener("resize", ()=>{
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
})

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    composer.render();
}

// Start the animation
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
