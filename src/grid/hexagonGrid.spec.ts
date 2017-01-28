import { HexagonGrid } from './hexagonGrid';
import { Hexagon } from './hexagon';
import { MountainVoxelor } from '../voxel/voxelStrategy';

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

    it('should add a new ore hexagon at 0/1', () => {
        let grid: HexagonGrid = new HexagonGrid(1, 50);

        let oreHexagon: Hexagon = grid.addNewOreHexagonAt(0, 1);

        expect(oreHexagon instanceof  Hexagon).toBeTruthy();
        expect(oreHexagon.voxelor instanceof MountainVoxelor).toBeTruthy();
    });
});
