import { HexagonGrid } from './hexagonGrid';

describe('HexagonGrid', () => {
    it('should make dummy test', () => {
        let grid: HexagonGrid = new HexagonGrid(3, 50);

        expect(grid).toBeDefined();
    });
});
