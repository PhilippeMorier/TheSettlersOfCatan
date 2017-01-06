import { BABYLON, Engine } from 'babylonjs/babylon.max';

class app {
    public static run(): void {
        let canvas: HTMLCanvasElement = document.getElementById('renderCanvas') as HTMLCanvasElement;
        let engine: BABYLON.Engine = new Engine(canvas, true);
    }
}

app.run();
