export class Hexagon {
    public get height(): number {
        return 2 * this.sideLength;
    }

    public get width(): number {
        return Math.sqrt(3) * this.sideLength;
    }

    public constructor(private sideLength: number) {

    }
}
