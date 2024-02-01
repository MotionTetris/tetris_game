import {Graphics} from "./Graphics";
import type * as RAPIER from "@dimforge/rapier2d";

type RAPIER_API = typeof import("@dimforge/rapier2d");

type Builders = Map<string, (RAPIER: RAPIER_API, testbed: Testbed) => void>;

export class Testbed {
    RAPIER: RAPIER_API;
    graphics: Graphics;
    inhibitLookAt: boolean;
    demoToken: number;
    mouse: {x: number; y: number};
    events: RAPIER.EventQueue;
    world: RAPIER.World;
    preTimestepAction?: (gfx: Graphics) => void;
    stepId: number;
    lastMessageTime: number;
    snap: Uint8Array;
    snapStepId: number;

    constructor(RAPIER: RAPIER_API, builders: Builders, canvas: HTMLCanvasElement) {
        this.RAPIER = RAPIER;
        this.graphics = new Graphics(canvas);
        this.inhibitLookAt = false;
        this.demoToken = 0;
        this.mouse = {x: 0, y: 0};
        this.events = new RAPIER.EventQueue(true);

        window.addEventListener("mousemove", (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = 1 - (event.clientY / window.innerHeight) * 2;
        });
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
            this.graphics.addCollider(this.RAPIER, world, coll);
        });

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
            this.world = this.RAPIER.World.restoreSnapshot(this.snap);
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