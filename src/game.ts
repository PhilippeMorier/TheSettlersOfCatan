// https://github.com/TriBlade9/VoxelMesher-BabylonJS/tree/master/js
// http://triblade9.github.io/VoxelMesher-BabylonJS/

import BABYLON = require('babylonjs/babylon.max');

import { Chunk } from './chunk';
import { MountainVoxelor } from './voxelStrategy';
import { GreedMesher } from './meshStrategy';
import { HexagonGrid } from './hexagonGrid';
import { Hexagon } from './hexagon';

export class Game {
    private engine: BABYLON.Engine;
    private scene: BABYLON.Scene;
    private camera: BABYLON.FreeCamera;
    private light: BABYLON.Light;
    private standardMaterial: BABYLON.StandardMaterial;
    private grid: HexagonGrid;

    public constructor(private canvas: HTMLCanvasElement) {
        this.engine = new BABYLON.Engine(this.canvas, true);
    }

    public createScene(): void {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.gravity = new BABYLON.Vector3(0, -0.5, 0);
        this.scene.clearColor = new BABYLON.Color3(0.7, 0.7, 0.7);

        this.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 200, -200), this.scene);
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.attachControl(this.canvas, false);
        this.light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this.scene);

        this.standardMaterial = new BABYLON.StandardMaterial('standardMaterial', this.scene);

        let centre: BABYLON.Vector2;
        this.grid = new HexagonGrid(3, 50);
        this.grid.setHexagon(0, 0, new Hexagon(new MountainVoxelor(0.5, 0, 0, 15, 15)));

        centre = this.grid.axialToPixel(1, 0);
        this.grid.setHexagon(1, 0, new Hexagon(new MountainVoxelor(0.5, centre.x, centre.y, 15, 15)));

        centre = this.grid.axialToPixel(0, 1);
        this.grid.setHexagon(0, 1, new Hexagon(new MountainVoxelor(0.5, centre.x, centre.y, 15, 15)));

        centre = this.grid.axialToPixel(-1, 1);
        this.grid.setHexagon(-1, 1, new Hexagon(new MountainVoxelor(0.5, centre.x, centre.y, 15, 15)));

        centre = this.grid.axialToPixel(-1, 0);
        this.grid.setHexagon(-1, 0, new Hexagon(new MountainVoxelor(0.5, centre.x, centre.y, 15, 15)));

        centre = this.grid.axialToPixel(0, -1);
        this.grid.setHexagon(0, -1, new Hexagon(new MountainVoxelor(0.5, centre.x, centre.y, 15, 15)));

        centre = this.grid.axialToPixel(1, -1);
        this.grid.setHexagon(1, -1, new Hexagon(new MountainVoxelor(0.5, centre.x, centre.y, 15, 15)));

        this.addChunks();
    }

    public run(): void {
        this.engine.runRenderLoop(() => {
            (document.getElementById('fps') as HTMLSpanElement).innerText = this.engine.getFps().toFixed() + 'fps';
            this.standardMaterial.wireframe = (document.getElementById('wireframe') as HTMLInputElement).checked;
            this.standardMaterial.backFaceCulling = true;
            this.scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    private addChunks(): void {
        let worldSize: BABYLON.Vector3 = new BABYLON.Vector3(10, 1, 10);
        let chunkCounter: number = 0;
        let chunkSize: number = 40;

        for (let z: number = -worldSize.z / 2; z < worldSize.z / 2; z++) {
            for (let y: number = -worldSize.y / 2; y < worldSize.y / 2; y++) {
                for (let x: number = -worldSize.x / 2; x < worldSize.x / 2; x++, chunkCounter++) {
                    let chunk: Chunk = new Chunk(
                        new BABYLON.Vector3(x * chunkSize, y * chunkSize, z * chunkSize),
                        new BABYLON.Vector3(chunkSize, chunkSize, chunkSize),
                        new GreedMesher(),
                        this.grid
                    );
                    setTimeout(() => {
                        chunk.initializeVoxel();
                        chunk.addToScene(this.scene, this.standardMaterial);
                    }, 1);
                }
            }
        }
    }
}
