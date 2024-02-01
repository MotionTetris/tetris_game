import { Body, Bodies } from 'matter-js';

export interface BlockOption {
    fillStyle?: string;
    friction?: number;
    restitution?: number;
    type: BlockType;
    size: number;
}

export const BlockTypeList = ["I", "O", "T", "S", "Z", "J", "L"] as const;
export const BlockColorList = ["red", "yellow", "purple", "green", "teal", "blue", "orange"] as const;
export type BlockType = typeof BlockTypeList[number];

export class BlockCreator {
    private constructor() {}

    public static create(x: number, y: number, option: BlockOption) {
        const parts = this.createParts(x, y, option);
        return Body.create({ parts: parts, label: option.type});
    }

    private static createRectangle(x: number, y: number, xOffset: number, yOffset: number, option: BlockOption) {
        const blockSize = option.size;
        return Bodies.rectangle(x + xOffset * blockSize, y + yOffset * blockSize, blockSize, blockSize, {
            friction: option.friction,
            restitution: option.restitution,
            render: { fillStyle: option.fillStyle },
            slop: 0,
            label: `${option.type} part`
        });
    }

    private static createParts(x: number, y: number, option: BlockOption) {
        switch (option.type) {
            case "I":
                return [
                    this.createRectangle(x, y, 0, 0, option),
                    this.createRectangle(x, y, 0, 1, option),
                    this.createRectangle(x, y, 0, 2, option),
                    this.createRectangle(x, y, 0, 3, option)
                ];
            case "O":
                return [
                    this.createRectangle(x, y, 0, 0, option),
                    this.createRectangle(x, y, 1, 0, option),
                    this.createRectangle(x, y, 0, 1, option),
                    this.createRectangle(x, y, 1, 1, option)
                ];
            case "T":
                return [
                    this.createRectangle(x, y, 0, 0, option),
                    this.createRectangle(x, y, -1, 1, option),
                    this.createRectangle(x, y, 0, 1, option),
                    this.createRectangle(x, y, 1, 1, option)
                ];
            case "S":
                return [
                    this.createRectangle(x, y, 0, 0, option),
                    this.createRectangle(x, y, 1, 0, option),
                    this.createRectangle(x, y, -1, 1, option),
                    this.createRectangle(x, y, 0, 1, option)
                ];
            case "Z":
                return [
                    this.createRectangle(x, y, 0, 0, option),
                    this.createRectangle(x, y, -1, 0, option),
                    this.createRectangle(x, y, 0, 1, option),
                    this.createRectangle(x, y, 1, 1, option)
                ];
            case "J":
                return [
                    this.createRectangle(x, y, 0, 0, option),
                    this.createRectangle(x, y, 0, 1, option),
                    this.createRectangle(x, y, 0, 2, option),
                    this.createRectangle(x, y, -1, 2, option)
                ];
            case "L":
                return [
                    this.createRectangle(x, y, 0, 0, option),
                    this.createRectangle(x, y, 0, 1, option),
                    this.createRectangle(x, y, 0, 2, option),
                    this.createRectangle(x, y, 1, 2, option)
                ];
            default:
                throw new Error(`Invalid block type: ${option.type}`);
        }
    }
}