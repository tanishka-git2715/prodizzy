import { useEffect, useRef } from "react";
import * as THREE from "three";

const RED = "#E63946";

export function WebGLMeshBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    container.appendChild(canvas);

    // Create a plane geometry with many segments for mesh distortion
    const segments = 32;
    const geometry = new THREE.PlaneGeometry(8, 8, segments, segments);
    const positions = geometry.attributes.position.array as Float32Array;

    // Store original y positions for animation
    const originalY = new Float32Array(positions.length);
    for (let i = 0; i < positions.length; i += 3) {
      originalY[i] = positions[i];
      originalY[i + 1] = positions[i + 1];
      originalY[i + 2] = positions[i + 2];
    }

    const material = new THREE.MeshBasicMaterial({
      color: RED,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI * 0.35;
    scene.add(mesh);

    let frame = 0;
    const clock = new THREE.Clock();

    function animate() {
      const t = clock.getElapsedTime();
      for (let i = 0; i < positions.length; i += 3) {
        const ix = originalY[i];
        const iy = originalY[i + 1];
        const wave = 0.15 * Math.sin(ix * 1.2 + t * 0.6) * Math.cos(iy * 1.2 + t * 0.4);
        positions[i + 2] = wave;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
      frame = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
      aria-hidden
    />
  );
}
