import { Game } from './game';

window.addEventListener('DOMContentLoaded', () => {
    let canvas: HTMLCanvasElement = document.getElementById('renderCanvas') as HTMLCanvasElement;
    let game = new Game(canvas);

    game.createScene();
    game.animate();
});
