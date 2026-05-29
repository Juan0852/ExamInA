import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { GLView } from "expo-gl";
import { Renderer, THREE } from "expo-three";
import { Asset } from "expo-asset";
import * as THREE_MODULE from "three";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function SplashScreen3D() {
  return (
    <View style={styles.container}>
      <View style={styles.sceneContainer}>
        <MedalScene />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>ExamInA</Text>
        <Text style={styles.subtitle}>Preparación PAU / Selectividad Inteligente</Text>
      </View>
    </View>
  );
}

function MedalScene() {
  const rendererRef = useRef<Renderer | null>(null);
  const frameIdRef = useRef<number | null>(null);

  const onContextCreate = async (gl: WebGLRenderingContext) => {
    try {
      const renderer = new Renderer({ gl });
      rendererRef.current = renderer;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, SCREEN_WIDTH / (SCREEN_WIDTH * 1.1), 0.1, 100);
      camera.position.set(0, 0, 5);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.58);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xe0f2fe, 2.05);
      dirLight1.position.set(3, 4, 5);
      scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x7dd3fc, 0.82);
      dirLight2.position.set(-4, 1, 3);
      scene.add(dirLight2);

      const pointLight1 = new THREE.PointLight(0x0ea5e9, 1.05, 20);
      pointLight1.position.set(-3, -2, 4);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xbfdbfe, 0.45, 20);
      pointLight2.position.set(2.5, 0.5, 2);
      scene.add(pointLight2);

      const asset = Asset.fromModule(require("../../assets/base_basic_shaded.glb"));
      await asset.downloadAsync();

      if (!asset.localUri) {
        console.error("Failed to download GLB asset");
        return;
      }

      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader");
      const loader = new GLTFLoader();
      const gltf: THREE_MODULE.Group = await new Promise((resolve, reject) => {
        loader.load(asset.localUri!, (g: any) => resolve(g.scene), undefined, reject);
      });

      gltf.traverse((object: any) => {
        if (object instanceof THREE.Mesh && object.material) {
          const mat = (object.material as THREE.MeshStandardMaterial).clone();
          mat.metalness = 0.95;
          mat.roughness = 0.14;
          mat.side = THREE.DoubleSide;
          object.material = mat;
        }
      });

      const front = gltf.clone(true);
      front.position.z = 0.1;

      const back = gltf.clone(true);
      back.scale.set(1, 1, -1);
      back.position.z = -0.1;
      back.traverse((object: any) => {
        if (object instanceof THREE.Mesh && object.material) {
          (object.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
        }
      });

      const medalGroup = new THREE.Group();
      medalGroup.add(front);
      medalGroup.add(back);
      scene.add(medalGroup);

      const render = () => {
        frameIdRef.current = requestAnimationFrame(render);

        medalGroup.rotation.y += 0.008;
        medalGroup.rotation.x = Math.sin(Date.now() * 0.0005) * 0.08;

        renderer.render(scene, camera);
        (gl as any).endFrameEXP();
      };

      render();
    } catch (err) {
      console.error("3D scene error:", err);
    }
  };

  useEffect(() => {
    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  return (
    <GLView style={styles.glView} onContextCreate={onContextCreate} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111F",
    justifyContent: "center",
    alignItems: "center",
  },
  sceneContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.1,
    justifyContent: "center",
    alignItems: "center",
  },
  glView: {
    flex: 1,
    width: "100%",
  },
  textContainer: {
    alignItems: "center",
    marginTop: -40,
    paddingBottom: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#EAF2FF",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#33D6D0",
    marginTop: 8,
    fontWeight: "600",
  },
});