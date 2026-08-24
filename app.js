import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function App() {
  const mountRef = useRef(null);
  const [isRotating, setIsRotating] = useState(true);
  const [speed, setSpeed] = useState(2.0);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 600;
    const height = 450;

    // 1. Escena, Cámara y Renderizador
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b19);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(3, 3, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // 2. Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x38bdf8, 3);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 3. Objeto Principal: Disco / Cilindro 3D
    const diskGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 48);
    const diskMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x0284c7, 
      roughness: 0.2, 
      metalness: 0.8 
    });
    const disk = new THREE.Mesh(diskGeometry, diskMaterial);
    scene.add(disk);

    // 4. Indicador visual en el borde (para notar claramente el giro)
    const markerGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.3);
    const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xf43f5e });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(1.3, 0, 0);
    disk.add(marker);

    // 5. Flecha de Vector de Rotación / Momento Angular (Eje Y azul)
    const dirY = new THREE.Vector3(0, 1, 0);
    const originY = new THREE.Vector3(0, 0, 0);
    const lengthY = 2.2;
    const arrowL = new THREE.ArrowHelper(dirY, originY, lengthY, 0x38bdf8, 0.4, 0.2);
    scene.add(arrowL);

    // 6. Flecha de Torque (Vector Curvo / Tangencial simulado con una flecha roja en el borde)
    const dirX = new THREE.Vector3(1, 0, 0);
    const originX = new THREE.Vector3(1.5, 0.5, 0);
    const arrowTorque = new THREE.ArrowHelper(dirX, originX, 1.2, 0x10b981, 0.3, 0.15);
    scene.add(arrowTorque);

    // 7. Animación
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isRotating) {
        disk.rotation.y += speed * 0.016;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Limpieza al desmontar
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isRotating, speed]);

  return (
    <div className="viewer-container">
      <div className="viewer-card">
        <div className="viewer-header">
          <h2>Simulación 3D: Dinámica Rotacional y Vectores</h2>
          <span className="live-badge">🔴 En Vivo</span>
        </div>
        
        {/* Aquí es donde se inyecta el canvas de Three.js */}
        <div ref={mountRef} className="canvas-wrapper"></div>

        <div className="viewer-controls">
          <button 
            onClick={() => setIsRotating(!isRotating)} 
            className={`btn-control ${isRotating ? 'pause' : 'resume'}`}
          >
            {isRotating ? '⏸️ Pausar Movimiento' : '▶️ Reanudar Movimiento'}
          </button>

          <div className="speed-slider-group">
            <label>Velocidad de Giro:</label>
            <input 
              type="range" 
              min="0.5" 
              max="6.0" 
              step="0.5" 
              value={speed} 
              onChange={(e) => setSpeed(parseFloat(e.target.value))} 
            />
            <span>{speed} rad/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}