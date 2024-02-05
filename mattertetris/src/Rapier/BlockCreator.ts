import { LinearAlgebra } from "./LinearAlgebra";
import { BlockType } from "./Tetromino";
import * as RAPIER from "@dimforge/rapier2d";

export class BlockCreator {
    public static createTetromino(blockSize: number, blockType: BlockType) {
        switch (blockType) {
            case "I":
                return this.createI(blockSize / 2);
            case "O":
                return this.createO(blockSize / 2);
            case "T":
                return this.createT(blockSize / 2);
            case "S":
                return this.createS(blockSize / 2);
            case "Z":
                return this.createZ(blockSize / 2);
            case "J":
                return this.createJ(blockSize / 2);
            case "L":
                return this.createL(blockSize / 2);
            default:
                throw new Error("Failed to create block: Unkown block type");
        }
    }

    public static createPolygon(x: number, y: number, coords: Float32Array | number[]) {
        const center = LinearAlgebra.center(coords);
        for (let i = 0; i < coords.length; i += 2) {
            coords[i] -= center[0];
            coords[i + 1] -= center[1];
        }
        
        return RAPIER.ColliderDesc.convexHull(new Float32Array(coords))?.setTranslation(x, y);
    }

    public static createRawPolygon(coords: Array<number>) {
        return RAPIER.ColliderDesc.convexHull(new Float32Array(coords));
    }

    private static createRectangle(rad: number) {
        return RAPIER.ColliderDesc.convexHull(new Float32Array([
            -rad, -rad,
            -rad, +rad,
            +rad, +rad,
            +rad, -rad  
        ]));
    }

    public static createO(rad: number) {
        let colliderDesc1 = this.createRectangle(rad)!.setTranslation(2 * rad, 0);
        let colliderDesc2 = this.createRectangle(rad)!.setTranslation(0, 2 * rad);
        let colliderDesc3 = this.createRectangle(rad)!.setTranslation(2 * rad, 2 * rad);
        let colliderDesc4 = this.createRectangle(rad)!.setTranslation(0, 0);
        return [colliderDesc1, colliderDesc2, colliderDesc3, colliderDesc4];
    }

    public static createI(rad: number) {
        let colliderDesc1 = this.createRectangle(rad)!.setTranslation(0, 0);
        let colliderDesc2 = this.createRectangle(rad)!.setTranslation(0, 1 * 2 * rad);
        let colliderDesc3 = this.createRectangle(rad)!.setTranslation(0, 2 * 2 * rad);
        let colliderDesc4 = this.createRectangle(rad)!.setTranslation(0, 3 * 2 * rad);
        return [colliderDesc1, colliderDesc2, colliderDesc3, colliderDesc4];
    }

    public static createT(rad: number) {
        let colliderDesc1 = this.createRectangle(rad)!.setTranslation(0, 0).setRestitution(0.1).setFriction(1.0);
        let colliderDesc2 = this.createRectangle(rad)!.setTranslation(2 * rad, 0).setRestitution(0.1).setFriction(1.0);
        let colliderDesc3 = this.createRectangle(rad)!.setTranslation(-2 * rad, 0).setRestitution(0.1).setFriction(1.0);
        let colliderDesc4 = this.createRectangle(rad)!.setTranslation(0, 2 * rad).setRestitution(0.1).setFriction(1.0);
        return [colliderDesc1, colliderDesc2, colliderDesc3, colliderDesc4];
    }

    public static createS(rad: number) {
        let colliderDesc1 = this.createRectangle(rad)!.setTranslation(0, 0);
        let colliderDesc2 = this.createRectangle(rad)!.setTranslation(-2 * rad, 0);
        let colliderDesc3 = this.createRectangle(rad)!.setTranslation(2 * rad, 2 * rad);
        let colliderDesc4 = this.createRectangle(rad)!.setTranslation(0, 2 * rad);
        return [colliderDesc1, colliderDesc2, colliderDesc3, colliderDesc4];
    }

    public static createZ(rad: number) {
        let colliderDesc1 = this.createRectangle(rad)!.setTranslation(0, 0);
        let colliderDesc2 = this.createRectangle(rad)!.setTranslation(2 * rad, 0);
        let colliderDesc3 = this.createRectangle(rad)!.setTranslation(-2 * rad, 2 * rad);
        let colliderDesc4 = this.createRectangle(rad)!.setTranslation(0, 2 * rad);
        return [colliderDesc1, colliderDesc2, colliderDesc3, colliderDesc4];
    }

    public static createL(rad: number) {
        let colliderDesc1 = this.createRectangle(rad)!.setTranslation(2 * rad, 2 * rad);
        let colliderDesc2 = this.createRectangle(rad)!.setTranslation(0, 1 * 2 * rad);
        let colliderDesc3 = this.createRectangle(rad)!.setTranslation(0, 2 * 2 * rad);
        let colliderDesc4 = this.createRectangle(rad)!.setTranslation(0, 3 * 2 * rad);
        return [colliderDesc1, colliderDesc2, colliderDesc3, colliderDesc4];
    }

    public static createJ(rad: number) {
        let colliderDesc1 = this.createRectangle(rad)!.setTranslation(-2 * rad, 2 * rad);
        let colliderDesc2 = this.createRectangle(rad)!.setTranslation(0, 1 * 2 * rad);
        let colliderDesc3 = this.createRectangle(rad)!.setTranslation(0, 2 * 2 * rad);
        let colliderDesc4 = this.createRectangle(rad)!.setTranslation(0, 3 * 2 * rad);
        return [colliderDesc1, colliderDesc2, colliderDesc3, colliderDesc4];
    }
}
