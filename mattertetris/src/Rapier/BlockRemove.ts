import { Geometry, diff } from "martinez-polygon-clipping";
import UnionFind from "./UnionFind";
import RAPIER from "@dimforge/rapier2d";
import Mapper from "./Mapper";
import { LinearAlgebra } from "./LinearAlgebra";
import { BlockCreator } from "./BlockCreator";
import { calculateArea } from "./BlockScore";

export function removeLines(body: RAPIER.RigidBody, line: Geometry) {
    const diffResults: Float32Array[] = [];

    for (let i = 0; i < body.numColliders(); i++) {
        const collider = body.collider(i);
        const geoJSON = Mapper.colliderToGeoJSON(collider);
        const diffResult = diff(geoJSON, line);
        const result = diffResult.map((position) => {
            let vector = Mapper.geoJSONToVectors(position);
            return new Float32Array(vector);
        });

        for (let j = 0; j < result.length; j++) {
            if (!result[j] || result[j].length % 2 != 0) {
                continue;
            }

            /* Too small pieces crashs the engine. */
            if (checkShape(result[j])) {
                diffResults.push(result[j]);    
            }
        }
    }

    if (diffResults.length == 0) {
        return;
    }

    /* Merge new bodies. */
    const unionFind = new UnionFind(diffResults.length);
    for (let i = 0; i < diffResults.length; i++) {
        for (let j = i + 1; j < diffResults.length; j++) {
            let combine = shouldCombine(diffResults[i], diffResults[j], 1);
            if (combine) {
                unionFind.union(i, j);
            }
        }
    }

    const group = new Map<number, Float32Array[]>();
    for (let i = 0; i < diffResults.length; i++) {
        let root = unionFind.find(i);
        if (group.get(root)) {
            group.get(root)?.push(diffResults[i]);
            continue;
        }

        group.set(root, []);
        group.get(root)?.push(diffResults[i]);
    }

    const coliderToAdd: RAPIER.ColliderDesc[][] = [];
    group.forEach((value) => {
        let colliderDescs = [];
        for (let i = 0; i < value.length; i++) {
            let center = LinearAlgebra.center(value[i]);
            let colliderDesc = BlockCreator.createPolygon(center[0], center[1], value[i]);
            
            if (colliderDesc) {
                colliderDescs.push(colliderDesc);
                continue;
            }
            
            console.error(`Failed to create ColliderDesc ${center[0]} ${center[1]}`, value[i]);
        }
        coliderToAdd.push(colliderDescs);
    });

    return coliderToAdd;
}

export function calculatePosition(collider: RAPIER.Collider) {
    let coords = collider.vertices();
    let rotation = LinearAlgebra.rotate(coords, collider.rotation());
    let transition = LinearAlgebra.translate(rotation, collider.translation().x, collider.translation().y);
    return transition;
}

function shouldCombine(body1: Float32Array, body2: Float32Array, maxDistance: number) {

    for (let i = 0; i < body1.length; i += 2) {
        for (let j = 0; j < body2.length; j += 2) {
            let distance = calculateDistance(body1[i], body1[i + 1], body2[j], body2[j + 1]);
            if (distance <= maxDistance) {
                return true;
            }
        }
    }

    function calculateDistance(x1: number, y1: number, x2: number, y2: number) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    return false;
}

/* Prevent crashing engine */
function checkShape(vertices: Float32Array) {
    if (calculateArea(vertices) > 50) {
        return true;
    }
    return false;
}