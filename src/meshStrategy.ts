import BABYLON = require('babylonjs/babylon.max');

import { VoxelData } from './voxelData';
import { GreedyMesher } from './greedyMesher';

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
        let meshData: {vertices: number[][]; faces: number[][]} = GreedyMesher.createMeshData(voxels.voxels, voxels.dimension);

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
