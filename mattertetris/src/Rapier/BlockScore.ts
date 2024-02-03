import { Geometry, intersection } from "martinez-polygon-clipping";
import Mapper from "./Mapper";
import RAPIER from "@dimforge/rapier2d";

export function calculateArea(vertices: Float32Array | Array<number>) {
    const n = vertices.length;
    let area = 0;

    for (let i = 0; i < vertices.length; i += 2) {
        const currentX = vertices[i];
        const currentY = vertices[i + 1];
        const nextX = vertices[(i + 2) % n];
        const nextY = vertices[(i + 3) % n];
        area += currentX * nextY - nextX * currentY;
    }

    area = Math.abs(area) / 2;
    return area;
}

export function calculateLineIntersectionArea(body: RAPIER.RigidBody, line: Geometry) {
    let sum = 0;

    for (let i = 0; i < body.numColliders(); i++) {
        const collider = body.collider(i);
        const geoJSON = Mapper.colliderToGeoJSON(collider);
        const intersectionResult = intersection(geoJSON, line);
        if (!intersectionResult || intersectionResult.length <= 0) {
            continue;
        }

        sum += calculateArea(Mapper.geoJSONToVectors(intersectionResult[0]));
    }

    return sum;
}