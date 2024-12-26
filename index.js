import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import gsap from 'gsap';

// Initialize the scene
init();
function init() {
    const scene = new THREE.Scene();

    // Create a camera
    const camera = new THREE.PerspectiveCamera(29, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 10;

    // Create a renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: document.querySelector("canvas") });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Load HDRI environment map
    const loader = new RGBELoader();
    loader.load('https://polyhaven.com/a/qwantani_dawn', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    });

    // Load textures for spheres and background
    const textureLoader = new THREE.TextureLoader();
    const textures = [
        './resources/csilla/color.png',
        './resources/earth/map.jpg',
        './resources/venus/map.jpg',
        './resources/volcanic/color.png'
    ];
    const backgroundTexture = textureLoader.load('./resources/stars.jpg');
    backgroundTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = backgroundTexture;

    // Create spheres
    let radius = 1.4;
    let widthSegments = 52;
    const spheres = new THREE.Group();
    const orbitDistance = 5.5;
    const sphereMeshes = []; // To keep track of sphere meshes

    for (let i = 0; i < 4; i++) {
        const geometry = new THREE.SphereGeometry(radius, widthSegments, widthSegments);
        const texture = textureLoader.load(textures[i]);
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const sphere = new THREE.Mesh(geometry, material);
        const angle = i / 4 * Math.PI * 2;
        sphere.position.x = Math.cos(angle) * orbitDistance;
        sphere.position.z = Math.sin(angle) * orbitDistance;
        spheres.add(sphere);
        sphereMeshes.push(sphere); // Save each sphere mesh for later use
    }

    spheres.rotation.x = 0.14;
    spheres.position.y = -0.5;
    scene.add(spheres);

    // Throttled wheel event handler
    let lastScrollTime = 0;
    let currentHeadingIndex = 0;
    const headings = document.querySelectorAll('.heading');
    const totalHeadings = headings.length;

    window.addEventListener('wheel', (event) => {
        const now = Date.now();
        if (now - lastScrollTime > 2000) {
            lastScrollTime = now;
            gsap.to(spheres.rotation, {
                y: spheres.rotation.y + (event.deltaY > 0 ? Math.PI / 2 : -Math.PI / 2),
                duration: 1
            });

            currentHeadingIndex = (currentHeadingIndex + (event.deltaY > 0 ? 1 : -1) + totalHeadings) % totalHeadings;
            gsap.to(headings, {
                yPercent: -100 * currentHeadingIndex,
                duration: 1,
                ease: "power2.inOut"
            });
        }
    });
let clock=new THREE.Clock();
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        for(let i=0;i<=3;i++){
            sphereMeshes[i].rotation.y =clock.getElapsedTime()*0.025;
        }
        renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}