import { IObject } from "./IObject";
import TetrisGame, { TetrisOption } from "./TetrisGame";
import { Bodies, Body } from "matter-js";

export class Wall implements IObject {
    private _game: TetrisGame;
    private _rigidBodies: Body[];

    public constructor(game: TetrisGame, option: TetrisOption) {
        this._game = game;
        this._rigidBodies = [];
        this.create(option.view.width, option.view.height, 10, 20, option.blockSize);
    }

    private create(canvasWidth: number, canvasHeight: number, width: number, height: number, blockSize: number) {
        const wall_thick = 60;
        const ground = Bodies.rectangle(canvasWidth / 2, height * blockSize + wall_thick / 2, canvasWidth, wall_thick, {
            isStatic: true,
            label: 'ground'
        });

        const leftWall = Bodies.rectangle(canvasWidth / 2 - width / 2 * blockSize - wall_thick / 2, canvasHeight / 2, wall_thick, canvasHeight, {
            isStatic: true,
            friction: 0,
            label: 'wall'
        });

        const rightWall = Bodies.rectangle(canvasWidth / 2 + width / 2 * blockSize + wall_thick / 2, canvasHeight / 2, wall_thick, canvasHeight, {
            isStatic: true,
            friction: 0,
            label: 'wall'
        });

        this._rigidBodies.push(...[ground, leftWall, rightWall]);
    }

    public get rigidBodies(): Body[] {
        return this._rigidBodies;
    }
    
    public update(): void {

    }
}