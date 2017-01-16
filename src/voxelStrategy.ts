import BABYLON = require('babylonjs/babylon.max');

import { FastSimplexNoise, Options } from './fastSimplexNoise';

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

export class SimplexNoise2DVoxelor implements  VoxelStrategy {
    private landNoise: FastSimplexNoise = new FastSimplexNoise({octaves: 1, amplitude: 1, frequency: 0.025, persistence: 0.25} as Options);
    // private falloffNoise: FastSimplexNoise = new FastSimplexNoise({octaves: 3, amplitude: 0.3, frequency: 0.005, persistence: 0.5} as Options);
    private falloff: (x: number, y: number) => number = this.makeGaussian(1, 75, 75, 25, 25);

    public generate(x: number, y: number, z: number): number {
        if (y < 1 && this.isPointInsideHexagon(new BABYLON.Vector2(x, z))) {
            return 6;
        }

        let landNoise: number = this.landNoise.scaled2D(x, z) + 1;
        // let falloffNoise: number = this.falloffNoise.scaled2D(x, z) + 1;
        let falloff: number = this.falloff(x, z);

        // let height: number = landNoise * 30;
        // let height: number = falloffNoise * 30;
        let height: number = falloff * landNoise * 15;

        if (y > height) {
            return 0;
        }
        if (y > height - 5) {
            return 3;
        }
        if (y > height - 30) {
            return 4;
        }

        return 7;
    }

    private makeGaussian(amplitude: number, x0: number, y0: number, sigmaX: number, sigmaY: number): (x: number, y: number) => number {
        return function (x: number, y: number): number {
            let exponent: number =
                -(
                    ( Math.pow(x - x0, 2) / (2 * Math.pow(sigmaX, 2)))
                    + ( Math.pow(y - y0, 2) / (2 * Math.pow(sigmaY, 2)))
                );

            return amplitude * Math.pow(Math.E, exponent);
        };
    }

    private isPointInsideHexagon(point: BABYLON.Vector2): boolean {
        // http://www.playchilla.com/how-to-check-if-a-point-is-inside-a-hexagon
        let center: BABYLON.Vector2 = new BABYLON.Vector2(75, 75);
        let radius: number = 75;
        const q2x: number = Math.abs(point.x - center.x); // transform the test point locally and to quadrant 2
        const q2y: number = Math.abs(point.y - center.y); // transform the test point locally and to quadrant 2

        if (q2x > radius || q2y > radius) {
            return false; // bounding test (since q2 is in quadrant 2 only 2 tests are needed)
        }

        return (radius * radius - (radius / 2) * q2x - radius * q2y) >= 0;   // finally the dot product can be reduced to this due to the hexagon symmetry
    }
}
