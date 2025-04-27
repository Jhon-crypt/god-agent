import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const OrbAnimation = () => {
  const containerRef = useRef();
  const orb = useRef();

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    // Set renderer size and properties
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Create the orb geometry
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const material = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform float uTime;
        
        void main() {
          vec3 baseColor = vec3(0.4, 0.2, 0.8); // Purple base
          vec3 glowColor = vec3(0.8, 0.3, 1.0); // Bright purple glow
          
          // Create pulsing effect
          float pulse = sin(uTime * 0.5) * 0.5 + 0.5;
          
          // Create pattern based on normal and time
          float pattern = sin(vNormal.x * 10.0 + uTime) * sin(vNormal.y * 10.0 + uTime) * 0.5 + 0.5;
          
          // Mix colors based on pattern and pulse
          vec3 finalColor = mix(baseColor, glowColor, pattern * pulse);
          
          // Add rim lighting
          float rimLight = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
          finalColor += glowColor * rimLight * pulse;
          
          gl_FragColor = vec4(finalColor, 0.9);
        }
      `,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
    });

    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);
    
    // Add point lights
    const light1 = new THREE.PointLight(0x9945FF, 1, 100);
    light1.position.set(5, 5, 5);
    scene.add(light1);
    
    const light2 = new THREE.PointLight(0x45A6FF, 1, 100);
    light2.position.set(-5, -5, 5);
    scene.add(light2);

    // Position camera
    camera.position.z = 5;

    // Animation loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      
      time += 0.01;
      material.uniforms.uTime.value = time;
      
      // Rotate orb
      orb.rotation.x += 0.001;
      orb.rotation.y += 0.002;
      
      renderer.render(scene, camera);
    };

    // Start animation
    animate();

    // Add floating animation with GSAP
    gsap.to(orb.position, {
      y: 0.2,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut"
    });

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default OrbAnimation; 