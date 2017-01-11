// https://github.com/TriBlade9/VoxelMesher-BabylonJS/tree/master/js
// http://triblade9.github.io/VoxelMesher-BabylonJS/

import {
    BABYLON,
    Scene,
    FreeCamera,
    Vector3,
    Engine,
    Color3,
    HemisphericLight,
    Mesh,
    StandardMaterial,
    VertexData
} from 'babylonjs/babylon.max';

import { GreedyMesher } from './greedyMesher';
import { FastSimplexNoise, Options } from './fastSimplexNoise';

export class Game {
    private engine: BABYLON.Engine;
    private scene: BABYLON.Scene;
    private camera: BABYLON.FreeCamera;
    private light: BABYLON.Light;
    private standardMaterial: BABYLON.StandardMaterial;
    private simplexNoise: FastSimplexNoise = new FastSimplexNoise({amplitude: 4, frequency: 0.03, persistence: 0.25} as Options);

    public constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
    }

    public createScene(): void {
        this.scene = new Scene(this.engine);
        this.scene.gravity = new Vector3(0, -0.5, 0);
        this.scene.clearColor = new Color3(0.7, 0.7, 0.7);

        this.camera = new FreeCamera('camera1', new Vector3(0, 50, -100), this.scene);
        this.camera.setTarget(Vector3.Zero());
        this.camera.attachControl(this.canvas, false);
        this.light = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);

        let chunkSize: number = 30;
        for (let chunkZ: number = 0; chunkZ < 3; chunkZ++) {
            for (let chunkX: number = 0; chunkX < 3; chunkX++) {
                this.createMesh(
                    this.makeVoxels([chunkX * chunkSize, 0, chunkZ * chunkSize], [(chunkX + 1) * chunkSize, chunkSize, (chunkZ + 1) * chunkSize],
                        (x: number, y: number, z: number): number => {
                            let noise: number = this.simplexNoise.scaled3D(x, y, z);

                            return (0.2 < noise) ? 255 / (chunkX + 1) : 0; // very slow when colors defined like: 0xff0000
                        }
                    )
                );
            }
        }
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

    public hexToRGB(hexStr: string): number[] {
        let R: number = parseInt((this.trimHex(hexStr)).substring(0, 2), 16);
        let G: number = parseInt((this.trimHex(hexStr)).substring(2, 4), 16);
        let B: number = parseInt((this.trimHex(hexStr)).substring(4, 6), 16);
        let A: number = 1;

        return [R / 255, G / 255, B / 255, A];
    }

    public trimHex(h: string): string {
        return (h.charAt(0) === '#') ? h.substring(1, 7) : h;
    }

    private makeVoxels(l: number[], h: number[], f: (i: number, j: number, k: number) => number): {voxels: Int32Array, dims: number[], position: number[]} {
        let dimension: number[] = [h[0] - l[0], h[1] - l[1], h[2] - l[2]];
        let voxels: Int32Array = new Int32Array(dimension[0] * dimension[1] * dimension[2]);
        let n: number = 0;

        for (let k: number = l[2]; k < h[2]; ++k) {
            for (let j: number = l[1]; j < h[1]; ++j) {
                for (let i: number = l[0]; i < h[0]; ++i, ++n) {
                    voxels[n] = f(i, j, k);
                }
            }
        }

        return {voxels: voxels, dims: dimension, position: l};
    }

    private createMesh(voxelData: {voxels: Int32Array, dims: number[], position: number[]}): void {
        let meshData: {vertices: number[][]; faces: number[][]} = GreedyMesher.createMeshData(voxelData.voxels, voxelData.dims);

        let voxelMesh: BABYLON.Mesh = new Mesh('voxelMesh', this.scene);
        voxelMesh.position = Vector3.Zero();

        this.standardMaterial = new StandardMaterial('standardMaterial', this.scene);
        voxelMesh.material = this.standardMaterial;
        voxelMesh.position = new Vector3(voxelData.position[0], voxelData.position[1], voxelData.position[2]);

        let vertices: number[] = [];
        let tris: number[] = [];
        let colors: number[] = [];
        let normals: number[] = [];

        for (let i: number = 0; i < meshData.vertices.length; ++i) {
            let q: number[] = meshData.vertices[i];
            vertices.push(q[0], q[1], q[2]);
        }

        for (let i: number = 0; i < meshData.faces.length; ++i) {
            let q: number[] = meshData.faces[i];
            tris.push(q[2], q[1], q[0]);
            let myColors: number[] = this.hexToRGB(q[3].toString(16));
            for (let i2: number = 0; i2 < 4; i2++) {
                colors[q[i2] * 4] = myColors[0];
                colors[(q[i2] * 4) + 1] = myColors[1];
                colors[(q[i2] * 4) + 2] = myColors[2];
                colors[(q[i2] * 4) + 3] = myColors[3];
            }
        }

        // http://babylonjsguide.github.io/advanced/Custom
        VertexData.ComputeNormals(vertices, tris, normals);

        let vertexData: BABYLON.VertexData = new VertexData();
        vertexData.positions = vertices;
        vertexData.indices = tris;
        vertexData.normals = normals;
        vertexData.colors = colors;

        console.log('vertices', vertices.length);
        console.log('triangles', tris.length);

        vertexData.applyToMesh(voxelMesh, false);
        // blankmesh._updateBoundingInfo();
        // voxelMesh.checkCollisions = true;
    }
}
