import {Graphics} from "./Graphics";
import * as RAPIER from "@dimforge/rapier2d";
import { BlockCollisionCallbackParam, TetrisOption } from "./TetrisOption";
import { BlockType, Tetromino } from "./Tetromino";
import { createLines } from "./Line";
import { calculateLineIntersectionArea } from "./BlockScore";
import { removeLines as removeShapeWithLine } from "./BlockRemove";
import { KeyFrameEvent, PlayerEventType } from "./Multiplay";

type Line = number[][][]
export class TetrisGame {
    graphics: Graphics;
    inhibitLookAt: boolean;
    demoToken: number;
    events: RAPIER.EventQueue;
    world?: RAPIER.World;
    preTimestepAction?: (gfx: Graphics) => void;
    stepId: number;
    lastMessageTime?: number;
    snap?: Uint8Array;
    snapStepId?: number;
    option: TetrisOption;
    tetrominos: Set<Tetromino>;
    fallingTetromino?: Tetromino;
    lines: Line[];
    sequence: number;
    userId: string;
    running: boolean;

    constructor(option: TetrisOption, userId: string) {
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
        this.userId = userId;
        this.stepId = 0;
        
    }

    set landingCallback(callback: ((result: BlockCollisionCallbackParam) => void)) {
        this.option.blockLandingCallback = callback;
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
        this.graphics.render(this.world, false);
        this.lastMessageTime = new Date().getTime();
    }

    lookAt(pos: Parameters<Graphics["lookAt"]>[0]) {
        if (!this.inhibitLookAt) {
            this.graphics.lookAt(pos);
        }

        this.inhibitLookAt = false;
    }

    takeSnapshot() {
        if (!this.world) {
            console.error("Failed to take snapshot: world is not set");
            return;
        }

        this.snap = this.world.takeSnapshot();
        this.snapStepId = this.stepId;
    }

    restoreSnapshot() {
        if (!!this.snap && this.snapStepId && this.world) {
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

    run() {
        if (!this.world) {
            console.error("Failed to run. world is not set");
            return;
        }

        if (!this.running) {
            return;
        }

        if (!!this.preTimestepAction) {
            this.preTimestepAction(this.graphics);
        }

        this.world.step(this.events);
        this.stepId += 1;
        this.graphics.render(this.world, false);
        this.events.drainCollisionEvents((handle1: number, handle2: number, started: boolean) => {
            if (!started) {
                return;
            }

            if (!this.world) {
                console.error("Failed to run. world is not set");
                return;
            }

            const body1 = this.world.getCollider(handle1);
            const body2 = this.world.getCollider(handle2);
            this.onCollisionDetected(body1, body2);
        });

        requestAnimationFrame(() => this.run());
    }

    pause() {
        this.running = false;
    }

    resume() {
        this.running = true;
        requestAnimationFrame(() => this.run());
    }

    removeBlock(block: Tetromino) {
        block.remove();
        this.tetrominos.delete(block);
    }

    /* Spawn new block */
    spawnBlock(color: number, blockType: BlockType, spawnedForFalling?: boolean) {
        if (!this.world) {
            throw new Error("Failed to spawn block. world is not set");
        }

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
        if (!this.world) {
            throw new Error("Failed to spawn block. world is not set");
        }

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
        if (!this.world) {
            throw new Error("Failed to spawn block. world is not set");
        }

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
        if (!this.world) {
            throw new Error("Failed to spawn block. world is not set");
        }

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

    checkLine(threshold: number) {
        let scoreSum = 0;
        let lineToRemove: Line[] = [];
        let lineIndices: number[] = [];
        for (let i = 0; i < this.lines.length; i++) {
            let score = 0;
            this.tetrominos.forEach((value) => {
                score += calculateLineIntersectionArea(value.rigidBody, this.lines[i]);
            });

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

        lineToRemove = [lineToRemove.pop()!];
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

    onRotateLeft() {
        this.fallingTetromino?.rigidBody.applyTorqueImpulse(1000000, false);
        let event = KeyFrameEvent.fromGame(this, this.userId, PlayerEventType.TURN_LEFT);
        console.log(event);
        this.updateSequence();
        return event;
    }

    onRotateRight() {
        this.fallingTetromino?.rigidBody.applyTorqueImpulse(-1000000, false);
        let event =  KeyFrameEvent.fromGame(this, this.userId, PlayerEventType.TURN_RIGHT);
        console.log(event);
        this.updateSequence();
        return event;
    }

    onMoveLeft(weight: number) {
        this.fallingTetromino?.rigidBody.applyImpulse({x: -weight * 100000, y: 0}, false);
        let event = KeyFrameEvent.fromGame(this, this.userId, PlayerEventType.MOVE_LEFT);
        event.userData = weight;
        console.log(event);
        this.updateSequence();
        return event;
    }

    onMoveRight(weight: number) {
        this.fallingTetromino?.rigidBody.applyImpulse({x: weight * 100000, y: 0}, false);
        let event = KeyFrameEvent.fromGame(this, this.userId, PlayerEventType.MOVE_RIGHT);
        event.userData = weight;
        console.log(event);
        this.updateSequence();
        return event;
    }

    onBlockSpawned(type: BlockType) {
        let event = KeyFrameEvent.fromGame(this, this.userId, PlayerEventType.BLOCK_SPAWNED);
        event.userData = type;
        console.log(event);
        this.sequence += 1;
        return event;
    }

    onCollisionDetected(collider1: RAPIER.Collider, collider2: RAPIER.Collider) {
        const body1 = collider1.parent();
        const body2 = collider2.parent();
        if (!body1 || !body2) {
            return;
        }

        if (this.isFalling(body1, body2) && !this.collideWithWall(body1, body2)) {
            this.tetrominos.add(this.fallingTetromino!);
            this.fallingTetromino?.rigidBody.resetForces(true);
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

    protected isFalling(body1: RAPIER.RigidBody, body2: RAPIER.RigidBody) {
        const fallingBody = this.fallingTetromino?.rigidBody?.handle;
        return this.fallingTetromino && (fallingBody === body1.handle || fallingBody === body2.handle)
    }

    protected collideWithWall(body1: RAPIER.RigidBody, body2: RAPIER.RigidBody) {
        // @ts-ignore
        return (body1.userData?.type === "left_wall" || body1.userData?.type === "right_wall") || (body2.userData?.type === "left_wall" || body2.userData?.type === "right_wall")
    }
}