import BABYLON = require('babylonjs/babylon.max');

import { VoxelData } from './voxelData';
import { VoxelStrategy } from './voxelStrategy';
import { MeshStrategy } from './meshStrategy';

export class Chunk {
    private voxels: VoxelData;
    private vertices: BABYLON.VertexData;

    public constructor(public position: BABYLON.Vector3,
                       public size: BABYLON.Vector3,
                       private voxelor: VoxelStrategy,
                       private mesher: MeshStrategy) {
    }

    // private getVoxel(x: number, y: number, z: number): number {
    //     return this.voxels.voxels[i + dims[0] * (j + dims[1] * k)];
    // }

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
