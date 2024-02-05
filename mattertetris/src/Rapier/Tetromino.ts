
import { BlockCreator } from "./BlockCreator";
import { TetrisOption } from "./TetrisOption";
import * as RAPIER from "@dimforge/rapier2d";
import * as PIXI from "pixi.js";

type RAPIER_API = typeof import("@dimforge/rapier2d");

export const BlockTypeList = ["I", "O", "T", "S", "Z", "J", "L"] as const;
export type BlockType = typeof BlockTypeList[number];

export class Tetromino {
    private _rigidBody: RAPIER.RigidBody;
    private _blockColor: number;
    private _type: string;
    private _graphics: PIXI.Graphics[];
    private _context: PIXI.Container;
    private _world: RAPIER.World;

    public constructor(option: TetrisOption, world: RAPIER.World, ctx: PIXI.Container, rigidBody?: RAPIER.RigidBody, blockColor?: number, blockType?: BlockType) {
        const spawnX = option.spawnX ?? 0;
        const spawnY = option.spawnY ?? 0;
        this._world = world;
        this._blockColor = blockColor!;
        this._type = blockType!;
        this._context = ctx;
        if (rigidBody) {
            this._rigidBody = rigidBody;
        } else {
            if (!blockType) {
                throw new Error("Failed to create tetromino: blockType is undefined.");
            }
            let bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(spawnX, spawnY);
            this._rigidBody = world.createRigidBody(bodyDesc);
            this._rigidBody.userData = blockType;
            BlockCreator.createTetromino(option.blockSize, blockType).forEach((value) => {
                world.createCollider(value, this._rigidBody).setRestitution(0);
            });
        }

        this._graphics = [];
    }

    public addGraphics(graphics: PIXI.Graphics) {
        this._graphics.push(graphics);
    }

    public set graphics(graphics: PIXI.Graphics[]) {
        this._graphics = graphics;
    }
    
    public get fillStyle() {
        return this._blockColor;
    }

    public get type() {
        return this._type;
    }

    public get rigidBody() {
        return this._rigidBody;
    }

    public remove() {
        this._graphics.forEach((value) => {
            this._context.removeChild(value);
        });

        this._world.removeRigidBody(this._rigidBody);
    }
}