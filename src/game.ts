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
    MeshBuilder,
    VertecData,
    Mesh,
    StandardMaterial,
    VertexData
} from 'babylonjs/babylon.max';

import { GreedyMesh } from './greedyMesher';

export class Game {
    private engine: BABYLON.Engine;
    private scene: BABYLON.Scene;
    private camera: BABYLON.FreeCamera;
    private light: BABYLON.Light;
    private meshmat: BABYLON.StandardMaterial;

    private voxelData = this.makeVoxels([0,0,0], [7,7,1], function(i,j,k) {
        if( (i == 2 && j == 1) ||
            (i == 5 && j == 2) ||
            (i == 1 && j == 4) ||
            (i == 4 && j == 5) ) {
            return 0x00ff;
        }
        return 0xeedd00;
    });

    private makeVoxels(l, h, f) {
        var d = [h[0] - l[0], h[1] - l[1], h[2] - l[2]]
            , v = new Int32Array(d[0] * d[1] * d[2])
            , n = 0;
        for (var k = l[2]; k < h[2]; ++k)
            for (var j = l[1]; j < h[1]; ++j)
                for (var i = l[0]; i < h[0]; ++i, ++n) {
                    v[n] = f(i, j, k);
                }

        return {voxels: v, dims: d};
    }

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
    }

    public createScene(): void {
        // this.scene = new Scene(this.engine);
        // this.scene.gravity = new Vector3(0,-0.5,0);
        // this.scene.clearColor = new Color3(0.7,0.7,0.7);
        //
        // this.camera = new FreeCamera('camera1', new Vector3(0, 5, -10), this.scene);
        // this.camera.setTarget(Vector3.Zero());
        // this.camera.attachControl(this.canvas, false);
        // this.light = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);

        this.scene = new Scene(this.engine);
        this.scene.gravity = new Vector3(0,-0.5,0);
        this.scene.clearColor = new Color3(0.7,0.7,0.7);
        this.camera = new FreeCamera("camera1", new Vector3(-5, -5, -5), this.scene);

        this.camera.setTarget(Vector3.Zero());

        this.camera.attachControl(this.canvas, false);

        var light0 = new HemisphericLight("Hemi0", new Vector3(0, 1, 0), this.scene);
        light0.diffuse = new Color3(1.2, 1.2, 1.2);
        light0.specular = new Color3(0.2, 0.2, 0.2);
        light0.groundColor = new Color3(0.2, 0.2, 0.2);

        // http://babylonjsguide.github.io/advanced/Custom
        let result = GreedyMesh(this.voxelData.voxels, this.voxelData.dims);

        let blankmesh: BABYLON.Mesh = new Mesh('blank', this.scene);
        blankmesh.position = Vector3.Zero();
        this.meshmat = new StandardMaterial('blankmat', this.scene);
        blankmesh.material = this.meshmat;
        blankmesh.position = new Vector3(-this.voxelData.dims[0] / 2, -this.voxelData.dims[1] / 2, -this.voxelData.dims[2] / 4);

        let vertices = [];
        let tris = [];
        let colors = [];
        let normals = [];
        for (let i = 0; i < result.vertices.length; ++i) {
            let q = result.vertices[i];
            vertices.push(q[0], q[1], q[2]);
        }
        for (let i = 0; i < result.faces.length; ++i) {
            let q = result.faces[i];
            tris.push(q[2], q[1], q[0]);
            let myColors = this.hexToRGB(q[3].toString(16), 255);
            for (let i2 = 0; i2 < 4; i2++) {
                colors[q[i2] * 4] = myColors[0];
                colors[(q[i2] * 4) + 1] = myColors[1];
                colors[(q[i2] * 4) + 2] = myColors[2];
                colors[(q[i2] * 4) + 3] = myColors[3];
            }
        }
        VertexData.ComputeNormals(vertices, tris, normals);
        let vertexData = new VertexData();
        vertexData.positions = vertices;
        vertexData.indices = tris;
        vertexData.normals = normals;
        vertexData.colors = colors;

        console.log('vertexData.positions', vertexData.positions.length);
        console.log('vertexData.indices', vertexData.indices.length);

        vertexData.applyToMesh(blankmesh, true);
        blankmesh._updateBoundingInfo();
        blankmesh.checkCollisions = true;
    }

    public animate(): void {
        this.engine.runRenderLoop(() => {
            this.meshmat.wireframe = true;
            this.meshmat.backFaceCulling = true;
            this.scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    public hexToRGB(hexStr, divInt): any {
        let R = parseInt((this.trimHex(hexStr)).substring(0, 2), 16);
        let G = parseInt((this.trimHex(hexStr)).substring(2, 4), 16);
        let B = parseInt((this.trimHex(hexStr)).substring(4, 6), 16);
        let A = 1;

        if (!divInt) {
            divInt = 1;
        }
        return [R / divInt, G / divInt, B / divInt, A];
    }

    public trimHex(h) {
        return (h.charAt(0) == "#") ? h.substring(1, 7) : h;
    }
}
