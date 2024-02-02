import {Graphics} from "./Graphics";
import * as RAPIER from "@dimforge/rapier2d";
import { TetrisOption } from "./TetrisOption";

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
    
    constructor(canvas: HTMLCanvasElement, option: TetrisOption) {
        this.graphics = new Graphics(canvas);
        this.inhibitLookAt = false;
        this.demoToken = 0;
        this.events = new RAPIER.EventQueue(true);
        this.option = option;
        console.log("game created.");
        if (!canvas) {
            throw new Error("Canvas is null");
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
        }
    }

    run() {
        this.world.numSolverIterations = 4;
        if (!!this.preTimestepAction) {
            this.preTimestepAction(this.graphics);
        }

        this.world.step(this.events);
        this.stepId += 1;
        this.graphics.render(this.world);

        requestAnimationFrame(() => this.run());
    }
}