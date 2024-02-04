import {Graphics} from "./Graphics";
import * as RAPIER from "@dimforge/rapier2d";
import { TetrisOption } from "./TetrisOption";
import { BlockType, Tetromino } from "./Tetromino";
import { createLines } from "./Line";
import { calculateLineIntersectionArea } from "./BlockScore";
import { removeLines as removeShapeWithLine } from "./BlockRemove";
import { collisionParticleEffect, explodeParticleEffect, generateParticleTexture } from "./Effect";
import { KeyFrameEvent, MultiPlayerContext } from "./Multiplay";

type RAPIER_API = typeof import("@dimforge/rapier2d");
type Line = number[][][]
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
    sequence: number;
    multiPlayerContext?: MultiPlayerContext;
    running: boolean;

    constructor(option: TetrisOption, multiplay: boolean, userId?: string) {
        if (!option.view) {
            throw new Error("Canvas is null");
        }

        this.graphics = new Graphics(option.view);
        this.inhibitLookAt = false;
        this.demoToken = 0;
        this.events = new RAPIER.EventQueue(true);
        this.option = option;
        this.tetrominos = new Set();
        this.lines = createLines(-20 * option.blockSize + 20, 0, option.blockSize);
        this.sequence = 0;
        this.running = false;

        if (multiplay) {
            if (!userId) {
                throw new Error("Set to multiplayer view, but no userId is given.");
            }
            this.multiPlayerContext = new MultiPlayerContext(userId);
        }
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
    
    updateSequence() {
        this.sequence += 1;
    }

    receiveKeyFrameEvent(event: KeyFrameEvent) {
        if (!this.multiPlayerContext) {
            console.error("This is not multiplayer view.");
            return;
        }

        if (!this.multiPlayerContext.isEventValid(event)) {
            throw new Error("Failed to receive event: Invalid event");
        }

        this.multiPlayerContext.updateNewEvent(event);

        if (!this.running) {
            this.run();
        }
    }

    run() {
        this.world.numSolverIterations = 4;
        if (!!this.preTimestepAction) {
            this.preTimestepAction(this.graphics);
        }

        if (this.multiPlayerContext) {
            if (this.stepId >= this.multiPlayerContext.lastKeyframe) {
                this.running = false;
                return;
            }
        }

        this.running = true;
        this.world.step(this.events);
        this.stepId += 1;
        this.graphics.render(this.world, false);
        this.events.drainCollisionEvents((handle1: number, handle2: number, started: boolean) => {
            if (!started) {
                return;
            }

            const body1 = this.world.getCollider(handle1);
            const body2 = this.world.getCollider(handle2);
            this.onCollisionDetected(body1, body2);
        });

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

            newBody.rigidBody.collider(i).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
        }

        newBody.rigidBody.userData = {
            color: color,
            type: 'block'
        };

        

        if (spawnedForFalling) {
            this.fallingTetromino = newBody;
            return newBody;
        }
        this.tetrominos.add(newBody);
        return newBody;
    }

    spawnFromRigidBody(color: number, rigidBody: RAPIER.RigidBody) {
        let tetromino = new Tetromino(this.option, this.world, this.graphics.viewport, rigidBody, color);
        for (let i = 0; i < rigidBody.numColliders(); i++) {
            rigidBody.collider(i).setRestitution(0);
            rigidBody.collider(i).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
        }
        this.tetrominos.add(tetromino);
        return tetromino; 
    }

    /* Spawn rigid body */
    spawnFromRigidBodyDesc(color: number, rigidBodyDesc: RAPIER.RigidBodyDesc) {
        let newBody = this.world.createRigidBody(rigidBodyDesc);
        let tetromino = new Tetromino(this.option, this.world, this.graphics.viewport, newBody, color);
        for (let i = 0; i < tetromino.rigidBody.numColliders(); i++) {
            this.graphics.addCollider(RAPIER, this.world, tetromino.rigidBody.collider(i));
            tetromino.rigidBody.collider(i).setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
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

            for (let collider of coliderDesc) {
                collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
                this.world.createCollider(collider, body);
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
            console.log(shape.rigidBody.translation());
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

    checkLine(threshold: number) {
        let scoreSum = 0;
        let lineToRemove: Line[] = [];
        let lineIndices: number[] = [];
        for (let i = 0; i < this.lines.length; i++) {
            let score = 0;
            this.tetrominos.forEach((value) => {
                score += calculateLineIntersectionArea(value.rigidBody, this.lines[i]);
            });

            console.log(`line[${i}] = ${score}`);
            if (score >= threshold) {
                scoreSum += score;
                lineToRemove.push(this.lines[i]);
                lineIndices.push(i);
            }
        }
        
        return {
            lines: lineToRemove,
            area: scoreSum,
            lineIndices: lineIndices
        }
    }

    /* If nothing can be removed, it returns false. otherwise returns true. */
    removeLines(lineToRemove: Line[]) {
        if (lineToRemove.length === 0) {
            return false;
        }

        // TODO: Shape-cast and remove without removing and re-create all shapes in the world
        for (const line of lineToRemove) {
            const shapes = [...this.tetrominos];
            shapes.forEach((value) => {
                let result = removeShapeWithLine(value.rigidBody, line);
                let color = value.fillStyle;
                this.removeBlock(value);
                if (!result) {
                    return;
                }
                this.spawnFromColliderDescs(color, result);
            });
        }

        return true;
    }

    onCollisionDetected(collider1: RAPIER.Collider, collider2: RAPIER.Collider) {
        const body1 = collider1.parent();
        const body2 = collider2.parent();
        const fallingBody = this.fallingTetromino?.rigidBody?.handle;
        if (!body1 || !body2) {
            return;
        }

        if (this.isFalling(body1, body2) && !this.collideWithWall(body1, body2)) {
            this.tetrominos.add(this.fallingTetromino);
            this.fallingTetromino = undefined;
            if (this.option.blockLandingCallback) {
                this.option.blockLandingCallback({bodyA: collider1, bodyB: collider2});
            }
            return;
        }

        if (this.option.blockCollisionCallback) {
            this.option.blockCollisionCallback({bodyA: collider1, bodyB: collider2});
        }
    }

    private isFalling(body1: RAPIER.RigidBody, body2: RAPIER.RigidBody) {
        const fallingBody = this.fallingTetromino?.rigidBody?.handle;
        return this.fallingTetromino && (fallingBody === body1.handle || fallingBody === body2.handle)
    }

    private collideWithWall(body1: RAPIER.RigidBody, body2: RAPIER.RigidBody) {
        return (body1.userData?.type === "left_wall" || body1.userData?.type === "right_wall") || (body2.userData?.type === "left_wall" || body2.userData?.type === "right_wall")
    }
}