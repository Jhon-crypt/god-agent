// Create and initialize the orb animation
function initOrbAnimation() {
    console.log('Starting orb animation initialization...');
    
    const container = document.getElementById('orb-container');
    if (!container) {
        console.error('Orb container not found');
        return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    
    // Calculate container dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Camera setup with narrower FOV for better perspective
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Clear any existing canvas
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    container.appendChild(renderer.domElement);
    console.log('Renderer added to container');

    // Create the orb geometry - smaller size for better fit
    const geometry = new THREE.SphereGeometry(0.8, 64, 64);
    
    // Create simpler material for testing
    const material = new THREE.MeshPhongMaterial({
        color: 0x9945FF,
        emissive: 0x332288,
        specular: 0xFFFFFF,
        shininess: 100,
        transparent: true,
        opacity: 0.9
    });

    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);
    console.log('Orb added to scene');
    
    // Lighting setup - adjusted positions for better illumination
    const light1 = new THREE.PointLight(0x9945FF, 2, 100);
    light1.position.set(3, 3, 4);
    scene.add(light1);
    
    const light2 = new THREE.PointLight(0x45A6FF, 2, 100);
    light2.position.set(-3, -3, 4);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0x332288, 0.5);
    scene.add(ambientLight);
    console.log('Lights added to scene');

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        orb.rotation.x += 0.001;
        orb.rotation.y += 0.002;
        
        renderer.render(scene, camera);
    }

    animate();
    console.log('Animation started');

    // Add GSAP animations - smaller float range
    gsap.to(orb.position, {
        y: 0.1, // Float around the center position
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "power1.inOut"
    });

    // Handle window resize
    function handleResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    window.addEventListener('resize', handleResize);
    console.log('Resize handler added');
}

// Make it available globally
window.initOrbAnimation = initOrbAnimation; 