import { Engine, Runner, World } from "matter-js";
import { Wall } from "./Wall";
import { TetrisOption } from "./TetrisGame";
// @ts-ignore
import * as Resurrect from 'resurrect-js';
import { BlockCreator } from "./BlockCreator";
/* other-client side view of tetris */
export class TetrisView {
    private _engine;
    private wall;
    private _serializer;
    private option: TetrisOption;
    public constructor(engine: Engine, option: TetrisOption) {
        this._engine = engine;
        this.option = option;
        console.log("만듬")
        this.wall = new Wall(this.option);
        this._serializer = new Resurrect({ prefix: '$', cleanup: true });
        this._serializer.parse = this._serializer.resurrect;
        this.spawnTransparentBlock();
        this.wall.rigidBodies.forEach((value) => World.addBody(this._engine.world, value));
    }

    public spawnTransparentBlock() {
        let block = BlockCreator.create(-1000, -100, {
            friction: this.option.blockFriction,
            restitution: this.option.blockRestitution,
            size: this.option.blockSize,
            type: "I",
            fillStyle: "red"
        });
        console.log("스폰함");
        World.add(this.option.engine.world, block);
    }
    
    public applyWorld(json: string) {
        let load = this._serializer.parse(json);
        if (load) {
            Engine.merge(this._engine, { world: load });
            this.spawnTransparentBlock();
        }
    }
}