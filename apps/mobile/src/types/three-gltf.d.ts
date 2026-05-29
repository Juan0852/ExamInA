declare module "three/examples/jsm/loaders/GLTFLoader" {
  import { Group } from "three";
  export class GLTFLoader {
    load(
      url: string,
      onLoad: (gltf: { scene: Group }) => void,
      onProgress?: ((event: ProgressEvent) => void) | undefined,
      onError?: ((event: ErrorEvent) => void) | undefined
    ): void;
  }
}