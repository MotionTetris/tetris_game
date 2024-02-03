import {Graphics} from "./Graphics";
import * as RAPIER from "@dimforge/rapier2d";
import { TetrisOption } from "./TetrisOption";
import { BlockType, Tetromino } from "./Tetromino";
import { createLines } from "./Line";
import { calculateLineIntersectionArea } from "./BlockScore";
import { removeLines } from "./BlockRemove";

type RAPIER_API = typeof import("@dimforge/rapier2d");

export class TetrisGame {
    graphics: Graphics;
    inhibitLookAt: boolean;
    demoToken: number;
    events: RAPIER.EventQueue;
    world: RAPIER.World;
    preTimestepAction?: (gfx: Graphics) => void;
    stepId: number;
    lastMessageTime: number;
    snap: Uint8Array;
    snapStepId: number;
    option: TetrisOption;
    tetrominos: Set<Tetromino>;
    fallingTetromino?: Tetromino;
    lines: number[][][][];

    constructor(option: TetrisOption) {
        if (!option.view) {
            throw new Error("Canvas is null");
        }

        this.graphics = new Graphics(option.view);
        this.inhibitLookAt = false;
        this.demoToken = 0;
        this.events = new RAPIER.EventQueue(true);
        this.option = option;
        console.log(option);
        this.tetrominos = new Set();
        this.lines = createLines(-20 * option.blockSize + 20, 0, option.blockSize);
        console.log(this.lines);
    }

    setpreTimestepAction(action: (gfx: Graphics) => void) {
        this.preTimestepAction = action;
    }

    setWorld(world: RAPIER.World) {
        document.onkeyup = null;
        document.onkeydown = null;
        this.preTimestepAction = undefined;
        this.world = world;
        this.world.numSolverIterations = 4;
        this.demoToken += 1;
        this.stepId = 0;

        world.forEachCollider((coll) => {
            this.graphics.addCollider(RAPIER, world, coll);
        });
        console.log(world);
        this.lastMessageTime = new Date().getTime();
    }

    lookAt(pos: Parameters<Graphics["lookAt"]>[0]) {
        if (!this.inhibitLookAt) {
            this.graphics.lookAt(pos);
        }

        this.inhibitLookAt = false;
    }

    takeSnapshot() {
        this.snap = this.world.takeSnapshot();
        this.snapStepId = this.stepId;
    }

    restoreSnapshot() {
        if (!!this.snap) {
            this.world.free();
            this.world = RAPIER.World.restoreSnapshot(this.snap);
            this.stepId = this.snapStepId;
            this.tetrominos.clear();
            
            this.world.bodies.forEach((value) => {
                // @ts-ignore
                if (value.userData && value.userData.type && value.userData.type === 'block') {
                    // @ts-ignore
                    this.tetrominos.push(this.spawnFromRigidBody(value.userData.color, value));
                }
            });
        }
    }

    run() {
        this.world.numSolverIterations = 4;
        if (!!this.preTimestepAction) {
            this.preTimestepAction(this.graphics);
        }

        this.world.step(this.events);
        this.stepId += 1;
        this.graphics.render(this.world, false);
        this.events.drainCollisionEvents(() => {
            console.log("충돌!");
        });
        
        if (this.stepId % 100 == 0) {
            this.spawnBlock(0, "T", true);
        }

        if (this.stepId % 1000 == 0) {
            this.checkAndRemoveLines(3000);
        }
        requestAnimationFrame(() => this.run());
    }

    removeBlock(block: Tetromino) {
        block.remove();
        this.tetrominos.delete(block);
    }

    /* Spawn new block */
    spawnBlock(color: number, blockType: BlockType, spawnedForFalling?: boolean) {
        let newBody = new Tetromino(this.option, this.world, this.graphics.viewport, undefined, color, blockType);
        for (let i = 0; i < newBody.rigidBody.numColliders(); i++) {
            let graphics = this.graphics.addCollider(RAPIER, this.world, newBody.rigidBody.collider(i));
            if (graphics) {
                newBody.addGraphics(graphics);
            }
        }

        newBody.rigidBody.userData = {
            color: color,
            type: 'block'
        };

        this.tetrominos.add(newBody);

        if (spawnedForFalling) {
            this.fallingTetromino = newBody;
        }
        return newBody;
    }

    spawnFromRigidBody(color: number, rigidBody: RAPIER.RigidBody) {
        let tetromino = new Tetromino(this.option, this.world, this.graphics.viewport, rigidBody, color);
        this.tetrominos.add(tetromino);
        return tetromino; 
        
    }

    /* Spawn rigid body */
    spawnFromRigidBodyDesc(color: number, rigidBodyDesc: RAPIER.RigidBodyDesc) {
        let newBody = this.world.createRigidBody(rigidBodyDesc);
        let tetromino = new Tetromino(this.option, this.world, this.graphics.viewport, newBody, color);
        for (let i = 0; i < tetromino.rigidBody.numColliders(); i++) {
            this.graphics.addCollider(RAPIER, this.world, tetromino.rigidBody.collider(i));
        }

        rigidBodyDesc.userData = {
            color: color,
            type: 'block'
        };

        this.tetrominos.add(tetromino);
        return tetromino;
    }

    spawnFromColliderDescs(color: number, coliderDescs: RAPIER.ColliderDesc[][]) {
        let shapes = [];
        for (let coliderDesc of coliderDescs) {
            let bodyDesc = RAPIER.RigidBodyDesc.dynamic();
            let body = this.world.createRigidBody(bodyDesc);
            body.userData = {
                color: color,
                type: 'block'
            };

            for (let colider of coliderDesc) {
                this.world.createCollider(colider, body);
            }

            let shape = new Tetromino(this.option, this.world, this.graphics.viewport, body, color);
            shapes.push(shape);
            console.log(shape);
        }

        for (let shape of shapes) {
            for (let i = 0; i < shape.rigidBody.numColliders(); i++) {
                let graphics = this.graphics.addCollider(RAPIER, this.world, shape.rigidBody.collider(i));
                if (graphics) {
                    shape.addGraphics(graphics);
                }
            }
            this.tetrominos.add(shape);
        }

        return shapes;
    }

    /* Spawn polygon for tests. */
    spawnPloygon(color: number, vertices: number[]) {
        let bodyDesc = RAPIER.RigidBodyDesc.dynamic();
        let body = this.world.createRigidBody(bodyDesc);
        body.userData = {
            color: color,
            type: 'block'
        };
        let desc = RAPIER.ColliderDesc.convexHull(new Float32Array(vertices));
        if (!desc) {
            console.log("desc is null");
        }
        let collider = this.world.createCollider(desc!, body);
        let newBody = new Tetromino(this.option, this.world, this.graphics.viewport, body, color);
        this.graphics.addCollider(RAPIER, this.world, newBody.rigidBody.collider(0));
        this.tetrominos.add(newBody);
    }

    checkAndRemoveLines(threshold: number) {
        let scoreSum = 0;
        let lineToRemove = [];
        for (let i = 0; i < this.lines.length; i++) {
            let score = 0;
            this.tetrominos.forEach((value) => {
                score += calculateLineIntersectionArea(value.rigidBody, this.lines[i]);
            });

            console.log(`line[${i}] = ${score}`);
            if (score >= threshold) {
                scoreSum += score;
                lineToRemove.push(this.lines[i]);
            }
        }
        
        if (lineToRemove.length === 0) {
            return;
        }
        
        // TODO: Shape-cast and remove without removing and re-create all shapes in the world 
        for (const line of lineToRemove) {
            const shapes = [...this.tetrominos];
            shapes.forEach((value) => {
                let result = removeLines(this.world, value.rigidBody, line);
                let color = value.fillStyle;
                this.removeBlock(value);
                if (!result) {
                    return;
                }

                this.spawnFromColliderDescs(color, result);
            });
        }
    }
}