import RAPIER from "@dimforge/rapier2d";
import { calculatePosition } from "./BlockRemove";

export default class GeoJSONMapper {
    private constructor() {}

    public static geoJSONToVectors(geometry: number[][] | number[][][]) {
        let ret = geometry.flat(4)!;
        ret.pop();
        ret.pop();
        return ret;
    }

    public static colliderToGeoJSON(collider: RAPIER.Collider): number[][][] {
        let vertices = collider.vertices();
        if (vertices.length % 2 !== 0) {
            throw new Error("Invalid vertices: # of vertices is odd");
        }

        if (vertices.length == 0) {
            throw new Error("Invalid vertices: # of vertices is zero");
        }

        let position = calculatePosition(collider);
        const result = [];
        for (let i = 0; i < position.length; i += 2) {
            const pair = [position[i], position[i + 1]];
            result.push(pair);
        }

        result.push(result[0].slice());
        return [result];
    }
}