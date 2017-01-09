export class GreedyMesher {
    private static mask: Int32Array = new Int32Array(4096);

    public static createMesh(volume: Int32Array, dims: number[]): {vertices: number[][], faces: number[][]} {
        function getAt(i, j, k) {
            return volume[i + dims[0] * (j + dims[1] * k)];
        }

        //Sweep over 3-axes
        let vertices: number[][] = [];
        let faces: number[][] = [];

        for (let d = 0; d < 3; ++d) {
            let i, j, k, l, w, h
                , u = (d + 1) % 3
                , v = (d + 2) % 3
                , x = [0, 0, 0]
                , q = [0, 0, 0];
            if (GreedyMesher.mask.length < dims[u] * dims[v]) {
                GreedyMesher.mask = new Int32Array(dims[u] * dims[v]);
            }
            q[d] = 1;
            for (x[d] = -1; x[d] < dims[d];) {
                //Compute mask
                let n = 0;
                for (x[v] = 0; x[v] < dims[v]; ++x[v])
                    for (x[u] = 0; x[u] < dims[u]; ++x[u], ++n) {
                        let a = (0 <= x[d] ? getAt(x[0], x[1], x[2]) : 0)
                            , b = (x[d] < dims[d] - 1 ? getAt(x[0] + q[0], x[1] + q[1], x[2] + q[2]) : 0);
                        if ((!!a) === (!!b)) {
                            GreedyMesher.mask[n] = 0;
                        } else if (!!a) {
                            GreedyMesher.mask[n] = a;
                        } else {
                            GreedyMesher.mask[n] = -b;
                        }
                    }
                //Increment x[d]
                ++x[d];
                //Generate mesh for mask using lexicographic ordering
                n = 0;
                for (j = 0; j < dims[v]; ++j)
                    for (i = 0; i < dims[u];) {
                        let c = GreedyMesher.mask[n];
                        if (!!c) {
                            //Compute width
                            for (w = 1; c === GreedyMesher.mask[n + w] && i + w < dims[u]; ++w) {
                            }
                            //Compute height (this is slightly awkward
                            let done = false;
                            for (h = 1; j + h < dims[v]; ++h) {
                                for (k = 0; k < w; ++k) {
                                    if (c !== GreedyMesher.mask[n + k + h * dims[u]]) {
                                        done = true;
                                        break;
                                    }
                                }
                                if (done) {
                                    break;
                                }
                            }
                            //Add quad
                            x[u] = i;
                            x[v] = j;
                            let du = [0, 0, 0]
                                , dv = [0, 0, 0];
                            if (c > 0) {
                                dv[v] = h;
                                du[u] = w;
                            } else {
                                c = -c;
                                du[v] = h;
                                dv[u] = w;
                            }
                            let vertex_count = vertices.length;
                            vertices.push([x[0], x[1], x[2]]);
                            vertices.push([x[0] + du[0], x[1] + du[1], x[2] + du[2]]);
                            vertices.push([x[0] + du[0] + dv[0], x[1] + du[1] + dv[1], x[2] + du[2] + dv[2]]);
                            vertices.push([x[0] + dv[0], x[1] + dv[1], x[2] + dv[2]]);
                            faces.push([vertex_count, vertex_count + 1, vertex_count + 2, c]);
                            faces.push([vertex_count, vertex_count + 2, vertex_count + 3, c]);

                            //Zero-out mask
                            for (l = 0; l < h; ++l)
                                for (k = 0; k < w; ++k) {
                                    GreedyMesher.mask[n + k + l * dims[u]] = 0;
                                }
                            //Increment counters and continue
                            i += w;
                            n += w;
                        } else {
                            ++i;
                            ++n;
                        }
                    }
            }
        }
        return {vertices: vertices, faces: faces};
    }
}
