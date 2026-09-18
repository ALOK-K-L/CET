'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeJSTooth() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    
    // Clear previous elements if any
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. High-grade Medical Materials
    // Translucent Enamel
    const enamelMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfdfefe,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.04,
      roughness: 0.22,
      metalness: 0.05,
      transmission: 0.25, // Subtle glass/enamel translucency
      thickness: 1.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      reflectivity: 0.9,
    });

    // Translucent Gingiva (Gum tissue at base)
    const gumMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf43f5e,
      emissive: 0xbe123c,
      emissiveIntensity: 0.15,
      roughness: 0.35,
      metalness: 0.0,
      transmission: 0.2,
      opacity: 0.75,
      transparent: true,
    });

    // Master Tooth Group
    const toothGroup = new THREE.Group();

    // 3. Anatomical Mesh Sculpting
    // A. The Crown (Molar with cusps and fissures)
    const crownGeo = new THREE.CylinderGeometry(1.25, 0.95, 1.4, 32, 16);
    const pos = crownGeo.attributes.position;
    // Displace vertices to form natural 4-cusp molar occlusal morphology
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Crown top occlusal table anatomy
      if (y > 0.4) {
        const cuspElevation = Math.sin(x * 2.8) * Math.cos(z * 2.8) * 0.22;
        const centralGroove = Math.exp(-(x * x + z * z) * 1.8) * -0.25;
        pos.setY(i, y + cuspElevation + centralGroove);
      }

      // Bulge tooth equator naturally
      if (y > -0.2 && y < 0.3) {
        const equatorBulge = 1.08;
        pos.setX(i, x * equatorBulge);
        pos.setZ(i, z * equatorBulge);
      }
    }
    crownGeo.computeVertexNormals();
    const crownMesh = new THREE.Mesh(crownGeo, enamelMaterial);
    crownMesh.position.y = 0.5;
    toothGroup.add(crownMesh);

    // B. The Roots (Bifurcated anatomical roots)
    function createMolarRoot(xOffset: number, zOffset: number, taperCurve: number) {
      const rootGeo = new THREE.ConeGeometry(0.55, 1.9, 24, 20);
      const rPos = rootGeo.attributes.position;
      for (let i = 0; i < rPos.count; i++) {
        let y = rPos.getY(i);
        let x = rPos.getX(i);
        // Curve root apex slightly inward
        rPos.setX(i, x + (1.0 - y) * taperCurve);
      }
      rootGeo.computeVertexNormals();
      const rootMesh = new THREE.Mesh(rootGeo, enamelMaterial);
      rootMesh.rotation.x = Math.PI;
      rootMesh.position.set(xOffset, -0.9, zOffset);
      return rootMesh;
    }

    const mesialRoot = createMolarRoot(-0.45, 0.05, 0.08);
    const distalRoot = createMolarRoot(0.45, -0.05, -0.08);
    toothGroup.add(mesialRoot);
    toothGroup.add(distalRoot);

    // C. Subtle Cervical Gum Base Collar
    const gumTorusGeo = new THREE.TorusGeometry(1.02, 0.18, 16, 40);
    const gumMesh = new THREE.Mesh(gumTorusGeo, gumMaterial);
    gumMesh.rotation.x = Math.PI / 2;
    gumMesh.position.y = -0.15;
    toothGroup.add(gumMesh);

    // D. Glowing Clinical Inspection Vector Rings & Data Halo
    const ringGeo = new THREE.RingGeometry(1.5, 1.54, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const dataRing = new THREE.Mesh(ringGeo, ringMat);
    dataRing.rotation.x = Math.PI / 2;
    dataRing.position.y = 0.2;
    toothGroup.add(dataRing);

    // Micro glowing clinical measurement nodes on tooth surface
    const nodeGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const activeBleedingMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

    const node1 = new THREE.Mesh(nodeGeo, nodeMat);
    node1.position.set(0.9, 0.6, 0.6);
    toothGroup.add(node1);

    const node2 = new THREE.Mesh(nodeGeo, activeBleedingMat); // BOP Indicator node
    node2.position.set(-0.85, -0.1, 0.75);
    toothGroup.add(node2);

    scene.add(toothGroup);

    // 4. Photorealistic Medical Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x06b6d4, 1.4);
    fillLight.position.set(-6, 3, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x0284c7, 1.0);
    rimLight.position.set(0, -5, 3);
    scene.add(rimLight);

    // 5. Interactive Drag & Natural Oscillation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let userRotationY = -0.35;
    let userRotationX = 0.15;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      userRotationY += deltaX * 0.008;
      userRotationX += deltaY * 0.008;
      userRotationX = Math.max(-0.6, Math.min(0.6, userRotationX));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => { isDragging = false; };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    container.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });
    window.addEventListener('touchmove', (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;
      userRotationY += deltaX * 0.008;
      userRotationX += deltaY * 0.008;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    window.addEventListener('touchend', onMouseUp);

    const onResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', onResize);

    // 6. Animation Loop
    const clock = new THREE.Clock();
    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!isDragging) {
        userRotationY += 0.004;
      }

      toothGroup.rotation.y = userRotationY;
      toothGroup.rotation.x = userRotationX + Math.sin(elapsedTime * 0.8) * 0.05;
      toothGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;

      dataRing.rotation.z = elapsedTime * 0.2;
      const scalePulse = 1 + Math.sin(elapsedTime * 2.5) * 0.03;
      dataRing.scale.set(scalePulse, scalePulse, 1);

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="relative w-full aspect-square max-w-[540px] rounded-3xl cursor-grab active:cursor-grabbing flex items-center justify-center"></div>;
}
