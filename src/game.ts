// https://github.com/TriBlade9/VoxelMesher-BabylonJS/tree/master/js
// http://triblade9.github.io/VoxelMesher-BabylonJS/

import BABYLON = require('babylonjs/babylon.max');

import { Chunk, SimplexNoiseVoxelor, GreedMesher } from './chunk';

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

        this.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 50, -100), this.scene);
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
        let simplexNoiseVoxelor = new SimplexNoiseVoxelor();

        for (let z: number = 0; z < 2; z++) {
            for (let y: number = 0; y < 2; y++) {
                for (let x: number = 0; x < 2; x++) {
                    let chunk: Chunk = new Chunk(new BABYLON.Vector3(x * 30, y * 30, z * 30), new BABYLON.Vector3(30, 30, 30), simplexNoiseVoxelor, new GreedMesher());
                    chunk.initializeVoxel();
                    chunk.addToScene(this.scene, this.standardMaterial);
                }
            }
        }
    }
}
