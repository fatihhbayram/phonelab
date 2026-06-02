'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

function IPhoneModel() {
  const { scene, animations } = useGLTF('/assets/model/iphone_12_teardown.glb');
  const groupRef = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(animations, groupRef);

  useEffect(() => {
    if (!groupRef.current) return;

    const box = new THREE.Box3().setFromObject(groupRef.current);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    if (maxDim > 0) {
      const scale = 3.4 / maxDim;
      groupRef.current.scale.setScalar(scale);
      groupRef.current.position.set(
        -center.x * scale,
        -center.y * scale,
        -center.z * scale,
      );
    }

    if (names.length > 0) {
      const action = actions[names[0]];
      if (action) {
        action.setLoop(THREE.LoopPingPong, Infinity);
        action.timeScale = 0.4;
        action.play();
      }
    }
  }, [scene, actions, names]);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* transparent background so the page bg + teal glow show through */}
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-5, -2, -3]} intensity={0.7} color="#2BC2D4" />
        <Suspense fallback={null}>
          <IPhoneModel />
          <Environment preset="city" />
        </Suspense>
        {/* drag-to-rotate only — no zoom/pan so it won't hijack page scroll */}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/assets/model/iphone_12_teardown.glb');
