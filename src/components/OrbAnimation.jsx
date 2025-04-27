import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Create and initialize the orb animation
function initOrbAnimation() {
    const container = document.getElementById('orb-container');
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Calculate container dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    
    // Set renderer size and properties
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create the orb geometry
    const geometry = new THREE.SphereGeometry(1.2, 128, 128);
    
    // Create custom shader material
    const material = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform float uTime;
            
            void main() {
                vec3 baseColor = vec3(0.4, 0.2, 0.8);     // Deep purple
                vec3 glowColor = vec3(0.8, 0.3, 1.0);     // Bright purple
                vec3 accentColor = vec3(0.2, 0.4, 1.0);   // Blue accent
                
                float mainPulse = sin(uTime * 0.5) * 0.5 + 0.5;
                float secondaryPulse = cos(uTime * 0.3) * 0.5 + 0.5;
                
                float pattern = sin(vNormal.x * 15.0 + uTime) * sin(vNormal.y * 15.0 + uTime * 0.8);
                pattern += sin(vNormal.z * 10.0 + uTime * 1.2) * 0.5;
                pattern = pattern * 0.5 + 0.5;
                
                float rimLight = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
                float glowStrength = mix(0.5, 1.0, mainPulse);
                
                vec3 finalColor = mix(baseColor, glowColor, pattern * mainPulse);
                finalColor = mix(finalColor, accentColor, pattern * secondaryPulse * 0.5);
                finalColor += glowColor * rimLight * glowStrength;
                
                finalColor += sin(vPosition.y * 2.0 + uTime) * 0.1;
                
                gl_FragColor = vec4(finalColor, 0.95);
            }
        `,
        uniforms: {
            uTime: { value: 0 }
        },
        transparent: true,
        side: THREE.FrontSide,
    });

    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);
    
    // Enhanced lighting setup
    const light1 = new THREE.PointLight(0x9945FF, 3, 100);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    
    const light2 = new THREE.PointLight(0x45A6FF, 3, 100);
    light2.position.set(-5, -5, 5);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0x332288, 0.7);
    scene.add(ambientLight);

    // Position camera
    camera.position.z = 4;

    // Animation loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        
        time += 0.01;
        material.uniforms.uTime.value = time;
        
        orb.rotation.x += 0.0005;
        orb.rotation.y += 0.001;
        
        renderer.render(scene, camera);
    }

    animate();

    // Add animations with GSAP
    gsap.to(orb.position, {
        y: 0.2,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "power1.inOut"
    });

    gsap.to(orb.scale, {
        x: 1.05,
        y: 1.05,
        z: 1.05,
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
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
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', initOrbAnimation); 