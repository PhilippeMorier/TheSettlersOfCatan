import BABYLON = require('babylonjs/babylon.max');

import { Hexagon } from './hexagon';
import { VoxelStrategy, MountainVoxelor } from '../voxel/voxelStrategy';

export class HexagonGrid {
    private hexagons: Hexagon[][] = [];

    public constructor(private radius: number, private edgeWidth: number) {
        this.initializeRows();
    }

    public getHexagon(column: number, row: number): Hexagon {
        let index: BABYLON.Vector2 = this.axialToIndex(column, row);

        return this.hexagons[index.x][index.y];
    }

    public setHexagon(column: number, row: number, hexagon: Hexagon): void {
        let index: BABYLON.Vector2 = this.axialToIndex(column, row);

        this.hexagons[index.x][index.y] = hexagon;
    }

    public addNewOreHexagonAt(column: number, row: number): Hexagon {
        let pixelPosition: BABYLON.Vector2 = this.axialToPixel(column, row);
        let voxelor: VoxelStrategy = new MountainVoxelor(0.5, pixelPosition.x, pixelPosition.y, 15, 15);
        let hexagon: Hexagon = new Hexagon(voxelor);

        this.setHexagon(column, row, hexagon);

        return hexagon;
    }

    public getHexagonByPixel(x: number, y: number): Hexagon {
        let axial: BABYLON.Vector2 = this.pixelToAxial(x, y);

        return this.getHexagon(axial.x, axial.y);
    }

    public pixelToAxial(x: number, y: number): BABYLON.Vector2 {
        return this.cubeToAxial(this.pixelToCube(x, y));
    }

    private axialToPixel(column: number, row: number): BABYLON.Vector2 {
        let x: number = this.edgeWidth * Math.sqrt(3) * (column + row / 2);
        let y: number = this.edgeWidth * 3 / 2 * row;

        return new BABYLON.Vector2(x, y);
    }

    private cubeToAxial(cube: BABYLON.Vector3): BABYLON.Vector2 {
        return new BABYLON.Vector2(cube.x, cube.z);
    }

    private pixelToCube(x: number, y: number): BABYLON.Vector3 {
        let column: number = (x * Math.sqrt(3) / 3 - y / 3) / this.edgeWidth;
        let row: number = y * 2 / 3 / this.edgeWidth;

        return this.roundToNearestCube(this.axialToCube(column, row));
    }

    private axialToCube(column: number, row: number): BABYLON.Vector3 {
        return new BABYLON.Vector3(column, -column - row, row);
    }

    private roundToNearestCube(cube: BABYLON.Vector3): BABYLON.Vector3 {
        // http://www.redblobgames.com/grids/hexagons/#rounding

        let xRounded: number = Math.round(cube.x);
        let yRounded: number = Math.round(cube.y);
        let zRounded: number = Math.round(cube.z);

        let xDelta: number = Math.abs(xRounded - cube.x);
        let yDelta: number = Math.abs(yRounded - cube.y);
        let zDelta: number = Math.abs(zRounded - cube.z);

        if (xDelta > yDelta && xDelta > zDelta) {
            xRounded = -yRounded - zRounded;
        }
        else if (yDelta > zDelta) {
            yRounded = -xRounded - zRounded;
        }
        else {
            zRounded = -xRounded - yRounded;
        }

        return new BABYLON.Vector3(xRounded, yRounded, zRounded);
    }

    private axialToIndex(column: number, row: number): BABYLON.Vector2 {
        let rowIndex: number = row + this.radius;
        let columnIndex: number = column + this.radius + Math.min(0, row);

        return new BABYLON.Vector2(rowIndex, columnIndex);
    }

    private initializeRows(): void {
        for (let i: number = 0; i < 2 * this.radius + 1; i++) {
            this.hexagons[i] = [];
        }
    }
}
