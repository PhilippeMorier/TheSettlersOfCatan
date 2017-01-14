// https://github.com/TriBlade9/VoxelMesher-BabylonJS/tree/master/js
// http://triblade9.github.io/VoxelMesher-BabylonJS/

import BABYLON = require('babylonjs/babylon.max');

import { Chunk } from './chunk';
import { SimplexNoise2DVoxelor, VoxelStrategy } from './voxelStrategy';
import { GreedMesher } from './meshStrategy';

export class Game {
    private engine: BABYLON.Engine;
    private scene: BABYLON.Scene;
    private camera: BABYLON.FreeCamera;
    private light: BABYLON.Light;
    private standardMaterial: BABYLON.StandardMaterial;

    public constructor(private canvas: HTMLCanvasElement) {
        this.engine = new BABYLON.Engine(this.canvas, true);
    }

    public createScene(): void {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.gravity = new BABYLON.Vector3(0, -0.5, 0);
        this.scene.clearColor = new BABYLON.Color3(0.7, 0.7, 0.7);

        this.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 100, -100), this.scene);
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.attachControl(this.canvas, false);
        this.light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene);

        this.standardMaterial = new BABYLON.StandardMaterial('standardMaterial', this.scene);

        this.addChunks();
    }

    public run(): void {
        this.engine.runRenderLoop(() => {
            this.standardMaterial.wireframe = (document.getElementById('wireframe') as HTMLInputElement).checked;
            this.standardMaterial.backFaceCulling = true;
            this.scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    private addChunks(): void {
        let voxelStrategy: VoxelStrategy = new SimplexNoise2DVoxelor();

        let worldSize: BABYLON.Vector3 = new BABYLON.Vector3(5, 2, 5);
        let chunkCounter: number = 0;

        for (let z: number = 0; z < worldSize.z; z++) {
            for (let y: number = 0; y < worldSize.y; y++) {
                for (let x: number = 0; x < worldSize.z; x++, chunkCounter++) {
                    let chunk: Chunk = new Chunk(new BABYLON.Vector3(x * 30, y * 30, z * 30), new BABYLON.Vector3(30, 30, 30), voxelStrategy, new GreedMesher());
                    chunk.initializeVoxel();
                    chunk.addToScene(this.scene, this.standardMaterial);
                }
                console.log(100 / (worldSize.x * worldSize.y * worldSize.z) * chunkCounter + '%');
            }
        }
    }
}
