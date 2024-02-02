
import { BlockCreator } from "./BlockCreator";
import { TetrisOption } from "./TetrisOption";
import * as RAPIER from "@dimforge/rapier2d";

type RAPIER_API = typeof import("@dimforge/rapier2d");

export const BlockTypeList = ["I", "O", "T", "S", "Z", "J", "L"] as const;
export const BlockColorList = ["red", "yellow", "purple", "green", "teal", "blue", "orange"] as const;
export type BlockType = typeof BlockTypeList[number];
export type BlockColor = typeof BlockColorList[number];

export class Tetromino {
    private _rigidBody: RAPIER.RigidBody;
    private _fillStyle: string;
    private _type: string;

    public constructor(option: TetrisOption, world: RAPIER.World, rigidBody?: RAPIER.RigidBody, blockColor?: BlockColor, blockType?: BlockType) {
        const spawnX = option.spawnX ?? 0;
        const spawnY = option.spawnY ?? 0;
        
        this._fillStyle = blockColor!;
        this._type = blockType!;

        if (rigidBody) {
            this._rigidBody = rigidBody;
        } else {
            if (!blockType) {
                throw new Error("Failed to create tetromino: blockType is undefined.");
            }
            let bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(spawnX, spawnY);
            this._rigidBody = world.createRigidBody(bodyDesc);
            this._rigidBody.userData = blockType;
            BlockCreator.create(option.blockSize, blockType).forEach((value) => {
                world.createCollider(value, this._rigidBody);
            });
        }
    }

    public get fillStyle() {
        return this._fillStyle;
    }

    public get type() {
        return this._type;
    }

    public get rigidBody() {
        return this._rigidBody;
    }

    public update() {

    }

    public remove() {

    }
}