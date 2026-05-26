import { Canvas, useFrame } from "@react-three/fiber";
import { Bounds, Center, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import { Mesh, MeshPhysicalMaterial, Group, Box3 } from "three";

function PlatinumParticles() {
  const groupRef = useRef<Group>(null);
  const particles = useMemo(() => {
      const particleCount = 150;

      return Array.from({ length: particleCount }, (_, index) => {
      const radius = 1.75 + Math.random() * 1.65;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      return {
        key: `particle-${index}`,
        position: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        ] as [number, number, number],
        scale: 0.012 + Math.random() * 0.032
      };
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y = state.clock.elapsedTime * 0.055 + state.pointer.x * 0.22;
    groupRef.current.rotation.x = state.clock.elapsedTime * 0.025 - state.pointer.y * 0.16;
  });

  return (
    <group ref={groupRef}>
      {particles.map((particle) => (
        <mesh key={particle.key} position={particle.position} scale={particle.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0ea5e9"
            emissiveIntensity={0.65}
            roughness={0.32}
            metalness={0.2}
            transparent
            opacity={0.82}
          />
        </mesh>
      ))}
    </group>
  );
}

function OpeningHalo() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.15) * 0.035;
    groupRef.current.scale.setScalar(pulse);
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.28) * 0.08;
  });

  return (
    <group ref={groupRef} position={[0, 0, -0.35]}>
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[1.86, 0.012, 12, 160]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.34} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 5]}>
        <torusGeometry args={[2.18, 0.008, 12, 160]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.22} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 7]}>
        <torusGeometry args={[2.48, 0.006, 12, 160]} />
        <meshBasicMaterial color="#bfdbfe" transparent opacity={0.16} />
      </mesh>
    </group>
  );
}

function LogoModel() {
  const model = useGLTF("/models/base_basic_shaded.glb");
  const groupRef = useRef<Group>(null);
  // Usar la escena original con sus colores reales del modelo GLB con un toque metálico pulido y espejo de cara en Z
  const colorScene = useMemo(() => {
    const scene = model.scene.clone(true);
    
    // Primero, hacemos que los materiales del modelo sean altamente metálicos y reflectantes
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        
        // Modificar ligeramente el material existente para darle brillo metálico sin perder color
        if (object.material) {
          const mat = object.material.clone();
          
          if ("metalness" in mat) {
            // @ts-ignore
            mat.metalness = 0.95; // Brillo metálico cromado alto
          }
          if ("roughness" in mat) {
            // @ts-ignore
            mat.roughness = 0.14; // Superficie muy pulida para reflejos nítidos
          }
          if ("clearcoat" in mat) {
            // @ts-ignore
            mat.clearcoat = 0.9; // Capa de esmalte brillante tipo lacado
          }
          if ("clearcoatRoughness" in mat) {
            // @ts-ignore
            mat.clearcoatRoughness = 0.08;
          }
          
          object.material = mat;
        }
      }
    });

    // Calcular la caja delimitadora del modelo para obtener la coordenada de la base plana
    const box = new Box3().setFromObject(scene);
    // El relieve del GLB apunta naturalmente hacia +Z, por lo que la base plana está en box.min.z
    const zFlat = Math.abs(box.min.z); // Profundidad desde el centro hasta la base plana

    // Creamos un contenedor Group para albergar y fusionar ambas caras
    const container = new Group();

    // ── CARA DELANTERA ──────────────────────────────────────────────────────
    // El relieve original del GLB apunta hacia +Z (hacia el espectador).
    // Mantenemos la escala original (sin invertir) para que el relieve quede hacia adelante.
    const frontScene = scene.clone(true);
    frontScene.scale.set(1, 1, 1); // Relieve → +Z (hacia adelante) ✓
    
    // Nos acercamos al centro quedando solo un 20% del grosor separadas,
    // de modo que los relieves sobresalen por ambos lados pero las bases casi se tocan.
    frontScene.position.z = zFlat * 0.5;

    // ── CARA TRASERA ────────────────────────────────────────────────────────
    // Invertimos la escala en Z para reflejar el modelo.
    // Después de la inversión, el relieve (antes en +Z) ahora apunta hacia -Z (hacia atrás). ✓
    const backScene = scene.clone(true);
    backScene.scale.set(1, 1, -1); // Relieve → -Z (hacia atrás) ✓
    
    // Simétrico: misma distancia al centro en dirección -Z.
    backScene.position.z = -(zFlat * 0.5);

    // Habilitamos DoubleSide en ambas caras para evitar problemas de caras ocultas (backface culling)
    const applyDoubleSide = (s: any) => {
      s.traverse((object: any) => {
        if (object instanceof Mesh && object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => {
              mat.side = 2; // THREE.DoubleSide
            });
          } else {
            object.material.side = 2; // THREE.DoubleSide
          }
        }
      });
    };

    applyDoubleSide(frontScene);
    applyDoubleSide(backScene);

    container.add(frontScene);
    container.add(backScene);

    return container;
  }, [model.scene]);



  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y = state.clock.elapsedTime * 0.14;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={colorScene} />
      </Center>
    </group>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.58} />
      <directionalLight position={[3, 4, 5]} intensity={2.05} color="#e0f2fe" />
      <directionalLight position={[-4, 1, 3]} intensity={0.82} color="#7dd3fc" />
      <pointLight position={[-3, -2, 4]} intensity={1.05} color="#0ea5e9" />
      <pointLight position={[2.5, 0.5, 2]} intensity={0.45} color="#bfdbfe" />
    </>
  );
}

interface LogoScene3DProps {
  className?: string;
  showEffects?: boolean;
  showModel?: boolean;
}

export function LogoScene3D({
  className = "relative mx-auto h-[280px] w-full max-w-[460px] sm:h-[360px] lg:h-[420px]",
  showEffects = true,
  showModel = true
}: LogoScene3DProps) {
  if (!showModel) {
    return (
      <div className={className}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 38 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
        >
          <SceneLights />
          <Suspense fallback={null}>
            {showEffects ? (
              <>
                <OpeningHalo />
                <PlatinumParticles />
              </>
            ) : null}
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>
    );
  }

  return (
    <div className={className}>
      {showEffects ? (
        <div className="pointer-events-none absolute -inset-x-28 -inset-y-20 z-0 sm:-inset-x-40 sm:-inset-y-28 lg:-inset-x-56 lg:-inset-y-36">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 38 }}
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true }}
          >
            <SceneLights />
            <Suspense fallback={null}>
              <OpeningHalo />
              <PlatinumParticles />
              <Environment preset="city" />
            </Suspense>
          </Canvas>
        </div>
      ) : null}
      <Canvas
        className="relative z-10"
        camera={{ position: [0, 0, 5], fov: 38 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <SceneLights />
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.2}>
            <LogoModel />
          </Bounds>
          <OrbitControls
            enableDamping
            enablePan={false}
            enableZoom={false}
            rotateSpeed={0.6}
            dampingFactor={0.08}
            minPolarAngle={Math.PI / 2.8}
            maxPolarAngle={Math.PI / 1.8}
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/base_basic_shaded.glb");
