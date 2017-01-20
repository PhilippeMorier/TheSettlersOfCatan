import BABYLON = require('babylonjs/babylon.max');

export class HexagonPosition {
    public axial: {column: number, row: number};
    public cube: BABYLON.Vector3;
    public pixel: BABYLON.Vector2;

    public constructor(column: number, row: number, public size: number) {
        this.axial = {column: column, row: row};
        this.cube = this.axialToCube(column, row);
        this.pixel = this.axialToPixel(column, row);
    }

    private axialToPixel(column: number, row: number): BABYLON.Vector2 {
        let x: number = this.size * Math.sqrt(3) * (column + row / 2);
        let y: number = this.size * 3 / 2 * row;

        return new BABYLON.Vector2(x, y);
    }

    private axialToCube(column: number, row: number): BABYLON.Vector3 {
        return new BABYLON.Vector3(column, -column - row, row);
    }
}
