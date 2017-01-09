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

export class Game {
    private engine: BABYLON.Engine;
    private scene: BABYLON.Scene;
    private camera: BABYLON.FreeCamera;
    private light: BABYLON.Light;
    private standardMaterial: BABYLON.StandardMaterial;

    public constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
    }

    public createScene(): void {
        this.scene = new Scene(this.engine);
        this.scene.gravity = new Vector3(0, -0.5, 0);
        this.scene.clearColor = new Color3(0.7, 0.7, 0.7);

        this.camera = new FreeCamera('camera1', new Vector3(0, 5, -10), this.scene);
        this.camera.setTarget(Vector3.Zero());
        this.camera.attachControl(this.canvas, false);
        this.light = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);

        let voxelData: {voxels: Int32Array; dims: number[]} = this.makeVoxels([0, 0, 0], [7, 7, 1], (i: number, j: number, k: number): number => {
            if ((i === 2 && j === 1) ||
                (i === 5 && j === 2) ||
                (i === 1 && j === 4) ||
                (i === 4 && j === 5)) {
                return 0x00ff;
            }
            return 0xeedd00;
        });
        this.createMesh(voxelData);
    }

    public run(): void {
        this.engine.runRenderLoop(() => {
            this.standardMaterial.wireframe = true;
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

    private makeVoxels(l: number[], h: number[], f: (i: number, j: number, k: number) => number): {voxels: Int32Array; dims: number[]} {
        let d: number[] = [h[0] - l[0], h[1] - l[1], h[2] - l[2]];
        let v: Int32Array = new Int32Array(d[0] * d[1] * d[2]);
        let n: number = 0;

        for (let k: number = l[2]; k < h[2]; ++k) {
            for (let j: number = l[1]; j < h[1]; ++j) {
                for (let i: number = l[0]; i < h[0]; ++i, ++n) {
                    v[n] = f(i, j, k);
                }
            }
        }

        return {voxels: v, dims: d};
    }

    private createMesh(voxelData: {voxels: Int32Array; dims: number[]}): void {
        let meshData: {vertices: number[][]; faces: number[][]} = GreedyMesher.createMeshData(voxelData.voxels, voxelData.dims);

        let voxelMesh: BABYLON.Mesh = new Mesh('voxelMesh', this.scene);
        voxelMesh.position = Vector3.Zero();

        this.standardMaterial = new StandardMaterial('standardMaterial', this.scene);
        voxelMesh.material = this.standardMaterial;
        voxelMesh.position = new Vector3(-voxelData.dims[0] / 2, -voxelData.dims[1] / 2, -voxelData.dims[2] / 4);

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

        vertexData.applyToMesh(voxelMesh, true);
        // blankmesh._updateBoundingInfo();
        voxelMesh.checkCollisions = true;
    }
}
