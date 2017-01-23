import { HexagonGrid } from './hexagonGrid';

describe('HexagonGrid', () => {
    it('should get axial coordinate for 0/0', () => {
        let grid: HexagonGrid = new HexagonGrid(3, 50);

        let axial: BABYLON.Vector2 = grid.pixelToAxial(0, 0);

        expect(axial.x).toBe(0);
        expect(axial.y).toBe(0);
    });

    it('should get axial coordinate for 0/50', () => {
        let grid: HexagonGrid = new HexagonGrid(3, 50);

        let axial: BABYLON.Vector2 = grid.pixelToAxial(0, 50);

        expect(axial.x).toBe(0);
        expect(axial.y).toBe(1);
    });
});
