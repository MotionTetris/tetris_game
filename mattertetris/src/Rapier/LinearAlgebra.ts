export class LinearAlgebra {
    public static center(coords: Float32Array | Array<number>) {
        let x = 0;
        let y = 0;
        for (let i = 0; i < coords.length; i += 2) {
            x += coords[i];
            y += coords[i + 1];
        }

        x /= coords.length / 2;
        y /= coords.length / 2;
        return [x, y]
    }

    public static rotate(coords: Float32Array | Array<number>, radian: number) {
        let ret = coords.slice();
        for (let i = 0; i < coords.length; i += 2) {
            const x = coords[i];
            const y = coords[i+1];
            ret[i] = x * Math.cos(radian) - y * Math.sin(radian);
            ret[i + 1] = x * Math.sin(radian) + y * Math.cos(radian);
        } 

        return ret;
    }

    public static translate(coords: Float32Array | Array<number>, x: number, y: number) {
        let ret = coords.slice();
        for (let i = 0; i < coords.length; i += 2) {
            ret[i] += x;
            ret[i + 1] += y;
        }

        return ret;
    }

    public static rotateInplace(coords: Float32Array | Array<number>, radian: number) {
        let center = this.center(coords);
        let origin = this.translate(coords, -center[0], -center[1]);
        let rotate = this.rotate(origin, radian);
        let ret = this.translate(rotate, center[0], center[1]);
        return ret;
    }
}