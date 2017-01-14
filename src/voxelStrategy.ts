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
    private simplexNoise: FastSimplexNoise = new FastSimplexNoise({amplitude: 4, frequency: 0.005, persistence: 0.25} as Options);

    public generate(x: number, y: number, z: number): number {
        let noise: number = this.simplexNoise.scaled2D(x, z) + 1;
        let height: number = noise * 30;

        if (y > height) {
            return 0;
        }
        if (y > height - 5) {
            return 4;
        }
        if (y > height - 30) {
            return 1;
        }

        return 3;
    }
}
