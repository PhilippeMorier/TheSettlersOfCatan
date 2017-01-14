import BABYLON = require('babylonjs/babylon.max');

import { VoxelData } from './voxelData';
import { FastSimplexNoise, Options } from './fastSimplexNoise';
import { GreedyMesher } from './greedyMesher';

export class Chunk {
    private voxels: VoxelData;
    private vertices: BABYLON.VertexData;

    public constructor(public position: BABYLON.Vector3,
                       public size: BABYLON.Vector3,
                       private voxelor: VoxelStrategy,
                       private mesher: MeshStrategy) {
    }

    public initializeVoxel(): void {
        let voxels: Int32Array = new Int32Array(this.size.x * this.size.y * this.size.z);
        let n: number = 0;

        for (let z: number = 0; z < this.size.z; ++z) {
            for (let y: number = 0; y < this.size.y; ++y) {
                for (let x: number = 0; x < this.size.x; ++x, ++n) {
                    voxels[n] = this.voxelor.generate(x + this.position.x, y + this.position.y, z + this.position.z);
                }
            }
        }

        this.voxels = new VoxelData(voxels, [this.size.x, this.size.y, this.size.z]);
    }

    public addToScene(scene: BABYLON.Scene, material: BABYLON.StandardMaterial): void {
        this.vertices = this.mesher.create(this.voxels);

        let voxelMesh: BABYLON.Mesh = new BABYLON.Mesh('Chunk_' + this.position.toString(), scene);
        voxelMesh.material = material;
        voxelMesh.position = this.position;

        this.vertices.applyToMesh(voxelMesh, false);
    }
}

export interface VoxelStrategy {
    generate(x: number, y: number, z: number): number;
}

export class SimplexNoiseVoxelor implements VoxelStrategy {
    private simplexNoise: FastSimplexNoise = new FastSimplexNoise({amplitude: 4, frequency: 0.03, persistence: 0.25} as Options);

    public generate(x: number, y: number, z: number): number {
        let noise: number = this.simplexNoise.scaled3D(x, y, z);

        if (0.2 <= noise && noise < 0.5) {
            return 1;
        }
        if (0.5 <= noise && noise < 0.8) {
            return 2;
        }
        if (0.8 <= noise && noise <= 1.0) {
            return 3;
        }

        return 0;
    }
}

export interface MeshStrategy {
    create(voxels: VoxelData): BABYLON.VertexData;
}

export class GreedMesher implements MeshStrategy {
    private colors: BABYLON.Color3[] = [
        BABYLON.Color3.Red(),
        BABYLON.Color3.Green(),
        BABYLON.Color3.Blue(),
        BABYLON.Color3.Black(),
        BABYLON.Color3.White(),
        BABYLON.Color3.Purple(),
        BABYLON.Color3.Magenta(),
        BABYLON.Color3.Yellow(),
        BABYLON.Color3.Gray()
    ];

    public create(voxels: VoxelData): BABYLON.VertexData {
        let meshData: {vertices: number[][]; faces: number[][]} = GreedyMesher.createMeshData(voxels.voxels, voxels.dims);

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

            let colorIndex: number = q[3];
            for (let i2: number = 0; i2 < 4; i2++) {
                colors[q[i2] * 4] = this.colors[colorIndex].r;
                colors[(q[i2] * 4) + 1] = this.colors[colorIndex].g;
                colors[(q[i2] * 4) + 2] = this.colors[colorIndex].b;
                colors[(q[i2] * 4) + 3] = 1;
            }
        }

        // http://babylonjsguide.github.io/advanced/Custom
        BABYLON.VertexData.ComputeNormals(vertices, tris, normals);

        let vertexData: BABYLON.VertexData = new BABYLON.VertexData();
        vertexData.positions = vertices;
        vertexData.indices = tris;
        vertexData.normals = normals;
        vertexData.colors = colors;

        return vertexData;
    }
}
