import { HexagonPosition } from './hexagonPosition';

describe('HexagonPosition', () => {
    it('should calculate axial', () => {
        let position: HexagonPosition = new HexagonPosition(1, 1, 50);

        expect(position.axial.column).toBe(1);
        expect(position.axial.row).toBe(1);
    });

    it('should calculate cube', () => {
        let position: HexagonPosition = new HexagonPosition(1, 1, 50);

        expect(position.cube.x).toBe(1);
        expect(position.cube.y).toBe(-2);
        expect(position.cube.z).toBe(1);
    });

    it('should calculate pixel', () => {
        let position: HexagonPosition = new HexagonPosition(1, 0, 50);

        expect(position.pixel.x).toBe(86.60254037844386);
        expect(position.pixel.y).toBe(0);
    });

    it('should calculate pixel', () => {
        let position: HexagonPosition = new HexagonPosition(2, 1, 50);

        expect(position.pixel.x).toBe(2.5 * 86.60254037844386);
        expect(position.pixel.y).toBe(75);
    });
});
