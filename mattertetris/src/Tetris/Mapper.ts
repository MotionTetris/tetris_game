import Matter from "matter-js";

export default class GeoJSONMapper {
    private constructor() {}

    public static geoJSONToVectors(geometry: any) {
        if (!geometry) {
            console.error("geometry is null or undefined");
            return;
        }

        if (geometry.length !== 1) {
            console.log(geometry);
            console.error("invalid geometry");
            return;
        }

        const polygon = geometry[0].slice();
        polygon.pop();
        const result = polygon.map(this.mapToVector);
        return result;
    }

    public static vectorsToGeoJSON(body: Matter.Body) {
        let vertices = Matter.Vertices.clockwiseSort(body.vertices.slice());
        vertices.push(vertices[0]);
        return [vertices.map(this.vectorToArray)];
    }

    private static mapToVector(coord: any) {
        if (coord.length !== 2) {
            console.error("invalid coordinates");
            return;
        }

        return { x: coord[0], y: coord[1] };
    }

    private static vectorToArray(vector: Matter.Vector) {
        return [vector.x, vector.y];
    }
}