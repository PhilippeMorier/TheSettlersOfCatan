import { BABYLON, Scene, FreeCamera, Vector3, Engine, HemisphericLight, MeshBuilder } from 'babylonjs/babylon.max';

export class Game {
    private engine: BABYLON.Engine;
    private scene: BABYLON.Scene;
    private camera: BABYLON.FreeCamera;
    private light: BABYLON.Light;

    constructor(private canvas: HTMLCanvasElement) {
        this.engine = new Engine(this.canvas, true);
    }

    public createScene(): void {
        this.scene = new Scene(this.engine);
        this.camera = new FreeCamera('camera1', new Vector3(0, 5, -10), this.scene);
        this.camera.setTarget(Vector3.Zero());
        this.camera.attachControl(this.canvas, false);
        this.light = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);

        let sphere = MeshBuilder.CreateSphere('sphere1', {segments: 16, diameter: 2}, this.scene);
        sphere.position.y = 1;
        let ground = MeshBuilder.CreateGround('ground1', {width: 6, height: 6, subdivisions: 2}, this.scene);
    }

    public animate(): void {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
}