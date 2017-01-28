import { FastSimplexNoise, Options } from '../mesh/fastSimplexNoise';

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

// export class ColorVoxelor implements VoxelStrategy {
//     public constructor(private colorIndex: number) {
//
//     }
//
//     public generate(x: number, y: number, z: number): number {
//         return this.colorIndex;
//     }
// }

export abstract class GaussianFalloffVoxelor implements VoxelStrategy {
    public constructor(private amplitude: number, private x0: number, private y0: number, private sigmaX: number, private sigmaY: number) {
    }

    public abstract generate(x: number, y: number, z: number): number;

    protected calculateGassian(x: number, y: number): number {
        let exponent: number =
            -(
                ( Math.pow(x - this.x0, 2) / (2 * Math.pow(this.sigmaX, 2)))
                + ( Math.pow(y - this.y0, 2) / (2 * Math.pow(this.sigmaY, 2)))
            );

        return this.amplitude * Math.pow(Math.E, exponent);
    };
}

export class GaussianVoxelor extends GaussianFalloffVoxelor {
    public constructor(amplitude: number, x0: number, y0: number, sigmaX: number, sigmaY: number) {
        super(amplitude, x0, y0, sigmaX, sigmaY);
    }

    public generate(x: number, y: number, z: number): number {
        if (y < super.calculateGassian(x, z) * 30) {
            return 2;
        }

        return 0;
    }
}

export class MountainVoxelor extends GaussianFalloffVoxelor {
    private landNoise: FastSimplexNoise = new FastSimplexNoise({octaves: 1, amplitude: 1, frequency: 0.025, persistence: 0.25} as Options);

    public generate(x: number, y: number, z: number): number {

        let landNoise: number = this.landNoise.scaled2D(x, z) + 1;
        let falloff: number = super.calculateGassian(x, z);

        let height: number = falloff * landNoise * 25;

        if (y <= 0 && height <= 1) {
            return 6;
        }

        if (y > height) {
            return 0;
        }
        if (y > height - 5) {
            return 3;
        }
        if (y > height - 10) {
            return 4;
        }

        return 7;
    }
}
