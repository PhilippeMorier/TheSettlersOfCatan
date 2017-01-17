import { Hexagon } from './hexagon';

describe('Hexagon', () => {
    it('should calculate height', () => {
        let hexagon: Hexagon = new Hexagon(50);

        expect(hexagon.height).toBe(100);
    });

    it('should calculate width', () => {
        let hexagon: Hexagon = new Hexagon(50);

        expect(hexagon.width).toBe(86.60254037844386);
    });
});
